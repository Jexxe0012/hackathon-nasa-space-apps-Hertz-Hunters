/*
 * Motor de sonido del disco Bosques · NASA SVS 4950 (GEDI) · Hertz Hunters (NASA Space Apps 2026)
 *
 * "SUBIR EL ÁRBOL": un camino de 16 puntos, del corazón del Amazonas al borde sur donde el bosque alto se acaba.
 *   En cada punto, el piano sube una escalera de notas desde el suelo hasta la copa:
 *   más alto el bosque = la escalera llega más arriba (pentatónica, Mi3 → Sol#5). La última nota (la copa) se queda sonando.
 *   Donde el bosque se acaba, las escaleras se cortan abajo. La emoción sale de esa comparación, no de efectos.
 *   Alturas aproximadas (el globo 3D con sombras no da metros exactos). Sin voz (la pone el bot).
 *
 * El mismo código suena en vivo y genera el WAV (Tone.Offline). Requiere Tone.js. Expone `window.MotorBosques`.
 */
(function (global) {
  'use strict';

  const ARBOL = Object.freeze({ paso: 1.1, baseHz: 164.8, escalones: 12, pentatonica: [0, 2, 4, 7, 9] });
  const DEMO = Object.freeze({ entrada: 0.4, salida: 2.2, subida: 0.2 });
  const NIVEL = Object.freeze({ pianoDb: -4, retornoRevDb: -9, salida: 2.0 }); // ~-20 LUFS (medido)
  const PIANO = Object.freeze({
    base: 'https://tonejs.github.io/audio/salamander/', // Salamander Grand Piano (Alexander Holm, CC BY 3.0)
    notas: { C3: 'C3', 'D#3': 'Ds3', 'F#3': 'Fs3', A3: 'A3', C4: 'C4', 'D#4': 'Ds4', 'F#4': 'Fs4', A4: 'A4', C5: 'C5', 'D#5': 'Ds5', 'F#5': 'Fs5', A5: 'A5' },
  });

  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
  function semitonos(p) { const o = Math.floor(p / 5), g = ((p % 5) + 5) % 5; return 12 * o + ARBOL.pentatonica[g]; }
  const hzDe = (p) => ARBOL.baseHz * Math.pow(2, semitonos(p) / 12);
  // altura (0–50 en la escala de la barra) → hasta qué escalón sube la escalera
  const cima = (alt) => Math.round(limitar(alt, 0, 50) / 50 * ARBOL.escalones);

  function respuestaReverb(sr) {
    const dur = 2.8, pre = Math.floor(0.02 * sr), n = Math.floor(dur * sr), canales = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      let s = c === 0 ? 0x510e527f : 0x9b05688c;
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
      this.bus = new T.Gain(g(NIVEL.pianoDb));
      this.bus.connect(this.salida);
      const env = new T.Gain(g(-1)); this.bus.connect(env); env.connect(this.envio);
      this.piano = piano ? new T.Sampler({ urls: piano, release: 1.2, attack: 0.004 }).connect(this.bus) : null;
      this.respaldo = [];
      const nivelR = new T.Gain(g(-10)); nivelR.connect(this.bus);
      for (let i = 0; i < 16; i++) this.respaldo.push(new T.Synth({ oscillator: { partials: [1, 0.12, 0.03] }, envelope: { attack: 0.006, attackCurve: 'sine', decay: 1.2, decayCurve: 'exponential', sustain: 0, release: 0.3 } }).connect(nivelR));
      this.sigR = 0;
      return this;
    }
    tocar(hz, dur, t, vel) {
      if (this.piano) this.piano.triggerAttackRelease(hz, dur, t, vel);
      else { const v = this.respaldo[this.sigR]; this.sigR = (this.sigR + 1) % this.respaldo.length; v.triggerAttackRelease(hz, dur, t, vel * 0.9); }
    }
    // la escalera de un punto: del suelo (escalón 0) a la copa; la copa se queda sonando
    arbol(alt, t) {
      const top = cima(alt), dt = Math.min(0.07, 0.62 / (top + 1));
      for (let p = 0; p <= top; p++) {
        const ultima = p === top;
        this.tocar(hzDe(p), ultima ? 0.85 : 0.12, t + p * dt, ultima ? 0.62 : 0.32 + 0.18 * p / Math.max(1, top));
      }
    }
    volumen(valor, t, dur) {
      const p = this.salida.gain, actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t); p.setValueAtTime(actual, t); p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // puntos = [{ altura | null }]. est = { t0, i }
  function programar(motor, puntos, est, hasta) {
    while (est.i < puntos.length) {
      const t = est.t0 + est.i * ARBOL.paso;
      if (t >= hasta) break;
      const a = puntos[est.i].altura;
      if (a != null) motor.arbol(a, t); // sin vegetación: silencio
      est.i++;
    }
  }
  const duracion = (n) => DEMO.entrada + n * ARBOL.paso + DEMO.salida;

  async function renderizar(puntos, opciones) {
    const T = global.Tone, op = opciones || {};
    let piano = null;
    try { piano = await cargarPiano(); } catch (e) { piano = null; }
    const buf = await T.Offline(() => {
      const m = new Motor().construir(piano), t0 = DEMO.entrada, fin = t0 + puntos.length * ARBOL.paso;
      m.volumen(NIVEL.salida, 0, DEMO.subida);
      programar(m, puntos, { t0, i: 0 }, fin);
      m.volumen(0, fin + 0.6, DEMO.salida - 0.66);
    }, duracion(puntos.length), 2, op.sampleRate || 48000);
    return buf.get();
  }

  class Reproductor {
    constructor() { this.motor = null; this.puntos = null; this.sonando = false; this.est = null; this.pos = 0; this.piano = null; this.terminando = false; this.alTerminar = function () {}; this._accion = 0; }
    get ahora() { return global.Tone.getContext().currentTime; }
    usarPiano(piano) { this.piano = piano; if (this.motor && piano && !this.motor.piano) this.motor.piano = new global.Tone.Sampler({ urls: piano, release: 1.2, attack: 0.004 }).connect(this.motor.bus); }
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
    // posición en puntos (con decimales)
    posicionEn(ahoraVisual) { return this.sonando && this.est ? limitar((ahoraVisual - this.est.t0) / ARBOL.paso, 0, this.puntos.length) : this.pos; }
    async iniciar(desde) {
      const accion = ++this._accion;
      await this.preparar();
      if (accion !== this._accion) return;
      const t = this.ahora, i = Math.floor(limitar(desde || 0, 0, this.puntos.length - 1));
      this.est = { t0: t + 0.08 - i * ARBOL.paso, i };
      this.terminando = false;
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    pausar() {
      this._accion++;
      if (!this.sonando) return;
      this.pos = this.posicionEn(this.ahora);
      this.sonando = false;
      this.motor.volumen(0, this.ahora + 0.01, 0.4);
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => { if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {}); }, 2500);
    }
    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora;
      programar(this.motor, this.puntos, this.est, t + (document.hidden ? 1.2 : 0.12));
      const fin = this.est.t0 + this.puntos.length * ARBOL.paso;
      if (!this.terminando && t >= fin) { this.terminando = true; this.motor.volumen(0, fin + 0.6, DEMO.salida - 0.66); }
      if (this.terminando && t >= fin + DEMO.salida) { this.terminando = false; this.sonando = false; this.pos = this.puntos.length; this.alTerminar(); }
    }
  }

  global.MotorBosques = { ARBOL, DEMO, NIVEL, cima, duracion, cargarPiano, Motor, Reproductor, renderizar };
})(window);
