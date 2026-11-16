/*
 * Motor de sonido del disco Luces · NASA SVS 5276 (Black Marble, VIIRS) · Hertz Hunters (NASA Space Apps 2026)
 *
 * RADAR: una línea recorre el mapa del mundo de noche de oeste a este en 12 s y suena lo que va tocando:
 *   cada franja de latitud es una nota (norte = agudo, sur = grave; pentatónica, 3 octavas);
 *   más luz en esa franja = nota más fuerte y repetida más seguido; sin luz = silencio;
 *   el sonido también viaja de izquierda a derecha, como la línea.
 *   Principio: la emoción sigue al dato. Si el dato no cambia, el sonido no cambia. Sin voz (la pone el bot).
 *
 * El mismo código suena en vivo y genera el WAV (Tone.Offline). Requiere Tone.js. Expone `window.MotorLuces`.
 */
(function (global) {
  'use strict';

  const RADAR = Object.freeze({
    barrido: 12,        // segundos para cruzar el mundo
    columnasPorPaso: 2, // la malla tiene 192 columnas: se escucha en 96 pasos de 0,125 s (3,75° cada uno)
    umbral: 25,         // brillo mínimo (0–1000) para que una franja suene
    maxNotas: 3,        // como máximo 3 notas nuevas por paso (las franjas más brillantes): nítido, no amontonado
    baseHz: 110,        // la franja más al sur suena La2; cada franja hacia el norte sube un escalón
    pentatonica: [0, 2, 4, 7, 9],
  });
  const DEMO = Object.freeze({ entrada: 0.3, pausa: 1.0, salida: 2.0, subida: 0.2 });
  const NIVEL = Object.freeze({ pianoDb: -6, retornoRevDb: -10, salida: 2.7 }); // ~-20 LUFS (medido)
  const PIANO = Object.freeze({
    base: 'https://tonejs.github.io/audio/salamander/', // Salamander Grand Piano (Alexander Holm, CC BY 3.0)
    notas: { A2: 'A2', C3: 'C3', 'D#3': 'Ds3', 'F#3': 'Fs3', A3: 'A3', C4: 'C4', 'D#4': 'Ds4', 'F#4': 'Fs4', A4: 'A4', C5: 'C5', 'D#5': 'Ds5', 'F#5': 'Fs5', A5: 'A5' },
  });

  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
  function semitonos(p) { const o = Math.floor(p / 5), g = ((p % 5) + 5) % 5; return 12 * o + RADAR.pentatonica[g]; }
  // franja 0 = la más al norte (72–64°N) … franja 15 = la más al sur (48–56°S)
  function frecuenciaFranja(f, franjas) { return RADAR.baseHz * Math.pow(2, semitonos(franjas - 1 - f) / 12); }
  // más luz = la nota se repite más seguido
  function intervalo(v) { return v >= 300 ? 0.125 : v >= 100 ? 0.25 : 0.5; }
  function fuerza(v) { return Math.min(1, 0.3 + 0.7 * Math.sqrt(v / 500)); }
  const pasos = (malla) => Math.ceil(malla.length / RADAR.columnasPorPaso);
  const dPaso = (malla) => RADAR.barrido / pasos(malla);

  function respuestaReverb(sr) {
    const dur = 2.6, pre = Math.floor(0.02 * sr), n = Math.floor(dur * sr), canales = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      let s = c === 0 ? 0x2545f491 : 0x6d2b79f5;
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
      const hp = new T.Filter({ type: 'highpass', frequency: 60, rolloff: -12 });
      const limitador = new T.Compressor({ threshold: -4, ratio: 20, knee: 0, attack: 0.002, release: 0.12 });
      const recorte = new T.Gain(g(-2.28)); // quita la ganancia automática del limitador (+2,28 dB, medido)
      const seguro = new T.WaveShaper((x) => { const a = Math.abs(x); return a <= 0.8 ? x : Math.sign(x) * (0.8 + 0.15 * Math.tanh((a - 0.8) / 0.15)); }, 4096);
      this.salida.chain(hp, limitador, recorte, seguro, T.getDestination());
      this.envio = new T.Gain(1);
      const reverb = new T.Convolver(T.ToneAudioBuffer.fromArray(respuestaReverb(T.getContext().sampleRate)));
      this.envio.chain(new T.Filter({ type: 'highpass', frequency: 300, rolloff: -12 }), reverb, new T.Gain(g(NIVEL.retornoRevDb)), this.salida);
      // El sonido viaja de izquierda a derecha con la línea del radar
      this.pan = new T.Panner(0);
      this.pianoBus = new T.Gain(g(NIVEL.pianoDb));
      this.pianoBus.chain(this.pan, this.salida);
      const env = new T.Gain(g(-3)); this.pan.connect(env); env.connect(this.envio);
      this.piano = piano ? new T.Sampler({ urls: piano, release: 0.7, attack: 0.004 }).connect(this.pianoBus) : null;
      this.campana = [];
      const nivelCampana = new T.Gain(g(-10)); nivelCampana.connect(this.pianoBus);
      for (let i = 0; i < 12; i++) {
        this.campana.push(new T.Synth({ oscillator: { partials: [1, 0.08, 0.02] }, envelope: { attack: 0.005, decay: 1.2, decayCurve: 'exponential', sustain: 0, release: 0.3 } }).connect(nivelCampana));
      }
      this.sigCampana = 0;
      return this;
    }

    nota(hz, v, t) {
      const vel = fuerza(v);
      if (this.piano) this.piano.triggerAttackRelease(hz, 0.25, t, vel); // notas cortas: se distingue cada luz
      else { const s = this.campana[this.sigCampana]; this.sigCampana = (this.sigCampana + 1) % this.campana.length; s.triggerAttackRelease(hz, 1.2, t, vel); }
    }

    // la línea del radar: de -0,75 (oeste) a +0,75 (este) durante el barrido
    panear(t0, t1, desde) {
      const p = this.pan.pan;
      p.cancelScheduledValues(t0);
      p.setValueAtTime(-0.75 + 1.5 * (desde || 0), t0);
      p.linearRampToValueAtTime(0.75, t1);
    }

    volumen(valor, t, dur) {
      const p = this.salida.gain, actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t); p.setValueAtTime(actual, t); p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // est = { segs: [{ anio, t0 }], seg, k, libre: [] }   mallas[año] = [columna][franja]
  function programar(motor, mallas, est, hasta) {
    for (;;) {
      const s = est.segs[est.seg];
      if (!s) break;
      const malla = mallas[s.anio], P = pasos(malla), dt = dPaso(malla), t = s.t0 + est.k * dt;
      if (t >= hasta) break;
      if (est.k === 0 || est.reanudar) { motor.panear(t, s.t0 + RADAR.barrido, est.k / P); est.reanudar = false; }
      const franjas = malla[0].length, c0 = est.k * RADAR.columnasPorPaso, cand = [];
      for (let f = 0; f < franjas; f++) {
        let v = 0;
        for (let c = c0; c < Math.min(malla.length, c0 + RADAR.columnasPorPaso); c++) v = Math.max(v, malla[c][f]);
        if (v >= RADAR.umbral && t >= (est.libre[f] || 0) - 1e-6) cand.push([v, f]);
      }
      cand.sort((a, b) => b[0] - a[0]);
      cand.slice(0, RADAR.maxNotas).forEach(([v, f]) => { motor.nota(frecuenciaFranja(f, franjas), v, t); est.libre[f] = t + intervalo(v); });
      est.k++;
      if (est.k >= P) { est.seg++; est.k = 0; est.libre = []; }
    }
  }

  // segmentos: un barrido (un año) o dos (2012 y el año elegido, para comparar)
  function armarSegmentos(anios, t0) { return anios.map((anio, i) => ({ anio, t0: t0 + i * (RADAR.barrido + DEMO.pausa) })); }
  function duracion(nAnios) { return DEMO.entrada + nAnios * RADAR.barrido + (nAnios - 1) * DEMO.pausa + DEMO.salida; }

  async function renderizar(mallas, anios, opciones) {
    const T = global.Tone, op = opciones || {};
    let piano = null;
    try { piano = await cargarPiano(); } catch (e) { piano = null; }
    const buf = await T.Offline(() => {
      const m = new Motor().construir(piano);
      const segs = armarSegmentos(anios, DEMO.entrada), fin = segs[segs.length - 1].t0 + RADAR.barrido;
      m.volumen(NIVEL.salida, 0, DEMO.subida);
      programar(m, mallas, { segs, seg: 0, k: 0, libre: [] }, fin);
      m.volumen(0, fin + 0.6, DEMO.salida - 0.66);
    }, duracion(anios.length), 2, op.sampleRate || 48000);
    return buf.get();
  }

  class Reproductor {
    constructor() {
      this.motor = null; this.mallas = null; this.sonando = false; this.est = null; this.posicion = 0; // segundos dentro del recorrido
      this.anios = []; this.piano = null; this.terminando = false; this.alTerminar = function () {}; this._accion = 0;
    }
    get ahora() { return global.Tone.getContext().currentTime; }
    usarPiano(piano) {
      this.piano = piano;
      if (this.motor && piano && !this.motor.piano) this.motor.piano = new global.Tone.Sampler({ urls: piano, release: 0.7, attack: 0.004 }).connect(this.motor.pianoBus);
    }
    async preparar() {
      const T = global.Tone;
      if (!this.motor) {
        try { T.setContext(new T.Context({ latencyHint: 'playback' })); } catch (e) { /* contexto de siempre */ }
        await T.start();
        this.motor = new Motor().construir(this.piano);
        setInterval(() => this._tic(), 25);
      } else { await T.start(); }
      clearTimeout(this._suspension);
    }
    // dónde va la línea: { segmento, fraccion 0–1 } (para la pantalla)
    linea(ahoraVisual) {
      if (!this.est) return null;
      const t0 = this.est.segs[0].t0, pos = this.sonando ? ahoraVisual - t0 : this.posicion;
      let i = 0;
      for (let k = this.est.segs.length - 1; k >= 0; k--) if (pos >= this.est.segs[k].t0 - t0) { i = k; break; }
      const s = this.est.segs[i];
      return { seg: i, anio: s.anio, fraccion: limitar((pos - (s.t0 - t0)) / RADAR.barrido, 0, 1) };
    }

    async iniciar(anios) {
      const accion = ++this._accion;
      await this.preparar();
      if (accion !== this._accion) return;
      const t = this.ahora;
      this.anios = anios.slice();
      this.est = { segs: armarSegmentos(this.anios, t + DEMO.entrada), seg: 0, k: 0, libre: [] };
      this.posicion = 0; this.terminando = false;
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    pausar() {
      this._accion++;
      if (!this.sonando) return;
      const t = this.ahora;
      this.posicion = t - this.est.segs[0].t0;
      this.sonando = false;
      this.motor.volumen(0, t + 0.01, 0.4);
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => { if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {}); }, 2000);
    }
    async continuar() {
      if (this.sonando || !this.est) return;
      const accion = ++this._accion;
      await this.preparar();
      if (accion !== this._accion) return;
      const t = this.ahora, desplazar = t + 0.05 - (this.est.segs[0].t0 + this.posicion);
      this.est.segs.forEach((s) => { s.t0 += desplazar; });
      this.est.reanudar = true;
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora, hasta = t + (document.hidden ? 1.2 : 0.12);
      programar(this.motor, this.mallas, this.est, hasta);
      const ult = this.est.segs[this.est.segs.length - 1], fin = ult.t0 + RADAR.barrido;
      if (!this.terminando && t >= fin) { this.terminando = true; this.motor.volumen(0, fin + 0.6, DEMO.salida - 0.66); }
      if (this.terminando && t >= fin + DEMO.salida) { this.terminando = false; this.sonando = false; this.posicion = fin - this.est.segs[0].t0; this.alTerminar(); }
    }
  }

  global.MotorLuces = { RADAR, DEMO, NIVEL, frecuenciaFranja, intervalo, fuerza, duracion, cargarPiano, Motor, Reproductor, renderizar, armarSegmentos };
})(window);
