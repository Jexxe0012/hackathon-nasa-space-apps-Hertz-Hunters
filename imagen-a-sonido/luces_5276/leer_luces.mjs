// Lee las luces nocturnas de El Salvador en los 12 mapas anuales del SVS 5276 (Black Marble, VIIRS) y el
// mapa de cambio 2012–2023. Sin librerías: Node trae zlib para abrir los PNG.
//
// Uso: node leer_luces.mjs [carpeta_5276_luces]
// La carpeta debe tener: por_anio/luces_AAAA.png (2012–2023) y cambio_2012-2023.png (3840×2160).
//
// Mapa: mundo completo estirado a 16:9 (x = (lon+180)/360·W, y = (90−lat)/180·H). Comprobado con el delta
// del Nilo. 1 pixel ≈ 10 km. La barra NO tiene números: todo es relativo a 2012 ("más luz / menos luz").
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CARPETA = process.argv[2] || 'C:/Users/ADMIN/Desktop/NASA-SpaceApps-2026-EarthJukebox/05-assets/5276_luces';

function leerPng(ruta) {
  const b = fs.readFileSync(ruta);
  let o = 8, w = 0, h = 0, tipo = 0;
  const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o), t = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); if (d[8] !== 8 || d[12] !== 0) throw new Error('PNG no soportado'); tipo = d[9]; }
    else if (t === 'IDAT') idat.push(d);
    o += 12 + len;
  }
  const bpp = { 2: 3, 6: 4, 0: 1, 4: 2 }[tipo];
  const raw = zlib.inflateSync(Buffer.concat(idat)), fila = w * bpp, px = Buffer.alloc(h * fila);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (fila + 1)], src = y * (fila + 1) + 1, dst = y * fila;
    for (let i = 0; i < fila; i++) {
      const x = raw[src + i], a = i >= bpp ? px[dst + i - bpp] : 0, up = y ? px[dst - fila + i] : 0, c = y && i >= bpp ? px[dst - fila + i - bpp] : 0;
      let v;
      if (f === 0) v = x; else if (f === 1) v = x + a; else if (f === 2) v = x + up; else if (f === 3) v = x + ((a + up) >> 1);
      else { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? up : c); }
      px[dst + i] = v & 255;
    }
  }
  return { w, h, bpp, px };
}

const caja = (img, lon0, lon1, lat0, lat1) => ({
  x0: Math.floor((lon0 + 180) / 360 * img.w), x1: Math.ceil((lon1 + 180) / 360 * img.w),
  y0: Math.floor((90 - lat1) / 180 * img.h), y1: Math.ceil((90 - lat0) / 180 * img.h),
});
// Zonas (recuadros en grados). El de El Salvador toca bordes de Guatemala y Honduras: se dice así.
const ZONAS = {
  el_salvador: { es: 'El Salvador (recuadro del país, incluye bordes vecinos)', en: 'El Salvador (country box, includes neighbor edges)', lon: [-90.15, -87.65], lat: [13.1, 14.45] },
  san_salvador: { es: 'Gran San Salvador', en: 'Greater San Salvador', lon: [-89.4, -88.95], lat: [13.55, 13.85] },
  centroamerica: { es: 'Centroamérica (comparación)', en: 'Central America (comparison)', lon: [-92.3, -77.2], lat: [7.2, 18.5] },
};
const UMBRAL = 0.04; // brillo bajo esto = fondo (no es luz)

function luzEn(img, z) {
  const c = caja(img, z.lon[0], z.lon[1], z.lat[0], z.lat[1]);
  let suma = 0, encendidos = 0, n = 0;
  const columnas = new Array(c.x1 - c.x0).fill(0); // luz por columna (oeste → este), para ubicar el sonido
  for (let y = c.y0; y < c.y1; y++) for (let x = c.x0; x < c.x1; x++) {
    const k = (y * img.w + x) * img.bpp;
    const L = (0.2126 * img.px[k] + 0.7152 * img.px[k + 1] + 0.0722 * img.px[k + 2]) / 255;
    n++;
    if (L > UMBRAL) { suma += L - UMBRAL; encendidos++; columnas[x - c.x0] += L - UMBRAL; }
  }
  return { suma, encendidos, pixeles: n, columnas };
}

