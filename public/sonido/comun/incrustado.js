/*
 * Modo incrustado de las escenas de sonido (para la app Earthbeat de Josué).
 * Con ?embed=1 la página:
 *   - oculta su encabezado, pie y controles propios (marcados .solo-pagina) y toma los colores de Earthbeat;
 *   - obedece al reproductor de la app por postMessage: { eij: 'alternar' | 'ir' | 'volumen', fraccion, valor };
 *   - informa su estado { eij: 'estado', sonando, pos, dur } y su alto { eij: 'alto', px } para que el visor se ajuste.
 * Cada escena registra sus funciones con EIJ.conectar({ alternar, ir, estado }).
 */
(function () {
  'use strict';
  const incrustado = new URLSearchParams(location.search).get('embed') === '1';
  const EIJ = { incrustado, conectar() {} };
  window.EIJ = EIJ;
  if (!incrustado) return;

  document.documentElement.classList.add('incrustado');
  const estilo = document.createElement('style');
  estilo.textContent = `
    html.incrustado { color-scheme: dark; }
    html.incrustado, html.incrustado body { overflow: hidden; } /* el visor ya mide el alto: sin barra interna */
    html.incrustado, html.incrustado body { background: #0d1629 !important; } /* mismo fondo que el visor de Earthbeat */
    html.incrustado body { color: #f3f4f0; font-family: 'Atkinson Hyperlegible', system-ui, sans-serif; }
    html.incrustado main { max-width: none !important; padding: 0 !important; }
    html.incrustado header .disco, html.incrustado header h1, html.incrustado header .aviso, html.incrustado footer, html.incrustado .solo-pagina { display: none !important; }
    html.incrustado .tarjeta { background: transparent !important; border: 0 !important; padding: 4px 2px !important; margin: 0 !important; }
    html.incrustado { --fondo: #0d1629 !important; --tarjeta: #101c31 !important; --texto: #f3f4f0 !important; --suave: #aabbd0 !important; --borde: #30405a !important; --acento: #75e0cd !important; --acento-texto: #0b1425 !important; }
    html.incrustado select, html.incrustado button { background: #192b43; color: #f3f4f0; border-color: #30405a; }
  `;
  document.head.appendChild(estilo);

  const padre = window.parent;
  const enviar = (msg) => { try { padre.postMessage(Object.assign({ eij: '' }, msg), '*'); } catch (e) { /* sin padre */ } };
  let api = null;
  EIJ.conectar = (funciones) => { api = funciones; };

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object' || !d.eij || !api) return;
    if (d.eij === 'alternar' && api.alternar) api.alternar();
    else if (d.eij === 'ir' && api.ir) api.ir(Math.max(0, Math.min(0.999, Number(d.fraccion) || 0)));
    else if (d.eij === 'volumen' && window.Tone) {
      const v = Math.max(0, Math.min(1, Number(d.valor)));
      try { Tone.getDestination().mute = v === 0; if (v > 0) Tone.getDestination().volume.rampTo(20 * Math.log10(v), 0.1); } catch (err) { /* aún sin audio */ }
    }
  });

  // estado (4 veces por segundo) y alto de la escena
  setInterval(() => { if (api && api.estado) { const s = api.estado(); enviar({ eij: 'estado', sonando: !!s.sonando, pos: s.pos || 0, dur: s.dur || 0 }); } }, 250);
  let ultimoAlto = 0;
  // alto del contenido real (no del documento, que crece con el propio recuadro y haría un bucle)
  const medir = (siempre) => { const m = document.querySelector('main') || document.body; const px = Math.ceil(m.getBoundingClientRect().bottom + window.scrollY) + 8; if (siempre === true || Math.abs(px - ultimoAlto) > 2) { ultimoAlto = px; enviar({ eij: 'alto', px }); } };
  new ResizeObserver(() => medir()).observe(document.body);
  setInterval(() => medir(true), 1000); // se repite: la app puede empezar a escuchar después
})();
