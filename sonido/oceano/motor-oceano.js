/*
 * Motor de sonido del disco Océano · NASA SVS 3912 · Hertz Hunters (NASA Space Apps 2026)
 *
 * Convierte la temperatura del mar (una cifra por semana) en sonido generado en vivo, sin grabaciones.
 * El MISMO código sirve para escuchar en el navegador y para exportar el WAV (Tone.Offline):
 * el archivo exportado suena igual que la página.
 *
 * Reglas (ver CLAUDE.md):
 *   altura   = temperatura, pentatónica, 1 escalón cada 0,5 °C, escala fija (24 °C = La2)
 *   ritmo    = activación: 1 pulso/s a 26 °C y el doble por cada 2 °C más
 *   aspereza = solo sobre 27 °C, crece hasta el tope fijo de 29,3 °C (máximo del año)
 *   26–27 °C = zona neutra (±0,5 °C alrededor del umbral de 26,5 °C): limpio
 *   Principio: la emoción sigue al dato. Si el dato no cambia, el sonido no cambia.
 *
 * Requiere Tone.js (global `Tone`). Expone `window.MotorOceano`.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- reglas (datos → sonido)
  const REGLAS = Object.freeze({
    umbralC: 26.5,              // temperatura del mar que favorece la formación de huracanes (NOAA)
    neutraMinC: 26.0,           // zona neutra: ±0,5 °C alrededor del umbral (error de lectura 0,46 °C)
    neutraMaxC: 27.0,
    asperezaTopeC: 29.3,        // máximo del año en la costa: aspereza completa
    pasoC: 0.5,                 // medio grado = un escalón de la escala
    baseC: 24.0,                // 24 °C suena La2 (110 Hz); la escala es la misma para todas las zonas
    baseHz: 110,
    pentatonica: [0, 2, 4, 7, 9], // La, Si, Do#, Mi, Fa# (pentatónica mayor: ninguna nota choca)
    pulsosRefC: 26.0,           // a 26 °C, 1 pulso por segundo...
    pulsosRefHz: 1.0,
    pulsosDoblaCadaC: 2.0,      // ...y el doble por cada 2 °C más
    asperezaHz: 45,             // modulación de amplitud rápida: el oído la siente como aspereza
    asperezaProfMax: 0.8,       // profundidad máxima de esa modulación (0 = nada, 1 = total); la reverb y el
                                // chorus la suavizan: a la salida llega ~65 % (medido)
  });

  // Demo: 48 semanas en 27,8 s; el archivo completo (con entrada y salida suaves) dura 30,0 s.
  const DEMO = Object.freeze({ entrada: 0.3, semana: 0.58, salida: 1.86, subida: 0.9 });
  // Tiempo que tarda el sonido en deslizarse de una semana a la otra (s).
  const DESLIZ = Object.freeze({ demo: 0.2, explorar: 0.6 });

  // ---------------------------------------------------------------- mezcla (calibrada midiendo el WAV)
  const NIVEL = Object.freeze({
    raizDb: -15,       // voz principal del pad (sierra suave filtrada)
    subDb: -17,        // octava de abajo (triángulo), da calidez
    pulsosDb: -6,      // pulsos ("gotas"): ~6 dB bajo el pad, se oyen claros sin tapar
    retornoRevDb: -9,  // cuánta reverb vuelve a la mezcla
    salida: 0.62,      // volumen general (lineal): el año queda en ~-19 LUFS con picos ~-5 dBFS (medido)
  });
  // Volumen parejo entre graves y agudos: dB que se suman por cada octava bajo la referencia
  const COMP = Object.freeze({ raiz: 3, sub: 1.5, pulsos: 2 });
  const DESAFINACION_HZ = [0, 0.31, -0.43]; // voz central, izquierda, derecha
  const CORTE_X_NOTA = 4;   // el filtro del pad sigue a la nota: deja pasar ~4 armónicos (mismo timbre en grave y agudo)
  const DUR_PULSO = 0.62;   // ataque + caída de cada pulso (s)
  const VOCES_PULSO = 8;    // voces que se turnan para los pulsos (nunca se corta una nota sonando)

  // ---------------------------------------------------------------- funciones puras (también para Josué y el bot)
  function paso(t) { return Math.round((t - REGLAS.baseC) / REGLAS.pasoC); }

  function semitonos(p) {
    const oct = Math.floor(p / 5);
    const grado = ((p % 5) + 5) % 5;
    return 12 * oct + REGLAS.pentatonica[grado];
  }

  function frecuencia(t) { return REGLAS.baseHz * Math.pow(2, semitonos(paso(t)) / 12); }

  function pulsosPorSegundo(t) {
    return REGLAS.pulsosRefHz * Math.pow(2, (t - REGLAS.pulsosRefC) / REGLAS.pulsosDoblaCadaC);
  }

  // 0 a 1. La aspereza percibida crece ~ profundidad^1,6, así que se usa x^0,625 para que suba parejo.
  function aspereza(t) {
    if (!(t > REGLAS.neutraMaxC)) return 0;
    const x = Math.min(1, (t - REGLAS.neutraMaxC) / (REGLAS.asperezaTopeC - REGLAS.neutraMaxC));
    return Math.pow(x, 0.625);
  }

  function zona(t) {
    if (t == null) return 'sin_dato';
    if (t < REGLAS.neutraMinC) return 'bajo';
    if (t <= REGLAS.neutraMaxC) return 'cerca';
    return 'sobre';
  }

  const NOMBRES = {
    es: { 9: 'La', 11: 'Si', 1: 'Do#', 4: 'Mi', 6: 'Fa#' },
    en: { 9: 'A', 11: 'B', 1: 'C#', 4: 'E', 6: 'F#' },
  };

  // Todo lo que suena para una temperatura (para el botón "¿por qué suena así?").
  function describir(t, idioma) {
    if (t == null || !isFinite(t)) return { temp: null, zona: 'sin_dato' };
    const p = paso(t);
    const midi = 45 + semitonos(p); // La2 = 45
    const nombres = NOMBRES[idioma] || NOMBRES.es;
    return {
      temp: t,
      paso: p,
      nota: nombres[midi % 12] + (Math.floor(midi / 12) - 1),
      hz: frecuencia(t),
      pulsosPorSegundo: pulsosPorSegundo(t),
      aspereza: aspereza(t),
      zona: zona(t),
    };
  }

  // Volumen parejo: el oído escucha más bajos los graves, así que se suben un poco (dB por octava bajo ref).
  function compensacionDb(f, ref, dbPorOctava) { return f < ref ? dbPorOctava * Math.log2(ref / f) : 0; }

  // Reverb propia: ruido con caída exponencial y cola cada vez más oscura (agua, sin metal).
  // Semilla fija: el WAV y la página usan exactamente la misma reverb.
  function respuestaReverb(sr) {
    const dur = 2.8, pre = Math.floor(0.022 * sr), n = Math.floor(dur * sr);
    const canales = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      let s = c === 0 ? 0x9e3779b9 : 0x7f4a7c15;
      const azar = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296) * 2 - 1; };
      const d = canales[c];
      let lp = 0;
      for (let i = pre; i < n; i++) {
        const t = (i - pre) / sr;
        const caida = Math.exp(-6.9 * t / (dur - 0.022));  // -60 dB al final
        const suave = Math.min(1, t / 0.03);               // entrada suave de la reverb
        const a = Math.min(0.93, 0.35 + t * 0.3);          // la cola se oscurece con el tiempo
        lp = lp * a + azar() * (1 - a);
        d[i] = lp * caida * suave * (1 + 2.5 * a);         // compensa la pérdida del filtro
      }
    }
    return canales;
  }

  // Lleva un parámetro a `valor` desde el tiempo `t`, sin saltos (curva exponencial suave).
  function aproximar(param, valor, t, tc) {
    param.cancelScheduledValues(t);
    param.setTargetAtTime(valor, t, tc);
  }

  // ---------------------------------------------------------------- el instrumento
  class Motor {
    // Crea el instrumento en el contexto de audio actual de Tone (en vivo u offline).
    construir() {
      const T = global.Tone;
      const g = T.dbToGain;

      // Salida: volumen general → limpieza de graves y agudos → limitador → seguro final
      this.salida = new T.Gain(0);
      const hp = new T.Filter({ type: 'highpass', frequency: 55, rolloff: -12, Q: 0.5 });
      const lp = new T.Filter({ type: 'lowpass', frequency: 8500, rolloff: -12, Q: 0.5 });
      // Limitador: techo -4 dBFS, sin rodilla. El navegador le suma una ganancia automática
      // (makeup = 0,6 × 3,8 dB = 2,28 dB, medido); el recorte de después la quita, así que no cambia
      // nada mientras el sonido esté bajo el techo. Medido: aun con +3 dBFS de entrada, sale a -3,4 dBFS.
      this.limitador = new T.Compressor({ threshold: -4, ratio: 20, knee: 0, attack: 0.002, release: 0.12 });
      const recorte = new T.Gain(g(-2.28));
      // Seguro: idéntico bajo 0,8; sobre eso se curva suave hasta un máximo de 0,95 (nunca satura).
      const seguro = new T.WaveShaper((x) => {
        const a = Math.abs(x);
        if (a <= 0.8) return x;
        return Math.sign(x) * (0.8 + 0.15 * Math.tanh((a - 0.8) / 0.15));
      }, 4096);
      this.salida.chain(hp, lp, this.limitador, recorte, seguro, T.getDestination());

      // Reverb amplia pero sin embarrar: sin graves (no hay barro) y sin agudos (no hay brillo metálico)
      this.envio = new T.Gain(1);
      const hpRev = new T.Filter({ type: 'highpass', frequency: 260, rolloff: -12 });
      const lpRev = new T.Filter({ type: 'lowpass', frequency: 5000, rolloff: -12 });
      const ir = T.ToneAudioBuffer.fromArray(respuestaReverb(T.getContext().sampleRate));
      this.reverb = new T.Convolver(ir);
      const retorno = new T.Gain(g(NIVEL.retornoRevDb));
      this.envio.chain(hpRev, lpRev, this.reverb, retorno, this.salida);

      // Pad: dos capas → aspereza (solo la capa principal) → chorus (ondulación) → salida y reverb
      this.chorus = new T.Chorus({ frequency: 0.33, delayTime: 3.5, depth: 0.3, spread: 160, wet: 0.45 });
      this.chorus.start();
      this.pad = new T.Gain(1); // baja a 0 si una semana no tuviera dato
      this.pad.connect(this.chorus);
      this.chorus.connect(this.salida);
      const envioPad = new T.Gain(g(-3));
      this.chorus.connect(envioPad);
      envioPad.connect(this.envio);

      const f0 = frecuencia(REGLAS.umbralC);
      // Capa principal: 3 sierras levemente desafinadas, con filtro que sigue a la nota.
      // La desafinación es fija en Hz (no en cents): las voces ondulan lento (cada ~2–3 s) y SIEMPRE
      // al mismo ritmo, sea cual sea la nota. Así esa ondulación no se confunde con los pulsos (el dato).
      // Las voces de los lados van a izquierda y derecha y más suaves: la ondulación es amplia pero leve.
      this.nivelRaiz = new T.Gain(0);
      this.vocesRaiz = DESAFINACION_HZ.map((dHz, i) => {
        const osc = new T.Oscillator({ frequency: f0 + dHz, type: 'sawtooth' });
        const nivel = new T.Gain(i === 0 ? 1 : 0.42);
        const pan = new T.Panner(i === 0 ? 0 : (i === 1 ? -0.6 : 0.6));
        osc.chain(nivel, pan, this.nivelRaiz);
        return { osc, dHz };
      });
      this.filtroRaiz = new T.Filter({ type: 'lowpass', frequency: f0 * CORTE_X_NOTA, rolloff: -24, Q: 0.6 });
      // Aspereza: ganancia = a + b·sen(2π·45·t). Con b = 0 el sonido queda limpio.
      this.am = new T.Gain(1);
      this.amOsc = new T.Oscillator({ frequency: REGLAS.asperezaHz, type: 'sine' });
      this.amProf = new T.Gain(0);
      this.amOsc.connect(this.amProf);
      this.amProf.connect(this.am.gain);
      this.nivelRaiz.chain(this.filtroRaiz, this.am, this.pad);
      // Deriva muy lenta del filtro (±1 semitono cada ~16 s): le quita lo "quieto" de sintetizador.
      // Es constante: no depende del dato, así que no agrega emoción.
      this.deriva = new T.LFO({ frequency: 0.06, min: -100, max: 100 });
      this.deriva.connect(this.filtroRaiz.detune);

      // Capa de calidez: un triángulo limpio una octava abajo, filtrado (sin desafinar: dos voces
      // desafinadas en el grave laten fuerte y meten un ritmo que no viene del dato)
      this.oscSub = new T.Oscillator({ frequency: f0 / 2, type: 'triangle' });
      this.nivelSub = new T.Gain(0);
      const filtroSub = new T.Filter({ type: 'lowpass', frequency: 700, rolloff: -12 });
      this.oscSub.chain(this.nivelSub, filtroSub, this.pad);

      // Pulsos ("gotas"): una octava arriba de la nota del pad, ataque suave, caída corta
      this.nivelPulsos = new T.Gain(g(NIVEL.pulsosDb));
      const filtroPulsos = new T.Filter({ type: 'lowpass', frequency: 2600, rolloff: -12 });
      filtroPulsos.connect(this.nivelPulsos);
      this.nivelPulsos.connect(this.salida);
      const envioPulsos = new T.Gain(g(-1));
      this.nivelPulsos.connect(envioPulsos);
      envioPulsos.connect(this.envio);
      this.voces = [];
      for (let i = 0; i < VOCES_PULSO; i++) {
        const v = new T.Synth({
          oscillator: { partials: [1, 0.16, 0.04] },
          envelope: { attack: 0.02, attackCurve: 'sine', decay: DUR_PULSO - 0.02, decayCurve: 'exponential',
            sustain: 0, release: 0.3, releaseCurve: 'exponential' },
        });
        v.connect(filtroPulsos);
        this.voces.push(v);
      }
      this.siguienteVoz = 0;
      return this;
    }

    arrancar(t) {
      this.vocesRaiz.forEach((v) => v.osc.start(t));
      this.oscSub.start(t);
      this.amOsc.start(t);
      this.deriva.start(t);
    }

    // Lleva el sonido a la temperatura `temp` desde el tiempo `t`, deslizándose en ~`desliz` segundos.
    fijar(temp, t, desliz) {
      const tc = Math.max(0.004, desliz / 3);
      if (temp == null || !isFinite(temp)) { aproximar(this.pad.gain, 0, t, tc); return; }
      const g = global.Tone.dbToGain;
      const hz = frecuencia(temp);
      aproximar(this.pad.gain, this.silenciarPad ? 0 : 1, t, tc);
      this.vocesRaiz.forEach((v) => aproximar(v.osc.frequency, hz + v.dHz, t, tc));
      aproximar(this.oscSub.frequency, hz / 2, t, tc);
      aproximar(this.filtroRaiz.frequency, hz * CORTE_X_NOTA, t, tc);
      aproximar(this.nivelRaiz.gain, g(NIVEL.raizDb + compensacionDb(hz, 440, COMP.raiz)), t, tc);
      aproximar(this.nivelSub.gain, g(NIVEL.subDb + compensacionDb(hz / 2, 220, COMP.sub)), t, tc);
      // a y b se eligen para que el volumen medio (RMS) no cambie: solo cambia la aspereza
      const m = REGLAS.asperezaProfMax * aspereza(temp);
      const a = 1 - m / 2, b = m / 2, rms = Math.sqrt(a * a + b * b / 2);
      aproximar(this.am.gain, a / rms, t, tc);
      aproximar(this.amProf.gain, b / rms, t, tc);
    }

    // Un pulso en el tiempo `t`.
    pulso(temp, t) {
      const hz = frecuencia(temp) * 2;
      // Pulsos más seguidos = un poco más suaves (-1,5 dB por cada vez que se duplica el ritmo):
      // sube la densidad, no el volumen. Más compensación de graves para que suene parejo.
      const db = -3 - 1.5 * Math.log2(pulsosPorSegundo(temp)) + compensacionDb(hz, 880, COMP.pulsos);
      const vel = Math.min(1, global.Tone.dbToGain(db));
      const v = this.voces[this.siguienteVoz];
      this.siguienteVoz = (this.siguienteVoz + 1) % this.voces.length;
      v.triggerAttackRelease(hz, DUR_PULSO, t, vel);
    }

    // Rampa lineal del volumen general (entradas, salidas, pausas).
    volumen(valor, t, dur) {
      const p = this.salida.gain;
      const actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t);
      p.setValueAtTime(actual, t);
      p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // ---------------------------------------------------------------- programación en el tiempo (común a vivo y WAV)
  // est = { t0, semanaProgramada, proximoPulso, ultimoPulso }
  function programarDemo(motor, temps, est, hasta) {
    const n = temps.length, D = est.D || DEMO.semana, fin = est.t0 + n * D;
    while (est.semanaProgramada + 1 < n) {
      const i = est.semanaProgramada + 1, ti = est.t0 + i * D;
      if (ti >= hasta) break;
      motor.fijar(temps[i], ti, DESLIZ.demo);
      est.semanaProgramada = i;
    }
    const tope = Math.min(hasta, fin);
    while (est.proximoPulso < tope) {
      const tp = est.proximoPulso;
      const i = Math.max(0, Math.min(n - 1, Math.floor((tp - est.t0) / D)));
      const temp = temps[i];
      if (temp == null) { est.proximoPulso += 0.05; continue; } // sin dato: sin pulsos
      if (!est.sinPulsos) motor.pulso(temp, tp);
      est.ultimoPulso = tp;
      est.proximoPulso = tp + 1 / pulsosPorSegundo(temp);
    }
  }

  function programarFijo(motor, temp, est, hasta) {
    if (temp == null) { est.proximoPulso = hasta; return; }
    while (est.proximoPulso < hasta) {
      motor.pulso(temp, est.proximoPulso);
      est.ultimoPulso = est.proximoPulso;
      est.proximoPulso += 1 / pulsosPorSegundo(temp);
    }
  }

  function duracionDemo(n, semana) { return DEMO.entrada + n * (semana || DEMO.semana) + DEMO.salida; }

  // Genera el año completo con el mismo motor, sin sonar (para exportar). Devuelve un AudioBuffer.
  // opciones.prueba = { semana, sinPulsos, sinPad } solo para medir el motor (no se usa en la página).
  async function renderizar(temps, opciones) {
    const T = global.Tone;
    const op = opciones || {}, prueba = op.prueba || {};
    const sr = op.sampleRate || 48000;
    const D = prueba.semana || DEMO.semana;
    const n = temps.length;
    const buf = await T.Offline(async () => {
      const m = new Motor().construir();
      m.silenciarPad = !!prueba.sinPad;
      const t0 = DEMO.entrada, fin = t0 + n * D;
      m.arrancar(0);
      m.fijar(temps[0], 0, 0.01);
      m.volumen(NIVEL.salida, 0.02, DEMO.subida);
      const est = { t0, D, sinPulsos: !!prueba.sinPulsos, semanaProgramada: 0, proximoPulso: t0, ultimoPulso: -1 };
      programarDemo(m, temps, est, fin);
      m.volumen(0, fin, DEMO.salida - 0.06);
    }, duracionDemo(n, D), 2, sr);
    return buf.get();
  }

  // ---------------------------------------------------------------- reproductor en vivo
  class Reproductor {
    constructor() {
      this.motor = null;
      this.temps = [];
      this.modo = 'explorar';     // 'demo' (avanza solo) o 'explorar' (semana a semana)
      this.sonando = false;
      this.semana = 0;            // semana actual en modo explorar
      this.tempManual = null;     // para la leyenda sonora (temperatura de referencia)
      this.posDemo = 0;           // dónde quedó la demo al pausar (en semanas)
      this.est = null;
      this.terminando = false;
      this.agachado = false;
      this.alTerminarDemo = function () {};
      this._reloj = null;
      this._accion = 0;           // arranques y pausas: si llega otra mientras arranca el audio, gana la última
      this._movido = 0;           // cambios de semana a mano
    }

    cargar(temps) {
      this.temps = temps.slice();
      this.semana = Math.min(this.semana, this.temps.length - 1);
      if (this.sonando) this._aplicar(DESLIZ.explorar);
    }

    get ahora() { return global.Tone.getContext().currentTime; }

    async preparar() {
      const T = global.Tone;
      if (!this.motor) {
        // 'playback': búfer más grande = sin cortes en celulares (a cambio de unos ms de retraso)
        try { T.setContext(new T.Context({ latencyHint: 'playback' })); } catch (e) { /* se usa el de siempre */ }
        await T.start();
        this.motor = new Motor().construir();
        this.motor.arrancar(this.ahora + 0.02);
        this._reloj = setInterval(() => this._tic(), 25);
      } else {
        await T.start();
      }
      clearTimeout(this._suspension);
    }

    tempActual() {
      if (this.tempManual != null) return this.tempManual;
      return this.temps[this.semana];
    }

    // Semana que está sonando ahora (en demo avanza sola).
    semanaActual() {
      if (this.modo === 'demo' && this.est) {
        const p = this.sonando ? (this.ahora - this.est.t0) / DEMO.semana : this.posDemo;
        return Math.max(0, Math.min(this.temps.length - 1, Math.floor(p)));
      }
      return this.semana;
    }

    // El audio tarda unos ms en arrancar (await). Si mientras tanto llega una pausa, gana la pausa;
    // si llega una flecha, se suena esa semana en modo explorar.
    async iniciarDemo() {
      const accion = ++this._accion, movido = this._movido;
      await this.preparar();
      if (accion !== this._accion) return;
      if (movido !== this._movido) { if (!this.sonando) this._sonar(); return; }
      const t = this.ahora;
      this.modo = 'demo';
      this.tempManual = null;
      this.terminando = false;
      this.est = { t0: t + DEMO.entrada, semanaProgramada: 0, proximoPulso: t + DEMO.entrada, ultimoPulso: -1 };
      this.motor.fijar(this.temps[0], t, this.sonando ? 0.3 : 0.01);
      this.motor.volumen(this._nivel(), t + 0.02, DEMO.subida);
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
        if (this.posDemo >= this.temps.length) this.posDemo = 0;
        const i = Math.floor(this.posDemo);
        this.est.t0 = t + 0.05 - this.posDemo * DEMO.semana;
        this.est.semanaProgramada = i;
        this.est.proximoPulso = Math.max(t + 0.05, this.est.ultimoPulso + 0.12);
        this.terminando = false;
        this.motor.fijar(this.temps[i], t, 0.01);
      } else {
        this.motor.fijar(this.tempActual(), t, 0.01);
        this.est = { t0: 0, semanaProgramada: 0, proximoPulso: t + 0.08, ultimoPulso: -1 };
      }
      this.motor.volumen(this._nivel(), t + 0.02, DEMO.subida); // ataque lento
      this.sonando = true;
    }

    pausar() {
      this._accion++;
      if (!this.sonando) return;
      const t = this.ahora;
      if (this.modo === 'demo') this.posDemo = (t - this.est.t0) / DEMO.semana;
      this.sonando = false;
      this.motor.volumen(0, t + 0.01, 0.6);
      // Con el sonido ya en silencio, se suspende el audio (ahorra batería en el celular).
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => {
        if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {});
      }, 900);
    }

    async alternar() { if (this.sonando) this.pausar(); else await this.reproducir(); }

    // Ir a una semana (pasa a modo explorar). Si está sonando, se desliza hacia ella.
    irA(i) {
      this._movido++;
      i = Math.max(0, Math.min(this.temps.length - 1, i));
      const venia = this.modo === 'demo';
      this.modo = 'explorar';
      this.semana = i;
      this.tempManual = null;
      if (this.sonando) this._aplicar(venia ? 0.3 : DESLIZ.explorar);
    }

    // Suena una temperatura de referencia (leyenda); null vuelve a la semana actual.
    fijarTemperatura(temp) {
      this.modo = 'explorar';
      this.tempManual = temp;
      if (this.sonando) this._aplicar(DESLIZ.explorar);
    }

    // Baja la música mientras habla la voz (y la devuelve después).
    agacharse(si) {
      this.agachado = si;
      if (this.sonando && this.motor) this.motor.volumen(this._nivel(), this.ahora + 0.01, si ? 0.25 : 0.5);
    }

    _nivel() { return NIVEL.salida * (this.agachado ? 0.35 : 1); }

    _aplicar(desliz) {
      const t = this.ahora;
      if (this.terminando) { this.terminando = false; this.motor.volumen(this._nivel(), t, 0.3); }
      this.motor.fijar(this.tempActual(), t + 0.02, desliz);
      // un pulso enseguida con la nota nueva (respuesta inmediata a la tecla), sin ametrallar
      this.est = this.est || { t0: 0, semanaProgramada: 0, proximoPulso: 0, ultimoPulso: -1 };
      this.est.proximoPulso = Math.max(t + 0.04, this.est.ultimoPulso + 0.15);
    }

    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora;
      const hasta = t + (document.hidden ? 1.2 : 0.12);
      if (this.modo === 'demo') {
        programarDemo(this.motor, this.temps, this.est, hasta);
        const fin = this.est.t0 + this.temps.length * DEMO.semana;
        if (!this.terminando && hasta >= fin) {
          this.terminando = true;
          this.motor.volumen(0, fin, DEMO.salida - 0.06);
        }
        if (this.terminando && t >= fin + DEMO.salida) {
          this.terminando = false;
          this.sonando = false;
          this.modo = 'explorar';
          this.semana = this.temps.length - 1;
          this.posDemo = 0;
          this.alTerminarDemo();
        }
      } else {
        programarFijo(this.motor, this.tempActual(), this.est, hasta);
      }
    }
  }

  global.MotorOceano = {
    REGLAS, DEMO, NIVEL,
    paso, frecuencia, pulsosPorSegundo, aspereza, zona, describir, duracionDemo,
    Motor, Reproductor, renderizar,
  };
})(window);
