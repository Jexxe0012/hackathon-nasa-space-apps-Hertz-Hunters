// Prepara el "radar" del disco Luces: convierte cada mapa anual del SVS 5276 (mundo de noche, 3840×2160) en una
// cuadrícula de brillo: 192 columnas de oeste a este (1,875° cada una) × 16 franjas de norte a sur (8° cada una,
// de 72°N a 56°S, donde están casi todas las luces). El sonido recorre las columnas como un radar.
//
// Uso: node radar_luces.mjs [carpeta_5276_luces]
// Brillo de una celda = promedio de (luminancia − 0,04) de sus pixeles con luz. Se normaliza con el máximo de
// TODOS los años (0–1000): así un año se puede comparar con otro. El texto del año que trae cada imagen se tapa.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CARPETA = process.argv[2] || 'C:/Users/ADMIN/Desktop/NASA-SpaceApps-2026-EarthJukebox/05-assets/5276_luces';
const COLUMNAS = 192, FRANJAS = 16, LAT_N = 72, LAT_S = -56, UMBRAL = 0.04;
// Texto del año en cada imagen (centro abajo): se ignora esa zona (x, y en pixeles de 3840×2160)
const TEXTO = { x0: 1600, x1: 1920, y0: 1290, y1: 1420 };

function leerPng(ruta) {
  const b = fs.readFileSync(ruta);
  let o = 8, w = 0, h = 0, tipo = 0;
  const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), t = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); tipo = d[9]; }
    else if (t === 'IDAT') idat.push(d);
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

const crudos = {};
let maximo = 0;
for (let a = 2012; a <= 2023; a++) {
  const img = leerPng(path.join(CARPETA, 'por_anio', `luces_${a}.png`));
  const yN = Math.round((90 - LAT_N) / 180 * img.h), yS = Math.round((90 - LAT_S) / 180 * img.h);
  const malla = [];
  for (let c = 0; c < COLUMNAS; c++) {
    const x0 = Math.floor(c * img.w / COLUMNAS), x1 = Math.floor((c + 1) * img.w / COLUMNAS), col = [];
    for (let f = 0; f < FRANJAS; f++) {
      const y0 = Math.floor(yN + f * (yS - yN) / FRANJAS), y1 = Math.floor(yN + (f + 1) * (yS - yN) / FRANJAS);
      let suma = 0, n = 0;
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        if (x >= TEXTO.x0 && x < TEXTO.x1 && y >= TEXTO.y0 && y < TEXTO.y1) continue;
        const k = (y * img.w + x) * img.bpp;
        const L = (0.2126 * img.px[k] + 0.7152 * img.px[k + 1] + 0.0722 * img.px[k + 2]) / 255;
        n++;
        if (L > UMBRAL) suma += L - UMBRAL;
      }
      const v = n ? suma / n : 0;
      col.push(v);
      maximo = Math.max(maximo, v);
    }
    malla.push(col);
  }
  crudos[a] = malla;
  process.stdout.write(a + ' ');
}
console.log();

const anios = {};
for (const [a, malla] of Object.entries(crudos)) anios[a] = malla.map((col) => col.map((v) => Math.round(1000 * v / maximo)));
const total = (a) => anios[a].flat().reduce((p, q) => p + q, 0);
const salida = {
  fuente: 'NASA SVS 5276 · Black Marble (VIIRS, Suomi NPP), mapas anuales 2012–2023 (promedio de todo el año), 3840×2160',
  aviso_es: 'Cada mapa es el promedio de todo un año, no de un día. Brillo relativo (la NASA no da unidades), comparable entre años.',
  aviso_en: 'Each map is the average of a whole year, not a single day. Relative brightness (NASA gives no units), comparable between years.',
  columnas: COLUMNAS, franjas: FRANJAS, lat_norte: LAT_N, lat_sur: LAT_S, grados_por_columna: 360 / COLUMNAS, grados_por_franja: (LAT_N - LAT_S) / FRANJAS,
  metodo: 'promedio de (luminancia − ' + UMBRAL + ') por celda; 0–1000 con el máximo de todos los años; se ignora el texto del año',
  total_relativo_2012: Object.fromEntries(Object.keys(anios).map((a) => [a, +(total(a) / total('2012')).toFixed(3)])),
  anios, // anios[año][columna oeste→este][franja norte→sur]
};
const out = path.join(AQUI, 'resultados', 'luces_radar.json');
fs.writeFileSync(out, JSON.stringify(salida));
console.log('escrito', out, (fs.statSync(out).size / 1024).toFixed(0) + ' KB');
console.log('luz total del mundo vs 2012:', JSON.stringify(salida.total_relativo_2012));
const v = Object.values(anios).flat(2).filter((x) => x > 0).sort((p, q) => p - q);
console.log('celdas con luz:', v.length, 'de', 12 * COLUMNAS * FRANJAS, '· percentiles 50/90/99:', v[Math.floor(v.length * 0.5)], v[Math.floor(v.length * 0.9)], v[Math.floor(v.length * 0.99)]);
const c2023 = anios['2023'], activas = c2023.map((col) => col.filter((x) => x >= 20).length);
console.log('franjas con brillo >= 20 por columna en 2023 (máx, promedio):', Math.max(...activas), (activas.reduce((p, q) => p + q, 0) / activas.length).toFixed(2));
