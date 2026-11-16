# Disco Luces · radar del mundo de noche (NASA SVS 5276)

**"Escucha cómo se veía el mundo de noche"** en fechas importantes de 2012 a 2023 (Black Marble, satélite VIIRS de la NASA y la NOAA). Observación real. Cada mapa es el **promedio de todo el año**, no del día de la fecha.

## Cómo suena: un radar

Una línea recorre el mapa de oeste a este (de América a Asia) en 12 segundos y suena lo que toca:

| Dato | Sonido |
|---|---|
| Hay luz en esa franja | suena una nota de piano; sin luz, silencio (océanos, desiertos) |
| Cuánta luz | nota más fuerte y repetida más seguido |
| Latitud | norte agudo, sur grave (16 franjas de 8°, pentatónica La2–La5) |
| Longitud | es el tiempo: la línea avanza y el sonido viaja de izquierda a derecha |

**Comparar año de referencia → año elegido**: suenan los dos recorridos seguidos (25 s), con la misma escala. Ambos años se pueden elegir. Los mapas son promedios anuales: una diferencia entre 2019 y 2020 no permite concluir por sí sola que su causa fue la pandemia. Sin voz (la pone el bot).

La entrada de Earthbeat «¿Cómo sonaban las luces del mundo durante la pandemia?» usa `?embed=1&v=5&anio=2020&comparar=2019`. Los parámetros se validan entre 2012 y 2023 y preparan la escucha sin reproducir automáticamente. Sin esos parámetros, la página comienza en 2023 con 2012 como referencia. El motor conserva su conversión de datos a sonido; solo cambia qué años solicita la interfaz.

## Fechas (una por año)

2012 Curiosity en Marte · 2013 Voyager 1 en el espacio interestelar · 2014 Philae sobre un cometa · 2015 New Horizons en Plutón · 2016 Juno en Júpiter · 2017 gran eclipse en EE. UU. · 2018 despega la sonda Parker · 2019 primera imagen de un agujero negro · 2020 pandemia de COVID-19 · 2021 Perseverance en Marte · 2022 primeras imágenes del James Webb · 2023 OSIRIS-REx trae muestras de Bennu.

## Cómo abrirla

Desde la raíz del repo `npm run dev` en la raíz del repo (app Earthbeat) → `http://localhost:5173/sonido/luces/`. Celular: `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/public/sonido/luces/index.html`.
Teclado: Espacio reproducir/pausar, ← → cambiar de fecha. Exportar WAV (año de referencia + año elegido).

## Datos

`imagen-a-sonido/luces_5276/radar_luces.mjs` → `resultados/luces_radar.json` (malla 192 columnas × 16 franjas por año, brillo 0–1000). Medido sobre el WAV: −20,7 LUFS, 0 saturación, 0 clics.

Imágenes: NASA/SVS 5276. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0).
