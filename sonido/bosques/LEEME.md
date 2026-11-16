# Disco Bosques · viaje de norte a sur (NASA SVS 4950, GEDI)

La altura de los bosques de América, medida por **GEDI**, un láser de la NASA en la Estación Espacial Internacional (2019–2020). La NASA solo publica estos datos como un **globo 3D con relieve y sombras**.

## Cómo suena

Una **línea horizontal baja por el globo, de Alaska a la Patagonia** (16 s), y suena lo que toca:

| Dato | Sonido |
|---|---|
| Altura de los árboles | **marimba** más aguda donde son más altos (13 escalones de la pentatónica, Mi3–Si5) |
| Cuánto bosque | nota más fuerte y más seguida |
| Dónde está en la imagen | izquierda / derecha (6 columnas con posición fija) |

Marimba: de madera, como los árboles, e instrumento tradicional de Centroamérica. Textos al pasar: Canadá y Alaska, EE. UU. (bosques del este altos, llanuras bajas), México, Centroamérica y El Salvador, Amazonas (los más altos), sur de Sudamérica y Patagonia (bajos). Sin voz (la pone el bot).

## Honestidad del dato

El globo tiene luz de un lado y sombra del otro, y la luz tiñe de amarillo. Se corrige con el **mar como referencia de luz** (su brillo en cada zona mide la luz que llega; malla 24×24 interpolada) y se busca el color más parecido de la barra 0–50 m. El patrón sale bien (Amazonas alto; Grandes Llanuras, noreste de Brasil y Patagonia bajos), pero **los metros no son confiables**: la página dice "más alto / más bajo", sin cifras. Las franjas siguen la imagen, no latitudes exactas.

## Abrir

`python -m http.server 8000` en la raíz del repo → `http://localhost:8000/sonido/bosques/`. Celular: `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/sonido/bosques/index.html`.
Teclado: Espacio reproducir/pausar, ↑ ↓ mover la línea; tocar el globo empieza ahí. Exportar WAV (18,3 s).

## Datos y calidad

`imagen-a-sonido/bosques_4950/leer_bosques.mjs` (Node) → `resultados/bosques_radar.json`: 96 franjas × 6 columnas con cobertura (0–1000) y altura aproximada. Medido sobre el WAV: ~−20 LUFS, sin saturación; agudos sobre 6 kHz 40 dB bajo el pico (los golpes graves de marimba no son clics).

Imagen: NASA/SVS 4950.
