// Copia los JSON que producen los lectores (imagen-a-sonido/*/resultados) a public/sonido/datos/,
// que es donde los cargan las escenas de sonido dentro de la app. Correr después de regenerar datos:
//   node scripts/copiar_datos_sonido.mjs
import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const destino = path.join(raiz, 'public', 'sonido', 'datos');
const archivos = [
  'imagen-a-sonido/oceano_3912/resultados/oceano_3912_costa.json',
  'imagen-a-sonido/luces_5276/resultados/luces_radar.json',
  'imagen-a-sonido/aerosoles_5669/resultados/aerosoles_radar.json',
  'imagen-a-sonido/bosques_4950/resultados/bosques_radar.json',
];
fs.mkdirSync(destino, { recursive: true });
for (const a of archivos) { fs.copyFileSync(path.join(raiz, a), path.join(destino, path.basename(a))); console.log('copiado', path.basename(a)); }
