/*
 * Disco Aerosoles: un radar recorre el mapa de partículas del aire del 19/08/2025 y cada tipo suena con su
 * instrumento (motor-aerosoles.js). Sin voz (la pone el bot).
 */
(function () {
  'use strict';
  const M = window.MotorAerosoles;
  const RUTA = '../../imagen-a-sonido/aerosoles_5669/resultados/aerosoles_radar.json';
  const COLOR = { carbono_negro: '#d2614a', polvo: '#c29bda', sal_marina: '#85aaa8', sulfatos: '#52dc34' };

  // Historias que destaca la NASA en esta imagen, por longitud (la línea las va mostrando al pasar)
  const HISTORIAS = [
    { lon: [-160, -148], es: 'Hilo verde: gases del volcán Kilauea (Hawái) → marimba', en: 'Green thread: gases from Kilauea volcano (Hawaii) → marimba' },
    { lon: [-82, -64], es: 'Remolino: el huracán Erin levanta sal marina → campanitas', en: 'Swirl: Hurricane Erin lifts sea salt → little bells' },
    { lon: [-62, -18], es: 'Franja lila: polvo del Sahara cruzando el Atlántico hacia el Caribe → arena', en: 'Lilac band: Saharan dust crossing the Atlantic toward the Caribbean → sand' },
    { lon: [-10, 0], es: 'Manchas rojas: incendios en España → piano grave', en: 'Red patches: wildfires in Spain → low piano' },
    { lon: [0, 12], es: 'El polvo sale del Sahara, sobre África → arena', en: 'Dust leaves the Sahara, over Africa → sand' },
    { lon: [12, 18], es: 'Hilo verde: volcán Etna (Italia) · más al sur, humo de quemas en África', en: 'Green thread: Etna volcano (Italy) · further south, smoke from fires in Africa' },
    { lon: [18, 36], es: 'Rojo-naranja: quemas en el sur de África → piano grave', en: 'Red-orange: fires in southern Africa → low piano' },
    { lon: [40, 62], es: 'Lila: polvo de Arabia y Medio Oriente → arena', en: 'Lilac: dust over Arabia and the Middle East → sand' },
    { lon: [110, 150], es: 'Remolinos azules al sur: sal marina del océano Austral → campanitas', en: 'Blue swirls in the south: sea salt over the Southern Ocean → little bells' },
  ];

  const TXT = {
    es: {
      disco: 'Disco 3 · Aerosoles · NASA SVS 5669',
      titulo: 'Escucha lo que flota en el aire del planeta',
      aviso: 'Las partículas del aire de todo el mundo el 19 de agosto de 2025, a las 2 p.m. de El Salvador (modelo GEOS de la NASA). Cada tipo de partícula suena con su propio instrumento.',
      idioma: 'Idioma · Language', h_mapa: 'El radar', leyenda: 'Tipos de partícula (prende o apaga cada uno)',
      tipos: {
        polvo: ['Polvo', 'desiertos · soplido de arena'], sal_marina: ['Sal marina', 'el mar · campanitas'],
        sulfatos: ['Sulfatos', 'industria y volcanes · marimba'], carbono_negro: ['Carbono negro', 'humo de incendios · piano grave'],
      },
      escuchar: 'Escuchar el planeta (15 s)', reproducir: 'Reproducir', pausar: 'Pausar',
      teclas: 'Teclado: <kbd>Espacio</kbd> reproducir o pausar · <kbd>←</kbd> <kbd>→</kbd> mover el radar · también puedes tocar el mapa para empezar ahí',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio', exportar_texto: 'Genera el recorrido completo (con los tipos que tengas prendidos) como WAV, con el mismo motor que escuchas aquí.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      fin: 'Fin del recorrido.', cargando: 'Cargando datos…', error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      pie: 'Datos e imagen: NASA Scientific Visualization Studio, SVS 5669 (modelo GEOS FP, NASA GMAO). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>Qué escuchas.</strong> Las partículas que flotan en el aire de todo el planeta el 19 de agosto de 2025 a las 2 p.m. de El Salvador, según el modelo GEOS de la NASA (combina satélites, estaciones y observaciones del clima). Es un modelo, no una foto.',
        '<strong>El radar.</strong> La línea recorre el mapa de oeste a este en 15 segundos y suena lo que toca. El sonido viaja de izquierda a derecha con ella.',
        '<strong>Cada tipo, su instrumento:</strong> polvo = soplido de arena; sal marina = campanitas de agua; sulfatos = marimba; carbono negro (hollín de incendios) = piano grave. Puedes prender y apagar cada uno para escucharlo solo.',
        '<strong>Norte agudo, sur grave</strong>, cada instrumento en su registro.',
        '<strong>Más intenso el color = más fuerte y más seguido.</strong> Donde no hay ese tipo, su instrumento calla.',
        '<strong>Sin números, a propósito.</strong> La leyenda de la NASA solo dice qué tipo es; la cantidad se nota en lo brillante del color. Cada tipo tiene su propia escala: no comparamos cuánto polvo con cuánta sal.',
        '<strong>Aproximaciones:</strong> donde se mezclan dos tipos, cuenta el color que domina; las luces de las ciudades y la tierra gris se descartan.',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 3 · Aerosols · NASA SVS 5669',
      titulo: 'Listen to what floats in the planet\'s air',
      aviso: 'Airborne particles over the whole world on August 19, 2025, at 2 p.m. El Salvador time (NASA GEOS model). Each particle type plays its own instrument.',
      idioma: 'Idioma · Language', h_mapa: 'The radar', leyenda: 'Particle types (turn each on or off)',
      tipos: {
        polvo: ['Dust', 'deserts · sand breath'], sal_marina: ['Sea salt', 'the sea · little bells'],
        sulfatos: ['Sulfate', 'industry and volcanoes · marimba'], carbono_negro: ['Black carbon', 'wildfire smoke · low piano'],
      },
      escuchar: 'Listen to the planet (15 s)', reproducir: 'Play', pausar: 'Pause',
      teclas: 'Keyboard: <kbd>Space</kbd> play or pause · <kbd>←</kbd> <kbd>→</kbd> move the radar · you can also tap the map to start there',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio', exportar_texto: 'Renders the full sweep (with the types you have on) as a WAV file, with the same engine you hear here.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      fin: 'End of the sweep.', cargando: 'Loading data…', error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      pie: 'Data and image: NASA Scientific Visualization Studio, SVS 5669 (GEOS FP model, NASA GMAO). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>What you hear.</strong> The particles floating in the air over the whole planet on August 19, 2025 at 2 p.m. El Salvador time, according to NASA\'s GEOS model (it combines satellites, ground stations and weather observations). It is a model, not a photo.',
        '<strong>The radar.</strong> The line sweeps the map from west to east in 15 seconds and plays what it touches. The sound travels left to right with it.',
        '<strong>Each type, its instrument:</strong> dust = sand breath; sea salt = little water bells; sulfate = marimba; black carbon (wildfire soot) = low piano. Turn each one on or off to hear it alone.',
        '<strong>North high, south low</strong>, each instrument in its own register.',
        '<strong>More intense color = louder and more frequent.</strong> Where a type is absent, its instrument is silent.',
        '<strong>No numbers, on purpose.</strong> NASA\'s legend only says which type it is; the amount shows in how bright the color is. Each type has its own scale: we don\'t compare how much dust with how much salt.',
        '<strong>Approximations:</strong> where two types mix, the dominant color counts; city lights and gray land are discarded.',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es', datos = null, posicion = 0, terminado = false;
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
    const ley = $('leyenda'), leg = ley.querySelector('legend');
    ley.innerHTML = ''; ley.appendChild(leg);
    M.TIPOS.forEach((tipo) => {
      const [nombre, detalle] = L().tipos[tipo];
      const lab = document.createElement('label'); lab.className = 'tipo';
      lab.innerHTML = `<input type="checkbox" data-tipo="${tipo}" ${rep.apagados[tipo] ? '' : 'checked'}><span class="chip" style="background:${COLOR[tipo]}" aria-hidden="true"></span><span>${nombre}<small>${detalle}</small></span>`;
      lab.querySelector('input').addEventListener('change', (e) => rep.activar(tipo, e.target.checked));
      ley.appendChild(lab);
    });
    actualizarBotonPlay(true);
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
  let historiaActual = null;
  function bucle() {
    if (datos) {
      const f = rep.sonando ? rep.lineaEn(relojVisual()) : posicion;
      $('radar').style.left = (100 * f) + '%';
      const lon = -180 + 360 * f, h = HISTORIAS.find((x) => lon >= x.lon[0] && lon < x.lon[1]);
      const texto = h ? h[idioma] : '';
      if (texto !== historiaActual) { $('historia').textContent = texto; historiaActual = texto; }
      actualizarBotonPlay(false);
    }
    requestAnimationFrame(bucle);
  }

  async function escuchar(desde) { terminado = false; await rep.iniciar(desde); }
  async function alternar() {
    if (rep.sonando) { rep.pausar(); posicion = rep.fraccion; }
    else await escuchar(terminado || posicion >= 0.999 ? 0 : posicion);
  }
  function mover(d) {
    posicion = Math.max(0, Math.min(0.999, (rep.sonando ? rep.lineaEn(relojVisual()) : posicion) + d));
    if (rep.sonando) escuchar(posicion);
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
  async function generarWav(apagados) {
    const ap = apagados || Object.assign({}, rep.apagados);
    const buffer = await M.renderizar(datos.tipos, { sampleRate: 48000, apagados: ap });
    const activos = M.TIPOS.filter((x) => !ap[x]);
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'aerosoles_radar_' + (activos.length === 4 ? 'todos' : activos.join('_')) + '.wav' };
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
    const el = e.target, tag = el.tagName, tipo = (el.type || '').toLowerCase();
    if (e.key === ' ' || e.code === 'Space') {
      if (tag === 'SELECT' || tag === 'SUMMARY' || (tag === 'INPUT' && tipo === 'checkbox') || (tag === 'BUTTON' && el.id !== 'btn-escuchar')) return;
      if (tag === 'BUTTON' && !rep.motor) return;
      e.preventDefault(); alternar();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (tag === 'SELECT') return;
      e.preventDefault(); mover(e.key === 'ArrowLeft' ? -1 / 12 : 1 / 12);
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('historia').textContent = t('cargando');
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); historiaActual = null; });
    $('btn-escuchar').addEventListener('click', () => { posicion = 0; escuchar(0); });
    $('btn-play').addEventListener('click', alternar);
    $('btn-exportar').addEventListener('click', exportar);
    $('mapa').addEventListener('click', (e) => { const r = e.currentTarget.getBoundingClientRect(); posicion = (e.clientX - r.left) / r.width; escuchar(posicion); });
    rep.alTerminar = () => { terminado = true; posicion = 1; $('estado').textContent = t('fin'); };
    if (!window.Tone) { $('historia').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }
    M.cargarPiano().then((p) => rep.usarPiano(p)).catch(() => { /* suena la campana grave */ });
    try {
      const r = await fetch(RUTA, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) { $('historia').textContent = t('error_datos'); return; }
    rep.mallas = datos.tipos;
    $('historia').textContent = '';
    historiaActual = '';
    requestAnimationFrame(bucle);
  }

  window.AerosolesApp = { generarWav, reproductor: rep };
  iniciar();
})();
