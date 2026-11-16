/*
 * Disco Aerosoles: "Un día en el aire del planeta · 19 de agosto de 2025", contado en historias.
 * Cada historia recorre una zona del mapa con el radar y su instrumento al frente (motor-aerosoles.js).
 * Sin voz (la pone el bot).
 */
(function () {
  'use strict';
  const M = window.MotorAerosoles;
  const RUTA = '../datos/aerosoles_radar.json';
  const COLOR = { carbono_negro: '#d2614a', polvo: '#c29bda', sal_marina: '#85aaa8', sulfatos: '#52dc34' };
  const EL_SALVADOR = { lon: -89.1, lat: 13.7 };

  // zona = [lon oeste, lon este, lat sur, lat norte]; dir −1 = la línea va de este a oeste (como el viento)
  const HISTORIAS = [
    { id: 'polvo', ganancia: 1.1, tramos: [{ zona: [-100, 25, -2, 38], dir: -1, tipos: ['polvo'], barrido: 14, pin: true }],
      es: ['El viaje del polvo del Sahara', 'El radar sigue al viento: de África hacia nosotros. Con audífonos, el polvo viene desde atrás a tu derecha hasta casi enfrente de ti. Solo suena el polvo: una flauta, como el viento.'],
      en: ['The journey of Saharan dust', 'The radar follows the wind: from Africa toward us. With headphones, the dust comes from behind on your right to almost in front of you. Only dust plays: a flute, like the wind.'],
      textos: [
        { lon: [-15, 25], es: 'El polvo se levanta del Sahara', en: 'Dust rises from the Sahara' },
        { lon: [-58, -15], es: 'Cruza el Atlántico empujado por los vientos alisios', en: 'It crosses the Atlantic, pushed by the trade winds' },
        { lon: [-70, -58], es: 'Llega al Caribe oriental: unos 5.000 km de viaje', en: 'It reaches the eastern Caribbean: a ~5,000 km journey' },
        { lon: [-100, -70], es: 'Aquí ya no hay polvo: ese día se detuvo a unos 2.700 km de El Salvador', en: 'No more dust here: that day it stopped ~2,700 km from El Salvador' },
      ] },
    { id: 'africa', ganancia: -2.4, tramos: [{ zona: [-20, 55, -36, 38], dir: 1, tipos: ['polvo', 'carbono_negro'], barrido: 13 }],
      es: ['África: polvo al norte, humo al sur', 'Arriba, el polvo del Sahara (flauta, agudo); abajo, el humo de las quemas (piano grave). Se oyen los dos a la vez, cada uno en su altura.'],
      en: ['Africa: dust in the north, smoke in the south', 'Above, Saharan dust (flute, high); below, smoke from fires (low piano). You hear both at once, each at its own height.'],
      textos: [{ lon: [-20, 55], es: 'Norte: polvo del Sahara (flauta) · sur: humo de quemas (piano grave)', en: 'North: Saharan dust (flute) · south: smoke from fires (low piano)' }] },
    { id: 'america', ganancia: 0, tramos: [{ zona: [-130, -30, -56, 60], dir: 1, tipos: null, barrido: 14, pin: true }],
      es: ['El aire sobre nuestro continente', 'América de oeste a este, con los 4 instrumentos. Sobre El Salvador y Centroamérica había sulfatos (marimba) y nada de polvo; el polvo del Sahara se quedó en el Caribe oriental.'],
      en: ['The air over our continent', 'The Americas from west to east, with all 4 instruments. Over El Salvador and Central America there was sulfate (marimba) and no dust; Saharan dust stayed in the eastern Caribbean.'],
      textos: [
        { lon: [-130, -100], es: 'Costa del Pacífico: sal marina (campanitas) y sulfatos (marimba)', en: 'Pacific coast: sea salt (bells) and sulfate (marimba)' },
        { lon: [-100, -80], es: 'Centroamérica y El Salvador: sulfatos (marimba), sin polvo', en: 'Central America and El Salvador: sulfate (marimba), no dust' },
        { lon: [-80, -58], es: 'Caribe: hasta aquí llegó el polvo del Sahara, apenas', en: 'Caribbean: Saharan dust barely reached this far' },
        { lon: [-58, -30], es: 'Este de Sudamérica y el Atlántico: sulfatos y sal marina', en: 'Eastern South America and the Atlantic: sulfate and sea salt' },
      ] },
    { id: 'sur', ganancia: 5.7, tramos: [{ zona: [-180, 180, -64, -36], dir: 1, tipos: ['sal_marina'], barrido: 15 }],
      es: ['Los mares del sur', 'Una franja de sal marina (campanitas) que da la vuelta al planeta: los vientos fuertes del océano Austral levantan gotitas de mar. Con audífonos, las campanitas también te dan la vuelta a ti.'],
      en: ['The southern seas', 'A band of sea salt (little bells) circling the planet: strong Southern Ocean winds lift droplets of sea water. With headphones, the bells circle around you too.'],
      textos: [{ lon: [-180, 180], es: 'Océano Austral: sal marina (campanitas) alrededor de todo el planeta', en: 'Southern Ocean: sea salt (bells) all around the planet' }] },
    { id: 'todo', global: true,
      es: ['Todo el planeta', 'El radar recorre el mundo completo con los 4 instrumentos. Con audífonos, el sonido te da la vuelta completa: El Salvador enfrente, Asia detrás.'],
      en: ['The whole planet', 'The radar sweeps the whole world with all 4 instruments. With headphones, the sound makes a full turn around you: El Salvador in front, Asia behind.'],
      textos: [
        { lon: [-160, -148], es: 'Hilo verde: volcán Kilauea (Hawái) → marimba', en: 'Green thread: Kilauea volcano (Hawaii) → marimba' },
        { lon: [-82, -64], es: 'Remolino: huracán Erin → campanitas y flauta', en: 'Swirl: Hurricane Erin → bells and flute' },
        { lon: [-62, -18], es: 'Franja lila: polvo del Sahara sobre el Atlántico → flauta', en: 'Lilac band: Saharan dust over the Atlantic → flute' },
        { lon: [-10, 0], es: 'Rojo: incendios en España → piano grave', en: 'Red: wildfires in Spain → low piano' },
        { lon: [12, 18], es: 'Verde: volcán Etna (Italia) → marimba', en: 'Green: Etna volcano (Italy) → marimba' },
        { lon: [18, 36], es: 'Rojo-naranja: quemas en el sur de África → piano grave', en: 'Red-orange: fires in southern Africa → low piano' },
        { lon: [40, 62], es: 'Lila: polvo de Arabia y Medio Oriente → flauta', en: 'Lilac: dust over Arabia and the Middle East → flute' },
        { lon: [110, 150], es: 'Remolinos azules: sal marina del océano Austral → campanitas', en: 'Blue swirls: sea salt over the Southern Ocean → bells' },
      ] },
  ];

  const TXT = {
    es: {
      disco: 'Disco 3 · Aerosoles · NASA SVS 5669',
      titulo: 'Un día en el aire del planeta',
      aviso: 'Las partículas del aire de todo el mundo el 19 de agosto de 2025, a las 2 p.m. de El Salvador (modelo GEOS de la NASA). Elige una historia: cada tipo de partícula suena con su propio instrumento. Con audífonos se oye en 8D.',
      idioma: 'Idioma · Language', historia_lbl: 'Historia', fecha_mapa: '19 ago 2025 · 2:00 p.m. hora de El Salvador', leyenda: 'Tipos de partícula (prende o apaga cada uno)',
      tipos: {
        polvo: ['Polvo', 'desiertos · flauta (viento)'], sal_marina: ['Sal marina', 'el mar · campanitas'],
        sulfatos: ['Sulfatos', 'industria y volcanes · marimba'], carbono_negro: ['Carbono negro', 'humo de incendios · piano grave'],
      },
      escuchar: 'Escuchar la historia ({seg} s)', reproducir: 'Reproducir', pausar: 'Pausar',
      teclas: 'Teclado: <kbd>Espacio</kbd> reproducir o pausar · <kbd>←</kbd> <kbd>→</kbd> cambiar de historia · también puedes tocar el mapa para empezar ahí',
      porque: '¿Por qué suena así?',
      h_exportar: 'Exportar audio', exportar_texto: 'Genera la historia elegida como WAV, con el mismo motor que escuchas aquí.',
      exportar: 'Exportar en WAV', exportando: 'Generando el audio…', exportado: 'Listo: {archivo} ({seg} s).', export_error: 'No se pudo generar el audio: {error}',
      fin: 'Fin de la historia.', cargando: 'Cargando datos…', error_datos: 'No se pudieron cargar los datos. Abre la página desde un servidor web (ver LEEME.md).',
      pie: 'Datos e imagen: NASA Scientific Visualization Studio, SVS 5669 (modelo GEOS FP, NASA GMAO). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>Qué escuchas.</strong> Las partículas que flotan en el aire el 19 de agosto de 2025 a las 2 p.m. de El Salvador, según el modelo GEOS de la NASA (combina satélites, estaciones y observaciones del clima). Es un modelo de un solo momento, no una foto ni un promedio.',
        '<strong>El radar.</strong> Una línea recorre la zona de la historia y suena lo que toca. En el viaje del polvo, la línea va de este a oeste, como el viento.',
        '<strong>8D: el sonido está donde está la línea.</strong> Con audífonos, imagina que estás en El Salvador: lo que está al oeste suena a tu izquierda, lo que está al este a tu derecha, y el otro lado del planeta (Asia), detrás. «Todo el planeta» y «Los mares del sur» te dan la vuelta completa; las demás historias recorren solo su parte (América, enfrente de ti; África, a tu derecha). Sin audífonos se oye como estéreo normal.',
        '<strong>Cada tipo, su instrumento:</strong> polvo = flauta (viento); sal marina = campanitas; sulfatos = marimba; carbono negro (hollín de incendios) = piano grave.',
        '<strong>Norte agudo, sur grave.</strong> Más intenso el color = más fuerte y más seguido. Donde no hay ese tipo, su instrumento calla: el silencio también es dato.',
        '<strong>Sin números, a propósito.</strong> La leyenda de la NASA solo dice qué tipo es; la cantidad se nota en lo brillante del color. Cada tipo tiene su propia escala.',
        '<strong>Lo que dicen los datos sobre nosotros:</strong> ese día el polvo del Sahara llegó al Caribe oriental y se detuvo a unos 2.700 km de El Salvador; sobre el país había sulfatos. Otros días del verano el polvo sí puede llegar a Centroamérica, pero esta imagen no lo muestra.',
        '<strong>Aproximaciones:</strong> donde se mezclan dos tipos, cuenta el color que domina; las luces de las ciudades y la tierra gris se descartan.',
      ],
      decimal: ',',
    },
    en: {
      disco: 'Disc 3 · Aerosols · NASA SVS 5669',
      titulo: 'One day in the planet\'s air',
      aviso: 'Airborne particles over the whole world on August 19, 2025, at 2 p.m. El Salvador time (NASA GEOS model). Pick a story: each particle type plays its own instrument. With headphones it plays in 8D.',
      idioma: 'Idioma · Language', historia_lbl: 'Story', fecha_mapa: 'Aug 19, 2025 · 2:00 p.m. El Salvador time', leyenda: 'Particle types (turn each on or off)',
      tipos: {
        polvo: ['Dust', 'deserts · flute (wind)'], sal_marina: ['Sea salt', 'the sea · little bells'],
        sulfatos: ['Sulfate', 'industry and volcanoes · marimba'], carbono_negro: ['Black carbon', 'wildfire smoke · low piano'],
      },
      escuchar: 'Listen to the story ({seg} s)', reproducir: 'Play', pausar: 'Pause',
      teclas: 'Keyboard: <kbd>Space</kbd> play or pause · <kbd>←</kbd> <kbd>→</kbd> change story · you can also tap the map to start there',
      porque: 'Why does it sound like this?',
      h_exportar: 'Export audio', exportar_texto: 'Renders the chosen story as a WAV file, with the same engine you hear here.',
      exportar: 'Export as WAV', exportando: 'Rendering audio…', exportado: 'Done: {archivo} ({seg} s).', export_error: 'Could not render the audio: {error}',
      fin: 'End of the story.', cargando: 'Loading data…', error_datos: 'Could not load the data. Open the page from a web server (see LEEME.md).',
      pie: 'Data and image: NASA Scientific Visualization Studio, SVS 5669 (GEOS FP model, NASA GMAO). Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0). Hertz Hunters · NASA Space Apps Challenge 2026 · San Salvador.',
      porque_lista: [
        '<strong>What you hear.</strong> The particles floating in the air on August 19, 2025 at 2 p.m. El Salvador time, according to NASA\'s GEOS model (it combines satellites, ground stations and weather observations). It is a model of a single moment, not a photo or an average.',
        '<strong>The radar.</strong> A line sweeps the story\'s area and plays what it touches. In the dust journey, the line goes east to west, like the wind.',
        '<strong>8D: the sound is where the line is.</strong> With headphones, imagine you are in El Salvador: what lies west plays on your left, what lies east on your right, and the other side of the planet (Asia) behind you. «The whole planet» and «The southern seas» make a full turn around you; the other stories cover only their part (the Americas in front of you, Africa on your right). Without headphones it sounds like normal stereo.',
        '<strong>Each type, its instrument:</strong> dust = flute (wind); sea salt = little bells; sulfate = marimba; black carbon (wildfire soot) = low piano.',
        '<strong>North high, south low.</strong> More intense color = louder and more frequent. Where a type is absent, its instrument is silent: silence is data too.',
        '<strong>No numbers, on purpose.</strong> NASA\'s legend only says which type it is; the amount shows in how bright the color is. Each type has its own scale.',
        '<strong>What the data says about us:</strong> that day Saharan dust reached the eastern Caribbean and stopped ~2,700 km from El Salvador; over the country there was sulfate. On other summer days dust can reach Central America, but this image does not show it.',
        '<strong>Approximations:</strong> where two types mix, the dominant color counts; city lights and gray land are discarded.',
      ],
      decimal: '.',
    },
  };

  const $ = (id) => document.getElementById(id);
  const rep = new M.Reproductor();
  let idioma = 'es', datos = null, hist = HISTORIAS[0], terminado = false;
  const recorridos = {};
  const L = () => TXT[idioma];
  function t(clave, vars) { let s = L()[clave]; if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]); return s; }
  const num = (x, d) => x.toFixed(d).replace('.', L().decimal);

  // Recorte de la malla fina para la zona de un tramo (columnas en el sentido del recorrido)
  function subMalla(zona, dir) {
    const fn = datos.fina, C = fn.columnas, F = fn.filas, dLon = 360 / C, dLat = (datos.lat_norte - datos.lat_sur) / F;
    const cols = [], filas = [];
    for (let c = 0; c < C; c++) { const lo = -180 + (c + 0.5) * dLon; if (lo >= zona[0] && lo <= zona[1]) cols.push(c); }
    for (let f = 0; f < F; f++) { const la = datos.lat_norte - (f + 0.5) * dLat; if (la >= zona[2] && la <= zona[3]) filas.push(f); }
    if (dir < 0) cols.reverse();
    const out = {};
    M.TIPOS.forEach((tp) => { out[tp] = cols.map((c) => filas.map((f) => fn.tipos[tp][c][f])); });
    return out;
  }
  function recorridoDe(h) {
    if (recorridos[h.id]) return recorridos[h.id];
    const rec = h.global
      ? { tramos: [{ mallas: datos.tipos, cpp: 2, barrido: 15, dir: 1, estirar: false, tipos: null, zona: [-180, 180, datos.lat_sur, datos.lat_norte], img: null }] }
      : { tramos: h.tramos.map((tr) => Object.assign({}, tr, { mallas: subMalla(tr.zona, tr.dir), cpp: 1, estirar: true })) };
    rec.ganancia = h.ganancia || 0; // dB: iguala el volumen de las historias con pocos instrumentos (medido)
    recorridos[h.id] = rec;
    return rec;
  }

  function aplicarIdioma() {
    document.documentElement.lang = idioma;
    document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $('teclas').innerHTML = t('teclas');
    $('btn-exportar').textContent = t('exportar');
    $('porque-texto').innerHTML = '<ul>' + L().porque_lista.map((x) => '<li>' + x + '</li>').join('') + '</ul>';
    const sel = $('historia-sel');
    sel.innerHTML = HISTORIAS.map((h) => `<option value="${h.id}">${h[idioma][0]}</option>`).join('');
    sel.value = hist.id;
    const ley = $('leyenda'), leg = ley.querySelector('legend');
    ley.innerHTML = ''; ley.appendChild(leg);
    M.TIPOS.forEach((tipo) => {
      const [nombre, detalle] = L().tipos[tipo];
      const lab = document.createElement('label'); lab.className = 'tipo';
      lab.innerHTML = `<input type="checkbox" data-tipo="${tipo}" ${rep.apagados[tipo] ? '' : 'checked'}><span class="chip" style="background:${COLOR[tipo]}" aria-hidden="true"></span><span>${nombre}<small>${detalle}</small></span>`;
      lab.querySelector('input').addEventListener('change', (e) => rep.activar(tipo, e.target.checked));
      ley.appendChild(lab);
    });
    mostrarHistoria();
  }

  function mostrarHistoria() {
    $('h-mapa').textContent = hist[idioma][0];
    $('fecha-mapa').textContent = t('fecha_mapa');
    $('sub').textContent = hist[idioma][1];
    if (datos) $('btn-escuchar').textContent = t('escuchar', { seg: Math.round(M.duracionRecorrido(recorridoDe(hist)) - M.DEMO.entrada - M.DEMO.salida) });
    tramoMostrado = -1;
    if (datos && !rep.sonando) ponerVisual({ tramo: 0, fraccion: 0 });
    actualizarBotonPlay(true);
  }

  let tramoMostrado = -1, textoActual = null;
  // Siempre el mapa completo (sin zoom): la zona de la historia se marca y el resto se oscurece un poco.
  // Mapa = mundo estirado a 16:9: x = (lon+180)/360, y = (90−lat)/180.
  const X = (lon) => (lon + 180) / 360, Y = (lat) => (90 - lat) / 180;
  function ponerVisual(l) {
    const rec = recorridoDe(hist), tr = rec.tramos[l.tramo] || rec.tramos[0], z = tr.zona;
    if (l.tramo !== tramoMostrado) {
      const zh = $('zona-hist').style;
      if (hist.global) zh.display = 'none';
      else Object.assign(zh, { display: 'block', left: (100 * X(z[0])) + '%', width: (100 * (X(z[1]) - X(z[0]))) + '%', top: (100 * Y(z[3])) + '%', height: (100 * (Y(z[2]) - Y(z[3]))) + '%' });
      const r = $('radar').style;
      r.top = (100 * (hist.global ? 0 : Y(z[3]))) + '%';
      r.height = (100 * (hist.global ? 1 : Y(z[2]) - Y(z[3]))) + '%';
      const pin = $('pin');
      if (tr.pin) { pin.style.display = 'block'; pin.style.left = (100 * X(EL_SALVADOR.lon)) + '%'; pin.style.top = (100 * Y(EL_SALVADOR.lat)) + '%'; $('pin-texto').textContent = 'El Salvador'; }
      else pin.style.display = 'none';
      tramoMostrado = l.tramo;
    }
    const f = tr.dir < 0 ? 1 - l.fraccion : l.fraccion, lon = z[0] + f * (z[1] - z[0]);
    $('radar').style.left = (100 * X(lon)) + '%';
    const h = hist.textos.find((q) => (q.tramo != null ? q.tramo === l.tramo : lon >= q.lon[0] && lon <= q.lon[1]));
    const texto = h ? h[idioma] : '';
    if (texto !== textoActual) { $('historia').textContent = texto; textoActual = texto; }
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
    if (datos) { ponerVisual(rep.linea(relojVisual())); actualizarBotonPlay(false); }
    requestAnimationFrame(bucle);
  }

  async function escuchar(desde) { terminado = false; await rep.iniciar(recorridoDe(hist), desde); }
  async function alternar() {
    if (rep.sonando) rep.pausar();
    else await escuchar(terminado ? null : rep.pos);
  }
  function elegir(id) {
    const sonaba = rep.sonando;
    if (sonaba) rep.pausar();
    hist = HISTORIAS.find((h) => h.id === id) || HISTORIAS[0];
    $('historia-sel').value = hist.id;
    rep.pos = { tramo: 0, fraccion: 0 }; terminado = false;
    mostrarHistoria();
    if (sonaba) escuchar(null);
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
  async function generarWav(id, apagados) {
    const h = HISTORIAS.find((x) => x.id === (id || hist.id));
    const buffer = await M.renderizar(recorridoDe(h), { sampleRate: 48000, apagados: apagados || Object.assign({}, rep.apagados) });
    return { blob: aWav(buffer), buffer, segundos: buffer.duration, nombre: 'aerosoles_' + h.id + '.wav' };
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
      e.preventDefault();
      const i = HISTORIAS.indexOf(hist) + (e.key === 'ArrowLeft' ? -1 : 1);
      elegir(HISTORIAS[(i + HISTORIAS.length) % HISTORIAS.length].id);
    }
  });

  async function iniciar() {
    aplicarIdioma();
    $('historia').textContent = t('cargando');
    $('idioma').addEventListener('change', (e) => { idioma = e.target.value; aplicarIdioma(); textoActual = null; });
    $('historia-sel').addEventListener('change', (e) => elegir(e.target.value));
    $('btn-escuchar').addEventListener('click', () => escuchar(null));
    $('btn-play').addEventListener('click', alternar);
    $('btn-exportar').addEventListener('click', exportar);
    $('mapa').addEventListener('click', (e) => {
      const r = e.currentTarget.getBoundingClientRect(), lon = -180 + 360 * (e.clientX - r.left) / r.width;
      const l = rep.linea(relojVisual()), tr = recorridoDe(hist).tramos[l.tramo] || recorridoDe(hist).tramos[0], z = tr.zona;
      const f = Math.max(0, Math.min(1, (lon - z[0]) / (z[1] - z[0])));
      escuchar({ tramo: l.tramo, fraccion: tr.dir < 0 ? 1 - f : f });
    });
    rep.alTerminar = () => { terminado = true; $('estado').textContent = t('fin'); };
    if (!window.Tone) { $('historia').textContent = 'Tone.js no cargó (¿sin internet?)'; return; }
    M.cargarPiano().then((p) => rep.usarPiano(p)).catch(() => { /* suena la campana grave */ });
    try {
      const r = await fetch(RUTA, { cache: 'no-cache' });
      if (!r.ok) throw new Error(r.status);
      datos = await r.json();
    } catch (e) { $('historia').textContent = t('error_datos'); return; }
    $('historia').textContent = ''; textoActual = '';
    mostrarHistoria();
    requestAnimationFrame(bucle);
  }

  // Modo incrustado (Earthbeat): el reproductor de la app manda
  if (window.EIJ) EIJ.conectar({
    alternar: () => alternar(),
    ir: (f) => { if (datos && recorridoDe(hist).tramos.length === 1) escuchar({ tramo: 0, fraccion: f }); },
    estado: () => {
      if (!datos) return { sonando: false, pos: 0, dur: 0 };
      const rec = recorridoDe(hist), dur = rec.tramos.reduce((s, tr) => s + tr.barrido, 0) + 0.8 * (rec.tramos.length - 1);
      const l = rep.linea(relojVisual()), tr = rec.tramos[l.tramo] || rec.tramos[0];
      let pos = l.fraccion * tr.barrido;
      for (let i = 0; i < l.tramo; i++) pos += rec.tramos[i].barrido + 0.8;
      return { sonando: rep.sonando, pos: Math.min(dur, pos), dur };
    },
  });

  window.AerosolesApp = { generarWav, reproductor: rep, HISTORIAS };
  iniciar();
})();
