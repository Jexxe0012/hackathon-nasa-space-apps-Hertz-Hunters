/*
 * Disco Luces: "escucha cómo se veía el mundo de noche" en fechas importantes de 2012 a 2023.
 * Un radar recorre el mapa de oeste a este y suena lo que toca (motor-luces.js). Sin voz (la pone el bot).
 */
(function () {
  'use strict';
  const M = window.MotorLuces;
  const RUTA = '../datos/luces_radar.json';

  // Fechas importantes (una por año). El mapa es el promedio del año: no muestra ese día.
  const FECHAS = {
    2012: { es: ['El rover Curiosity llega a Marte', '6 de agosto de 2012 · y es el primer año de este mapa de luces'], en: ['The Curiosity rover lands on Mars', 'August 6, 2012 · and the first year of this night-lights map'] },
    2013: { es: ['La NASA confirma que la Voyager 1 salió al espacio interestelar', 'septiembre de 2013'], en: ['NASA confirms Voyager 1 reached interstellar space', 'September 2013'] },
    2014: { es: ['Philae, de la misión Rosetta, se posa sobre un cometa', '12 de noviembre de 2014'], en: ['Philae, from the Rosetta mission, lands on a comet', 'November 12, 2014'] },
    2015: { es: ['New Horizons pasa junto a Plutón', '14 de julio de 2015'], en: ['New Horizons flies past Pluto', 'July 14, 2015'] },
    2016: { es: ['La sonda Juno llega a Júpiter', '4 de julio de 2016'], en: ['The Juno probe arrives at Jupiter', 'July 4, 2016'] },
    2017: { es: ['Gran eclipse total de Sol en Estados Unidos', '21 de agosto de 2017'], en: ['Great total solar eclipse across the United States', 'August 21, 2017'] },
    2018: { es: ['Despega la sonda solar Parker', '12 de agosto de 2018'], en: ['The Parker Solar Probe launches', 'August 12, 2018'] },
    2019: { es: ['Primera imagen de un agujero negro', '10 de abril de 2019'], en: ['First image of a black hole', 'April 10, 2019'] },
    2020: { es: ['Pandemia de COVID-19', 'la OMS la declara el 11 de marzo de 2020'], en: ['COVID-19 pandemic', 'declared by the WHO on March 11, 2020'] },
    2021: { es: ['El rover Perseverance llega a Marte', '18 de febrero de 2021'], en: ['The Perseverance rover lands on Mars', 'February 18, 2021'] },
    2022: { es: ['Primeras imágenes del telescopio James Webb', '12 de julio de 2022'], en: ['First images from the James Webb Space Telescope', 'July 12, 2022'] },
    2023: { es: ['OSIRIS-REx trae a la Tierra muestras del asteroide Bennu', '24 de septiembre de 2023'], en: ['OSIRIS-REx brings samples of asteroid Bennu to Earth', 'September 24, 2023'] },
  };

  const TXT = {
    es: {
      disco: 'Disco 2 · Luces nocturnas · NASA SVS 5276',
      titulo: 'Escucha cómo se veía el mundo de noche',
      aviso: 'Elige una fecha importante y escucha las luces del planeta ese año, vistas desde el espacio (satélite VIIRS de la NASA y la NOAA). Cada mapa es el promedio de todo el año, no de ese día.',
      idioma: 'Idioma · Language', fecha: 'Año que quieres escuchar', referencia: 'Año de referencia',
      leyenda_mapa: 'La línea recorre el mundo de oeste a este (de América a Asia) y suena lo que toca: más luz, más notas; norte agudo, sur grave.',
      escuchar: 'Escuchar {anio} (12 s)', comparar: 'Comparar {base} → {anio} (25 s)',
      reproducir: 'Reproducir', pausar: 'Pausar',
      teclas: 'Teclado: <kbd>Espacio</kbd> reproducir o pausar · <kbd>←</kbd> <kbd>→</kbd> cambiar de fecha',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio',
      exportar_texto: 'Genera el recorrido de {base} y del año elegido como archivo WAV, con el mismo motor que escuchas aquí. Sirve para el video de la demo.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      fin: 'Fin del recorrido.', cargando: 'Cargando datos…', error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      pie: 'Datos e imágenes: NASA Scientific Visualization Studio, SVS 5276 (Black Marble, VIIRS / Suomi NPP). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: () => [
        '<strong>Qué escuchas.</strong> El mundo de noche visto desde el espacio (mapas Black Marble de la NASA, satélite VIIRS) el año de la fecha que elegiste. Cada mapa es el promedio de todo ese año: la fecha es solo para ubicarte en el tiempo.',
        '<strong>El radar.</strong> Una línea recorre el mapa de oeste a este en 12 segundos y suena lo que va tocando. El sonido también viaja de izquierda a derecha en tus audífonos.',
        '<strong>Más luz = más notas y más fuertes.</strong> Las ciudades suenan; los océanos y los desiertos oscuros quedan en silencio.',
        '<strong>Norte agudo, sur grave.</strong> Cada franja de latitud es una nota de una escala pentatónica: Europa suena aguda; Brasil, Sudáfrica y Australia, graves.',
        '<strong>Comparar años.</strong> Primero suena el año de referencia y después el elegido, con la misma escala. Son promedios anuales: las diferencias no explican por sí solas su causa ni muestran un día concreto de la pandemia.',
        '<strong>Sin números, a propósito.</strong> La NASA no da unidades: el brillo es relativo y comparable entre años. Más luz no es buena ni mala por sí sola.',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 2 · Night lights · NASA SVS 5276',
      titulo: 'Listen to how the world looked at night',
      aviso: 'Pick an important date and listen to the planet\'s lights that year, seen from space (NASA–NOAA VIIRS satellite). Each map is the average of the whole year, not of that day.',
      idioma: 'Idioma · Language', fecha: 'Year to listen to', referencia: 'Reference year',
      leyenda_mapa: 'The line sweeps the world from west to east (from the Americas to Asia) and plays what it touches: more light, more notes; north high, south low.',
      escuchar: 'Listen to {anio} (12 s)', comparar: 'Compare {base} → {anio} (25 s)',
      reproducir: 'Play', pausar: 'Pause',
      teclas: 'Keyboard: <kbd>Space</kbd> play or pause · <kbd>←</kbd> <kbd>→</kbd> change date',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio',
      exportar_texto: 'Renders the sweep of {base} and of the chosen year as a WAV file, with the same engine you hear here. Use it for the demo video.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      fin: 'End of the sweep.', cargando: 'Loading data…', error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      pie: 'Data and images: NASA Scientific Visualization Studio, SVS 5276 (Black Marble, VIIRS / Suomi NPP). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: () => [
        '<strong>What you hear.</strong> The world at night seen from space (NASA Black Marble maps, VIIRS satellite) in the year of the date you picked. Each map is the average of the whole year: the date only places you in time.',
        '<strong>The radar.</strong> A line sweeps the map from west to east in 12 seconds and plays what it touches. The sound also travels from left to right in your headphones.',
        '<strong>More light = more and louder notes.</strong> Cities sound; dark oceans and deserts stay silent.',
        '<strong>North high, south low.</strong> Each latitude band is a note of a pentatonic scale: Europe sounds high; Brazil, South Africa and Australia, low.',
        '<strong>Compare years.</strong> The reference year plays first, followed by the selected year, using the same scale. These are annual averages: differences alone do not explain their causes or show a particular day during the pandemic.',
        '<strong>No numbers, on purpose.</strong> NASA gives no units: brightness is relative and comparable between years. More light is neither good nor bad by itself.',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  const parametros = new URLSearchParams(location.search);
  const anioValido = (a) => Number.isInteger(a) && a >= 2012 && a <= 2023;
  const solicitado = Number(parametros.get('anio'));
  const baseSolicitada = Number(parametros.get('comparar'));
  let idioma = 'es', datos = null, anio = anioValido(solicitado) ? solicitado : 2023;
  let referencia = anioValido(baseSolicitada) ? baseSolicitada : 2012;
  const L = () => TXT[idioma];
  function t(clave, vars) { let s = L()[clave]; if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; }
  const num = (x, d) => x.toFixed(d).replace('.', L().decimal);
  const imgs = {};

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t, { base: referencia }); });
    $('teclas').innerHTML = t('teclas');
    $('btn-exportar').textContent = t('exportar');
    const sel = $('fecha'), previo = sel.value || String(anio);
    sel.innerHTML = Object.keys(FECHAS).map((a) => `<option value="${a}">${a} · ${FECHAS[a][idioma][0]}</option>`).join('');
    sel.value = previo;
    $('referencia').innerHTML = Object.keys(FECHAS).map((a) => `<option value="${a}">${a}</option>`).join('');
    $('referencia').value = String(referencia);
    if (datos) $('porque-texto').innerHTML = '<ul>' + L().porque_lista().map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    mostrarFecha();
  }

  function mostrarFecha() {
    const f = FECHAS[anio][idioma];
    $('evento').textContent = anio + ' · ' + f[0];
    $('evento-sub').textContent = f[1];
    $('btn-escuchar').textContent = t('escuchar', { anio });
    $('btn-comparar').textContent = t('comparar', { base: referencia, anio });
    $('btn-comparar').disabled = !datos || anio === referencia;
    $('btn-escuchar').disabled = !datos;
    if (!rep.sonando) ponerMapa(anio, 0);
    actualizarBotonPlay(true);
  }

  let mapaActual = null;
  function ponerMapa(a, fraccion) {
    if (a !== mapaActual && imgs[a]) { $('mapa').style.backgroundImage = 'url(' + imgs[a].src + ')'; $('etiqueta-anio').textContent = a; mapaActual = a; }
    $('radar').style.left = (100 * fraccion) + '%';
    $('estela').style.width = (100 * fraccion) + '%';
  }

  let textoPlay = '';
  function actualizarBotonPlay(forzar) {
    const nuevo = rep.sonando ? t('pausar') : t('reproducir');
    if (forzar || nuevo !== textoPlay) { textoPlay = nuevo; $('btn-play').textContent = nuevo; }
  }

  function relojVisual() {
    if (!rep.motor || !window.Tone) return 0;
    const raw = Tone.getContext().rawContext;
    return Tone.getContext().currentTime - (raw.outputLatency || raw.baseLatency || 0);
  }

  function bucle() {
    if (datos) {
      const l = rep.linea(relojVisual());
      if (l) ponerMapa(l.anio, l.fraccion);
      actualizarBotonPlay(false);
    }
    requestAnimationFrame(bucle);
  }

  async function escuchar(anios) { await rep.iniciar(anios); }
  async function alternar() {
    if (rep.sonando) rep.pausar();
    else if (rep.est && !terminado) await rep.continuar();
    else await escuchar([anio]);
  }
  let terminado = false;
  function elegir(a) {
    anio = a; $('fecha').value = String(a);
    const sonaba = rep.sonando;
    if (sonaba) rep.pausar();
    rep.est = null; terminado = false;
    mostrarFecha();
    if (sonaba) escuchar([anio]);
  }

  function aWav(buffer) {
    const nc = buffer.numberOfChannels, sr = buffer.sampleRate, n = buffer.length, dv = new DataView(new ArrayBuffer(44 + n * nc * 2));
    const tx = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    tx(0, 'RIFF'); dv.setUint32(4, 36 + n * nc * 2, true); tx(8, 'WAVE'); tx(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true);
    dv.setUint16(22, nc, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * nc * 2, true); dv.setUint16(32, nc * 2, true); dv.setUint16(34, 16, true);
    tx(36, 'data'); dv.setUint32(40, n * nc * 2, true);
    const c = []; for (let k = 0; k < nc; k++) c.push(buffer.getChannelData(k));
    let o = 44;
    for (let i = 0; i < n; i++) for (let k = 0; k < nc; k++) { dv.setInt16(o, Math.max(-32768, Math.min(32767, Math.round(c[k][i] * 32767 + Math.random() - Math.random()))), true); o += 2; }
    return new Blob([dv], { type: 'audio/wav' });
  }
  async function generarWav(anios) {
    anios = anios || (anio === referencia ? [referencia] : [referencia, anio]);
    const buffer = await M.renderizar(datos.anios, anios, { sampleRate: 48000 });
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'luces_radar_' + anios.join('_vs_') + '.wav' };
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
    if (!datos || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target, tag = el.tagName;
    if (e.key === ' ' || e.code === 'Space') {
      if (tag === 'SELECT' || tag === 'SUMMARY' || (tag === 'BUTTON' && !['btn-escuchar', 'btn-comparar'].includes(el.id))) return;
      if (tag === 'BUTTON' && !rep.motor) return; // primera vez: el botón hace lo suyo
      e.preventDefault(); alternar();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (tag === 'SELECT') return;
      e.preventDefault(); elegir(Math.max(2012, Math.min(2023, anio + (e.key === 'ArrowLeft' ? -1 : 1))));
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('evento').textContent = t('cargando');
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); });
    $('fecha').addEventListener('change', (e) => elegir(Number(e.target.value)));
    $('referencia').addEventListener('change', (e) => {
      referencia = Number(e.target.value);
      if (rep.sonando) rep.pausar();
      rep.est = null; terminado = false;
      aplicarIdioma();
    });
    $('btn-escuchar').addEventListener('click', () => { terminado = false; escuchar([anio]); });
    $('btn-comparar').addEventListener('click', () => { terminado = false; escuchar([referencia, anio]); });
    $('btn-play').addEventListener('click', alternar);
    $('btn-exportar').addEventListener('click', exportar);
    rep.alTerminar = () => { terminado = true; $('estado').textContent = t('fin'); };
    if (!window.Tone) { $('evento').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }
    M.cargarPiano().then((p) => rep.usarPiano(p)).catch(() => { /* suena la campana */ });
    try {
      const r = await fetch(RUTA, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) { $('evento').textContent = t('error_datos'); $('evento').setAttribute('role', 'alert'); return; }
    rep.mallas = datos.anios;
    Object.keys(FECHAS).forEach((a) => { const im = new Image(); im.src = 'mapas/mundo_' + a + '.webp'; imgs[a] = im; });
    aplicarIdioma();
    requestAnimationFrame(bucle);
  }

  // Modo incrustado (Earthbeat): el reproductor de la app manda
  if (window.EIJ) EIJ.conectar({
    alternar: () => alternar(),
    ir: () => { /* el radar no salta: se reinicia con Reproducir */ },
    estado: () => {
      const segs = rep.est ? rep.est.segs.length : 1, dur = segs * M.RADAR.barrido + (segs - 1) * M.DEMO.pausa;
      const pos = rep.est ? (rep.sonando ? rep.ahora - rep.est.segs[0].t0 : rep.posicion) : 0;
      return { sonando: rep.sonando, pos: Math.max(0, Math.min(dur, pos)), dur };
    },
  });

  window.LucesApp = { generarWav, reproductor: rep };
  iniciar();
})();
