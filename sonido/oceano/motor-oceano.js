/*
 * Motor de sonido del disco Océano · NASA SVS 3912 · Hertz Hunters (NASA Space Apps 2026)
 *
 * Dos cosas suenan, nada más: EL MAR (olas) y UNA MELODÍA (piano). Todo sale del dato:
 *   melodía  = temperatura: más agudo = más caliente (pentatónica, 1 escalón cada 0,5 °C, escala fija).
 *              Cada vez que la temperatura cambia de escalón, la nota suena en ese momento.
 *   ritmo    = activación: notas y olas más seguidas cuando el mar está más caliente.
 *   espuma   = tensión sobre 27 °C: las olas rompen con espuma (siseo en la cresta) que crece hasta 29,3 °C.
 *              Bajo 27 °C el mar queda liso, sin espuma. 26–27 °C es la zona neutra alrededor de 26,5 °C.
 *   Principio: la emoción sigue al dato. Si el dato no cambia, el sonido no cambia. Sin voz (la pone el bot).
 *
 * El MISMO código suena en vivo y genera el WAV (Tone.Offline). Requiere Tone.js. Expone `window.MotorOceano`.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------- reglas (datos → sonido)
  const REGLAS = Object.freeze({
    umbralC: 26.5,              // temperatura del mar que favorece la formación de huracanes (NOAA)
    neutraMinC: 26.0,           // zona neutra: ±0,5 °C alrededor del umbral (error de lectura 0,46 °C)
    neutraMaxC: 27.0,
    espumaTopeC: 29.3,          // máximo del año en la costa: espuma completa
    pasoC: 0.5,                 // medio grado = un escalón de la escala
    baseC: 24.0,                // 24 °C suena La3 (220 Hz); la escala es la misma para todas las zonas
    baseHz: 220,
    pentatonica: [0, 2, 4, 7, 9], // La, Si, Do#, Mi, Fa# (pentatónica mayor: ninguna nota choca)
    notasRefC: 26.0,            // a 26 °C, 1 nota por segundo y el doble por cada 2 °C más
    notasDoblaCadaC: 2.0,
    olaRefC: 26.0,              // a 26 °C, una ola cada 4,4 s; la mitad de tiempo por cada 2,5 °C más
    olaPeriodoRefS: 4.4,
    olaMitadCadaC: 2.5,
    fuerzaMinC: 25.0,           // fuerza del mar (olas más llenas y brillantes, toque más firme): 0 a 25 °C...
    fuerzaMaxC: 29.5,           // ...1 a 29,5 °C
  });

  // Demo: 48 semanas en 27,8 s; el archivo completo (con entrada y salida suaves) dura 30,0 s.
  const DEMO = Object.freeze({ entrada: 0.3, semana: 0.58, salida: 1.86, subida: 0.25 });

  // ---------------------------------------------------------------- mezcla (calibrada midiendo el WAV)
  const NIVEL = Object.freeze({
    olasDb: -6,        // el mar, ~3 dB bajo la melodía: se oye claro sin taparla
    espumaDb: -12,
    melodiaDb: -4,
    retornoRevDb: -10,
    salida: 2.3,       // volumen general: el año queda en ~-20 LUFS (medido)
  });

  const PIANO = Object.freeze({
    base: 'https://tonejs.github.io/audio/salamander/', // Salamander Grand Piano (Alexander Holm, CC BY 3.0)
    notas: { A3: 'A3', C4: 'C4', 'D#4': 'Ds4', 'F#4': 'Fs4', A4: 'A4', C5: 'C5', 'D#5': 'Ds5', 'F#5': 'Fs5', A5: 'A5', C6: 'C6' },
  });

  // ---------------------------------------------------------------- funciones puras (también para Josué y el bot)
  const limitar = (x, a, b) => Math.max(a, Math.min(b, x));

  function paso(t) { return Math.round((t - REGLAS.baseC) / REGLAS.pasoC); }
  function semitonos(p) { const o = Math.floor(p / 5), g = ((p % 5) + 5) % 5; return 12 * o + REGLAS.pentatonica[g]; }
  function frecuencia(t) { return REGLAS.baseHz * Math.pow(2, semitonos(paso(t)) / 12); }
  function notasPorSegundo(t) { return Math.pow(2, (t - REGLAS.notasRefC) / REGLAS.notasDoblaCadaC); }
  function olaPeriodo(t) { return REGLAS.olaPeriodoRefS / Math.pow(2, (t - REGLAS.olaRefC) / REGLAS.olaMitadCadaC); }
  function fuerza(t) { return limitar((t - REGLAS.fuerzaMinC) / (REGLAS.fuerzaMaxC - REGLAS.fuerzaMinC), 0, 1); }
  // 0 a 1. Sube parejo al oído (la percepción crece más rápido que la cantidad, por eso x^0,625)
  function espuma(t) {
    if (!(t > REGLAS.neutraMaxC)) return 0;
    return Math.pow(Math.min(1, (t - REGLAS.neutraMaxC) / (REGLAS.espumaTopeC - REGLAS.neutraMaxC)), 0.625);
  }
  function zona(t) {
    if (t == null) return 'sin_dato';
    if (t < REGLAS.neutraMinC) return 'bajo';
    if (t <= REGLAS.neutraMaxC) return 'cerca';
    return 'sobre';
  }
  const NOMBRES = { es: { 9: 'La', 11: 'Si', 1: 'Do#', 4: 'Mi', 6: 'Fa#' }, en: { 9: 'A', 11: 'B', 1: 'C#', 4: 'E', 6: 'F#' } };

  // Todo lo que suena para una temperatura (para "¿por qué suena así?" y para el bot).
  function describir(t, idioma) {
    if (t == null || !isFinite(t)) return { temp: null, zona: 'sin_dato' };
    const p = paso(t), midi = 57 + semitonos(p); // La3 = 57
    return {
      temp: t, paso: p, nota: (NOMBRES[idioma] || NOMBRES.es)[midi % 12] + (Math.floor(midi / 12) - 1), hz: frecuencia(t),
      notasPorSegundo: notasPorSegundo(t), olaPeriodo: olaPeriodo(t), espuma: espuma(t), fuerza: fuerza(t), zona: zona(t),
    };
  }

  // Variación natural de cada ola (ninguna ola es idéntica). Fija por número de ola: la página y el WAV coinciden.
  function azar(i, k) { const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); }

  // Reverb propia (sala amplia y suave para el piano). Semilla fija.
  function respuestaReverb(sr) {
    const dur = 2.4, pre = Math.floor(0.018 * sr), n = Math.floor(dur * sr);
    const canales = [new Float32Array(n), new Float32Array(n)];
    for (let c = 0; c < 2; c++) {
      let s = c === 0 ? 0x9e3779b9 : 0x7f4a7c15;
      const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296) * 2 - 1; };
      let lp = 0;
      for (let i = pre; i < n; i++) {
        const t = (i - pre) / sr, a = Math.min(0.9, 0.3 + t * 0.3);
        lp = lp * a + rnd() * (1 - a);
        canales[c][i] = lp * Math.exp(-6.9 * t / (dur - 0.018)) * Math.min(1, t / 0.02) * (1 + 2.5 * a);
      }
    }
    return canales;
  }

  // Carga las muestras de piano una vez (AudioBuffer sirve tanto en vivo como al exportar).
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

  // ---------------------------------------------------------------- el instrumento
  class Motor {
    // piano: mapa nota → AudioBuffer (o null: se usa la campana sintetizada)
    construir(piano, instrumento) {
      const T = global.Tone, g = T.dbToGain;

      // Salida → limpieza → limitador (techo -4 dBFS; el navegador suma +2,28 dB que el recorte quita) → seguro
      this.salida = new T.Gain(0);
      const hp = new T.Filter({ type: 'highpass', frequency: 40, rolloff: -12, Q: 0.5 });
      const limitador = new T.Compressor({ threshold: -4, ratio: 20, knee: 0, attack: 0.002, release: 0.12 });
      const recorte = new T.Gain(g(-2.28));
      const seguro = new T.WaveShaper((x) => { const a = Math.abs(x); return a <= 0.8 ? x : Math.sign(x) * (0.8 + 0.15 * Math.tanh((a - 0.8) / 0.15)); }, 4096);
      this.salida.chain(hp, limitador, recorte, seguro, T.getDestination());

      // Reverb (sobre todo para el piano)
      this.envio = new T.Gain(1);
      const hpRev = new T.Filter({ type: 'highpass', frequency: 300, rolloff: -12 });
      const reverb = new T.Convolver(T.ToneAudioBuffer.fromArray(respuestaReverb(T.getContext().sampleRate)));
      const retorno = new T.Gain(g(NIVEL.retornoRevDb));
      this.envio.chain(hpRev, reverb, retorno, this.salida);

      // ---- EL MAR: 3 olas que se turnan (una puede seguir sonando mientras llega la siguiente)
      this.olasBus = new T.Gain(g(NIVEL.olasDb));
      const hpOlas = new T.Filter({ type: 'highpass', frequency: 90, rolloff: -12 }); // sin retumbo grave
      this.olasBus.connect(hpOlas);
      hpOlas.connect(this.salida);
      const envioOlas = new T.Gain(g(-14));
      this.olasBus.connect(envioOlas);
      envioOlas.connect(this.envio);
      const ruidoEspuma = new T.Noise('white');
      const hpEspuma = new T.Filter({ type: 'highpass', frequency: 2500, rolloff: -12 });
      const lpEspuma = new T.Filter({ type: 'lowpass', frequency: 7500, rolloff: -12 });
      ruidoEspuma.chain(hpEspuma, lpEspuma);
      this.fuentes = [ruidoEspuma];
      this.olas = [-0.5, 0.5, 0].map((p) => {
        const ruido = new T.Noise('pink');
        const filtro = new T.Filter({ type: 'lowpass', frequency: 300, rolloff: -24, Q: 0.2 });
        const nivel = new T.Gain(0);
        const espumaNivel = new T.Gain(0);
        const pan = new T.Panner(p);
        ruido.chain(filtro, nivel, pan);
        lpEspuma.connect(espumaNivel);
        const espumaBus = new T.Gain(g(NIVEL.espumaDb - NIVEL.olasDb));
        espumaNivel.chain(espumaBus, pan);
        pan.connect(this.olasBus);
        this.fuentes.push(ruido);
        return { filtro, nivel, espumaNivel };
      });
      this.sigOla = 0;

      // ---- LA MELODÍA: piano real (o campana si no cargó el piano)
      this.melodiaBus = new T.Gain(g(NIVEL.melodiaDb));
      const lpMelodia = new T.Filter({ type: 'lowpass', frequency: 4200, rolloff: -12 });
      this.melodiaBus.connect(lpMelodia);
      lpMelodia.connect(this.salida);
      const envioMel = new T.Gain(g(-3));
      lpMelodia.connect(envioMel);
      envioMel.connect(this.envio);
      this.piano = piano ? new T.Sampler({ urls: piano, release: 1.1, attack: 0.005 }).connect(this.melodiaBus) : null;
      this.campana = [];
      const campanaNivel = new T.Gain(g(-10)); // igualada al piano (medido)
      campanaNivel.connect(this.melodiaBus);
      for (let i = 0; i < 6; i++) {
        this.campana.push(new T.Synth({
          oscillator: { partials: [1, 0.08, 0.02] },
          envelope: { attack: 0.006, decay: 1.6, decayCurve: 'exponential', sustain: 0, release: 0.4 },
        }).connect(campanaNivel));
      }
      this.sigCampana = 0;
      this.instrumento = this.piano && instrumento !== 'campana' ? 'piano' : 'campana';
      return this;
    }

    arrancar(t) { this.fuentes.forEach((f) => f.start(t)); }

    // Balance: cuánto más alto (+) o más bajo (-) suena el mar respecto de la melodía, en dB.
    nivelMar(db, t) { this.olasBus.gain.rampTo(global.Tone.dbToGain(NIVEL.olasDb + db), 0.08, t); }

    // Una nota de la melodía en el tiempo t. Toque más firme cuando el mar está más activo.
    nota(temp, t) {
      const hz = frecuencia(temp), vel = 0.5 + 0.25 * fuerza(temp);
      if (this.instrumento === 'piano') {
        this.piano.triggerAttackRelease(hz, 0.55, t, vel);
      } else {
        const v = this.campana[this.sigCampana];
        this.sigCampana = (this.sigCampana + 1) % this.campana.length;
        v.triggerAttackRelease(hz, 1.6, t, vel * 0.8);
      }
    }

    // Una ola que empieza en t. Devuelve cuánto dura hasta la siguiente.
    ola(temp, t, i) {
      const P = olaPeriodo(temp) * (0.88 + 0.24 * azar(i, 1));
      const f = fuerza(temp), e = espuma(temp);
      const v = this.olas[this.sigOla];
      this.sigOla = (this.sigOla + 1) % this.olas.length;
      const pico = (0.65 + 0.35 * f) * (0.85 + 0.3 * azar(i, 2));
      const brillo = 500 * Math.pow(5, f) * (0.9 + 0.2 * azar(i, 3)); // 500 Hz (mar en calma) → 2500 Hz
      const cresta = t + 0.42 * P;
      // la ola crece lento y cada vez más rápido, rompe en la cresta y se retira despacio
      const n = v.nivel.gain, fr = v.filtro.frequency;
      const nAhora = n.getValueAtTime(t), frAhora = fr.getValueAtTime(t);
      n.cancelScheduledValues(t);
      n.setValueAtTime(nAhora, t);
      n.linearRampToValueAtTime(Math.max(0.02, nAhora), t + 0.03);  // sin saltos al empezar
      n.exponentialRampToValueAtTime(pico, cresta);
      n.setTargetAtTime(0, cresta, 0.36 * P);
      fr.cancelScheduledValues(t);
      fr.setValueAtTime(frAhora, t);
      fr.linearRampToValueAtTime(Math.max(200, frAhora), t + 0.03);
      fr.exponentialRampToValueAtTime(brillo, cresta);
      fr.setTargetAtTime(280, cresta, 0.42 * P);
      // Espuma: solo sobre 27 °C. Rompe en la cresta y deja dos rizos más pequeños. Solo rampas con
      // principio y fin definidos (se encadenan sin sorpresas).
      const es = v.espumaNivel.gain, piso = 1e-4;
      const esAhora = es.getValueAtTime(t);
      es.cancelScheduledValues(t);
      es.setValueAtTime(esAhora, t);
      es.linearRampToValueAtTime(piso, t + 0.06);
      if (e > 0) {
        const alto = Math.max(piso * 2, e * pico);
        es.setValueAtTime(piso, cresta - 0.03);
        es.linearRampToValueAtTime(alto, cresta + 0.05);
        let fin = cresta + 0.05 + 0.13 * P;
        es.exponentialRampToValueAtTime(alto * 0.04, fin);
        if (P >= 1.6) {
          [0.64, 0.84].forEach((x, k) => {
            const tr = Math.max(fin + 0.02, t + P * (x + 0.04 * azar(i, 4 + k)));
            es.linearRampToValueAtTime(alto * 0.04, tr);
            es.linearRampToValueAtTime(alto * 0.45, tr + 0.06);
            fin = tr + 0.06 + 0.09 * P;
            es.exponentialRampToValueAtTime(alto * 0.02, fin);
          });
        }
        es.linearRampToValueAtTime(0, fin + 0.15);
      }
      return P;
    }

    // Rampa lineal del volumen general (entradas, salidas, pausas).
    volumen(valor, t, dur) {
      const p = this.salida.gain, actual = p.getValueAtTime(t);
      p.cancelScheduledValues(t);
      p.setValueAtTime(actual, t);
      p.linearRampToValueAtTime(valor, t + Math.max(0.01, dur));
    }
  }

  // ---------------------------------------------------------------- programación en el tiempo (común a vivo y WAV)
  // est = { t0, D, semanaProgramada, proximaNota, ultimaNota, pasoSonado, proximaOla, nOla }
  // Los eventos (cambio de semana, nota, ola) se procesan en orden de tiempo: así da lo mismo programar
  // de a poco (en vivo) o todo el año de una vez (al exportar).
  function programarDemo(motor, temps, est, hasta) {
    const n = temps.length, D = est.D || DEMO.semana, fin = est.t0 + n * D, tope = Math.min(hasta, fin);
    const tempEn = (t) => temps[limitar(Math.floor((t - est.t0) / D + 1e-6), 0, n - 1)];
    for (;;) {
      const tSem = est.semanaProgramada + 1 < n ? est.t0 + (est.semanaProgramada + 1) * D : Infinity;
      const tSig = Math.min(tSem, est.proximaNota, est.proximaOla);
      if (!(tSig < tope)) break;
      if (tSig === tSem) {
        // Empieza una semana: si la temperatura cambió de escalón, la nota nueva suena ya (se oye cada cambio)
        const temp = temps[++est.semanaProgramada];
        if (temp != null && paso(temp) !== est.pasoSonado && tSem - est.ultimaNota > 0.12) {
          motor.nota(temp, tSem);
          est.ultimaNota = tSem; est.pasoSonado = paso(temp);
          est.proximaNota = tSem + 1 / notasPorSegundo(temp);
        }
      } else if (tSig === est.proximaNota) {
        const temp = tempEn(tSig);
        if (temp == null) { est.proximaNota += 0.05; continue; } // sin dato: no suena
        motor.nota(temp, tSig);
        est.ultimaNota = tSig; est.pasoSonado = paso(temp);
        est.proximaNota = tSig + 1 / notasPorSegundo(temp);
      } else {
        const temp = tempEn(tSig);
        if (temp == null) { est.proximaOla += 0.25; continue; }
        est.proximaOla = tSig + motor.ola(temp, tSig, est.nOla++);
      }
    }
  }

  function programarFijo(motor, temp, est, hasta) {
    if (temp == null) { est.proximaNota = est.proximaOla = hasta; return; }
    while (est.proximaNota < hasta) {
      motor.nota(temp, est.proximaNota);
      est.ultimaNota = est.proximaNota; est.pasoSonado = paso(temp);
      est.proximaNota += 1 / notasPorSegundo(temp);
    }
    while (est.proximaOla < hasta) est.proximaOla += motor.ola(temp, est.proximaOla, est.nOla++);
  }

  function estadoNuevo(t0, D) {
    return { t0, D, semanaProgramada: 0, proximaNota: t0, ultimaNota: -1, pasoSonado: null, proximaOla: t0, nOla: 0 };
  }

  function duracionDemo(n, semana) { return DEMO.entrada + n * (semana || DEMO.semana) + DEMO.salida; }

  // Genera el año completo con el mismo motor, sin sonar (para exportar). Devuelve un AudioBuffer.
  async function renderizar(temps, opciones) {
    const T = global.Tone, op = opciones || {}, prueba = op.prueba || {};
    const instrumento = op.instrumento || 'piano';
    let piano = null;
    if (instrumento === 'piano') { try { piano = await cargarPiano(); } catch (e) { piano = null; } }
    const D = prueba.semana || DEMO.semana, n = temps.length;
    const buf = await T.Offline(() => {
      const m = new Motor().construir(piano, instrumento);
      m.olasBus.gain.value = T.dbToGain(NIVEL.olasDb + (op.marDb || 0));
      if (prueba.sinOlas) m.olasBus.gain.value = 0;
      if (prueba.sinMelodia) m.melodiaBus.gain.value = 0;
      const t0 = DEMO.entrada, fin = t0 + n * D;
      m.arrancar(0);
      m.volumen(NIVEL.salida, 0.0, DEMO.subida);
      const est = estadoNuevo(t0, D);
      if (temps[0] != null) { m.nota(temps[0], t0); est.ultimaNota = t0; est.pasoSonado = paso(temps[0]); est.proximaNota = t0 + 1 / notasPorSegundo(temps[0]); }
      programarDemo(m, temps, est, fin);
      m.volumen(0, fin, DEMO.salida - 0.06);
    }, duracionDemo(n, D), 2, op.sampleRate || 48000);
    return buf.get();
  }

  // ---------------------------------------------------------------- reproductor en vivo
  class Reproductor {
    constructor() {
      this.motor = null;
      this.temps = [];
      this.modo = 'explorar';     // 'demo' (avanza solo) o 'explorar' (semana a semana)
      this.sonando = false;
      this.semana = 0;
      this.tempManual = null;     // temperatura de referencia (para el bot)
      this.posDemo = 0;
      this.est = null;
      this.terminando = false;
      this.instrumento = 'piano';
      this.piano = null;
      this.marDb = 0;             // balance mar ↔ melodía elegido por oído (también se usa al exportar)
      this.alTerminarDemo = function () {};
      this._accion = 0;
      this._movido = 0;
    }

    cargar(temps) {
      this.temps = temps.slice();
      this.semana = Math.min(this.semana, this.temps.length - 1);
    }

    get ahora() { return global.Tone.getContext().currentTime; }

    // Piano listo (o null). Si el motor ya existe, se le agrega.
    usarPiano(piano) {
      this.piano = piano;
      if (this.motor && piano && !this.motor.piano) {
        this.motor.piano = new global.Tone.Sampler({ urls: piano, release: 1.1, attack: 0.005 }).connect(this.motor.melodiaBus);
      }
      this.elegirInstrumento(this.instrumento);
    }

    usarMar(db) {
      this.marDb = db;
      if (this.motor) this.motor.nivelMar(db, this.ahora);
    }

    elegirInstrumento(nombre) {
      this.instrumento = nombre;
      if (this.motor) this.motor.instrumento = nombre === 'piano' && this.motor.piano ? 'piano' : 'campana';
    }

    async preparar() {
      const T = global.Tone;
      if (!this.motor) {
        try { T.setContext(new T.Context({ latencyHint: 'playback' })); } catch (e) { /* se usa el de siempre */ }
        await T.start();
        this.motor = new Motor().construir(this.piano, this.instrumento);
        this.motor.olasBus.gain.value = T.dbToGain(NIVEL.olasDb + this.marDb);
        this.motor.arrancar(this.ahora + 0.02);
        setInterval(() => this._tic(), 25);
      } else {
        await T.start();
      }
      clearTimeout(this._suspension);
    }

    tempActual() { return this.tempManual != null ? this.tempManual : this.temps[this.semana]; }

    semanaActual() {
      if (this.modo === 'demo' && this.est) {
        const p = this.sonando ? (this.ahora - this.est.t0) / DEMO.semana : this.posDemo;
        return limitar(Math.floor(p), 0, this.temps.length - 1);
      }
      return this.semana;
    }

    async iniciarDemo() {
      const accion = ++this._accion, movido = this._movido;
      await this.preparar();
      if (accion !== this._accion) return;
      if (movido !== this._movido) { if (!this.sonando) this._sonar(); return; }
      const t = this.ahora;
      this.modo = 'demo';
      this.tempManual = null;
      this.terminando = false;
      const t0 = t + DEMO.entrada;
      this.est = estadoNuevo(t0, DEMO.semana);
      const t0temp = this.temps[0];
      if (t0temp != null) { this.motor.nota(t0temp, t0); this.est.ultimaNota = t0; this.est.pasoSonado = paso(t0temp); this.est.proximaNota = t0 + 1 / notasPorSegundo(t0temp); }
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
        if (this.posDemo >= this.temps.length) this.posDemo = 0;
        const i = Math.floor(this.posDemo), anterior = this.est;
        this.est = estadoNuevo(t + 0.05 - this.posDemo * DEMO.semana, DEMO.semana);
        this.est.semanaProgramada = i;
        this.est.pasoSonado = anterior ? anterior.pasoSonado : null;
        this.est.proximaNota = this.est.proximaOla = t + 0.05;
        this.terminando = false;
      } else {
        this.est = estadoNuevo(t + 0.05, DEMO.semana);
      }
      this.motor.volumen(NIVEL.salida, t + 0.01, DEMO.subida);
      this.sonando = true;
    }

    pausar() {
      this._accion++;
      if (!this.sonando) return;
      const t = this.ahora;
      if (this.modo === 'demo') this.posDemo = (t - this.est.t0) / DEMO.semana;
      this.sonando = false;
      this.motor.volumen(0, t + 0.01, 0.5);
      clearTimeout(this._suspension);
      this._suspension = setTimeout(() => {
        if (!this.sonando) global.Tone.getContext().rawContext.suspend().catch(() => {});
      }, 2500); // deja que la última nota y la reverb se apaguen
    }

    async alternar() { if (this.sonando) this.pausar(); else await this.reproducir(); }

    // Ir a una semana (pasa a modo explorar). Si está sonando, suena enseguida la nota de esa semana.
    irA(i) {
      this._movido++;
      this.modo = 'explorar';
      this.semana = limitar(i, 0, this.temps.length - 1);
      this.tempManual = null;
      if (this.sonando) this._aplicar();
    }

    // Suena una temperatura de referencia (para el bot); null vuelve a la semana actual.
    fijarTemperatura(temp) {
      this.modo = 'explorar';
      this.tempManual = temp;
      if (this.sonando) this._aplicar();
    }

    _aplicar() {
      const t = this.ahora;
      if (this.terminando) { this.terminando = false; this.motor.volumen(NIVEL.salida, t, 0.3); }
      this.est = this.est || estadoNuevo(t, DEMO.semana);
      this.est.proximaNota = Math.max(t + 0.03, this.est.ultimaNota + 0.15); // respuesta inmediata, sin ametrallar
      this.est.proximaOla = Math.min(this.est.proximaOla, t + olaPeriodo(this.tempActual() || REGLAS.umbralC) * 0.5);
    }

    _tic() {
      if (!this.sonando || !this.motor) return;
      const t = this.ahora, hasta = t + (document.hidden ? 1.2 : 0.12);
      if (this.modo === 'demo') {
        programarDemo(this.motor, this.temps, this.est, hasta);
        const fin = this.est.t0 + this.temps.length * DEMO.semana;
        if (!this.terminando && hasta >= fin) { this.terminando = true; this.motor.volumen(0, fin, DEMO.salida - 0.06); }
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
    REGLAS, DEMO, NIVEL, PIANO,
    paso, frecuencia, notasPorSegundo, olaPeriodo, espuma, fuerza, zona, describir, duracionDemo,
    cargarPiano, Motor, Reproductor, renderizar,
  };
})(window);