const anios = [];
for (let a = 2012; a <= 2023; a++) {
  const img = leerPng(path.join(CARPETA, 'por_anio', `luces_${a}.png`));
  const r = { anio: a };
  for (const [k, z] of Object.entries(ZONAS)) r[k] = luzEn(img, z);
  anios.push(r);
  process.stdout.write(a + ' ');
}
console.log();

// Mapa de cambio: morado = luces nuevas, naranja = se apagaron (pesado por cuánto color tiene el pixel)
function cambioEn(img, z) {
  const c = caja(img, z.lon[0], z.lon[1], z.lat[0], z.lat[1]);
  let nuevas = 0, apagadas = 0;
  for (let y = c.y0; y < c.y1; y++) for (let x = c.x0; x < c.x1; x++) {
    const k = (y * img.w + x) * img.bpp, R = img.px[k], G = img.px[k + 1], B = img.px[k + 2];
    const mx = Math.max(R, G, B), mn = Math.min(R, G, B), croma = (mx - mn) / 255;
    if (mx < 60 || croma < 0.12) continue; // fondo oscuro o gris: sin cambio visible
    if (B > G && R > G) nuevas += croma * mx / 255;       // morado
    else if (R > B && G > B) apagadas += croma * mx / 255; // naranja
  }
  return { nuevas: +nuevas.toFixed(3), apagadas: +apagadas.toFixed(3) };
}
const imgCambio = leerPng(path.join(CARPETA, 'cambio_2012-2023.png'));
const cambio = {};
for (const [k, z] of Object.entries(ZONAS)) cambio[k] = cambioEn(imgCambio, z);

const base = anios[0];
const series = {};
for (const k of Object.keys(ZONAS)) {
  series[k] = anios.map((r) => ({
    anio: r.anio,
    luz_relativa_2012: +(r[k].suma / base[k].suma).toFixed(3),
    pixeles_encendidos: r[k].encendidos,
    // reparto de la luz de oeste a este (10 tramos), para ubicar los destellos en estéreo
    oeste_a_este: (() => { const col = r[k].columnas, t = 10, out = new Array(t).fill(0); col.forEach((v, i) => { out[Math.min(t - 1, Math.floor(i * t / col.length))] += v; }); const s = out.reduce((p, q) => p + q, 0) || 1; return out.map((v) => +(v / s).toFixed(3)); })(),
  }));
}

const salida = {
  fuente: 'NASA SVS 5276 · Black Marble (VIIRS, Suomi NPP), mapas anuales 2012–2023 y mapa de cambio 2012–2023, 3840×2160',
  aviso_es: 'Observación real desde satélite. La barra no tiene números: todo es relativo a 2012 (más luz / menos luz). Más luz no es ni bueno ni malo por sí solo.',
  aviso_en: 'Real satellite observation. The color bar has no numbers: everything is relative to 2012 (more light / less light). More light is neither good nor bad by itself.',
  metodo: 'brillo (luminancia) de cada pixel menos un umbral de fondo de ' + UMBRAL + ', sumado dentro de cada recuadro; dividido entre el de 2012',
  km_por_pixel: 10.4,
  zonas: Object.fromEntries(Object.entries(ZONAS).map(([k, z]) => [k, { nombre_es: z.es, nombre_en: z.en, lon: z.lon, lat: z.lat }])),
  cambio_2012_2023: cambio,
  series,
};
const out = path.join(AQUI, 'resultados', 'luces_5276.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(salida, null, 1));
console.log('escrito', out);
for (const k of Object.keys(ZONAS)) console.log(k.padEnd(14), series[k].map((s) => s.luz_relativa_2012.toFixed(2)).join(' '), '| pixeles 2012→2023:', series[k][0].pixeles_encendidos, '→', series[k][11].pixeles_encendidos);
console.log('cambio (nuevas / apagadas):', JSON.stringify(cambio));
