/*
 * Página mínima y accesible del disco Océano (la interfaz bonita la hace Josué; aquí manda el sonido).
 * Carga el JSON de la costa, lo hace sonar con motor-oceano.js, habla con la voz del navegador
 * (español o inglés) y exporta el año en WAV.
 */
(function () {
  'use strict';
  const M = window.MotorOceano;
  const RUTA_DATOS = '../../imagen-a-sonido/oceano_3912/resultados/oceano_3912_costa.json';
  const BARRA = { min: 25, max: 30 }; // escala de la barra visual (°C)

  const TXT = {
    es: {
      disco: 'Disco 1 · Océano · NASA SVS 3912',
      titulo: 'Escucha el mar durante un año',
      zona_prefijo: 'Zona:',
      aviso: 'Temperatura del mar, una cifra por semana. Es una simulación de la NASA (ECCO2, marzo 2007 – febrero 2008): se escucha el ciclo de las estaciones, no el calentamiento global.',
      idioma: 'Idioma · Language',
      zona: 'Zona',
      h_semana: 'Semana actual',
      semana_control: 'Semana (flechas ← → para moverte)',
      h_controles: 'Escuchar',
      demo: 'Escuchar el año (30 s)',
      reproducir: 'Reproducir',
      pausar: 'Pausar',
      prev: 'Semana anterior',
      next: 'Semana siguiente',
      decir: 'Decir la semana',
      leyenda: 'Leyenda sonora',
      casilla_meses: 'Decir los meses mientras suena el año',
      teclas: 'Teclado: <kbd>←</kbd> <kbd>→</kbd> cambiar de semana · <kbd>Espacio</kbd> reproducir o pausar · <kbd>Enter</kbd> decir la semana',
      porque: '¿Por qué suena así?',
      leer: 'Leer en voz alta',
      h_exportar: 'Exportar audio',
      exportar_texto: 'Genera el año completo (30 s) como archivo WAV con el mismo motor que escuchas aquí. Sirve para el video de la demo.',
      exportar: 'Exportar el año en WAV',
      exportando: 'Generando el audio…',
      exportado: 'Listo: {archivo} ({seg} s).',
      export_error: 'No se pudo generar el audio: {error}',
      pie: 'Datos: NASA Scientific Visualization Studio, SVS 3912 (simulación ECCO2). La temperatura se obtiene leyendo el color de las líneas de corriente del mapa (error máximo 0,46 °C). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      semana_de: 'Semana {n} de {N}',
      zonas: { sobre: 'Sobre el umbral de 26,5 °C', cerca: 'Cerca del umbral de 26,5 °C (zona neutra)', bajo: 'Bajo el umbral de 26,5 °C', sin_dato: 'Sin dato esta semana' },
      voz_zona: { sobre: 'Por encima del umbral de 26,5', cerca: 'Cerca del umbral de 26,5', bajo: 'Por debajo del umbral de 26,5' },
      voz_semana: 'Semana {n} de {N}. {fecha}. Unos {grados} grados. {zona}.',
      voz_sin_dato: 'Semana {n} de {N}. {fecha}. Sin dato esta semana.',
      valor: 'Semana {n} de {N}: {fecha}, {temp} grados, {zona}',
      valor_sin: 'Semana {n} de {N}: {fecha}, sin dato',
      fin_demo: 'Fin del año.',
      cargando: 'Cargando datos…',
      error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md), no con doble clic.',
      sin_voz: 'Este navegador no tiene voz sintetizada: los textos se anuncian al lector de pantalla.',
      ley_intro: 'Leyenda sonora: tres referencias.',
      ley_min: 'Lo más fresco del año, {fecha}: unos {grados} grados.',
      ley_umbral: 'El umbral de 26,5 grados, como referencia.',
      ley_max: 'Lo más caliente del año, {fecha}: unos {grados} grados.',
      ahora: 'Esta semana: {temp} °C → nota {nota} (escalón {paso} de la escala), {pps} pulsos por segundo, aspereza {asp} %.',
      ahora_nota: { sobre: '', cerca: ' Zona neutra: sonido limpio.', bajo: ' Bajo 26 °C: limpio y calmado.' },
      ahora_sin: 'Esta semana no tiene dato: el pad se apaga y no hay pulsos.',
      que_costa: '<strong>Qué escuchas.</strong> La temperatura del mar frente a la costa salvadoreña (una franja de ~20 a ~176 km mar adentro, de Acajutla al Golfo de Fonseca), una cifra por semana, durante un año simulado por la NASA (ECCO2, marzo 2007 – febrero 2008). Es el ciclo de las estaciones, no calentamiento global.',
      que_caribe: '<strong>Qué escuchas.</strong> La temperatura del mar en el centro del Caribe, para comparar con la costa salvadoreña, una cifra por semana durante el mismo año simulado (ECCO2, marzo 2007 – febrero 2008). Es el ciclo de las estaciones, no calentamiento global.',
      porque_lista: [
        '<strong>Más agudo = más caliente.</strong> Cada medio grado sube un escalón de una escala pentatónica (cinco notas que nunca chocan entre sí). Medio grado es casi nuestro error de lectura (0,46 °C): si la nota cambia, es una diferencia que sí medimos. La escala es la misma para todas las zonas; no la estiramos para exagerar.',
        '<strong>Pulsos más seguidos = mar más activo.</strong> A 26 °C suena un pulso por segundo; por cada 2 °C más, van el doble de seguidos.',
        '<strong>Aspereza = sobre 27 °C.</strong> Un temblor muy rápido del volumen (45 veces por segundo) que el oído siente como tensión. Solo aparece sobre 27 °C y crece poco a poco hasta el máximo del año (29,3 °C).',
        '<strong>26,5 °C es el umbral</strong> de temperatura del mar que favorece la formación de huracanes (NOAA). Entre 26 y 27 °C estamos a menos de medio grado de él, el tamaño de nuestro error de lectura: por eso ahí el sonido queda limpio y la voz dice «cerca del umbral».',
        '<strong>Bajo 26 °C:</strong> limpio y calmado (pulsos lentos, sin aspereza).',
        '<strong>El volumen no es un dato:</strong> graves y agudos suenan parejos.',
        '<strong>Lo que no hacemos:</strong> no hay música de fondo, ni sonidos tristes, ni alarmas. Si el dato no cambia, el sonido no cambia.',
        '<strong>Cómo se midió:</strong> leímos el color de las líneas de corriente en los mapas de la NASA (SVS 3912) y lo pasamos a °C con su barra de colores. La costa es la mediana de tres tramos: Acajutla, La Libertad / Surf City y El Cuco.',
      ],
      meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      meses_corto: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      fecha_larga: (d, m, a, M) => `${d} de ${M[m]} de ${a}`,
      fecha_corta: (d, m, a, M) => `${d} ${M[m]} ${a}`,
      dia_mes: (d, m, M) => `${d} de ${M[m]}`,
      lang: 'es-MX',
      voces: ['es-mx', 'es-us', 'es-419', 'es-es', 'es'],
      decimal: ',',
    },
    en: {
      disco: 'Disc 1 · Ocean · NASA SVS 3912',
      titulo: 'Listen to the sea for one year',
      zona_prefijo: 'Zone:',
      aviso: 'Sea temperature, one value per week. It is a NASA simulation (ECCO2, March 2007 – February 2008): you hear the seasonal cycle, not global warming.',
      idioma: 'Idioma · Language',
      zona: 'Zone',
      h_semana: 'Current week',
      semana_control: 'Week (use ← → arrows to move)',
      h_controles: 'Listen',
      demo: 'Play the year (30 s)',
      reproducir: 'Play',
      pausar: 'Pause',
      prev: 'Previous week',
      next: 'Next week',
      decir: 'Say the week',
      leyenda: 'Sound legend',
      casilla_meses: 'Say the months while the year plays',
      teclas: 'Keyboard: <kbd>←</kbd> <kbd>→</kbd> change week · <kbd>Space</kbd> play or pause · <kbd>Enter</kbd> say the week',
      porque: 'Why does it sound like this?',
      leer: 'Read aloud',
      h_exportar: 'Export audio',
      exportar_texto: 'Renders the full year (30 s) as a WAV file with the same engine you hear here. Use it for the demo video.',
      exportar: 'Export the year as WAV',
      exportando: 'Rendering audio…',
      exportado: 'Done: {archivo} ({seg} s).',
      export_error: 'Could not render the audio: {error}',
      pie: 'Data: NASA Scientific Visualization Studio, SVS 3912 (ECCO2 simulation). Temperature is obtained by reading the color of the map\'s current lines (maximum error 0.46 °C). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      semana_de: 'Week {n} of {N}',
      zonas: { sobre: 'Above the 26.5 °C threshold', cerca: 'Near the 26.5 °C threshold (neutral zone)', bajo: 'Below the 26.5 °C threshold', sin_dato: 'No data this week' },
      voz_zona: { sobre: 'Above the 26.5 degree threshold', cerca: 'Near the 26.5 degree threshold', bajo: 'Below the 26.5 degree threshold' },
      voz_semana: 'Week {n} of {N}. {fecha}. About {grados} degrees Celsius. {zona}.',
      voz_sin_dato: 'Week {n} of {N}. {fecha}. No data this week.',
      valor: 'Week {n} of {N}: {fecha}, {temp} degrees, {zona}',
      valor_sin: 'Week {n} of {N}: {fecha}, no data',
      fin_demo: 'End of the year.',
      cargando: 'Loading data…',
      error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md), not by double-clicking.',
      sin_voz: 'This browser has no speech synthesis: texts are announced to the screen reader.',
      ley_intro: 'Sound legend: three references.',
      ley_min: 'The coolest week of the year, {fecha}: about {grados} degrees.',
      ley_umbral: 'The 26.5 degree threshold, as a reference.',
      ley_max: 'The warmest week of the year, {fecha}: about {grados} degrees.',
      ahora: 'This week: {temp} °C → note {nota} (step {paso} of the scale), {pps} pulses per second, roughness {asp} %.',
      ahora_nota: { sobre: '', cerca: ' Neutral zone: clean sound.', bajo: ' Below 26 °C: clean and calm.' },
      ahora_sin: 'This week has no data: the pad fades out and there are no pulses.',
      que_costa: '<strong>What you hear.</strong> Sea temperature off El Salvador\'s coast (a strip ~20 to ~176 km offshore, from Acajutla to the Gulf of Fonseca), one value per week, over one year simulated by NASA (ECCO2, March 2007 – February 2008). It is the seasonal cycle, not global warming.',
      que_caribe: '<strong>What you hear.</strong> Sea temperature in the central Caribbean, to compare with El Salvador\'s coast, one value per week over the same simulated year (ECCO2, March 2007 – February 2008). It is the seasonal cycle, not global warming.',
      porque_lista: [
        '<strong>Higher pitch = warmer.</strong> Every half degree moves one step up a pentatonic scale (five notes that never clash). Half a degree is about our reading error (0.46 °C): if the note changes, it is a difference we actually measured. The scale is the same for every zone; we don\'t stretch it to exaggerate.',
        '<strong>Faster pulses = a more active sea.</strong> At 26 °C there is one pulse per second; every 2 °C more doubles the pace.',
        '<strong>Roughness = above 27 °C.</strong> A very fast tremor in loudness (45 times per second) that the ear perceives as tension. It appears only above 27 °C and grows gradually up to the year\'s maximum (29.3 °C).',
        '<strong>26.5 °C is the threshold</strong> of sea temperature that favors hurricane formation (NOAA). Between 26 and 27 °C we are within half a degree of it, the size of our reading error: so the sound stays clean there and the voice says "near the threshold".',
        '<strong>Below 26 °C:</strong> clean and calm (slow pulses, no roughness).',
        '<strong>Loudness is not data:</strong> low and high notes sound equally loud.',
        '<strong>What we don\'t do:</strong> no background music, no sad sounds, no alarms. If the data doesn\'t change, the sound doesn\'t change.',
        '<strong>How it was measured:</strong> we read the color of the current lines on NASA\'s maps (SVS 3912) and converted it to °C with their color bar. The coast is the median of three stretches: Acajutla, La Libertad / Surf City and El Cuco.',
      ],
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      meses_corto: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      fecha_larga: (d, m, a, M) => `${M[m]} ${d}, ${a}`,
      fecha_corta: (d, m, a, M) => `${M[m]} ${d}, ${a}`,
      dia_mes: (d, m, M) => `${M[m]} ${d}`,
      lang: 'en-US',
      voces: ['en-us', 'en-gb', 'en'],
      decimal: '.',
    },
  };

  // ---------------------------------------------------------------- estado
  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es';
  let datos = null;
  let zonaSel = 'costa';
  let serie = [];
  let ultimaMostrada = -1;
  let ultimoMes = null;
  let leyendaActiva = 0;      // token: cambia para cancelar la leyenda en curso
  let leyendaCorriendo = false;

  const L = () => TXT[idioma];
  function t(clave, vars) {
    let s = L()[clave];
    if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
    return s;
  }
  const num = (x, d) => x.toFixed(d).replace('.', L().decimal);
  function partes(iso) { const [a, m, d] = iso.split('-').map(Number); return [d, m - 1, a]; }
  const fechaLarga = (iso) => { const [d, m, a] = partes(iso); return L().fecha_larga(d, m, a, L().meses); };
  const fechaCorta = (iso) => { const [d, m, a] = partes(iso); return L().fecha_corta(d, m, a, L().meses_corto); };
  const diaMes = (iso) => { const [d, m] = partes(iso); return L().dia_mes(d, m, L().meses); };

  function anunciar(texto) { // para el lector de pantalla
    const a = $('anuncio');
    a.textContent = '';
    setTimeout(() => { a.textContent = texto; }, 30);
  }

  // ---------------------------------------------------------------- voz del navegador
  const Voz = {
    hay: 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    voces: [],
    turno: 0,
    iniciar() {
      if (!this.hay) return;
      const cargar = () => { this.voces = speechSynthesis.getVoices(); };
      cargar();
      speechSynthesis.addEventListener('voiceschanged', cargar);
    },
    voz() {
      for (const p of L().voces) {
        const v = this.voces.find((x) => (x.lang || '').toLowerCase().replace('_', '-').startsWith(p));
        if (v) return v;
      }
      return null;
    },
    // Dice uno o varios textos. interrumpir: corta lo que esté diciendo. agachar: baja la música mientras habla.
    // Solo una frase que interrumpe abre un "turno" nuevo; las que no interrumpen (los meses) se ponen en fila
    // sin anular a las demás.
    decir(textos, { interrumpir = true, agachar = true } = {}) {
      textos = [].concat(textos);
      if (!this.hay) { anunciar(textos.join(' ')); return Promise.resolve(); }
      if (interrumpir) this.turno++;
      const turno = this.turno;
      return new Promise((resolver) => {
        const hablar = () => {
          if (turno !== this.turno) { resolver(); return; }
          if (agachar) rep.agacharse(true);
          textos.forEach((texto, i) => {
            const u = new SpeechSynthesisUtterance(texto);
            u.lang = L().lang;
            const v = this.voz();
            if (v) u.voice = v;
            if (i === textos.length - 1) {
              const fin = () => { if (turno === this.turno && agachar) rep.agacharse(false); resolver(); };
              u.onend = fin;
              u.onerror = fin;
            }
            speechSynthesis.speak(u);
          });
        };
        if (interrumpir && (speechSynthesis.speaking || speechSynthesis.pending)) {
          speechSynthesis.cancel();
          setTimeout(hablar, 60); // Chrome a veces ignora un speak() pegado a cancel()
        } else {
          hablar();
        }
      });
    },
    callar() {
      this.turno++;
      if (this.hay) speechSynthesis.cancel();
      rep.agacharse(false);
    },
  };

  // ---------------------------------------------------------------- textos y pantalla
  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('teclas').innerHTML = t('teclas');
    $('btn-demo').textContent = t('demo');
    $('btn-prev').innerHTML = '<span aria-hidden="true">◀ </span>' + t('prev');
    $('btn-next').innerHTML = t('next') + '<span aria-hidden="true"> ▶</span>';
    $('btn-decir').textContent = t('decir');
    $('btn-leyenda').textContent = t('leyenda');
    $('btn-leer').textContent = t('leer');
    $('btn-exportar').textContent = t('exportar');
    if (datos) {
      const zs = datos.zonas;
      $('zona').options[0].textContent = idioma === 'es' ? zs.costa.nombre_es : zs.costa.nombre_en;
      $('zona').options[1].textContent = idioma === 'es' ? zs.caribe.nombre_es : zs.caribe.nombre_en;
      $('zona-nombre').textContent = idioma === 'es' ? zs[zonaSel].nombre_es : zs[zonaSel].nombre_en;
    }
    $('porque-texto').innerHTML = '<p>' + t(zonaSel === 'costa' ? 'que_costa' : 'que_caribe') + '</p><ul>' +
      L().porque_lista.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    const pct = (c) => (100 * (c - BARRA.min) / (BARRA.max - BARRA.min)) + '%';
    const n = $('barra-neutra');
    n.style.left = pct(M.REGLAS.neutraMinC);
    n.style.width = (100 * (M.REGLAS.neutraMaxC - M.REGLAS.neutraMinC) / (BARRA.max - BARRA.min)) + '%';
    $('barra-umbral').style.left = pct(M.REGLAS.umbralC);
    const eMin = $('et-min'), eUm = $('et-umbral'), eMax = $('et-max');
    eMin.textContent = BARRA.min + ' °C'; eMin.style.left = '0'; eMin.style.transform = 'none';
    eUm.textContent = num(M.REGLAS.umbralC, 1) + ' °C'; eUm.style.left = pct(M.REGLAS.umbralC);
    eMax.textContent = BARRA.max + ' °C'; eMax.style.right = '0'; eMax.style.transform = 'none';
    ultimaMostrada = -1;
    actualizarBotonPlay(true);
  }

  function textoValor(i) {
    const s = serie[i], T = s.temperatura_c;
    if (T == null) return t('valor_sin', { n: i + 1, N: serie.length, fecha: fechaLarga(s.fecha) });
    const z = L().zonas[M.zona(T)];
    return t('valor', { n: i + 1, N: serie.length, fecha: fechaLarga(s.fecha), temp: num(T, 1), zona: z.charAt(0).toLowerCase() + z.slice(1) });
  }

  function mostrar(i, actualizarValorAccesible) {
    const s = serie[i], T = s.temperatura_c, d = M.describir(T, idioma);
    $('fecha').textContent = t('semana_de', { n: i + 1, N: serie.length }) + ' · ' + fechaCorta(s.fecha);
    $('temp').textContent = T == null ? '—' : num(T, 1) + ' °C';
    $('estado').textContent = L().zonas[d.zona];
    const x = T == null ? 0 : Math.max(0, Math.min(1, (T - BARRA.min) / (BARRA.max - BARRA.min)));
    $('barra-relleno').style.width = (100 * x) + '%';
    const sl = $('semana');
    sl.value = String(i + 1);
    if (actualizarValorAccesible) sl.setAttribute('aria-valuetext', textoValor(i));
    $('ahora-explica').textContent = T == null ? t('ahora_sin') : t('ahora', {
      temp: num(T, 1), nota: d.nota, paso: d.paso, pps: num(d.pulsosPorSegundo, 1), asp: Math.round(100 * d.aspereza),
    }) + L().ahora_nota[d.zona];
  }

  let textoPlay = '';
  function actualizarBotonPlay(forzar) {
    const nuevo = rep.sonando ? t('pausar') : t('reproducir');
    if (forzar || nuevo !== textoPlay) { textoPlay = nuevo; $('btn-play').textContent = nuevo; }
  }

  function anunciarMes(i) {
    const [, m, a] = partes(serie[i].fecha);
    const clave = a * 12 + m;
    if (clave === ultimoMes) return;
    const primero = ultimoMes == null;
    ultimoMes = clave;
    if (!$('chk-meses').checked) return;
    const texto = L().meses[m] + (primero || m === 0 ? ' ' + a : '');
    Voz.decir(texto, { interrumpir: false, agachar: false });
  }

  function bucle() {
    if (serie.length) {
      const i = rep.semanaActual();
      if (i !== ultimaMostrada) {
        const enDemo = rep.modo === 'demo' && rep.sonando;
        mostrar(i, !enDemo); // en la demo no se toca el valor accesible (evita que el lector hable 48 veces)
        if (enDemo) anunciarMes(i);
        ultimaMostrada = i;
      }
      actualizarBotonPlay(false);
    }
    requestAnimationFrame(bucle);
  }

  // ---------------------------------------------------------------- acciones
  function cancelarLeyenda() {
    if (!leyendaCorriendo) return;
    leyendaActiva++;
    leyendaCorriendo = false;
    Voz.callar();
    rep.tempManual = null;
  }

  async function demo() {
    cancelarLeyenda();
    ultimoMes = null;
    anunciarMes(0); // dentro del clic: en iPhone la voz solo arranca si la primera frase sale de un toque
    // El foco pasa al control de semanas: desde ahí Espacio pausa, Enter dice la semana y las flechas mueven
    // (si se quedara en el botón, Enter volvería a empezar el año)
    $('semana').focus();
    await rep.iniciarDemo();
    ultimaMostrada = -1;
  }

  async function alternar() {
    cancelarLeyenda();
    await rep.alternar();
    if (!rep.sonando) mostrar(rep.semanaActual(), true);
  }

  function irA(i) {
    cancelarLeyenda();
    if (rep.modo === 'demo') rep.semana = rep.semanaActual();
    rep.irA(i);
    mostrar(rep.semana, true);
    ultimaMostrada = rep.semana;
  }

  function mover(delta) { irA(rep.semanaActual() + delta); }

  function fraseSemana(i) {
    const s = serie[i], T = s.temperatura_c, base = { n: i + 1, N: serie.length, fecha: fechaLarga(s.fecha) };
    if (T == null) return t('voz_sin_dato', base);
    return t('voz_semana', Object.assign(base, { grados: Math.round(T), zona: L().voz_zona[M.zona(T)] }));
  }

  function decirSemana() {
    cancelarLeyenda();
    Voz.decir(fraseSemana(rep.semanaActual()));
  }

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  async function leyenda() {
    cancelarLeyenda();
    const token = ++leyendaActiva;
    leyendaCorriendo = true;
    const conDato = serie.filter((s) => s.temperatura_c != null);
    const min = conDato.reduce((a, b) => (b.temperatura_c < a.temperatura_c ? b : a));
    const max = conDato.reduce((a, b) => (b.temperatura_c > a.temperatura_c ? b : a));
    const pasos = [
      { texto: t('ley_intro') },
      { texto: t('ley_min', { fecha: diaMes(min.fecha), grados: Math.round(min.temperatura_c) }), temp: min.temperatura_c },
      { texto: t('ley_umbral'), temp: M.REGLAS.umbralC },
      { texto: t('ley_max', { fecha: diaMes(max.fecha), grados: Math.round(max.temperatura_c) }), temp: max.temperatura_c },
    ];
    const sigue = () => token === leyendaActiva;
    await rep.preparar();
    for (const p of pasos) {
      if (!sigue()) return;
      if (rep.sonando) { rep.pausar(); await esperar(650); }
      if (!sigue()) return;
      await Voz.decir(p.texto, { agachar: false });
      if (!sigue() || p.temp == null) continue;
      rep.fijarTemperatura(p.temp);
      await rep.reproducir();
      await esperar(3600);
    }
    if (!sigue()) return;
    rep.pausar();
    rep.tempManual = null;
    leyendaCorriendo = false;
  }

  function leerPorque() {
    cancelarLeyenda();
    const partesTexto = [$('porque-texto').querySelector('p').textContent]
      .concat([...$('porque-texto').querySelectorAll('li')].map((li) => li.textContent))
      .concat([$('ahora-explica').textContent]);
    Voz.decir(partesTexto);
  }

  // WAV de 16 bits con dither (ruido mínimo para que el redondeo no se oiga)
  function aWav(buffer) {
    const nc = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length;
    const datosWav = new DataView(new ArrayBuffer(44 + n * nc * 2));
    const texto = (o, s) => { for (let i = 0; i < s.length; i++) datosWav.setUint8(o + i, s.charCodeAt(i)); };
    texto(0, 'RIFF'); datosWav.setUint32(4, 36 + n * nc * 2, true); texto(8, 'WAVE');
    texto(12, 'fmt '); datosWav.setUint32(16, 16, true); datosWav.setUint16(20, 1, true);
    datosWav.setUint16(22, nc, true); datosWav.setUint32(24, sr, true); datosWav.setUint32(28, sr * nc * 2, true);
    datosWav.setUint16(32, nc * 2, true); datosWav.setUint16(34, 16, true);
    texto(36, 'data'); datosWav.setUint32(40, n * nc * 2, true);
    const canales = [];
    for (let c = 0; c < nc; c++) canales.push(buffer.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < nc; c++) {
        const v = canales[c][i] * 32767 + (Math.random() - Math.random());
        datosWav.setInt16(o, Math.max(-32768, Math.min(32767, Math.round(v))), true);
        o += 2;
      }
    }
    return new Blob([datosWav], { type: 'audio/wav' });
  }

  async function generarWav() {
    const temps = serie.map((s) => s.temperatura_c);
    const buffer = await M.renderizar(temps, { sampleRate: 48000 });
    return { blob: aWav(buffer), segundos: buffer.duration, nombre: 'oceano_3912_' + zonaSel + '_anio_30s.wav' };
  }

  async function exportar() {
    cancelarLeyenda();
    const btn = $('btn-exportar'), est = $('estado-export');
    btn.disabled = true;
    est.textContent = t('exportando');
    rep.pausar();
    try {
      const r = await generarWav();
      const url = URL.createObjectURL(r.blob);
      const a = document.createElement('a');
      a.href = url; a.download = r.nombre;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      est.textContent = t('exportado', { archivo: r.nombre, seg: num(r.segundos, 1) });
    } catch (e) {
      console.error(e);
      est.textContent = t('export_error', { error: e && e.message ? e.message : String(e) });
    } finally {
      btn.disabled = false;
    }
  }

  function elegirZona(z) {
    zonaSel = z;
    serie = datos.series[z];
    rep.cargar(serie.map((s) => s.temperatura_c));
    aplicarIdioma();
    mostrar(rep.semanaActual(), true);
  }

  // ---------------------------------------------------------------- teclado (todo usable sin mouse)
  document.addEventListener('keydown', (e) => {
    if (!serie.length || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target, tag = el.tagName, tipo = (el.type || '').toLowerCase();
    const nativo = tag === 'BUTTON' || tag === 'SUMMARY' || tag === 'SELECT' || tag === 'A' || tag === 'TEXTAREA' ||
      (tag === 'INPUT' && tipo !== 'range');
    if (e.key === ' ' || e.code === 'Space') {
      // Tras pulsar "Escuchar el año" el foco queda ahí: desde entonces Espacio pausa y continúa
      // (no reinicia). Para empezar el año de nuevo: Enter o clic en ese botón.
      const alternarDesdeDemo = el.id === 'btn-demo' && rep.motor;
      if (nativo && !alternarDesdeDemo) return; // en otro botón, Espacio lo pulsa (lo normal)
      e.preventDefault();
      alternar();
    } else if (e.key === 'Enter') {
      if (nativo) return;
      e.preventDefault();
      decirSemana();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // En botones y casillas las flechas no hacen nada: mueven la semana. En listas, campos de texto y el
      // control deslizante se deja lo normal (el deslizante ya mueve la semana solo).
      const usaFlechas = tag === 'SELECT' || tag === 'TEXTAREA' || (tag === 'INPUT' && tipo !== 'checkbox');
      if (usaFlechas) return;
      e.preventDefault();
      mover(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  // ---------------------------------------------------------------- arranque
  async function iniciar() {
    Voz.iniciar();
    aplicarIdioma();
    $('fecha').textContent = t('cargando');
    $('btn-demo').addEventListener('click', demo);
    $('btn-play').addEventListener('click', alternar);
    $('btn-prev').addEventListener('click', () => mover(-1));
    $('btn-next').addEventListener('click', () => mover(1));
    $('btn-decir').addEventListener('click', decirSemana);
    $('btn-leyenda').addEventListener('click', leyenda);
    $('btn-leer').addEventListener('click', leerPorque);
    $('btn-exportar').addEventListener('click', exportar);
    $('semana').addEventListener('input', (e) => irA(Number(e.target.value) - 1));
    $('idioma').addEventListener('change', (e) => {
      idioma = e.target.value;
      Voz.callar();
      aplicarIdioma();
      if (serie.length) mostrar(rep.semanaActual(), true);
    });
    $('zona').addEventListener('change', (e) => { cancelarLeyenda(); elegirZona(e.target.value); });
    rep.alTerminarDemo = () => {
      mostrar(rep.semanaActual(), true);
      if ($('chk-meses').checked) Voz.decir(t('fin_demo'), { interrumpir: false, agachar: false });
      else anunciar(t('fin_demo'));
    };
    if (!Voz.hay) $('estado-export').textContent = t('sin_voz');
    if (!window.Tone) { $('fecha').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }

    try {
      const r = await fetch(RUTA_DATOS, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) {
      $('fecha').textContent = t('error_datos');
      $('fecha').setAttribute('role', 'alert');
      return;
    }
    $('semana').max = String(datos.series.costa.length);
    elegirZona('costa');
    requestAnimationFrame(bucle);
  }

  // Para pruebas y para el video: genera el WAV sin descargarlo.
  window.OceanoApp = { generarWav, reproductor: rep };

  iniciar();
})();
