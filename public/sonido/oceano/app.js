/*
 * Página mínima del disco Océano (la interfaz bonita la hace Josué; la voz para personas ciegas la pone
 * el bot del otro Diego). Carga el JSON de la costa, lo hace sonar con motor-oceano.js y exporta el WAV.
 */
(function () {
  'use strict';
  const M = window.MotorOceano;
  const RUTA_DATOS = '../datos/oceano_3912_costa.json';
  const BARRA = { min: 25, max: 30 }; // escala de la barra visual (°C)

  const TXT = {
    es: {
      disco: 'Disco 1 · Océano · NASA SVS 3912',
      titulo: 'Escucha el mar durante un año',
      zona_prefijo: 'Zona:',
      aviso: 'Temperatura del mar, una cifra por semana. Es una simulación de la NASA (ECCO2, marzo 2007 – febrero 2008): se escucha el ciclo de las estaciones, no el calentamiento global.',
      idioma: 'Idioma',
      zona: 'Zona',
      instrumento: 'Melodía',
      mapa_globo: 'Todo el Pacífico (NASA SVS 3912). El recuadro blanco es la zona ampliada.',
      mapa_zoom: 'Zoom: {zona}. Recuadro punteado = el mar que escuchas (aprox.).',
      mar: 'Mar ↔ Melodía',
      mar_valor: 'mar {db} dB respecto de la melodía',
      piano: 'Piano',
      campana: 'Campana',
      piano_cargando: 'Piano (cargando…)',
      piano_error: 'No se pudo cargar el piano (¿sin internet?): suena la campana.',
      h_semana: 'Semana actual',
      semana_control: 'Semana (flechas ← → para moverte)',
      h_controles: 'Escuchar',
      demo: 'Escuchar el año (30 s)',
      reproducir: 'Reproducir',
      pausar: 'Pausar',
      prev: 'Semana anterior',
      next: 'Semana siguiente',
      teclas: 'Teclado: <kbd>←</kbd> <kbd>→</kbd> cambiar de semana · <kbd>Espacio</kbd> reproducir o pausar',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio',
      exportar_texto: 'Genera el año completo (30 s) como archivo WAV con el mismo motor que escuchas aquí. Sirve para el video de la demo.',
      exportar: 'Exportar el año en WAV',
      exportando: 'Generando el audio…',
      exportado: 'Listo: {archivo} ({seg} s).',
      export_error: 'No se pudo generar el audio: {error}',
      pie: 'Datos: NASA Scientific Visualization Studio, SVS 3912 (simulación ECCO2). La temperatura se obtiene leyendo el color de las líneas de corriente del mapa (error máximo 0,46 °C). Imágenes: NASA/SVS 3912. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      semana_de: 'Semana {n} de {N}',
      zonas: { sobre: 'Sobre el umbral de 26,5 °C', cerca: 'Cerca del umbral de 26,5 °C (zona neutra)', bajo: 'Bajo el umbral de 26,5 °C', sin_dato: 'Sin dato esta semana' },
      valor: 'Semana {n} de {N}: {fecha}, {temp} grados, {zona}',
      valor_sin: 'Semana {n} de {N}: {fecha}, sin dato',
      fin_demo: 'Fin del año.',
      cargando: 'Cargando datos…',
      error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md), no con doble clic.',
      ahora: 'Esta semana: {temp} °C → nota {nota}, {nps} notas por segundo, una ola cada {ola} s, espuma {esp} %.',
      ahora_nota: { sobre: '', cerca: ' Zona neutra: mar liso, sin espuma.', bajo: ' Bajo 26 °C: mar en calma.' },
      ahora_sin: 'Esta semana no tiene dato: no suena nada.',
      que_costa: '<strong>Qué escuchas.</strong> El mar frente a la costa salvadoreña (una franja de ~20 a ~176 km mar adentro, de Acajutla al Golfo de Fonseca) durante un año simulado por la NASA (ECCO2, marzo 2007 – febrero 2008), una temperatura por semana. Es el ciclo de las estaciones, no calentamiento global.',
      que_caribe: '<strong>Qué escuchas.</strong> El mar en el centro del Caribe, para comparar con la costa salvadoreña, durante el mismo año simulado (ECCO2, marzo 2007 – febrero 2008), una temperatura por semana. Es el ciclo de las estaciones, no calentamiento global.',
      porque_lista: [
        '<strong>Solo suenan dos cosas:</strong> el mar (olas) y una melodía (piano).',
        '<strong>Melodía más aguda = mar más caliente.</strong> Cada medio grado sube un escalón de una escala pentatónica (cinco notas que nunca chocan). Medio grado es casi nuestro error de lectura (0,46 °C): si la nota cambia, es una diferencia que sí medimos. Cuando la temperatura cambia de escalón, la nota nueva suena en ese momento.',
        '<strong>Más seguido = mar más activo.</strong> A 26 °C suena una nota por segundo y llega una ola cada 4,4 s; cuanto más caliente, más seguidas las notas y las olas, y las olas más llenas.',
        '<strong>Espuma = sobre 27 °C.</strong> Las olas rompen con espuma (un siseo en la cresta) que crece hasta el máximo del año (29,3 °C). Bajo 27 °C el mar queda liso.',
        '<strong>26,5 °C es el umbral</strong> de temperatura del mar que favorece la formación de huracanes (NOAA). Entre 26 y 27 °C estamos a menos de medio grado de él, el tamaño de nuestro error: por eso ahí no hay espuma.',
        '<strong>Lo que no hacemos:</strong> no hay música de fondo, ni sonidos tristes, ni alarmas. Si el dato no cambia, el sonido no cambia.',
        '<strong>Cómo se midió:</strong> leímos el color de las líneas de corriente en los mapas de la NASA (SVS 3912) y lo pasamos a °C con su barra de colores. La costa es la mediana de tres tramos: Acajutla, La Libertad / Surf City y El Cuco.',
      ],
      meses_corto: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
      meses: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
      fecha_larga: (d, m, a, Mx) => `${d} de ${Mx[m]} de ${a}`,
      fecha_corta: (d, m, a, Mx) => `${d} ${Mx[m]} ${a}`,
      decimal: ',',
    },
    en: {
      disco: 'Disc 1 · Ocean · NASA SVS 3912',
      titulo: 'Listen to the sea for one year',
      zona_prefijo: 'Zone:',
      aviso: 'Sea temperature, one value per week. It is a NASA simulation (ECCO2, March 2007 – February 2008): you hear the seasonal cycle, not global warming.',
      idioma: 'Language',
      zona: 'Zone',
      instrumento: 'Melody',
      mapa_globo: 'The whole Pacific (NASA SVS 3912). The white box is the zoomed area.',
      mapa_zoom: 'Zoom: {zona}. Dashed box = the sea you hear (approx.).',
      mar: 'Sea ↔ Melody',
      mar_valor: 'sea {db} dB relative to the melody',
      piano: 'Piano',
      campana: 'Bell',
      piano_cargando: 'Piano (loading…)',
      piano_error: 'Could not load the piano (offline?): the bell plays instead.',
      h_semana: 'Current week',
      semana_control: 'Week (use ← → arrows to move)',
      h_controles: 'Listen',
      demo: 'Play the year (30 s)',
      reproducir: 'Play',
      pausar: 'Pause',
      prev: 'Previous week',
      next: 'Next week',
      teclas: 'Keyboard: <kbd>←</kbd> <kbd>→</kbd> change week · <kbd>Space</kbd> play or pause',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio',
      exportar_texto: 'Renders the full year (30 s) as a WAV file with the same engine you hear here. Use it for the demo video.',
      exportar: 'Export the year as WAV',
      exportando: 'Rendering audio…',
      exportado: 'Done: {archivo} ({seg} s).',
      export_error: 'Could not render the audio: {error}',
      pie: 'Data: NASA Scientific Visualization Studio, SVS 3912 (ECCO2 simulation). Temperature is obtained by reading the color of the map\'s current lines (maximum error 0.46 °C). Images: NASA/SVS 3912. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      semana_de: 'Week {n} of {N}',
      zonas: { sobre: 'Above the 26.5 °C threshold', cerca: 'Near the 26.5 °C threshold (neutral zone)', bajo: 'Below the 26.5 °C threshold', sin_dato: 'No data this week' },
      valor: 'Week {n} of {N}: {fecha}, {temp} degrees, {zona}',
      valor_sin: 'Week {n} of {N}: {fecha}, no data',
      fin_demo: 'End of the year.',
      cargando: 'Loading data…',
      error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md), not by double-clicking.',
      ahora: 'This week: {temp} °C → note {nota}, {nps} notes per second, a wave every {ola} s, foam {esp} %.',
      ahora_nota: { sobre: '', cerca: ' Neutral zone: smooth sea, no foam.', bajo: ' Below 26 °C: calm sea.' },
      ahora_sin: 'This week has no data: nothing plays.',
      que_costa: '<strong>What you hear.</strong> The sea off El Salvador\'s coast (a strip ~20 to ~176 km offshore, from Acajutla to the Gulf of Fonseca) over one year simulated by NASA (ECCO2, March 2007 – February 2008), one temperature per week. It is the seasonal cycle, not global warming.',
      que_caribe: '<strong>What you hear.</strong> The sea in the central Caribbean, to compare with El Salvador\'s coast, over the same simulated year (ECCO2, March 2007 – February 2008), one temperature per week. It is the seasonal cycle, not global warming.',
      porque_lista: [
        '<strong>Only two things play:</strong> the sea (waves) and a melody (piano).',
        '<strong>Higher melody = warmer sea.</strong> Every half degree moves one step up a pentatonic scale (five notes that never clash). Half a degree is about our reading error (0.46 °C): if the note changes, it is a difference we actually measured. When the temperature changes step, the new note plays right then.',
        '<strong>Faster = a more active sea.</strong> At 26 °C there is one note per second and a wave every 4.4 s; the warmer, the closer together the notes and waves, and the fuller the waves.',
        '<strong>Foam = above 27 °C.</strong> Waves break with foam (a hiss at the crest) that grows up to the year\'s maximum (29.3 °C). Below 27 °C the sea stays smooth.',
        '<strong>26.5 °C is the threshold</strong> of sea temperature that favors hurricane formation (NOAA). Between 26 and 27 °C we are within half a degree of it, the size of our reading error: so there is no foam there.',
        '<strong>What we don\'t do:</strong> no background music, no sad sounds, no alarms. If the data doesn\'t change, the sound doesn\'t change.',
        '<strong>How it was measured:</strong> we read the color of the current lines on NASA\'s maps (SVS 3912) and converted it to °C with their color bar. The coast is the median of three stretches: Acajutla, La Libertad / Surf City and El Cuco.',
      ],
      meses_corto: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      fecha_larga: (d, m, a, Mx) => `${Mx[m]} ${d}, ${a}`,
      fecha_corta: (d, m, a, Mx) => `${Mx[m]} ${d}, ${a}`,
      decimal: '.',
    },
  };

  // ---------------------------------------------------------------- estado
  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = window.EIJ ? EIJ.idiomaInicial() : 'en', datos = null, zonaSel = 'costa', serie = [], ultimaMostrada = -1, estadoPiano = 'cargando';

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

  function anunciar(texto) { // solo para el lector de pantalla, y solo cuando ya no suena nada
    const a = $('anuncio');
    a.textContent = '';
    setTimeout(() => { a.textContent = texto; }, 30);
  }

  // ---------------------------------------------------------------- textos y pantalla
  function cambiarIdioma(nuevo) {
    if ((nuevo !== 'en' && nuevo !== 'es') || nuevo === idioma) return;
    idioma = nuevo;
    aplicarIdioma();
    if (serie.length) { construirVisual(); mostrar(rep.semanaActual(), true); }
  }

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.title = L().titulo + ' · Earthbeat';
    $('idioma').value = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('teclas').innerHTML = t('teclas');
    $('btn-demo').textContent = t('demo');
    $('btn-prev').innerHTML = '<span aria-hidden="true">◀ </span>' + t('prev');
    $('btn-next').innerHTML = t('next') + '<span aria-hidden="true"> ▶</span>';
    $('btn-exportar').textContent = t('exportar');
    const inst = $('instrumento');
    inst.options[0].textContent = estadoPiano === 'cargando' ? t('piano_cargando') : t('piano');
    inst.options[0].disabled = estadoPiano === 'error';
    inst.options[1].textContent = t('campana');
    if (datos) {
      const zs = datos.zonas, nombre = (z) => (idioma === 'es' ? zs[z].nombre_es : zs[z].nombre_en);
      $('zona').options[0].textContent = nombre('costa');
      $('zona').options[1].textContent = nombre('caribe');
      $('zona-nombre').textContent = nombre(zonaSel);
    }
    $('porque-texto').innerHTML = '<p>' + t(zonaSel === 'costa' ? 'que_costa' : 'que_caribe') + '</p><ul>' +
      L().porque_lista.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    const pct = (c) => (100 * (c - BARRA.min) / (BARRA.max - BARRA.min)) + '%';
    $('barra-neutra').style.left = pct(M.REGLAS.neutraMinC);
    $('barra-neutra').style.width = (100 * (M.REGLAS.neutraMaxC - M.REGLAS.neutraMinC) / (BARRA.max - BARRA.min)) + '%';
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
      temp: num(T, 1), nota: d.nota, nps: num(d.notasPorSegundo, 1), ola: num(d.olaPeriodo, 1), esp: Math.round(100 * d.espuma),
    }) + L().ahora_nota[d.zona];
  }

  let textoPlay = '';
  function actualizarBotonPlay(forzar) {
    const nuevo = rep.sonando ? t('pausar') : t('reproducir');
    if (forzar || nuevo !== textoPlay) { textoPlay = nuevo; $('btn-play').textContent = nuevo; }
  }

  function bucle() {
    if (serie.length) {
      // Un solo reloj (el del audio, menos la latencia de salida) para el texto, el mapa y la curva
      const ahoraV = relojVisual(), enDemo = rep.modo === 'demo' && !!rep.est;
      const p = enDemo ? (rep.sonando ? (ahoraV - rep.est.t0) / M.DEMO.semana : rep.posDemo) : rep.semana;
      const i = Math.max(0, Math.min(serie.length - 1, Math.floor(p)));
      if (i !== ultimaMostrada) {
        mostrar(i, !(rep.modo === 'demo' && rep.sonando)); // en la demo no se toca el valor accesible (no habla 48 veces)
        ultimaMostrada = i;
      }
      actualizarBotonPlay(false);
      actualizarVisual(p, enDemo);
      revisarNotas(ahoraV);
    }
    requestAnimationFrame(bucle);
  }


  // ---------------------------------------------------------------- lo visual: mapa de la NASA + curva que se dibuja con el sonido
  // Vista de globo del SVS 3912 (cámara fija, 960×540): centro (480, 270), radio 340 px, centrada en lon -132,6° y el
  // ecuador (calculado con la costa de Ecuador como referencia). La marca es aproximada (±7 px).
  const GLOBO = { cx: 480, cy: 270, r: 340, lon0: -132.6 };
  // Zonas en grados (la costa: de Acajutla al Golfo de Fonseca, de la costa a ~176 km mar adentro)
  const ZONAS_GEO = { costa: { lon: [-90.15, -87.7], lat: [12.1, 13.5] }, caribe: { lon: [-80, -72], lat: [13, 17] } };
  const ZOOM = { w: 150, h: 119 };    // pedazo del mapa (en px de 960×540) que se ve ampliado
  const CROP = { x: 140, w: 680 };    // recorte del globo (sin los bordes negros)
  function proyectar(lon, lat) {
    const r = Math.PI / 180;
    return { x: GLOBO.cx + GLOBO.r * Math.cos(lat * r) * Math.sin((lon - GLOBO.lon0) * r), y: GLOBO.cy - GLOBO.r * Math.sin(lat * r) };
  }
  const mapas = [];
  const CURVA = { x0: 30, x1: 472, y0: 10, y1: 128, tmin: 25, tmax: 30 };
  const cxs = (i) => CURVA.x0 + (CURVA.x1 - CURVA.x0) * i / (serie.length - 1);
  const cys = (T) => CURVA.y1 - (CURVA.y1 - CURVA.y0) * (Math.max(CURVA.tmin, Math.min(CURVA.tmax, T)) - CURVA.tmin) / (CURVA.tmax - CURVA.tmin);
  let mapaActual = -1, destello = null;
  const pct = (x) => (100 * x).toFixed(3) + '%';

  function construirVisual() {
    if (!serie.length) return;
    if (!mapas.length) for (let i = 1; i <= serie.length; i++) { const im = new Image(); im.src = 'mapas/s' + String(i).padStart(2, '0') + '.webp'; mapas.push(im); }
    // caja de la zona medida (esquinas proyectadas en el globo)
    const g = ZONAS_GEO[zonaSel], pts = [];
    g.lon.forEach((lo) => g.lat.forEach((la) => pts.push(proyectar(lo, la))));
    const x0 = Math.min(...pts.map((q) => q.x)) - 1.5, x1 = Math.max(...pts.map((q) => q.x)) + 1.5;
    const y0 = Math.min(...pts.map((q) => q.y)) - 1.5, y1 = Math.max(...pts.map((q) => q.y)) + 1.5;
    // pedazo ampliado, centrado en la zona (un poco hacia el mar)
    const izq = Math.max(0, Math.min(960 - ZOOM.w, (x0 + x1) / 2 - ZOOM.w / 2 - 8));
    const arr = Math.max(0, Math.min(540 - ZOOM.h, (y0 + y1) / 2 - ZOOM.h / 2 + 6));
    const zoom = $('zoom');
    zoom.style.backgroundSize = pct(960 / ZOOM.w) + ' auto';
    zoom.style.backgroundPosition = pct(izq / (960 - ZOOM.w)) + ' ' + pct(arr / (540 - ZOOM.h));
    const zm = $('zona-medida').style;
    zm.left = pct((x0 - izq) / ZOOM.w); zm.top = pct((y0 - arr) / ZOOM.h);
    zm.width = pct((x1 - x0) / ZOOM.w); zm.height = pct((y1 - y0) / ZOOM.h);
    const rc = $('recuadro').style;
    rc.left = pct((izq - CROP.x) / CROP.w); rc.top = pct(arr / 540);
    rc.width = pct(ZOOM.w / CROP.w); rc.height = pct(ZOOM.h / 540);
    const zs = datos.zonas[zonaSel];
    $('leyenda-zoom').textContent = t('mapa_zoom', { zona: idioma === 'es' ? zs.nombre_es : zs.nombre_en });
    let d = '';
    serie.forEach((s, i) => { if (s.temperatura_c != null) d += (d ? 'L' : 'M') + cxs(i).toFixed(1) + ' ' + cys(s.temperatura_c).toFixed(1); });
    const yU = cys(M.REGLAS.umbralC), yN0 = cys(M.REGLAS.neutraMaxC), yN1 = cys(M.REGLAS.neutraMinC);
    let meses = '';
    let mesAnterior = -1;
    serie.forEach((s, i) => {
      const m = partes(s.fecha)[1];
      if (m !== mesAnterior && m % 3 === 2) meses += `<text x="${cxs(i).toFixed(1)}" y="146" font-size="9" fill="var(--suave)" text-anchor="middle">${L().meses_corto[m]}</text>`;
      mesAnterior = m;
    });
    $('curva').innerHTML =
      '<defs><clipPath id="hecho"><rect id="hecho-rect" x="0" y="0" width="0" height="150"/></clipPath></defs>' +
      `<rect x="${CURVA.x0}" y="${yN0}" width="${CURVA.x1 - CURVA.x0}" height="${yN1 - yN0}" fill="var(--neutra)"/>` +
      `<line x1="${CURVA.x0}" x2="${CURVA.x1}" y1="${yU}" y2="${yU}" stroke="var(--umbral)" stroke-width="1.2" stroke-dasharray="4 3"/>` +
      `<text x="0" y="${yU + 3}" font-size="9" fill="var(--umbral)">${num(M.REGLAS.umbralC, 1)}°</text>` +
      `<text x="0" y="${cys(29) + 3}" font-size="9" fill="var(--suave)">29°</text>` +
      `<text x="0" y="${cys(25.5) + 3}" font-size="9" fill="var(--suave)">${num(25.5, 1)}°</text>` +
      meses +
      `<path d="${d}" fill="none" stroke="var(--borde)" stroke-width="2"/>` +
      `<path d="${d}" fill="none" stroke="var(--acento)" stroke-width="2.8" stroke-linejoin="round" clip-path="url(#hecho)"/>` +
      `<line id="cursor" x1="0" x2="0" y1="${CURVA.y0 - 6}" y2="${CURVA.y1 + 4}" stroke="var(--texto)" stroke-width="1" opacity=".45"/>` +
      '<circle id="punto" class="punto" r="4.5" fill="var(--acento)" stroke="var(--tarjeta)" stroke-width="1.5"/>';
    mapaActual = -1;
  }

  // p = posición en semanas (con decimales). En la demo la línea se dibuja hasta el cursor; explorando se ve entera.
  function actualizarVisual(p, enDemo) {
    const n = serie.length, i = Math.max(0, Math.min(n - 1, Math.floor(p)));
    if (i !== mapaActual && mapas[i]) { const u = 'url(' + mapas[i].src + ')'; $('globo').style.backgroundImage = u; $('zoom').style.backgroundImage = u; mapaActual = i; }
    const q = Math.max(0, Math.min(n - 1, p)), x = cxs(q);
    const a = serie[Math.floor(q)].temperatura_c, b = serie[Math.min(n - 1, Math.floor(q) + 1)].temperatura_c;
    const T = a == null ? b : (b == null ? a : a + (b - a) * (q - Math.floor(q)));
    const rect = document.getElementById('hecho-rect');
    if (!rect) return;
    rect.setAttribute('width', enDemo ? x : 480);
    $('cursor').setAttribute('x1', x); $('cursor').setAttribute('x2', x);
    if (T != null) { $('punto').setAttribute('cx', x); $('punto').setAttribute('cy', cys(T)); }
  }

  // Cada nota que suena hace brillar la marca del mapa y el punto de la curva, en el mismo instante.
  function revisarNotas(ahoraVisual) {
    const cola = rep.motor && rep.motor.notasVisuales;
    if (!cola || !cola.length) return;
    let suena = false;
    while (cola.length && cola[0] <= ahoraVisual) { cola.shift(); suena = true; }
    if (!suena) return;
    $('zoom').classList.add('pulso'); $('zona-medida').classList.add('pulso');
    $('punto').setAttribute('r', '7');
    clearTimeout(destello);
    destello = setTimeout(() => { $('zoom').classList.remove('pulso'); $('zona-medida').classList.remove('pulso'); const pt = $('punto'); if (pt) pt.setAttribute('r', '4.5'); }, 110);
  }

  function relojVisual() {
    if (!rep.motor || !window.Tone) return 0;
    const raw = Tone.getContext().rawContext; // se descuenta la latencia de salida: se ve cuando se oye
    return Tone.getContext().currentTime - (raw.outputLatency || raw.baseLatency || 0);
  }

  // ---------------------------------------------------------------- acciones
  async function demo() {
    // El foco pasa al control de semanas: desde ahí Espacio pausa y las flechas mueven
    $('semana').focus();
    await rep.iniciarDemo();
    ultimaMostrada = -1;
  }

  async function alternar() {
    await rep.alternar();
    if (!rep.sonando) mostrar(rep.semanaActual(), true);
  }

  function irA(i) {
    if (rep.modo === 'demo') rep.semana = rep.semanaActual();
    rep.irA(i);
    mostrar(rep.semana, true);
    ultimaMostrada = rep.semana;
  }

  const mover = (delta) => irA(rep.semanaActual() + delta);

  // WAV de 16 bits con dither (ruido mínimo para que el redondeo no se oiga)
  function aWav(buffer) {
    const nc = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length;
    const dv = new DataView(new ArrayBuffer(44 + n * nc * 2));
    const texto = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    texto(0, 'RIFF'); dv.setUint32(4, 36 + n * nc * 2, true); texto(8, 'WAVE');
    texto(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, nc, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * nc * 2, true);
    dv.setUint16(32, nc * 2, true); dv.setUint16(34, 16, true);
    texto(36, 'data'); dv.setUint32(40, n * nc * 2, true);
    const canales = [];
    for (let c = 0; c < nc; c++) canales.push(buffer.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < nc; c++) {
        const v = canales[c][i] * 32767 + (Math.random() - Math.random());
        dv.setInt16(o, Math.max(-32768, Math.min(32767, Math.round(v))), true);
        o += 2;
      }
    }
    return new Blob([dv], { type: 'audio/wav' });
  }

  async function generarWav(opciones) {
    const temps = serie.map((s) => s.temperatura_c);
    const buffer = await M.renderizar(temps, Object.assign({ sampleRate: 48000, instrumento: rep.instrumento, marDb: rep.marDb }, opciones || {}));
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'oceano_3912_' + zonaSel + '_' + rep.instrumento + '_30s.wav' };
  }

  async function exportar() {
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
    construirVisual();
    mostrar(rep.semanaActual(), true);
  }

  // ---------------------------------------------------------------- teclado (todo usable sin mouse)
  document.addEventListener('keydown', (e) => {
    if (!serie.length || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target, tag = el.tagName, tipo = (el.type || '').toLowerCase();
    const nativo = tag === 'BUTTON' || tag === 'SUMMARY' || tag === 'SELECT' || tag === 'A' || tag === 'TEXTAREA' ||
      (tag === 'INPUT' && tipo !== 'range');
    if (e.key === ' ' || e.code === 'Space') {
      // Tras pulsar "Escuchar el año", Espacio pausa y continúa (no reinicia)
      if (nativo && !(el.id === 'btn-demo' && rep.motor)) return;
      e.preventDefault();
      alternar();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // Mueven la semana desde la que está SONANDO (también sobre el deslizador, por si la pantalla va atrasada).
      // En listas y campos de texto se deja lo normal.
      if (tag === 'SELECT' || tag === 'TEXTAREA' || el.id === 'mar' ||
        (tag === 'INPUT' && tipo !== 'checkbox' && tipo !== 'range')) return; // el control "Mar" usa sus flechas
      e.preventDefault();
      mover(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  // ---------------------------------------------------------------- arranque
  async function iniciar() {
    aplicarIdioma();
    $('fecha').textContent = t('cargando');
    $('btn-demo').addEventListener('click', demo);
    $('btn-play').addEventListener('click', alternar);
    $('btn-prev').addEventListener('click', () => mover(-1));
    $('btn-next').addEventListener('click', () => mover(1));
    $('btn-exportar').addEventListener('click', exportar);
    $('semana').addEventListener('input', (e) => irA(Number(e.target.value) - 1));
    $('idioma').addEventListener('change', (e) => { cambiarIdioma(e.target.value); if (window.EIJ) EIJ.guardarIdioma(idioma); });
    $('zona').addEventListener('change', (e) => elegirZona(e.target.value));
    $('instrumento').addEventListener('change', (e) => rep.elegirInstrumento(e.target.value));
    $('mar').addEventListener('input', (e) => {
      const db = Number(e.target.value), txt = (db > 0 ? '+' : '') + db;
      rep.usarMar(db);
      $('mar-valor').textContent = txt + ' dB';
      e.target.setAttribute('aria-valuetext', t('mar_valor', { db: txt }));
    });
    rep.alTerminarDemo = () => { mostrar(rep.semanaActual(), true); anunciar(t('fin_demo')); };
    if (!window.Tone) { $('fecha').textContent = (idioma === 'es' ? 'No se pudo cargar el audio. Comprueba tu conexión e inténtalo de nuevo.' : 'Audio could not load. Check your connection and try again.'); return; }

    // El piano se carga aparte: mientras tanto (o si falla) suena la campana
    rep.elegirInstrumento('campana');
    M.cargarPiano().then((piano) => {
      estadoPiano = 'listo';
      rep.usarPiano(piano);
      if ($('instrumento').value === 'piano') rep.elegirInstrumento('piano');
      aplicarIdioma();
    }).catch(() => {
      estadoPiano = 'error';
      $('instrumento').value = 'campana';
      aplicarIdioma();
      $('estado-export').textContent = t('piano_error');
    });

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
  // Modo incrustado (Earthbeat): el reproductor de la app manda; sin mover el foco del teclado
  if (window.EIJ) EIJ.conectar({
    idioma: cambiarIdioma,
    pausar: () => rep.pausar(),
    alternar: async () => {
      if (rep.sonando) { rep.pausar(); return; }
      if (!rep.motor) { await rep.iniciarDemo(); return; }
      if (rep.modo !== 'demo') { rep.modo = 'demo'; rep.posDemo = rep.semana >= serie.length - 1 ? 0 : rep.semana; }
      await rep.reproducir();
    },
    ir: (f) => {
      const n = serie.length, estaba = rep.sonando;
      if (estaba) rep.pausar();
      rep.modo = 'demo'; rep.posDemo = f * n; rep.semana = Math.min(n - 1, Math.floor(f * n));
      if (estaba) rep.reproducir(); else mostrar(rep.semana, true);
    },
    estado: () => {
      const n = serie.length, D = M.DEMO.semana;
      const p = rep.modo === 'demo' && rep.est ? (rep.sonando ? (rep.ahora - rep.est.t0) / D : rep.posDemo) : rep.semana;
      return { sonando: rep.sonando, pos: Math.max(0, Math.min(n, p)) * D, dur: n * D };
    },
  });

  window.OceanoApp = { generarWav, reproductor: rep };

  iniciar();
})();
