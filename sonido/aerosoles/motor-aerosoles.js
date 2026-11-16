/*
 * Motor de sonido del disco Aerosoles · NASA SVS 5669 (modelo GEOS, 19/08/2025) · Hertz Hunters (NASA Space Apps 2026)
 *
 * RADAR con 4 instrumentos: una línea recorre el mapa de oeste a este en 15 s y suena lo que toca.
 *   Cada TIPO de partícula tiene su instrumento (así se reconoce qué es):
 *     polvo = soplido de arena · sal marina = campanitas de agua · sulfatos = marimba · carbono negro = piano grave
 *   Norte = agudo, sur = grave (cada franja de latitud es una nota de la pentatónica, dentro del registro de cada instrumento).
 *   Más intenso el color = nota más fuerte y repetida más seguido; sin ese tipo = silencio de ese instrumento.
 *   El sonido viaja de izquierda a derecha con la línea. Sin voz (la pone el bot).
 *
 * El mismo código suena en vivo y genera el WAV (Tone.Offline). Requiere Tone.js. Expone `window.MotorAerosoles`.
 */
(function (global) {
  'use strict';

  const RADAR = Object.freeze({ barrido: 15, columnasPorPaso: 2, umbral: 60, maxPorTipo: 2, pentatonica: [0, 2, 4, 7, 9] });
  const DEMO = Object.freeze({ entrada: 0.3, salida: 2.0, subida: 0.2 });
  const TIPOS = ['polvo', 'sal_marina', 'sulfatos', 'carbono_negro'];
  // registro de cada instrumento (nota de la franja más al sur) y nivel, calibrados midiendo cada uno solo
  const INSTR = Object.freeze({
    polvo: { baseHz: 220, db: 6 },        // el ruido filtrado pierde mucha energía: va más alto
    sal_marina: { baseHz: 440, db: -15 },
    sulfatos: { baseHz: 110, db: -13 },
    carbono_negro: { baseHz: 55, db: -6 },
  });
  const NIVEL = Object.freeze({ retornoRevDb: -10, salida: 1.4 });
  const PIANO = Object.freeze({
    base: 'https://tonejs.github.io/audio/salamander/', // Salamander Grand Piano (Alexander Holm, CC BY 3.0)
    notas: { A1: 'A1', C2: 'C2', 'D#2': 'Ds2', 'F#2': 'Fs2', A2: 'A2', C3: 'C3', 'D#3': 'Ds3', 'F#3': 'Fs3', A3: 'A3', C4: 'C4', 'D#4': 'Ds4', 'F#4': 'Fs4', A4: 'A4' },
  });

  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
  function semitonos(p) { const o = Math.floor(p / 5), g = ((p % 5) + 5) % 5; return 12 * o + RADAR.pentatonica[g]; }
  function frecuencia(tipo, f, franjas) { return INSTR[tipo].baseHz * Math.pow(2, semitonos(franjas - 1 - f) / 12); }
  function intervalo(v) { return v >= 500 ? 0.15 : v >= 200 ? 0.3 : 0.6; }
  function fuerza(v) { return Math.min(1, 0.3 + 0.7 * Math.sqrt(v / 600)); }
  const pasos = (malla) => Math.ceil(malla.length / RADAR.columnasPorPaso);

  function respuestaReverb(sr) {
    const dur = 2.6, pre = Math.floor(0.02 * sr), n = Math.floor(dur * sr), canales = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      let s = c === 0 ? 0x1b873593 : 0x5bd1e995;
      const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296) * 2 - 1; };
      let lp = 0;
      for (let i = pre; i < n; i++) {
        const t = (i - pre) / sr, a = Math.min(0.88, 0.25 + t * 0.3);
        lp = lp * a + rnd() * (1 - a);
        canales[c][i] = lp * Math.exp(-6.9 * t / (dur - 0.02)) * Math.min(1, t / 0.02) * (1 + 2.5 * a);
      }
    }
    return canales;
  }

  let pianoCache = null;
  function cargarPiano() {
    if (pianoCache) return pianoCache;
    const dec = new OfflineAudioContext(1, 1, 48000);
    pianoCache = Promise.all(Object.entries(PIANO.notas).map(async ([nota, archivo]) => {
      const r = await fetch(PIANO.base + archivo + '.mp3');
      if (!r.ok) throw new Error('piano ' + r.status);
      return [nota, await dec.decodeAudioData(await r.arrayBuffer())];
    })).then(Object.fromEntries).catch((e) => { pianoCache = null; throw e; });
    return pianoCache;
  }

  class Motor {
    construir(piano) {
      const T = global.Tone, g = T.dbToGain;
      this.salida = new T.Gain(0);
      const hp = new T.Filter({ type: 'highpass', frequency: 45, rolloff: -12 });
      const limitador = new T.Compressor({ threshold: -4, ratio: 20, knee: 0, attack: 0.002, release: 0.12 });
      const recorte = new T.Gain(g(-2.28)); // quita la ganancia automática del limitador (+2,28 dB, medido)
      const seguro = new T.WaveShaper((x) => { const a = Math.abs(x); return a <= 0.8 ? x : Math.sign(x) * (0.8 + 0.15 * Math.tanh((a - 0.8) / 0.15)); }, 4096);
      this.salida.chain(hp, limitador, recorte, seguro, T.getDestination());
      this.envio = new T.Gain(1);
      const reverb = new T.Convolver(T.ToneAudioBuffer.fromArray(respuestaReverb(T.getContext().sampleRate)));
      this.envio.chain(new T.Filter({ type: 'highpass', frequency: 300, rolloff: -12 }), reverb, new T.Gain(g(NIVEL.retornoRevDb)), this.salida);
      this.pan = new T.Panner(0);
      this.mezcla = new T.Gain(1);
      this.mezcla.chain(this.pan, this.salida);
      const env = new T.Gain(g(-3)); this.pan.connect(env); env.connect(this.envio);

      this.buses = {};
      for (const t of TIPOS) { const b = new T.Gain(g(INSTR[t].db)); b.connect(this.mezcla); this.buses[t] = b; }

      // polvo: soplos de ruido filtrado en la nota de la franja ("shhh" de arena)
      this.polvo = [];
      for (let i = 0; i < 8; i++) {
        const ruido = new T.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.04, decay: 0.32, sustain: 0, release: 0.1 } });
        const filtro = new T.Filter({ type: 'bandpass', frequency: 1000, Q: 5 });
        ruido.chain(filtro, this.buses.polvo);
        this.polvo.push({ ruido, filtro });
      }
      // sal marina: campanitas de cristal
      this.sal = [];
      for (let i = 0; i < 8; i++) this.sal.push(new T.Synth({ oscillator: { partials: [1, 0, 0.22, 0, 0.06] }, envelope: { attack: 0.003, decay: 0.7, decayCurve: 'exponential', sustain: 0, release: 0.2 } }).connect(this.buses.sal_marina));
      // sulfatos: marimba (fundamental + armónico 4, golpe seco)
      this.marimba = [];
      for (let i = 0; i < 8; i++) this.marimba.push(new T.Synth({ oscillator: { partials: [1, 0, 0, 0.2] }, envelope: { attack: 0.012, attackCurve: 'sine', decay: 0.42, decayCurve: 'exponential', sustain: 0, release: 0.1 } }).connect(this.buses.sulfatos));
      // carbono negro: piano grave (o campana grave si no cargó el piano)
      this.piano = piano ? new T.Sampler({ urls: piano, release: 0.8, attack: 0.004 }).connect(this.buses.carbono_negro) : null;
      this.respaldo = [];
      const respaldoNivel = new T.Gain(g(-8)); respaldoNivel.connect(this.buses.carbono_negro);
      for (let i = 0; i < 6; i++) this.respaldo.push(new T.Synth({ oscillator: { partials: [1, 0.3, 0.1] }, envelope: { attack: 0.005, decay: 0.9, decayCurve: 'exponential', sustain: 0, release: 0.2 } }).connect(respaldoNivel));
      this.turno = { polvo: 0, sal: 0, marimba: 0, respaldo: 0 };
      return this;
    }

    nota(tipo, hz, v, t) {
      const vel = fuerza(v), sig = (k, arr) => { const x = arr[this.turno[k]]; this.turno[k] = (this.turno[k] + 1) % arr.length; return x; };
      if (tipo === 'polvo') { const p = sig('polvo', this.polvo); p.filtro.frequency.setValueAtTime(hz * 4, t); p.ruido.triggerAttackRelease(0.34, t, vel); }
      else if (tipo === 'sal_marina') sig('sal', this.sal).triggerAttackRelease(hz, 0.7, t, vel);
      else if (tipo === 'sulfatos') sig('marimba', this.marimba).triggerAttackRelease(hz, 0.42, t, vel);
      else if (this.piano) this.piano.triggerAttackRelease(hz, 0.3, t, vel);
      else sig('respaldo', this.respaldo).triggerAttackRelease(hz, 0.9, t, vel);
    }

    // el sonido sigue a la línea: de izquierda a derecha (dir +1) o de derecha a izquierda (dir −1)
    panear(t0, t1, desde, dir) {
      const p = this.pan.pan, s = dir < 0 ? -1 : 1;
      p.cancelScheduledValues(t0);
      p.setValueAtTime(s * (-0.75 + 1.5 * (desde || 0)), t0);
      p.linearRampToValueAtTime(s * 0.75, t1);
    }

    activar(tipo, si, t) { this.buses[tipo].gain.rampTo(si ? global.Tone.dbToGain(INSTR[tipo].db) : 0, 0.08, t); }

    volumen(valor, t, dur) {
      const p = this.salida.gain, actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t); p.setValueAtTime(actual, t); p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // Un RECORRIDO es una lista de tramos (una historia puede tener uno o dos lugares). Cada tramo:
  //   { mallas: {tipo: [columna][fila]}, cpp (columnas por paso), barrido (s), dir (+1 oeste→este, −1 este→oeste),
  //     estirar (repartir las filas en 12 escalones: zonas chicas con pocas filas), tipos (los que suenan) }.
  const PAUSA_TRAMOS = 0.8;
  function armar(rec, t0, desdeTramo) {
    let t = t0;
    rec.tramos.forEach((tr, i) => { if (i < (desdeTramo || 0)) { tr.t0 = -1e9; return; } tr.t0 = t; t += tr.barrido + PAUSA_TRAMOS; });
    return rec;
  }
  const copiar = (rec) => ({ ganancia: rec.ganancia, tramos: rec.tramos.map((tr) => Object.assign({}, tr)) });
  const finDe = (rec) => { const u = rec.tramos[rec.tramos.length - 1]; return u.t0 + u.barrido; };
  function duracionRecorrido(rec) { return DEMO.entrada + rec.tramos.reduce((s, tr) => s + tr.barrido, 0) + PAUSA_TRAMOS * (rec.tramos.length - 1) + DEMO.salida; }
  const pasosDe = (tr) => Math.ceil(tr.mallas[Object.keys(tr.mallas)[0]].length / tr.cpp);

  function frecuenciaTramo(tipo, f, filas, estirar) {
    const p = estirar && filas > 1 ? Math.round((filas - 1 - f) * 12 / (filas - 1)) : filas - 1 - f;
    return INSTR[tipo].baseHz * Math.pow(2, semitonos(p) / 12);
  }

  // est = { tramo, k, libre, reanudar, apagados }. Los eventos van en orden de tiempo (igual en vivo y al exportar).
  function programar(motor, rec, est, hasta) {
    for (;;) {
      const tr = rec.tramos[est.tramo];
      if (!tr) break;
      const ref = tr.mallas[Object.keys(tr.mallas)[0]], P = pasosDe(tr), dt = tr.barrido / P, t = tr.t0 + est.k * dt;
      if (t >= hasta) break;
      if (est.k === 0 || est.reanudar) { motor.panear(t, tr.t0 + tr.barrido, est.k / P, tr.dir); est.reanudar = false; }
      const filas = ref[0].length, c0 = est.k * tr.cpp;
      for (const tipo of TIPOS) {
        if (!tr.mallas[tipo] || (tr.tipos && !tr.tipos.includes(tipo)) || (est.apagados && est.apagados[tipo])) continue;
        const malla = tr.mallas[tipo], cand = [], libre = est.libre[tipo] || (est.libre[tipo] = []);
        for (let f = 0; f < filas; f++) {
          let v = 0;
          for (let c = c0; c < Math.min(malla.length, c0 + tr.cpp); c++) v = Math.max(v, malla[c][f]);
          if (v >= RADAR.umbral && t >= (libre[f] || 0) - 1e-6) cand.push([v, f]);
        }
        cand.sort((a, b) => b[0] - a[0]);
        cand.slice(0, RADAR.maxPorTipo).forEach(([v, f]) => { motor.nota(tipo, frecuenciaTramo(tipo, f, filas, tr.estirar), v, t); libre[f] = t + intervalo(v); });
      }
      est.k++;
      if (est.k >= P) { est.tramo++; est.k = 0; est.libre = {}; }
    }
  }

  async function renderizar(recorrido, opciones) {
    const T = global.Tone, op = opciones || {};
    let piano = null;
    try { piano = await cargarPiano(); } catch (e) { piano = null; }
    const rec = armar(copiar(recorrido), DEMO.entrada);
    const buf = await T.Offline(() => {
      const m = new Motor().construir(piano);
      m.volumen(NIVEL.salida * T.dbToGain(recorrido.ganancia || 0), 0, DEMO.subida);
      const est = { tramo: 0, k: 0, libre: {}, reanudar: true, apagados: op.apagados || {} };
      TIPOS.forEach((tipo) => { if (est.apagados[tipo]) m.buses[tipo].gain.value = 0; });
      programar(m, rec, est, finDe(rec));
      m.volumen(0, finDe(rec) + 0.5, DEMO.salida - 0.56);
    }, duracionRecorrido(recorrido), 2, op.sampleRate || 48000);
    return buf.get();
  }

  class Reproductor {
    constructor() {
      this.motor = null; this.rec = null; this.sonando = false; this.est = null; this.pos = { tramo: 0, fraccion: 0 };
      this.apagados = {}; this.piano = null; this.terminando = false; this.alTerminar = function () {}; this._accion = 0;
    }
    get ahora() { return global.Tone.getContext().currentTime; }
    usarPiano(piano) {
      this.piano = piano;
      if (this.motor && piano && !this.motor.piano) this.motor.piano = new global.Tone.Sampler({ urls: piano, release: 0.8, attack: 0.004 }).connect(this.motor.buses.carbono_negro);
    }
    async preparar() {
      const T = global.Tone;
      if (!this.motor) {
        try { T.setContext(new T.Context({ latencyHint: 'playback' })); } catch (e) { /* contexto de siempre */ }
        await T.start();
        this.motor = new Motor().construir(this.piano);
        TIPOS.forEach((t) => { if (this.apagados[t]) this.motor.buses[t].gain.value = 0; });
        setInterval(() => this._tic(), 25);
      } else { await T.start(); }
      clearTimeout(this._suspension);
    }
    // dónde va la línea: { tramo, fraccion } (fraccion 0–1 en el sentido del recorrido)
    linea(ahoraVisual) {
      if (!this.rec || !this.sonando) return this.pos;
      let i = 0;
      this.rec.tramos.forEach((tr, k) => { if (tr.t0 > -1e8 && ahoraVisual >= tr.t0 - PAUSA_TRAMOS / 2) i = k; });
      const tr = this.rec.tramos[i];
      return { tramo: i, fraccion: limitar((ahoraVisual - tr.t0) / tr.barrido, 0, 1) };
    }
    async iniciar(recorrido, desde) {
      const accion = ++this._accion;
      await this.preparar();
      if (accion !== this._accion) return;
      const t = this.ahora, d = desde || { tramo: 0, fraccion: 0 }, i = limitar(d.tramo, 0, recorrido.tramos.length - 1);
      const tr0 = recorrido.tramos[i], k = Math.floor(limitar(d.fraccion, 0, 0.999) * pasosDe(tr0));
      this.rec = armar(copiar(recorrido), t + 0.08 - (k / pasosDe(tr0)) * tr0.barrido, i);
      this.est = { tramo: i, k, libre: {}, reanudar: true, apagados: this.apagados };
      this.terminando = false;
      this.motor.volumen(NIVEL.salida * global.Tone.dbToGain(recorrido.ganancia || 0), t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    pausar() {
      this._accion++;
      if (!this.sonando) return;
      this.pos = this.linea(this.ahora);
      this.sonando = false;
      this.motor.volumen(0, this.ahora + 0.01, 0.4);
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => { if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {}); }, 2000);
    }
    activar(tipo, si) {
      this.apagados[tipo] = !si;
      if (this.motor) this.motor.activar(tipo, si, this.ahora);
    }
    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora, hasta = t + (document.hidden ? 1.2 : 0.12);
      programar(this.motor, this.rec, this.est, hasta);
      const fin = finDe(this.rec);
      if (!this.terminando && t >= fin) { this.terminando = true; this.motor.volumen(0, fin + 0.5, DEMO.salida - 0.56); }
      if (this.terminando && t >= fin + DEMO.salida) {
        this.terminando = false; this.sonando = false;
        this.pos = { tramo: this.rec.tramos.length - 1, fraccion: 1 }; this.alTerminar();
      }
    }
  }

  global.MotorAerosoles = { RADAR, DEMO, TIPOS, INSTR, NIVEL, duracionRecorrido, cargarPiano, Motor, Reproductor, renderizar };
})(window);
