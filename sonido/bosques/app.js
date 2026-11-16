/*
 * Disco Bosques: "Del corazón del Amazonas al borde donde se acaba el bosque" (motor-bosques.js). Sin voz (la pone el bot).
 */
(function () {
  'use strict';
  const M = window.MotorBosques;
  const RUTA = '../datos/bosques_radar.json';
  const TXT = {
    es: {
      disco: 'Disco 4 · Bosques · NASA SVS 4950 (GEDI)',
      titulo: 'Del corazón del Amazonas al borde donde se acaba el bosque',
      aviso: 'La altura de los árboles medida con un láser desde la Estación Espacial Internacional (GEDI, 2019–2020). En cada punto del camino, el piano sube del suelo a la copa: mientras más alto el bosque, más arriba llega.',
      idioma: 'Idioma · Language', h_camino: 'El camino (de norte a sur)', eje_norte: 'Corazón del Amazonas', eje_sur: 'Borde sur',
      escuchar: 'Escuchar el camino (18 s)', reproducir: 'Reproducir', pausar: 'Pausar',
      teclas: 'Teclado: <kbd>Espacio</kbd> reproducir o pausar · <kbd>←</kbd> <kbd>→</kbd> ir al punto anterior o siguiente',
      lugar_interior: 'Corazón del Amazonas: bosque alto → la escalera de notas sube muy arriba',
      lugar_borde: 'El borde: aquí el bosque alto se acaba de golpe',
      lugar_fuera: 'Más allá del borde: sabana y campos de cultivo y ganado. Es la zona del "arco de la deforestación"',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio', exportar_texto: 'Genera el camino completo como WAV, con el mismo motor que escuchas aquí.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      fin: 'Fin del camino.', cargando: 'Cargando datos…', error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      pie: 'Datos e imagen: NASA Scientific Visualization Studio, SVS 4950 (GEDI, altura de la vegetación). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>Qué escuchas.</strong> 16 puntos en línea recta sobre el globo de la NASA, del corazón del Amazonas hacia el sur. En cada punto, el piano sube una escalera de notas desde el suelo hasta la copa de los árboles.',
        '<strong>Más alto el bosque = la escalera llega más arriba.</strong> En el Amazonas las escaleras son largas; en el borde se cortan abajo. Esa comparación es la historia: no hay efectos ni sonidos tristes.',
        '<strong>Lo que dice el dato:</strong> a lo largo del camino el bosque se mantiene alto y, de un punto al siguiente, cae a menos de un tercio de su altura.',
        '<strong>Lo que NO dice:</strong> GEDI es una foto de 2019–2020, no muestra el antes y el después, así que no mide la deforestación. Sí muestra dónde se acaba el bosque alto: en el sur del Amazonas ese borde coincide con el "arco de la deforestación" que vigilan la NASA y el INPE de Brasil, donde el bosque da paso a sabana natural y a campos de cultivo y ganado.',
        '<strong>Alturas aproximadas:</strong> la NASA publica estos datos como un globo 3D con sombras; leímos el color corrigiendo la luz con el brillo del mar. El patrón es confiable; los metros exactos no, por eso no damos cifras.',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 4 · Forests · NASA SVS 4950 (GEDI)',
      titulo: 'From the heart of the Amazon to the edge where the forest ends',
      aviso: 'Tree height measured by a laser on the International Space Station (GEDI, 2019–2020). At each point along the path, the piano climbs from the ground to the canopy: the taller the forest, the higher it reaches.',
      idioma: 'Idioma · Language', h_camino: 'The path (north to south)', eje_norte: 'Heart of the Amazon', eje_sur: 'Southern edge',
      escuchar: 'Listen to the path (18 s)', reproducir: 'Play', pausar: 'Pause',
      teclas: 'Keyboard: <kbd>Space</kbd> play or pause · <kbd>←</kbd> <kbd>→</kbd> previous or next point',
      lugar_interior: 'Heart of the Amazon: tall forest → the note ladder climbs very high',
      lugar_borde: 'The edge: here the tall forest ends abruptly',
      lugar_fuera: 'Beyond the edge: savanna, cropland and pasture. This is the "arc of deforestation"',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio', exportar_texto: 'Renders the full path as a WAV file, with the same engine you hear here.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      fin: 'End of the path.', cargando: 'Loading data…', error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      pie: 'Data and image: NASA Scientific Visualization Studio, SVS 4950 (GEDI, vegetation height). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>What you hear.</strong> 16 points in a straight line on NASA\'s globe, from the heart of the Amazon southward. At each point, the piano climbs a ladder of notes from the ground to the treetops.',
        '<strong>Taller forest = the ladder reaches higher.</strong> In the Amazon the ladders are long; at the edge they stop low. That comparison is the story: no effects, no sad sounds.',
        '<strong>What the data says:</strong> along the path the forest stays tall and then, from one point to the next, drops to less than a third of its height.',
        '<strong>What it does NOT say:</strong> GEDI is a 2019–2020 snapshot with no before and after, so it does not measure deforestation. It does show where the tall forest ends: in the southern Amazon that edge matches the "arc of deforestation" monitored by NASA and Brazil\'s INPE, where forest gives way to natural savanna, cropland and pasture.',
        '<strong>Approximate heights:</strong> NASA publishes this data as a shaded 3D globe; we read the color while correcting the light with the brightness of the sea. The pattern is reliable; exact meters are not, so we give no figures.',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es', datos = null, puntos = [], borde = -1, terminado = false, lugarActual = null, actual = -1;
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
    lugarActual = null; actual = -1; actualizarBotonPlay(true);
  }

  // dónde se acaba el bosque alto: primer punto con menos de la mitad de la altura media del interior
  function calcularBorde() {
    const interior = puntos.slice(0, 8).filter((p) => p.altura != null).map((p) => p.altura);
    const media = interior.reduce((a, b) => a + b, 0) / interior.length;
    return puntos.findIndex((p, i) => i >= 4 && p.altura != null && p.altura < 0.5 * media);
  }

  function construirVisual() {
    const a = puntos[0], b = puntos[puntos.length - 1];
    $('capa').innerHTML =
      `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#fff" stroke-width="6" stroke-dasharray="18 12" opacity=".8"/>` +
      puntos.map((p, i) => `<circle id="p${i}" cx="${p.x}" cy="${p.y}" r="14" fill="#fff" opacity=".55"/>`).join('') +
      `<circle id="actual" cx="${a.x}" cy="${a.y}" r="34" fill="none" stroke="#fff" stroke-width="7" opacity="0"/>`;
    $('barras').innerHTML = puntos.map((p, i) => `<div class="barra${i >= borde && borde >= 0 ? ' borde' : ''}" id="b${i}" style="height:${p.altura == null ? 2 : Math.max(4, 100 * p.altura / 50)}%"></div>`).join('');
  }

  function mostrar(pos) {
    const i = Math.max(0, Math.min(puntos.length - 1, Math.floor(pos)));
    if (i !== actual) {
      puntos.forEach((p, k) => {
        const c = document.getElementById('p' + k), br = document.getElementById('b' + k);
        if (c) { c.setAttribute('opacity', k <= i ? '1' : '.4'); c.setAttribute('r', k <= i ? '16' : '12'); }
        if (br) { br.classList.toggle('oida', k <= i); br.classList.toggle('ahora', k === i); }
      });
      const ac = $('actual'); if (ac) { ac.setAttribute('cx', puntos[i].x); ac.setAttribute('cy', puntos[i].y); ac.setAttribute('opacity', '1'); }
      actual = i;
    }
    const texto = borde < 0 || i < borde - 1 ? t('lugar_interior') : i <= borde ? t('lugar_borde') : t('lugar_fuera');
    if (texto !== lugarActual) { $('lugar').textContent = texto; lugarActual = texto; }
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
    if (datos) { mostrar(rep.posicionEn(relojVisual())); actualizarBotonPlay(false); }
    requestAnimationFrame(bucle);
  }
  async function escuchar(desde) { terminado = false; await rep.iniciar(desde); }
  async function alternar() {
    if (rep.sonando) rep.pausar();
    else await escuchar(terminado || rep.pos >= puntos.length ? 0 : rep.pos);
  }
  function mover(d) {
    const i = Math.max(0, Math.min(puntos.length - 1, Math.floor(rep.sonando ? rep.posicionEn(relojVisual()) : rep.pos) + d));
    rep.pos = i; terminado = false; escuchar(i);
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
  async function generarWav() {
    const buffer = await M.renderizar(puntos, { sampleRate: 48000 });
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'bosques_amazonas_borde.wav' };
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
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (tag === 'SELECT') return;
      e.preventDefault(); mover(e.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('lugar').textContent = t('cargando');
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); });
    $('btn-escuchar').addEventListener('click', () => { rep.pos = 0; escuchar(0); });
    $('btn-play').addEventListener('click', alternar);
    $('btn-exportar').addEventListener('click', exportar);
    rep.alTerminar = () => { terminado = true; $('estado').textContent = t('fin'); };
    if (!window.Tone) { $('lugar').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }
    M.cargarPiano().then((p) => rep.usarPiano(p)).catch(() => { /* suena el respaldo */ });
    try {
      const r = await fetch(RUTA, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) { $('lugar').textContent = t('error_datos'); return; }
    puntos = datos.transecto;
    rep.puntos = puntos;
    borde = calcularBorde();
    construirVisual();
    $('lugar').textContent = ''; lugarActual = '';
    requestAnimationFrame(bucle);
  }

  // Modo incrustado (Earthbeat): el reproductor de la app manda
  if (window.EIJ) EIJ.conectar({
    alternar: () => alternar(),
    ir: (f) => { const i = Math.floor(f * puntos.length); rep.pos = i; terminado = false; if (rep.sonando) escuchar(i); },
    estado: () => {
      const P = M.ARBOL.paso, n = puntos.length;
      return { sonando: rep.sonando, pos: Math.min(n, rep.posicionEn(relojVisual())) * P, dur: n * P };
    },
  });

  window.BosquesApp = { generarWav, reproductor: rep };
  iniciar();
})();
