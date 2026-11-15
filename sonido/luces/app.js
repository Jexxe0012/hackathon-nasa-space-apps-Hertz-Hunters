/*
 * Página mínima del disco Luces (la interfaz bonita la hace Josué; la voz, el bot del otro Diego).
 * Carga el JSON de luces, lo hace sonar con motor-luces.js, muestra el mapa y la curva sincronizados y exporta el WAV.
 */
(function () {
  'use strict';
  const M = window.MotorLuces;
  const RUTA_DATOS = '../../imagen-a-sonido/luces_5276/resultados/luces_5276.json';

  const TXT = {
    es: {
      disco: 'Disco 2 · Luces nocturnas · NASA SVS 5276',
      titulo: 'Escucha cómo se enciende El Salvador',
      aviso: 'Las luces de noche vistas desde el espacio, de 2012 a 2023 (satélite VIIRS, NASA y NOAA). Observación real. La NASA no da números: se compara cada año con 2012.',
      idioma: 'Idioma · Language',
      h_anio: 'Año actual',
      anio_control: 'Año (flechas ← → para moverte)',
      h_controles: 'Escuchar',
      demo: 'Escuchar los 12 años (30 s)',
      reproducir: 'Reproducir', pausar: 'Pausar',
      prev: 'Año anterior', next: 'Año siguiente',
      teclas: 'Teclado: <kbd>←</kbd> <kbd>→</kbd> cambiar de año · <kbd>Espacio</kbd> reproducir o pausar',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio',
      exportar_texto: 'Genera los 12 años (30 s) como archivo WAV con el mismo motor que escuchas aquí. Sirve para el video de la demo.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      mapa_mundo: 'Todo el mundo de noche (NASA SVS 5276). El recuadro blanco es la zona ampliada.',
      mapa_zoom: 'Zoom: Centroamérica. Recuadro punteado = El Salvador, la luz que escuchas.',
      pie: 'Datos e imágenes: NASA Scientific Visualization Studio, SVS 5276 (Black Marble, VIIRS / Suomi NPP). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      referencia: 'Año de referencia',
      vs2012: { mas: 'Más luz que en 2012', igual: 'Igual que en 2012', menos: 'Menos luz que en 2012' },
      vsAnterior: { mas: 'más que el año anterior', igual: 'igual que el año anterior', menos: 'menos que el año anterior' },
      fin_demo: 'Fin.',
      cargando: 'Cargando datos…',
      error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      ahora: 'Este año: nota {nota} (escalón {paso}), {dps} destellos por segundo.',
      porque_html: [
        '<strong>Qué escuchas.</strong> Las luces nocturnas de El Salvador vistas desde el espacio (satélite VIIRS de la NASA y la NOAA, mapas Black Marble), un año tras otro de 2012 a 2023. Es una observación real.',
        '<strong>Solo suenan dos cosas:</strong> destellos (las luces) y una nota de piano por año.',
        '<strong>Más destellos = más luz.</strong> Con la luz de 2012 suenan 5 destellos por segundo; con más luz, más destellos, en la misma proporción. Cada destello suena a la izquierda o a la derecha según dónde está la luz en el país: el oeste (Ahuachapán, Sonsonate) a la izquierda y el este (San Miguel, La Unión) a la derecha.',
        '<strong>Piano más agudo = más luz.</strong> Cada 10 % más de luz que en 2012 sube un escalón; si la luz baja, la nota baja.',
        '<strong>Sin números, a propósito.</strong> La barra de la NASA no tiene unidades, así que decimos "más luz" o "menos luz" comparado con 2012. Más luz no es bueno ni malo por sí solo: puede ser ciudades que crecen, electrificación o más alumbrado.',
        '<strong>Cómo se midió:</strong> sumamos el brillo de los pixeles dentro de un recuadro sobre El Salvador (cada pixel ≈ 10 km; el recuadro toca bordes de Guatemala y Honduras) y lo comparamos con 2012. En la curva, la línea gris punteada es Centroamérica completa, para comparar.',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 2 · Night lights · NASA SVS 5276',
      titulo: 'Listen to El Salvador lighting up',
      aviso: 'Night lights seen from space, 2012 to 2023 (VIIRS satellite, NASA and NOAA). Real observation. NASA gives no numbers: each year is compared with 2012.',
      idioma: 'Idioma · Language',
      h_anio: 'Current year',
      anio_control: 'Year (use ← → arrows to move)',
      h_controles: 'Listen',
      demo: 'Play the 12 years (30 s)',
      reproducir: 'Play', pausar: 'Pause',
      prev: 'Previous year', next: 'Next year',
      teclas: 'Keyboard: <kbd>←</kbd> <kbd>→</kbd> change year · <kbd>Space</kbd> play or pause',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio',
      exportar_texto: 'Renders the 12 years (30 s) as a WAV file with the same engine you hear here. Use it for the demo video.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      mapa_mundo: 'The whole world at night (NASA SVS 5276). The white box is the zoomed area.',
      mapa_zoom: 'Zoom: Central America. Dashed box = El Salvador, the light you hear.',
      pie: 'Data and images: NASA Scientific Visualization Studio, SVS 5276 (Black Marble, VIIRS / Suomi NPP). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      referencia: 'Reference year',
      vs2012: { mas: 'More light than in 2012', igual: 'Same as 2012', menos: 'Less light than in 2012' },
      vsAnterior: { mas: 'more than the year before', igual: 'same as the year before', menos: 'less than the year before' },
      fin_demo: 'End.',
      cargando: 'Loading data…',
      error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      ahora: 'This year: note {nota} (step {paso}), {dps} sparkles per second.',
      porque_html: [
        '<strong>What you hear.</strong> El Salvador\'s night lights seen from space (NASA–NOAA VIIRS satellite, Black Marble maps), year after year from 2012 to 2023. It is a real observation.',
        '<strong>Only two things play:</strong> sparkles (the lights) and one piano note per year.',
        '<strong>More sparkles = more light.</strong> With 2012\'s light there are 5 sparkles per second; with more light, more sparkles, in the same proportion. Each sparkle plays left or right depending on where the light is in the country: west (Ahuachapán, Sonsonate) on the left and east (San Miguel, La Unión) on the right.',
        '<strong>Higher piano = more light.</strong> Every 10 % more light than in 2012 moves one step up; if the light drops, the note drops.',
        '<strong>No numbers, on purpose.</strong> NASA\'s color bar has no units, so we say "more light" or "less light" compared with 2012. More light is neither good nor bad by itself: it can be growing cities, electrification or more street lighting.',
        '<strong>How it was measured:</strong> we added up pixel brightness inside a box over El Salvador (each pixel ≈ 10 km; the box touches the edges of Guatemala and Honduras) and compared it with 2012. In the curve, the dashed gray line is all of Central America, for comparison.',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es', datos = null, anios = [], comp = [], ultimaMostrada = -1, destello = null;
  const L = () => TXT[idioma];
  function t(clave, vars) { let s = L()[clave]; if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; }
  const num = (x, d) => x.toFixed(d).replace('.', L().decimal);
  const comparar = (a, b) => (Math.abs(a - b) < 0.005 ? 'igual' : a > b ? 'mas' : 'menos');

  function textoEstado(i) {
    if (i === 0) return L().referencia;
    return L().vs2012[comparar(anios[i].rel, 1)] + ' · ' + L().vsAnterior[comparar(anios[i].rel, anios[i - 1].rel)];
  }

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('teclas').innerHTML = t('teclas');
    $('btn-demo').textContent = t('demo');
    $('btn-prev').innerHTML = '<span aria-hidden="true">◀ </span>' + t('prev');
    $('btn-next').innerHTML = t('next') + '<span aria-hidden="true"> ▶</span>';
    $('btn-exportar').textContent = t('exportar');
    $('porque-texto').innerHTML = '<ul>' + L().porque_html.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    actualizarBotonPlay(true);
    construirCurva();
    ultimaMostrada = -1;
  }

  // ---------------------------------------------------------------- visual: mundo + zoom + curva (mismo reloj que el audio)
  const imgs = { mundo: [], zoom: [] };
  const CURVA = { x0: 30, x1: 470, y0: 10, y1: 126, rmin: 0.9, rmax: 1.75 };
  const cxs = (i) => CURVA.x0 + (CURVA.x1 - CURVA.x0) * i / (anios.length - 1);
  const cys = (r) => CURVA.y1 - (CURVA.y1 - CURVA.y0) * (Math.max(CURVA.rmin, Math.min(CURVA.rmax, r)) - CURVA.rmin) / (CURVA.rmax - CURVA.rmin);
  function construirCurva() {
    if (!anios.length) return;
    const linea = (s) => s.map((v, i) => (i ? 'L' : 'M') + cxs(i).toFixed(1) + ' ' + cys(v).toFixed(1)).join('');
    const yRef = cys(1);
    let etiquetas = '';
    anios.forEach((a, i) => { if ([2012, 2015, 2018, 2021, 2023].includes(a.anio)) etiquetas += `<text x="${cxs(i).toFixed(1)}" y="146" font-size="9" fill="var(--suave)" text-anchor="middle">${a.anio}</text>`; });
    $('curva').innerHTML =
      '<defs><clipPath id="hecho"><rect id="hecho-rect" x="0" y="0" width="0" height="150"/></clipPath></defs>' +
      `<line x1="${CURVA.x0}" x2="${CURVA.x1}" y1="${yRef}" y2="${yRef}" stroke="var(--ref)" stroke-width="1.2" stroke-dasharray="4 3"/>` +
      `<text x="0" y="${yRef + 3}" font-size="9" fill="var(--ref)">2012</text>` +
      `<text x="0" y="${CURVA.y0 + 6}" font-size="9" fill="var(--suave)">${idioma === 'es' ? '+luz' : '+light'}</text>` +
      etiquetas +
      `<path d="${linea(comp)}" fill="none" stroke="var(--comp)" stroke-width="1.6" stroke-dasharray="3 3"/>` +
      `<path d="${linea(anios.map((a) => a.rel))}" fill="none" stroke="var(--borde)" stroke-width="2"/>` +
      `<path d="${linea(anios.map((a) => a.rel))}" fill="none" stroke="var(--acento)" stroke-width="2.8" stroke-linejoin="round" clip-path="url(#hecho)"/>` +
      `<line id="cursor" x1="0" x2="0" y1="${CURVA.y0 - 6}" y2="${CURVA.y1 + 4}" stroke="var(--texto)" stroke-width="1" opacity=".45"/>` +
      '<circle id="punto" r="4.5" fill="var(--acento)" stroke="var(--tarjeta)" stroke-width="1.5" style="transition:r .12s"/>';
  }
  let imgActual = -1;
  function actualizarVisual(p, enDemo) {
    const n = anios.length, i = Math.max(0, Math.min(n - 1, Math.floor(p)));
    if (i !== imgActual && imgs.mundo[i]) {
      $('mundo').style.backgroundImage = 'url(' + imgs.mundo[i].src + ')';
      $('zoom').style.backgroundImage = 'url(' + imgs.zoom[i].src + ')';
      imgActual = i;
    }
    const q = Math.max(0, Math.min(n - 1, p)), x = cxs(q), f = q - Math.floor(q);
    const r = anios[Math.floor(q)].rel + (anios[Math.min(n - 1, Math.floor(q) + 1)].rel - anios[Math.floor(q)].rel) * f;
    const rect = document.getElementById('hecho-rect');
    if (!rect) return;
    rect.setAttribute('width', enDemo ? x : 480);
    $('cursor').setAttribute('x1', x); $('cursor').setAttribute('x2', x);
    $('punto').setAttribute('cx', x); $('punto').setAttribute('cy', cys(r));
  }
  function revisarNotas(ahoraV) {
    const cola = rep.motor && rep.motor.notasVisuales;
    if (!cola || !cola.length) return;
    let suena = false;
    while (cola.length && cola[0] <= ahoraV) { cola.shift(); suena = true; }
    if (!suena) return;
    $('zoom').classList.add('pulso'); $('punto').setAttribute('r', '7');
    clearTimeout(destello);
    destello = setTimeout(() => { $('zoom').classList.remove('pulso'); const pt = $('punto'); if (pt) pt.setAttribute('r', '4.5'); }, 140);
  }
  function relojVisual() {
    if (!rep.motor || !window.Tone) return 0;
    const raw = Tone.getContext().rawContext;
    return Tone.getContext().currentTime - (raw.outputLatency || raw.baseLatency || 0);
  }

  function mostrar(i, accesible) {
    const a = anios[i], d = M.describir(a.rel, idioma);
    $('anio').textContent = a.anio;
    $('estado').textContent = textoEstado(i);
    const sl = $('control-anio');
    sl.value = String(i + 1);
    if (accesible) sl.setAttribute('aria-valuetext', a.anio + ': ' + textoEstado(i));
    $('ahora-explica').textContent = t('ahora', { nota: d.nota, paso: d.paso, dps: num(d.destellosPorSegundo, 1) });
  }

  let textoPlay = '';
  function actualizarBotonPlay(forzar) {
    const nuevo = rep.sonando ? t('pausar') : t('reproducir');
    if (forzar || nuevo !== textoPlay) { textoPlay = nuevo; $('btn-play').textContent = nuevo; }
  }

  function bucle() {
    if (anios.length) {
      const ahoraV = relojVisual(), enDemo = rep.modo === 'demo' && !!rep.est;
      const p = enDemo ? (rep.sonando ? (ahoraV - rep.est.t0) / M.DEMO.anio : rep.posDemo) : rep.anio;
      const i = Math.max(0, Math.min(anios.length - 1, Math.floor(p)));
      if (i !== ultimaMostrada) { mostrar(i, !(enDemo && rep.sonando)); ultimaMostrada = i; }
      actualizarBotonPlay(false);
      actualizarVisual(p, enDemo);
      revisarNotas(ahoraV);
    }
    requestAnimationFrame(bucle);
  }

  async function demo() { $('control-anio').focus(); await rep.iniciarDemo(); ultimaMostrada = -1; }
  async function alternar() { await rep.alternar(); if (!rep.sonando) mostrar(rep.anioActual(), true); }
  function irA(i) { if (rep.modo === 'demo') rep.anio = rep.anioActual(); rep.irA(i); mostrar(rep.anio, true); ultimaMostrada = rep.anio; }
  const mover = (d) => irA(rep.anioActual() + d);

  function aWav(buffer) {
    const nc = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length, dv = new DataView(new ArrayBuffer(44 + n * nc * 2));
    const texto = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    texto(0, 'RIFF'); dv.setUint32(4, 36 + n * nc * 2, true); texto(8, 'WAVE'); texto(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, nc, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * nc * 2, true); dv.setUint16(32, nc * 2, true); dv.setUint16(34, 16, true);
    texto(36, 'data'); dv.setUint32(40, n * nc * 2, true);
    const c = []; for (let k = 0; k < nc; k++) c.push(buffer.getChannelData(k));
    let o = 44;
    for (let i = 0; i < n; i++) for (let k = 0; k < nc; k++) { dv.setInt16(o, Math.max(-32768, Math.min(32767, Math.round(c[k][i] * 32767 + Math.random() - Math.random()))), true); o += 2; }
    return new Blob([dv], { type: 'audio/wav' });
  }
  async function generarWav() {
    const buffer = await M.renderizar(anios, { sampleRate: 48000 });
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'luces_5276_el_salvador_30s.wav' };
  }
  async function exportar() {
    const btn = $('btn-exportar'), est = $('estado-export');
    btn.disabled = true; est.textContent = t('exportando'); rep.pausar();
    try {
      const r = await generarWav(), url = URL.createObjectURL(r.blob), a = document.createElement('a');
      a.href = url; a.download = r.nombre; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      est.textContent = t('exportado', { archivo: r.nombre, seg: num(r.segundos, 1) });
    } catch (e) { console.error(e); est.textContent = t('export_error', { error: e && e.message ? e.message : String(e) }); }
    finally { btn.disabled = false; }
  }

  document.addEventListener('keydown', (e) => {
    if (!anios.length || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target, tag = el.tagName, tipo = (el.type || '').toLowerCase();
    const nativo = tag === 'BUTTON' || tag === 'SUMMARY' || tag === 'SELECT' || tag === 'A' || (tag === 'INPUT' && tipo !== 'range');
    if (e.key === ' ' || e.code === 'Space') {
      if (nativo && !(el.id === 'btn-demo' && rep.motor)) return;
      e.preventDefault(); alternar();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (tag === 'SELECT' || (tag === 'INPUT' && tipo !== 'range')) return;
      e.preventDefault(); mover(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('anio').textContent = t('cargando');
    $('btn-demo').addEventListener('click', demo);
    $('btn-play').addEventListener('click', alternar);
    $('btn-prev').addEventListener('click', () => mover(-1));
    $('btn-next').addEventListener('click', () => mover(1));
    $('btn-exportar').addEventListener('click', exportar);
    $('control-anio').addEventListener('input', (e) => irA(Number(e.target.value) - 1));
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); if (anios.length) mostrar(rep.anioActual(), true); });
    rep.alTerminarDemo = () => { mostrar(rep.anioActual(), true); const a = $('anuncio'); a.textContent = ''; setTimeout(() => { a.textContent = t('fin_demo'); }, 30); };
    if (!window.Tone) { $('anio').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }
    M.cargarPiano().then((p) => rep.usarPiano(p)).catch(() => { /* suena la campana de respaldo */ });
    try {
      const r = await fetch(RUTA_DATOS, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) { $('anio').textContent = t('error_datos'); $('anio').setAttribute('role', 'alert'); return; }
    anios = datos.series.el_salvador.map((s) => ({ anio: s.anio, rel: s.luz_relativa_2012, reparto: s.oeste_a_este }));
    comp = datos.series.centroamerica.map((s) => s.luz_relativa_2012);
    rep.cargar(anios);
    anios.forEach((a) => { const m = new Image(); m.src = 'mapas/mundo_' + a.anio + '.webp'; imgs.mundo.push(m); const z = new Image(); z.src = 'mapas/zoom_' + a.anio + '.webp'; imgs.zoom.push(z); });
    // Recuadros: zoom = lon −92,5…−85,5, lat 11,5…16,5; El Salvador = lon −90,15…−87,65, lat 13,1…14,45 (mapa 3840×2160)
    Object.assign($('recuadro').style, { left: '24.30%', top: '40.83%', width: '1.95%', height: '2.78%' });
    Object.assign($('zona-medida').style, { left: '33.9%', top: '41%', width: '35.6%', height: '27%' });
    construirCurva();
    mostrar(0, true);
    requestAnimationFrame(bucle);
  }

  window.LucesApp = { generarWav, reproductor: rep };
  iniciar();
})();
