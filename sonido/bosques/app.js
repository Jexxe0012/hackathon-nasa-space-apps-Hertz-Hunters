/*
 * Disco Bosques: un viaje de norte a sur por los bosques de América (motor-bosques.js). Sin voz (la pone el bot).
 */
(function () {
  'use strict';
  const M = window.MotorBosques;
  const RUTA = '../../imagen-a-sonido/bosques_4950/resultados/bosques_radar.json';
  // Lugares por los que pasa la línea (fracción del viaje de arriba a abajo en la imagen)
  const LUGARES = [
    { f: [0.02, 0.14], es: 'Canadá y Alaska: bosques del norte', en: 'Canada and Alaska: northern forests' },
    { f: [0.14, 0.24], es: 'Estados Unidos: bosques del este (más altos) y llanuras del centro (bajas)', en: 'United States: eastern forests (taller) and central plains (low)' },
    { f: [0.24, 0.30], es: 'México', en: 'Mexico' },
    { f: [0.30, 0.41], es: 'Centroamérica y El Salvador', en: 'Central America and El Salvador' },
    { f: [0.42, 0.69], es: 'El Amazonas: los bosques más altos del continente → notas más agudas', en: 'The Amazon: the tallest forests on the continent → higher notes' },
    { f: [0.69, 0.99], es: 'Sur de Sudamérica: bosques más bajos y la estepa de la Patagonia → notas más graves', en: 'Southern South America: lower forests and the Patagonian steppe → lower notes' },
  ];
  const TXT = {
    es: {
      disco: 'Disco 4 · Bosques · NASA SVS 4950 (GEDI)',
      titulo: 'Un viaje de norte a sur por los bosques de América',
      aviso: 'La altura de los árboles medida con un láser desde la Estación Espacial Internacional (GEDI, 2019–2020). La línea baja de Alaska a la Patagonia: la marimba suena más aguda donde los árboles son más altos.',
      idioma: 'Idioma · Language', h_viaje: 'El viaje',
      escuchar: 'Escuchar el viaje (16 s)', reproducir: 'Reproducir', pausar: 'Pausar',
      teclas: 'Teclado: <kbd>Espacio</kbd> reproducir o pausar · <kbd>↑</kbd> <kbd>↓</kbd> mover la línea · también puedes tocar el globo para empezar ahí',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio', exportar_texto: 'Genera el viaje completo como WAV, con el mismo motor que escuchas aquí.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      fin: 'Fin del viaje.', cargando: 'Cargando datos…', error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      pie: 'Datos e imagen: NASA Scientific Visualization Studio, SVS 4950 (GEDI, altura de la vegetación). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>Qué escuchas.</strong> La altura de los bosques de América, medida por GEDI, un láser de la NASA en la Estación Espacial Internacional (2019–2020).',
        '<strong>El viaje.</strong> Una línea baja por el globo, de Alaska a la Patagonia, y suena lo que toca. El sonido va a la izquierda o a la derecha según dónde está el bosque en la imagen.',
        '<strong>Marimba:</strong> de madera, como los árboles, e instrumento tradicional de Centroamérica.',
        '<strong>Nota más aguda = árboles más altos.</strong> Más bosque en ese tramo = nota más fuerte y más seguida. Sin bosque (mar, hielo), silencio.',
        '<strong>Sin metros exactos, a propósito.</strong> La NASA solo publica estos datos como un globo 3D con relieve y sombras. Leímos el color de cada punto corrigiendo la luz con el brillo del mar cercano; el patrón sale bien (Amazonas alto, llanuras y Patagonia bajos), pero los metros no son confiables, así que decimos "más alto" o "más bajo".',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 4 · Forests · NASA SVS 4950 (GEDI)',
      titulo: 'A north-to-south journey through the forests of the Americas',
      aviso: 'Tree height measured by a laser on the International Space Station (GEDI, 2019–2020). The line moves down from Alaska to Patagonia: the marimba plays higher where trees are taller.',
      idioma: 'Idioma · Language', h_viaje: 'The journey',
      escuchar: 'Listen to the journey (16 s)', reproducir: 'Play', pausar: 'Pause',
      teclas: 'Keyboard: <kbd>Space</kbd> play or pause · <kbd>↑</kbd> <kbd>↓</kbd> move the line · you can also tap the globe to start there',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio', exportar_texto: 'Renders the full journey as a WAV file, with the same engine you hear here.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      fin: 'End of the journey.', cargando: 'Loading data…', error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      pie: 'Data and image: NASA Scientific Visualization Studio, SVS 4950 (GEDI, vegetation height). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>What you hear.</strong> The height of the forests of the Americas, measured by GEDI, a NASA laser on the International Space Station (2019–2020).',
        '<strong>The journey.</strong> A line moves down the globe, from Alaska to Patagonia, and plays what it touches. The sound goes left or right depending on where the forest is in the image.',
        '<strong>Marimba:</strong> made of wood, like trees, and a traditional Central American instrument.',
        '<strong>Higher note = taller trees.</strong> More forest in that stretch = louder and more frequent notes. No forest (sea, ice), silence.',
        '<strong>No exact meters, on purpose.</strong> NASA only publishes this data as a 3D globe with relief and shadows. We read each point\'s color, correcting the light with the brightness of the nearby sea; the pattern comes out right (tall Amazon, low plains and Patagonia), but the meters are not reliable, so we say "taller" or "lower".',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es', datos = null, posicion = 0, terminado = false, lugarActual = null;
  const L = () => TXT[idioma];
  function t(clave, vars) { let s = L()[clave]; if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; }
  const num = (x, d) => x.toFixed(d).replace('.', L().decimal);

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('teclas').innerHTML = t('teclas');
    $('btn-escuchar').textContent = t('escuchar');
    $('btn-exportar').textContent = t('exportar');
    $('porque-texto').innerHTML = '<ul>' + L().porque_lista.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    lugarActual = null; actualizarBotonPlay(true);
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
      const f = rep.sonando ? rep.lineaEn(relojVisual()) : posicion, Z = datos.zona_pixeles;
      $('linea').style.top = (100 * (Z.y0 + f * (Z.y1 - Z.y0)) / Z.alto) + '%';
      const l = LUGARES.find((q) => f >= q.f[0] && f < q.f[1]), texto = l ? l[idioma] : '';
      if (texto !== lugarActual) { $('lugar').textContent = texto; lugarActual = texto; }
      actualizarBotonPlay(false);
    }
    requestAnimationFrame(bucle);
  }
  async function escuchar(desde) { terminado = false; await rep.iniciar(desde); }
  async function alternar() {
    if (rep.sonando) { rep.pausar(); posicion = rep.fraccion; }
    else await escuchar(terminado || posicion >= 0.999 ? 0 : posicion);
  }
  function mover(d) { posicion = Math.max(0, Math.min(0.999, (rep.sonando ? rep.lineaEn(relojVisual()) : posicion) + d)); if (rep.sonando) escuchar(posicion); }

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
  async function generarWav() {
    const buffer = await M.renderizar(datos.filas, { sampleRate: 48000 });
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'bosques_viaje_norte_sur.wav' };
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
      if (tag === 'SELECT' || tag === 'SUMMARY' || (tag === 'BUTTON' && el.id !== 'btn-escuchar')) return;
      if (tag === 'BUTTON' && !rep.motor) return;
      e.preventDefault(); alternar();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      if (tag === 'SELECT') return;
      e.preventDefault(); mover(e.key === 'ArrowUp' ? -1 / 12 : 1 / 12);
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('lugar').textContent = t('cargando');
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); });
    $('btn-escuchar').addEventListener('click', () => { posicion = 0; escuchar(0); });
    $('btn-play').addEventListener('click', alternar);
    $('btn-exportar').addEventListener('click', exportar);
    $('mapa').addEventListener('click', (e) => {
      if (!datos) return;
      const r = e.currentTarget.getBoundingClientRect(), Z = datos.zona_pixeles, y = (e.clientY - r.top) / r.height * Z.alto;
      posicion = Math.max(0, Math.min(0.999, (y - Z.y0) / (Z.y1 - Z.y0))); escuchar(posicion);
    });
    rep.alTerminar = () => { terminado = true; posicion = 1; $('estado').textContent = t('fin'); };
    if (!window.Tone) { $('lugar').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }
    try {
      const r = await fetch(RUTA, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) { $('lugar').textContent = t('error_datos'); return; }
    rep.filas = datos.filas;
    $('lugar').textContent = ''; lugarActual = '';
    requestAnimationFrame(bucle);
  }

  window.BosquesApp = { generarWav, reproductor: rep };
  iniciar();
})();
