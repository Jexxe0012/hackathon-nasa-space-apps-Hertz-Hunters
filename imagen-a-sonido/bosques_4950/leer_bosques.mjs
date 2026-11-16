// Lee la altura de los bosques (GEDI, NASA SVS 4950) en el globo de América (3840×2160) para el radar de norte a sur.
// La NASA solo publica este dataset como globo 3D con relieve y sombras: la lectura en metros es APROXIMADA.
//
// Uso: node leer_bosques.mjs [globo.png] [barra.png]
// Método: la barra va de café (0 m) a verde, amarillo y crema (50 m): más alto = más claro. El globo tiene luz de un
// lado y sombra del otro, y la luz tiñe de amarillo. Corrección: el MAR es del mismo color en todas partes, así que su
// brillo en cada zona mide la luz que llega ahí; se aclara la tierra en la misma proporción (malla de 24×24 zonas) y
// luego se busca el color más parecido de la barra (con menos peso al azul, por el tinte amarillo de la luz).
// Se descartan el mar, el fondo negro, el hielo/nubes y la leyenda de la imagen.
// Salida: N franjas horizontales (de norte a sur en la imagen) × 6 columnas (oeste → este en la imagen):
//   cobertura (0–1000, cuánta parte de la celda es bosque/vegetación) y altura media en metros.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'C:/Users/ADMIN/Desktop/NASA-SpaceApps-2026-EarthJukebox/05-assets/4950_bosques/';
const GLOBO = process.argv[2] || BASE + 'bosques_globo_americas_f1900.png';
const BARRA = process.argv[3] || BASE + 'barra_0a50m.png';
const FRANJAS = 96, COLUMNAS = 6;
const X0 = 1150, X1 = 3000, Y0 = 60, Y1 = 2080;     // zona del globo (pixeles)
const LEYENDA = { x1: 1100, y0: 1880 };              // la leyenda de la imagen (abajo a la izquierda) se ignora

function leerPng(ruta) {
  const b = fs.readFileSync(ruta);
  let o = 8, w = 0, h = 0, tipo = 0;
  const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), t = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); tipo = d[9]; } else if (t === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const bpp = { 2: 3, 6: 4 }[tipo], raw = zlib.inflateSync(Buffer.concat(idat)), fila = w * bpp, px = Buffer.alloc(h * fila);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (fila + 1)], s = y * (fila + 1) + 1, d = y * fila;
    for (let i = 0; i < fila; i++) {
      const x = raw[s + i], a = i >= bpp ? px[d + i - bpp] : 0, u = y ? px[d - fila + i] : 0, c = y && i >= bpp ? px[d - fila + i - bpp] : 0;
      let v;
      if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + u; else if (f === 3) v = x + ((a + u) >> 1);
      else { const p = a + u - c, pa = Math.abs(p - a), pb = Math.abs(p - u), pc = Math.abs(p - c); v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? u : c); }
      px[d + i] = v & 255;
    }
  }
  return { w, h, bpp, px };
}

// Barra: fila del medio (sin las marcas blancas), de 0 m a 50 m
const barra = leerPng(BARRA);
const by = Math.round(barra.h * 0.53);
const muestras = [];
for (let x = 30; x <= 1652; x += 2) {
  const k = (by * barra.w + x) * barra.bpp, R = barra.px[k], G = barra.px[k + 1], B = barra.px[k + 2], S = R + G + B;
  if (R > 230 && G > 230 && B > 230 && x < 1600) continue; // marca blanca
  muestras.push({ m: 50 * (x - 30) / (1652 - 30), R, G, B });
}

