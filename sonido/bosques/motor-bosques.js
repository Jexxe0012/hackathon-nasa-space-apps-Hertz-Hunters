/*
 * Motor de sonido del disco Bosques · NASA SVS 4950 (GEDI) · Hertz Hunters (NASA Space Apps 2026)
 *
 * VIAJE DE NORTE A SUR: una línea horizontal baja por el globo de América (de Alaska a la Patagonia) y suena lo que toca.
 *   Instrumento: marimba (madera, como los árboles; instrumento tradicional de Centroamérica).
 *   Nota más aguda = árboles más altos (altura relativa: el globo 3D con sombras no da metros exactos).
 *   Más bosque en ese tramo = nota más fuerte. Izquierda/derecha = dónde está el bosque en la imagen.
 *   Principio: la emoción sigue al dato. Sin voz (la pone el bot).
 *
 * El mismo código suena en vivo y genera el WAV (Tone.Offline). Requiere Tone.js. Expone `window.MotorBosques`.
 */
(function (global) {
  'use strict';

  const VIAJE = Object.freeze({ barrido: 16, umbral: 120, maxNotas: 3, baseHz: 164.8, pentatonica: [0, 2, 4, 7, 9], pasos: 13 });
  const DEMO = Object.freeze({ entrada: 0.3, salida: 2.0, subida: 0.2 });
  const COLUMNAS_SONIDO = 6; // igual que las columnas del JSON (oeste → este en la imagen)
  const NIVEL = Object.freeze({ marimbaDb: -8, retornoRevDb: -9, salida: 0.9 }); // ~-20 LUFS (medido)

  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));
  function semitonos(p) { const o = Math.floor(p / 5), g = ((p % 5) + 5) % 5; return 12 * o + VIAJE.pentatonica[g]; }
  // altura (0–50 en la escala de la barra) → 13 escalones de la pentatónica (Mi3 … ~Si5; más grave retumbaba)
  function frecuencia(alt) { return VIAJE.baseHz * Math.pow(2, semitonos(Math.round(limitar(alt, 0, 50) / 50 * (VIAJE.pasos - 1))) / 12); }
  const fuerza = (cob) => Math.min(1, 0.35 + 0.65 * Math.sqrt(cob / 1000));

  function respuestaReverb(sr) {
    const dur = 2.4, pre = Math.floor(0.02 * sr), n = Math.floor(dur * sr), canales = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      let s = c === 0 ? 0x3c6ef372 : 0xa54ff53a;
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

  class Motor {
    construir() {
      const T = global.Tone, g = T.dbToGain;
      this.salida = new T.Gain(0);
      const hp = new T.Filter({ type: 'highpass', frequency: 50, rolloff: -12 });
      const limitador = new T.Compressor({ threshold: -4, ratio: 20, knee: 0, attack: 0.002, release: 0.12 });
      const recorte = new T.Gain(g(-2.28)); // quita la ganancia automática del limitador (+2,28 dB, medido)
      const seguro = new T.WaveShaper((x) => { const a = Math.abs(x); return a <= 0.8 ? x : Math.sign(x) * (0.8 + 0.15 * Math.tanh((a - 0.8) / 0.15)); }, 4096);
      this.salida.chain(hp, limitador, recorte, seguro, T.getDestination());
      this.envio = new T.Gain(1);
      const reverb = new T.Convolver(T.ToneAudioBuffer.fromArray(respuestaReverb(T.getContext().sampleRate)));
      this.envio.chain(new T.Filter({ type: 'highpass', frequency: 250, rolloff: -12 }), reverb, new T.Gain(g(NIVEL.retornoRevDb)), this.salida);
      this.bus = new T.Gain(g(NIVEL.marimbaDb));
      this.bus.connect(this.salida);
      const env = new T.Gain(g(-2)); this.bus.connect(env); env.connect(this.envio);
      // marimba de madera: fundamental + armónicos del tubo, golpe suave (curva sin quiebre).
      // Cada columna de la imagen tiene sus propias voces con posición izquierda/derecha FIJA: si una voz cambiara de
      // lugar mientras su nota anterior aún suena, el salto se oiría como un clic.
      this.columnas = [];
      for (let c = 0; c < COLUMNAS_SONIDO; c++) {
        const pan = new T.Panner((-1 + 2 * (c + 0.5) / COLUMNAS_SONIDO) * 0.8);
        pan.connect(this.bus);
        const voces = [];
        for (let i = 0; i < 4; i++) {
          voces.push(new T.Synth({ oscillator: { partials: [1, 0, 0, 0.22, 0, 0, 0, 0, 0, 0.04] }, envelope: { attack: 0.01, attackCurve: 'sine', decay: 0.7, decayCurve: 'exponential', sustain: 0, release: 0.15 } }).connect(pan));
        }
        this.columnas.push({ voces, sig: 0 });
      }
      return this;
    }
    nota(alt, cob, columna, t) {
      const col = this.columnas[limitar(columna, 0, this.columnas.length - 1)];
      const v = col.voces[col.sig];
      col.sig = (col.sig + 1) % col.voces.length;
      v.triggerAttackRelease(frecuencia(alt), 0.7, t, fuerza(cob));
    }
    volumen(valor, t, dur) {
      const p = this.salida.gain, actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t); p.setValueAtTime(actual, t); p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // filas[franja][columna] = { cobertura, altura_m }. est = { t0, k, libre: [] }
  function programar(motor, filas, est, hasta) {
    const P = filas.length, dt = VIAJE.barrido / P;
    while (est.k < P) {
      const t = est.t0 + est.k * dt;
      if (t >= hasta) break;
      const celdas = filas[est.k], C = celdas.length, cand = [];
      celdas.forEach((c, i) => { if (c.altura_m != null && c.cobertura >= VIAJE.umbral && t >= (est.libre[i] || 0) - 1e-6) cand.push([c.cobertura, i]); });
      cand.sort((a, b) => b[0] - a[0]);
      cand.slice(0, VIAJE.maxNotas).forEach(([cob, i]) => {
        motor.nota(celdas[i].altura_m, cob, i, t);
        est.libre[i] = t + (cob >= 600 ? 0.17 : cob >= 300 ? 0.34 : 0.5); // más bosque = más seguido
      });
      est.k++;
    }
  }

  const duracion = () => DEMO.entrada + VIAJE.barrido + DEMO.salida;

  async function renderizar(filas, opciones) {
    const T = global.Tone, op = opciones || {};
    const buf = await T.Offline(() => {
      const m = new Motor().construir(), t0 = DEMO.entrada, fin = t0 + VIAJE.barrido;
      m.volumen(NIVEL.salida, 0, DEMO.subida);
      programar(m, filas, { t0, k: 0, libre: [] }, fin);
      m.volumen(0, fin + 0.5, DEMO.salida - 0.56);
    }, duracion(), 2, op.sampleRate || 48000);
    return buf.get();
  }

  class Reproductor {
    constructor() { this.motor = null; this.filas = null; this.sonando = false; this.est = null; this.fraccion = 0; this.terminando = false; this.alTerminar = function () {}; this._accion = 0; }
    get ahora() { return global.Tone.getContext().currentTime; }
    async preparar() {
      const T = global.Tone;
      if (!this.motor) {
        try { T.setContext(new T.Context({ latencyHint: 'playback' })); } catch (e) { /* contexto de siempre */ }
        await T.start();
        this.motor = new Motor().construir();
        setInterval(() => this._tic(), 25);
      } else { await T.start(); }
      clearTimeout(this._suspension);
    }
    lineaEn(ahoraVisual) { return this.sonando && this.est ? limitar((ahoraVisual - this.est.t0) / VIAJE.barrido, 0, 1) : this.fraccion; }
    async iniciar(desde) {
      const accion = ++this._accion;
      await this.preparar();
      if (accion !== this._accion) return;
      const t = this.ahora, P = this.filas.length, k = Math.floor(limitar(desde || 0, 0, 0.999) * P);
      this.est = { t0: t + 0.08 - (k / P) * VIAJE.barrido, k, libre: [] };
      this.terminando = false;
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }
    pausar() {
      this._accion++;
      if (!this.sonando) return;
      this.fraccion = this.lineaEn(this.ahora);
      this.sonando = false;
      this.motor.volumen(0, this.ahora + 0.01, 0.4);
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => { if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {}); }, 2000);
    }
    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora;
      programar(this.motor, this.filas, this.est, t + (document.hidden ? 1.2 : 0.12));
      const fin = this.est.t0 + VIAJE.barrido;
      if (!this.terminando && t >= fin) { this.terminando = true; this.motor.volumen(0, fin + 0.5, DEMO.salida - 0.56); }
      if (this.terminando && t >= fin + DEMO.salida) { this.terminando = false; this.sonando = false; this.fraccion = 1; this.alTerminar(); }
    }
  }

  global.MotorBosques = { VIAJE, DEMO, NIVEL, frecuencia, duracion, Motor, Reproductor, renderizar };
})(window);
