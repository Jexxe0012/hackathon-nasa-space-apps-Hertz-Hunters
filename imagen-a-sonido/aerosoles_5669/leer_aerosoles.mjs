// Lee los 4 tipos de aerosol del SVS 5669 (modelo GEOS, 19/08/2025 20:00 UTC, mapa plano 3840×2160) en una malla
// para el radar: 192 columnas de oeste a este × 16 franjas de norte a sur (72°N a 64°S, 8,5° cada una).
//
// Uso: node leer_aerosoles.mjs [archivo.png]
// La leyenda NO tiene números: dice QUÉ tipo es; la cantidad se nota en lo brillante del color. Por eso:
//   tipo = el color de la leyenda más parecido (por tono), cantidad = brillo del pixel sobre un piso.
//   Cada tipo se normaliza con su propio máximo (0–1000): no se comparan cantidades entre tipos.
// Aproximaciones (se dicen en la página): donde se mezclan dos tipos, el pixel cuenta para el tono que domina;
// las luces de ciudades (blanco-amarillo) y la tierra gris se descartan.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVO = process.argv[2] || 'C:/Users/ADMIN/Desktop/NASA-SpaceApps-2026-EarthJukebox/05-assets/5669_aerosoles/aerosoles_2025-08-19_3840.png';
const COLUMNAS = 192, FRANJAS = 16, LAT_N = 72, LAT_S = -64;

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

// Clasifica un pixel: devuelve [tipo, cantidad] o null
function clasificar(R, G, B) {
  const mx = Math.max(R, G, B), mn = Math.min(R, G, B), V = mx / 255, C = (mx - mn) / 255;
  if (C < 0.04) return null; // gris (tierra, hielo) o blanco
  let h;
  if (mx === R) h = ((G - B) / (mx - mn)) % 6; else if (mx === G) h = (B - R) / (mx - mn) + 2; else h = (R - G) / (mx - mn) + 4;
  h = (h * 60 + 360) % 360;
  // carbono negro (rojo-naranja): sin el amarillo de las luces de ciudades (G alto)
  if ((h >= 345 || h <= 30) && C > 0.15 && V > 0.3 && G < 0.72 * R) return ['carbono_negro', V - 0.2];
  // polvo (lila)
  if (h >= 255 && h <= 330 && C > 0.1 && V > 0.35) return ['polvo', V - 0.2];
  // sulfatos (verde brillante); el océano de fondo es verdoso pero oscuro
  if (h >= 75 && h <= 160 && C > 0.22 && V > 0.25) return ['sulfatos', V - 0.2];
  // sal marina (gris azulado claro): más azul que rojo, clara
  if (h >= 165 && h <= 240 && V > 0.3 && C < 0.5 && B - R > 12) return ['sal_marina', V - 0.25];
  return null;
}

const img = leerPng(ARCHIVO);
const TIPOS = ['carbono_negro', 'polvo', 'sal_marina', 'sulfatos'];
const conteo = Object.fromEntries(TIPOS.map((t) => [t, 0]));

// Malla de COLS × FILAS entre LAT_N y LAT_S; cada tipo normalizado con su máximo (0–1000)
function malla(COLS, FILAS, contar) {
  const crudo = Object.fromEntries(TIPOS.map((t) => [t, []]));
  const yN = Math.round((90 - LAT_N) / 180 * img.h), yS = Math.round((90 - LAT_S) / 180 * img.h);
  for (let c = 0; c < COLS; c++) {
    const x0 = Math.floor(c * img.w / COLS), x1 = Math.floor((c + 1) * img.w / COLS);
    const cols = Object.fromEntries(TIPOS.map((t) => [t, []]));
    for (let f = 0; f < FILAS; f++) {
      const y0 = Math.floor(yN + f * (yS - yN) / FILAS), y1 = Math.floor(yN + (f + 1) * (yS - yN) / FILAS);
      const suma = Object.fromEntries(TIPOS.map((t) => [t, 0]));
      let n = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const k = (y * img.w + x) * img.bpp, r = clasificar(img.px[k], img.px[k + 1], img.px[k + 2]);
        n++;
        if (r && r[1] > 0) { suma[r[0]] += r[1]; if (contar) conteo[r[0]]++; }
      }
      TIPOS.forEach((t) => cols[t].push(suma[t] / n));
    }
    TIPOS.forEach((t) => crudo[t].push(cols[t]));
  }
  const out = {};
  for (const t of TIPOS) { const max = Math.max(...crudo[t].flat()); out[t] = crudo[t].map((col) => col.map((v) => Math.round(1000 * v / max))); }
  return out;
}
const tipos = malla(COLUMNAS, FRANJAS, true);
// Malla fina para las historias (zonas pequeñas): 384 × 34 (0,94° × 4°)
const FINA = { columnas: 384, filas: 34 };
const fina = malla(FINA.columnas, FINA.filas, false);
const salida = {
  fuente: 'NASA SVS 5669 · modelo GEOS (FP), aerosoles del 19/08/2025 20:00 UTC, mapa plano 3840×2160',
  aviso_es: 'Modelo (no foto). La leyenda no tiene números: el tipo sale del color y la cantidad, de lo brillante. Cada tipo usa su propia escala.',
  aviso_en: 'Model (not a photo). The legend has no numbers: type comes from color and amount from brightness. Each type uses its own scale.',
  columnas: COLUMNAS, franjas: FRANJAS, lat_norte: LAT_N, lat_sur: LAT_S,
  metodo: 'tono más parecido al de la leyenda; cantidad = brillo sobre un piso; promedio por celda; 0–1000 con el máximo de cada tipo',
  pixeles_por_tipo: conteo,
  tipos, // tipos[tipo][columna oeste→este][franja norte→sur]
  fina: { columnas: FINA.columnas, filas: FINA.filas, tipos: fina }, // misma idea, más detalle (para las historias)
};
const out = path.join(AQUI, 'resultados', 'aerosoles_radar.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(salida));
console.log('escrito', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
console.log('pixeles por tipo:', JSON.stringify(conteo));
for (const t of TIPOS) {
  const v = tipos[t].flat().filter((x) => x > 0).sort((a, b) => a - b);
  const act = tipos[t].map((col) => col.filter((x) => x >= 60).length);
  console.log(t.padEnd(14), 'celdas>0:', v.length, 'p50/p90:', v[Math.floor(v.length / 2)], v[Math.floor(v.length * 0.9)], '| franjas>=60 por columna (máx, prom):', Math.max(...act), (act.reduce((a, b) => a + b, 0) / act.length).toFixed(2));
}
// dónde está cada tipo (longitud de la columna con más cantidad)
for (const t of TIPOS) {
  let best = [0, 0, 0];
  tipos[t].forEach((col, c) => col.forEach((v, f) => { if (v > best[0]) best = [v, c, f]; }));
  console.log(t.padEnd(14), 'máximo en lon', (-180 + (best[1] + 0.5) * 360 / COLUMNAS).toFixed(0), 'lat', (LAT_N - (best[2] + 0.5) * (LAT_N - LAT_S) / FRANJAS).toFixed(0));
}