function esVegetacion(R, G, B) {
  const V = Math.max(R, G, B) / 255;
  return V >= 0.08 && G >= B + 10 && R >= B + 5; // verde-café-amarillo; el mar y el hielo son azulados o grises
}
function altura(R, G, B, k) {
  const r = Math.min(255, R * k), g = Math.min(255, G * k), b = Math.min(255, B * k);
  let mejor = null, dmin = 1e9;
  for (const q of muestras) { const d = (q.R - r) ** 2 + (q.G - g) ** 2 + 0.3 * (q.B - b) ** 2; if (d < dmin) { dmin = d; mejor = q; } }
  return mejor.m;
}
const img = leerPng(GLOBO);
// Luz: brillo medio del mar en una malla de 24×24 zonas del globo; las zonas sin mar toman el promedio de sus vecinas
const NL = 24, luz = Array.from({ length: NL }, () => new Array(NL).fill(null));
for (let gy = 0; gy < NL; gy++) for (let gx = 0; gx < NL; gx++) {
  let s2 = 0, n2 = 0;
  for (let y = Math.floor(Y0 + gy * (Y1 - Y0) / NL); y < Math.floor(Y0 + (gy + 1) * (Y1 - Y0) / NL); y += 3)
    for (let x = Math.floor(X0 + gx * (X1 - X0) / NL); x < Math.floor(X0 + (gx + 1) * (X1 - X0) / NL); x += 3) {
      const k = (y * img.w + x) * img.bpp, R = img.px[k], G = img.px[k + 1], B = img.px[k + 2];
      if (B > R + 30 && B > G && B > 40) { s2 += 0.2126 * R + 0.7152 * G + 0.0722 * B; n2++; }
    }
  if (n2 >= 30) luz[gy][gx] = s2 / n2;
}
for (let pasada = 0; pasada < 30; pasada++) {
  let faltan = 0;
  for (let gy = 0; gy < NL; gy++) for (let gx = 0; gx < NL; gx++) {
    if (luz[gy][gx] != null) continue;
    let s2 = 0, n2 = 0;
    for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const v = (luz[gy + dy] || [])[gx + dx]; if (v != null) { s2 += v; n2++; } }
    if (n2) luz[gy][gx] = -(s2 / n2); else faltan++; // negativo = rellenado en esta pasada
  }
  for (let gy = 0; gy < NL; gy++) for (let gx = 0; gx < NL; gx++) if (luz[gy][gx] < 0) luz[gy][gx] = -luz[gy][gx];
  if (!faltan) break;
}
const ref = luz.flat().filter((v) => v != null).sort((a, b) => a - b);
const LUZ_REF = ref[Math.floor(ref.length * 0.5)]; // referencia = luz media del mar (no la más brillante)
// interpolación entre centros de zona: sin bloques
const factorLuz = (x, y) => {
  const fx = (x - X0) / (X1 - X0) * NL - 0.5, fy = (y - Y0) / (Y1 - Y0) * NL - 0.5;
  const x0 = Math.max(0, Math.min(NL - 1, Math.floor(fx))), y0 = Math.max(0, Math.min(NL - 1, Math.floor(fy)));
  const x1 = Math.min(NL - 1, x0 + 1), y1 = Math.min(NL - 1, y0 + 1), tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0));
  const L = (gy, gx) => luz[gy][gx] || LUZ_REF;
  const v = (L(y0, x0) * (1 - tx) + L(y0, x1) * tx) * (1 - ty) + (L(y1, x0) * (1 - tx) + L(y1, x1) * tx) * ty;
  return Math.max(0.7, Math.min(2.2, LUZ_REF / v));
};
const filas = [];
let maxAlt = 0, total = 0;
for (let f = 0; f < FRANJAS; f++) {
  const y0 = Math.floor(Y0 + f * (Y1 - Y0) / FRANJAS), y1 = Math.floor(Y0 + (f + 1) * (Y1 - Y0) / FRANJAS);
  const celdas = [];
  for (let c = 0; c < COLUMNAS; c++) {
    const x0 = Math.floor(X0 + c * (X1 - X0) / COLUMNAS), x1 = Math.floor(X0 + (c + 1) * (X1 - X0) / COLUMNAS);
    let n = 0, veg = 0, suma = 0;
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) {
      if (x < LEYENDA.x1 && y > LEYENDA.y0) continue;
      n++;
      const k = (y * img.w + x) * img.bpp, R = img.px[k], G = img.px[k + 1], B = img.px[k + 2];
      if (esVegetacion(R, G, B)) { veg++; suma += altura(R, G, B, factorLuz(x, y)); }
    }
    const cob = n ? veg / n : 0, alt = veg ? suma / veg : null;
    if (alt != null && cob > 0.05) maxAlt = Math.max(maxAlt, alt);
    total += veg;
    celdas.push({ cobertura: Math.round(1000 * cob), altura_m: alt == null ? null : +alt.toFixed(1) });
  }
  filas.push(celdas);
}

