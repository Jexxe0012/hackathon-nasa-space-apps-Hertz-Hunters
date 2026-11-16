/*
 * Disco Luces: "escucha cómo se veía el mundo de noche" en fechas importantes de 2012 a 2023.
 * Un radar recorre el mapa de oeste a este y suena lo que toca (motor-luces.js). Sin voz (la pone el bot).
 */
(function () {
  'use strict';
  const M = window.MotorLuces;
  const RUTA = '../datos/luces_radar.json';

  // Fechas importantes. El mapa es el promedio del año: no muestra ese día.
  // Solo 3 años: simulando las notas del radar, casi todos los años suenan como su vecino.
  // Frente a 2020 (la fecha protagonista) solo 2012 y 2023 suenan claramente distintos
  // (diferencia nota a nota 0,23 y 0,29; el siguiente, 2015, apenas 0,16). Entre 2012 y 2023: 0,42.
  const FECHAS = {
    2012: { es: ['El rover Curiosity llega a Marte', '6 de agosto de 2012 · y es el primer año de este mapa de luces'], en: ['The Curiosity rover lands on Mars', 'August 6, 2012 · and the first year of this night-lights map'] },
    2020: { es: ['Pandemia de COVID-19', 'la OMS la declara el 11 de marzo de 2020'], en: ['COVID-19 pandemic', 'declared by the WHO on March 11, 2020'] },
    2023: { es: ['OSIRIS-REx trae a la Tierra muestras del asteroide Bennu', '24 de septiembre de 2023'], en: ['OSIRIS-REx brings samples of asteroid Bennu to Earth', 'September 24, 2023'] },
  };
  const LISTA = Object.keys(FECHAS).map(Number);

  const TXT = {
    es: {
      disco: 'Disco 2 · Luces nocturnas · NASA SVS 5276',
      titulo: 'Escucha cómo se veía el mundo de noche',
      aviso: 'Elige una fecha importante y escucha las luces del planeta ese año, vistas desde el espacio (satélite VIIRS de la NASA y la NOAA). Cada mapa es el promedio de todo el año, no de ese día.',
      idioma: 'Idioma · Language', fecha: 'Fecha',
      leyenda_mapa: 'La línea recorre el mundo de oeste a este (de América a Asia) y suena lo que toca: más luz, más notas; norte agudo, sur grave. Con audífonos el sonido te da la vuelta (8D): El Salvador suena enfrente y Asia, detrás.',
      escuchar: 'Escuchar {anio} (12 s)', comparar: 'Comparar 2012 → {anio} (25 s)',
      reproducir: 'Reproducir', pausar: 'Pausar',
      teclas: 'Teclado: <kbd>Espacio</kbd> reproducir o pausar · <kbd>←</kbd> <kbd>→</kbd> cambiar de fecha',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio',
      exportar_texto: 'Genera el recorrido de 2012 y del año elegido como archivo WAV, con el mismo motor que escuchas aquí. Sirve para el video de la demo.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      fin: 'Fin del recorrido.', cargando: 'Cargando datos…', error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      pie: 'Datos e imágenes: NASA Scientific Visualization Studio, SVS 5276 (Black Marble, VIIRS / Suomi NPP). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: (rel) => [
        '<strong>Qué escuchas.</strong> El mundo de noche visto desde el espacio (mapas Black Marble de la NASA, satélite VIIRS) el año de la fecha que elegiste. Cada mapa es el promedio de todo ese año: la fecha es solo para ubicarte en el tiempo.',
        '<strong>El radar.</strong> Una línea recorre el mapa de oeste a este en 12 segundos y suena lo que va tocando.',
        '<strong>8D: el sonido le da la vuelta a tu cabeza.</strong> Con audífonos, el sonido da una vuelta completa a tu alrededor, igual que la línea le da la vuelta al planeta: empieza a tu izquierda en el Pacífico, pasa enfrente por El Salvador, a tu derecha por Europa y África, detrás por Asia (que está al otro lado del planeta) y vuelve a tu izquierda. Sin audífonos se oye como estéreo normal.',
        '<strong>Más luz = más notas y más fuertes.</strong> Las ciudades suenan; los océanos y los desiertos oscuros quedan en silencio.',
        '<strong>Norte agudo, sur grave.</strong> Cada franja de latitud es una nota de una escala pentatónica: Europa suena aguda; Brasil, Sudáfrica y Australia, graves.',
        '<strong>Comparar con 2012.</strong> Primero suena 2012 y después tu año. En 2023 el mundo tiene un ' + Math.round(100 * (rel[2023] - 1)) + ' % más de luz que en 2012 (se oyen más notas), y en 2020 hubo menos luz que en 2019.',
        '<strong>Sin números, a propósito.</strong> La NASA no da unidades: el brillo es relativo y comparable entre años. Más luz no es buena ni mala por sí sola.',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 2 · Night lights · NASA SVS 5276',
      titulo: 'Listen to how the world looked at night',
      aviso: 'Pick an important date and listen to the planet\'s lights that year, seen from space (NASA–NOAA VIIRS satellite). Each map is the average of the whole year, not of that day.',
      idioma: 'Idioma · Language', fecha: 'Date',
      leyenda_mapa: 'The line sweeps the world from west to east (from the Americas to Asia) and plays what it touches: more light, more notes; north high, south low. With headphones the sound circles around you (8D): El Salvador is in front and Asia behind.',
      escuchar: 'Listen to {anio} (12 s)', comparar: 'Compare 2012 → {anio} (25 s)',
      reproducir: 'Play', pausar: 'Pause',
      teclas: 'Keyboard: <kbd>Space</kbd> play or pause · <kbd>←</kbd> <kbd>→</kbd> change date',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio',
      exportar_texto: 'Renders the sweep of 2012 and of the chosen year as a WAV file, with the same engine you hear here. Use it for the demo video.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      fin: 'End of the sweep.', cargando: 'Loading data…', error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      pie: 'Data and images: NASA Scientific Visualization Studio, SVS 5276 (Black Marble, VIIRS / Suomi NPP). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: (rel) => [
        '<strong>What you hear.</strong> The world at night seen from space (NASA Black Marble maps, VIIRS satellite) in the year of the date you picked. Each map is the average of the whole year: the date only places you in time.',
        '<strong>The radar.</strong> A line sweeps the map from west to east in 12 seconds and plays what it touches.',
        '<strong>8D: the sound circles your head.</strong> With headphones, the sound makes a full turn around you, just as the line goes around the planet: it starts on your left over the Pacific, passes in front over El Salvador, on your right over Europe and Africa, behind you over Asia (on the other side of the planet) and back to your left. Without headphones it sounds like normal stereo.',
        '<strong>More light = more and louder notes.</strong> Cities sound; dark oceans and deserts stay silent.',
        '<strong>North high, south low.</strong> Each latitude band is a note of a pentatonic scale: Europe sounds high; Brazil, South Africa and Australia, low.',
        '<strong>Compare with 2012.</strong> First 2012 plays, then your year. In 2023 the world has ' + Math.round(100 * (rel[2023] - 1)) + ' % more light than in 2012 (you hear more notes), and 2020 had less light than 2019.',
        '<strong>No numbers, on purpose.</strong> NASA gives no units: brightness is relative and comparable between years. More light is neither good nor bad by itself.',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es', datos = null, anio = 2023;
  const L = () => TXT[idioma];
  function t(clave, vars) { let s = L()[clave]; if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; }
  const num = (x, d) => x.toFixed(d).replace('.', L().decimal);
  const imgs = {};

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('teclas').innerHTML = t('teclas');
    $('btn-exportar').textContent = t('exportar');
    const sel = $('fecha'), previo = sel.value || String(anio);
    sel.innerHTML = Object.keys(FECHAS).map((a) => `<option value="${a}">${a} · ${FECHAS[a][idioma][0]}</option>`).join('');
    sel.value = previo;
    if (datos) $('porque-texto').innerHTML = '<ul>' + L().porque_lista(datos.total_relativo_2012).map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    mostrarFecha();
  }

  function mostrarFecha() {
    const f = FECHAS[anio][idioma];
    $('evento').textContent = anio + ' · ' + f[0];
    $('evento-sub').textContent = f[1];
    $('btn-escuchar').textContent = t('escuchar', { anio });
    $('btn-comparar').textContent = t('comparar', { anio });
    $('btn-comparar').disabled = anio === 2012;
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
    anios = anios || (anio === 2012 ? [2012] : [2012, anio]);
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
      e.preventDefault();
      const i = LISTA.indexOf(anio) + (e.key === 'ArrowLeft' ? -1 : 1);
      elegir(LISTA[Math.max(0, Math.min(LISTA.length - 1, i))]);
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('evento').textContent = t('cargando');
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); });
    $('fecha').addEventListener('change', (e) => elegir(Number(e.target.value)));
    $('btn-escuchar').addEventListener('click', () => { terminado = false; escuchar([anio]); });
    $('btn-comparar').addEventListener('click', () => { terminado = false; escuchar([2012, anio]); });
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
