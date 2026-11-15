/*
 * Motor de sonido del disco Luces · NASA SVS 5276 (Black Marble, VIIRS) · Hertz Hunters (NASA Space Apps 2026)
 *
 * Dos cosas suenan: DESTELLOS (las luces) y UNA NOTA DE PIANO POR AÑO. Todo sale del dato, relativo a 2012
 * (la barra de la NASA no tiene números: "más luz / menos luz"):
 *   destellos = cuánta luz hay: 5 por segundo con la luz de 2012, más cuanto más luz (proporcional).
 *               Cada destello suena a la izquierda o a la derecha según dónde está la luz en el país (oeste → este).
 *   piano     = nivel de luz: un escalón de la pentatónica por cada 10 % más (o menos) de luz que en 2012.
 *   Principio: la emoción sigue al dato. Si el dato no cambia, el sonido no cambia. Sin voz (la pone el bot).
 *
 * El mismo código suena en vivo y genera el WAV (Tone.Offline). Requiere Tone.js. Expone `window.MotorLuces`.
 */
(function (global) {
  'use strict';

  const REGLAS = Object.freeze({
    pasoRel: 0.10,              // 10 % más luz que en 2012 = un escalón más agudo
    baseHz: 220,                // la luz de 2012 suena La3
    pentatonica: [0, 2, 4, 7, 9],
    destellosRef: 5,            // destellos por segundo con la luz de 2012 (proporcional a la luz)
  });
  // Demo: 12 años en 27,6 s; el archivo completo dura 30,0 s.
  const DEMO = Object.freeze({ entrada: 0.3, anio: 2.3, salida: 2.1, subida: 0.25 });
  const NIVEL = Object.freeze({ pianoDb: -3, destellosDb: -15, retornoRevDb: -9, salida: 1.85 }); // ~-20 LUFS (medido)
  const PIANO = Object.freeze({
    base: 'https://tonejs.github.io/audio/salamander/', // Salamander Grand Piano (Alexander Holm, CC BY 3.0)
    notas: { A2: 'A2', C3: 'C3', 'D#3': 'Ds3', 'F#3': 'Fs3', A3: 'A3', C4: 'C4', 'D#4': 'Ds4', 'F#4': 'Fs4', A4: 'A4', C5: 'C5', 'D#5': 'Ds5' },
  });
  // Notas posibles de los destellos (agudas, pentatónica): textura de luz; cuántas y dónde es el dato.
  const DESTELLO_HZ = [1760, 1975.5, 2217.5, 2637, 2960, 3520, 3951, 4435];

  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
  function paso(rel) { return Math.round((rel - 1) / REGLAS.pasoRel); }
  function semitonos(p) { const o = Math.floor(p / 5), g = ((p % 5) + 5) % 5; return 12 * o + REGLAS.pentatonica[g]; }
  function frecuencia(rel) { return REGLAS.baseHz * Math.pow(2, semitonos(paso(rel)) / 12); }
  function destellosPorSegundo(rel) { return REGLAS.destellosRef * rel; }
  function azar(i, k) { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }
  // Elige el lugar (−1 oeste … +1 este) según cómo se reparte la luz ese año
  function lugarDe(reparto, u) {
    let acc = 0;
    for (let i = 0; i < reparto.length; i++) { acc += reparto[i]; if (u <= acc) return -1 + 2 * (i + azar(i, u * 1000)) / reparto.length; }
    return 1;
  }
  const NOMBRES = { es: { 9: 'La', 11: 'Si', 1: 'Do#', 4: 'Mi', 6: 'Fa#' }, en: { 9: 'A', 11: 'B', 1: 'C#', 4: 'E', 6: 'F#' } };
  function describir(rel, idioma) {
    if (rel == null) return { rel: null };
    const p = paso(rel), midi = 57 + semitonos(p);
    return { rel, paso: p, nota: (NOMBRES[idioma] || NOMBRES.es)[midi % 12] + (Math.floor(midi / 12) - 1), destellosPorSegundo: destellosPorSegundo(rel), masLuz: rel > 1.0 };
  }

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
      const retorno = new T.Gain(g(NIVEL.retornoRevDb));
      this.envio.chain(new T.Filter({ type: 'highpass', frequency: 300, rolloff: -12 }), reverb, retorno, this.salida);

      // Piano (nota del año). Si no cargó el piano, una campana grave.
      this.pianoBus = new T.Gain(g(NIVEL.pianoDb));
      this.pianoBus.connect(this.salida);
      const envP = new T.Gain(g(-2)); this.pianoBus.connect(envP); envP.connect(this.envio);
      this.piano = piano ? new T.Sampler({ urls: piano, release: 1.6, attack: 0.005 }).connect(this.pianoBus) : null;
      this.respaldo = new T.Synth({ oscillator: { partials: [1, 0.1, 0.03] }, envelope: { attack: 0.006, decay: 2.2, decayCurve: 'exponential', sustain: 0, release: 0.5 } });
      const respaldoNivel = new T.Gain(g(-10)); this.respaldo.chain(respaldoNivel, this.pianoBus);

      // Destellos: voces de cristal que se turnan, cada una con su ubicación oeste-este
      this.destellosBus = new T.Gain(g(NIVEL.destellosDb));
      const lp = new T.Filter({ type: 'lowpass', frequency: 7000, rolloff: -12 });
      this.destellosBus.connect(lp); lp.connect(this.salida);
      const envD = new T.Gain(g(0)); lp.connect(envD); envD.connect(this.envio);
      this.voces = [];
      for (let i = 0; i < 10; i++) {
        const pan = new T.Panner(0);
        const v = new T.Synth({ oscillator: { partials: [1, 0, 0.18, 0, 0.05] }, envelope: { attack: 0.003, decay: 0.32, decayCurve: 'exponential', sustain: 0, release: 0.1 } });
        v.chain(pan, this.destellosBus);
        this.voces.push({ v, pan });
      }
      this.sigVoz = 0;
      return this;
    }

    notaAnio(rel, t, vel) {
      if (this.notasVisuales) { this.notasVisuales.push(t); if (this.notasVisuales.length > 64) this.notasVisuales.shift(); }
      const hz = frecuencia(rel);
      if (this.piano) this.piano.triggerAttackRelease(hz, 1.4, t, vel);
      else this.respaldo.triggerAttackRelease(hz, 2.0, t, vel);
    }

    destello(t, lugar, i) {
      const { v, pan } = this.voces[this.sigVoz];
      this.sigVoz = (this.sigVoz + 1) % this.voces.length;
      pan.pan.setValueAtTime(limitar(lugar, -1, 1) * 0.85, t);
      const hz = DESTELLO_HZ[Math.floor(azar(i, 7) * DESTELLO_HZ.length)];
      v.triggerAttackRelease(hz, 0.33, t, 0.55 + 0.35 * azar(i, 8));
    }

    volumen(valor, t, dur) {
      const p = this.salida.gain, actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t); p.setValueAtTime(actual, t); p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // est = { t0, D, anioProgramado, proximoDestello, nDestello, proximaRepeticion }
  // anios = [{ rel, reparto }]. Los eventos van en orden de tiempo (igual en vivo y al exportar).
  function programarDemo(motor, anios, est, hasta) {
    const n = anios.length, D = est.D, fin = est.t0 + n * D, tope = Math.min(hasta, fin);
    const anioEn = (t) => anios[limitar(Math.floor((t - est.t0) / D + 1e-6), 0, n - 1)];
    for (;;) {
      const tA = est.anioProgramado + 1 < n ? est.t0 + (est.anioProgramado + 1) * D : Infinity;
      const tSig = Math.min(tA, est.proximoDestello);
      if (!(tSig < tope)) break;
      if (tSig === tA) {
        const a = anios[++est.anioProgramado];
        if (a.rel != null) motor.notaAnio(a.rel, tA, 0.62);
      } else {
        const a = anioEn(tSig);
        if (a.rel == null) { est.proximoDestello += 0.1; continue; }
        const i = est.nDestello++;
        motor.destello(tSig, lugarDe(a.reparto, azar(i, 3)), i);
        // tiempos irregulares (como luces que titilan); 0,744 = promedio de -ln(1-0,9u): el ritmo medio es el que pide el dato
        est.proximoDestello = tSig + (-Math.log(1 - 0.9 * azar(i, 5)) / 0.744) / destellosPorSegundo(a.rel);
      }
    }
  }

  function programarFijo(motor, a, est, hasta) {
    if (!a || a.rel == null) { est.proximoDestello = est.proximaRepeticion = hasta; return; }
    for (;;) {
      const tSig = Math.min(est.proximaRepeticion, est.proximoDestello);
      if (!(tSig < hasta)) break;
      if (tSig === est.proximaRepeticion) { motor.notaAnio(a.rel, tSig, 0.55); est.proximaRepeticion += DEMO.anio; }
      else {
        const i = est.nDestello++;
        motor.destello(tSig, lugarDe(a.reparto, azar(i, 3)), i);
        est.proximoDestello = tSig + (-Math.log(1 - 0.9 * azar(i, 5)) / 0.744) / destellosPorSegundo(a.rel);
      }
    }
  }

  const estadoNuevo = (t0) => ({ t0, D: DEMO.anio, anioProgramado: -1, proximoDestello: t0 + 0.05, nDestello: 0, proximaRepeticion: t0 });
  const duracionDemo = (n) => DEMO.entrada + n * DEMO.anio + DEMO.salida;

  async function renderizar(anios, opciones) {
    const T = global.Tone, op = opciones || {};
    let piano = null;
    try { piano = await cargarPiano(); } catch (e) { piano = null; }
    const n = anios.length;
    const buf = await T.Offline(() => {
      const m = new Motor().construir(piano);
      const t0 = DEMO.entrada, fin = t0 + n * DEMO.anio;
      m.volumen(NIVEL.salida, 0, DEMO.subida);
      const est = estadoNuevo(t0);
      programarDemo(m, anios, est, fin);
      m.volumen(0, fin, DEMO.salida - 0.06);
    }, duracionDemo(n), 2, op.sampleRate || 48000);
    return buf.get();
  }

  class Reproductor {
    constructor() {
      this.motor = null; this.anios = []; this.modo = 'explorar'; this.sonando = false; this.anio = 0;
      this.posDemo = 0; this.est = null; this.terminando = false; this.piano = null;
      this.alTerminarDemo = function () {}; this._accion = 0; this._movido = 0;
    }
    cargar(anios) { this.anios = anios.slice(); this.anio = Math.min(this.anio, this.anios.length - 1); }
    get ahora() { return global.Tone.getContext().currentTime; }
    usarPiano(piano) {
      this.piano = piano;
      if (this.motor && piano && !this.motor.piano) this.motor.piano = new global.Tone.Sampler({ urls: piano, release: 1.6, attack: 0.005 }).connect(this.motor.pianoBus);
    }
    async preparar() {
      const T = global.Tone;
      if (!this.motor) {
        try { T.setContext(new T.Context({ latencyHint: 'playback' })); } catch (e) { /* contexto de siempre */ }
        await T.start();
        this.motor = new Motor().construir(this.piano);
        this.motor.notasVisuales = [];
        setInterval(() => this._tic(), 25);
      } else { await T.start(); }
      clearTimeout(this._suspension);
    }
    anioActual() {
      if (this.modo === 'demo' && this.est) {
        const p = this.sonando ? (this.ahora - this.est.t0) / DEMO.anio : this.posDemo;
        return limitar(Math.floor(p), 0, this.anios.length - 1);
      }
      return this.anio;
    }
    async iniciarDemo() {
      const accion = ++this._accion, movido = this._movido;
      await this.preparar();
      if (accion !== this._accion) return;
      if (movido !== this._movido) { if (!this.sonando) this._sonar(); return; }
      const t = this.ahora;
      this.modo = 'demo'; this.terminando = false;
      this.est = estadoNuevo(t + DEMO.entrada);
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    async reproducir() {
      if (this.sonando) return;
      const accion = ++this._accion;
      await this.preparar();
      if (accion !== this._accion || this.sonando) return;
      this._sonar();
    }
    _sonar() {
      const t = this.ahora;
      if (this.modo === 'demo') {
        if (this.posDemo >= this.anios.length) this.posDemo = 0;
        const i = Math.floor(this.posDemo);
        this.est = estadoNuevo(t + 0.05 - this.posDemo * DEMO.anio);
        this.est.anioProgramado = i - 1 + (this.posDemo - i > 0.05 ? 1 : 0);
        this.est.proximoDestello = t + 0.05;
        this.terminando = false;
      } else {
        this.est = estadoNuevo(t + 0.05);
      }
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    pausar() {
      this._accion++;
      if (!this.sonando) return;
      const t = this.ahora;
      if (this.modo === 'demo') this.posDemo = (t - this.est.t0) / DEMO.anio;
      this.sonando = false;
      this.motor.volumen(0, t + 0.01, 0.5);
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => { if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {}); }, 2500);
    }
    async alternar() { if (this.sonando) this.pausar(); else await this.reproducir(); }
    irA(i) {
      this._movido++;
      this.modo = 'explorar';
      this.anio = limitar(i, 0, this.anios.length - 1);
      if (this.sonando) {
        const t = this.ahora;
        if (this.terminando) { this.terminando = false; this.motor.volumen(NIVEL.salida, t, 0.3); }
        this.est = this.est || estadoNuevo(t);
        this.est.proximaRepeticion = t + 0.03; // la nota del año nuevo suena enseguida
        this.est.proximoDestello = Math.min(this.est.proximoDestello, t + 0.1);
      }
    }
    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora, hasta = t + (document.hidden ? 1.2 : 0.12);
      if (this.modo === 'demo') {
        programarDemo(this.motor, this.anios, this.est, hasta);
        const fin = this.est.t0 + this.anios.length * DEMO.anio;
        if (!this.terminando && hasta >= fin) { this.terminando = true; this.motor.volumen(0, fin, DEMO.salida - 0.06); }
        if (this.terminando && t >= fin + DEMO.salida) {
          this.terminando = false; this.sonando = false; this.modo = 'explorar';
          this.anio = this.anios.length - 1; this.posDemo = 0; this.alTerminarDemo();
        }
      } else {
        programarFijo(this.motor, this.anios[this.anio], this.est, hasta);
      }
    }
  }

  global.MotorLuces = { REGLAS, DEMO, NIVEL, paso, frecuencia, destellosPorSegundo, describir, duracionDemo, cargarPiano, Motor, Reproductor, renderizar };
})(window);