// Historia: del corazón del Amazonas (norte) al borde sur donde el bosque alto se acaba. 16 puntos en línea recta
// sobre la imagen; cada punto = altura media de la vegetación en una ventana de 60×60 px (misma lectura corregida).
const TRANSECTO = { xa: 2250, ya: 1040, xb: 2250, yb: 1760, n: 16, ventana: 30 };
const transecto = [];
for (let i = 0; i < TRANSECTO.n; i++) {
  const cx = Math.round(TRANSECTO.xa + (TRANSECTO.xb - TRANSECTO.xa) * i / (TRANSECTO.n - 1));
  const cy = Math.round(TRANSECTO.ya + (TRANSECTO.yb - TRANSECTO.ya) * i / (TRANSECTO.n - 1));
  let s2 = 0, v = 0, tot = 0;
  for (let y = cy - TRANSECTO.ventana; y < cy + TRANSECTO.ventana; y += 2) for (let x = cx - TRANSECTO.ventana; x < cx + TRANSECTO.ventana; x += 2) {
    const k = (y * img.w + x) * img.bpp, R = img.px[k], G = img.px[k + 1], B = img.px[k + 2];
    tot++;
    if (esVegetacion(R, G, B)) { v++; s2 += altura(R, G, B, factorLuz(x, y)); }
  }
  transecto.push({ x: cx, y: cy, vegetacion: +(v / tot).toFixed(2), altura: v / tot > 0.3 ? +(s2 / v).toFixed(1) : null });
}
console.log('transecto (altura en la escala de la barra):', transecto.map((q) => q.altura == null ? '-' : Math.round(q.altura)).join(' '));

const salida = {
  fuente: 'NASA SVS 4950 · altura de la vegetación (GEDI, Estación Espacial Internacional), globo de América 3840×2160',
  aviso_es: 'La NASA solo publica este dataset como globo 3D con relieve y sombras: las alturas son APROXIMADAS y se usan como relativas (más alto / más bajo), no como metros exactos. Las franjas siguen la imagen (de arriba a abajo), no latitudes exactas.',
  aviso_en: 'NASA only publishes this dataset as a shaded 3D globe: heights are approximate. Bands follow the image (top to bottom), not exact latitudes.',
  metodo: 'luz corregida con el brillo del mar cercano (malla 24×24) y color más parecido de la barra 0–50 m (menos peso al azul); se descartan mar, hielo, fondo y leyenda',
  franjas: FRANJAS, columnas: COLUMNAS, zona_pixeles: { x0: X0, x1: X1, y0: Y0, y1: Y1, ancho: img.w, alto: img.h },
  filas, // filas[franja de arriba a abajo][columna de izquierda a derecha] = { cobertura 0–1000, altura_m }
  transecto, // del corazón del Amazonas al borde sur: [{ x, y (pixeles), vegetacion 0–1, altura (escala de la barra, aproximada) }]
};
const out = path.join(AQUI, 'resultados', 'bosques_radar.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(salida));
console.log('escrito', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB · muestras de barra:', muestras.length, '· pixeles de vegetación:', total);
// altura media por franja (para revisar el viaje norte → sur)
const resumen = filas.map((cel, f) => {
  let s = 0, w = 0; cel.forEach((c) => { if (c.altura_m != null) { s += c.altura_m * c.cobertura; w += c.cobertura; } });
  return { f, alt: w ? s / w : null, cob: w / COLUMNAS };
});
console.log('franja · altura media (m) · cobertura media (cada 6):');
console.log(resumen.filter((r) => r.f % 6 === 0).map((r) => `${r.f}:${r.alt == null ? '-' : r.alt.toFixed(0)}m/${r.cob.toFixed(0)}`).join('  '));
