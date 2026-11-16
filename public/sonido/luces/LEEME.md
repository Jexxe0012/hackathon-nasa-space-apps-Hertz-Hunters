# Disco Luces · radar del mundo de noche (NASA SVS 5276)

**"Escucha cómo se veía el mundo de noche"** en fechas importantes de 2012 a 2023 (Black Marble, satélite VIIRS de la NASA y la NOAA). Observación real. Cada mapa es el **promedio de todo el año**, no del día de la fecha.

## Cómo suena: un radar

Una línea recorre el mapa de oeste a este (de América a Asia) en 12 segundos y suena lo que toca:

| Dato | Sonido |
|---|---|
| Hay luz en esa franja | suena una nota de piano; sin luz, silencio (océanos, desiertos) |
| Cuánta luz | nota más fuerte y repetida más seguido |
| Latitud | norte agudo, sur grave (16 franjas de 8°, pentatónica La2–La5) |
| Longitud | es el tiempo y el lugar: la línea avanza y el sonido da una vuelta completa alrededor de tu cabeza (8D, con audífonos): Pacífico a la izquierda, El Salvador enfrente, Europa y África a la derecha, Asia detrás |

**Comparar 2012 → año elegido**: suenan los dos recorridos seguidos (25 s). En 2023 el mundo tiene un 37 % más de luz que en 2012; en 2020 hubo menos luz que en 2019. La NASA no da unidades: el brillo es relativo y comparable entre años. Sin voz (la pone el bot).

## Fechas (solo 3)

2012 Curiosity en Marte · 2020 pandemia de COVID-19 · 2023 OSIRIS-REx trae muestras de Bennu.

Antes había una por año (2012–2023), pero casi todas sonaban igual. Simulando las notas del radar año por año, frente a 2020 solo 2012 (diferencia nota a nota 0,23) y 2023 (0,29) suenan claramente distintos; el siguiente, 2015, se queda en 0,16, y cada año restante suena como un gemelo de su vecino (2018 ≈ 2019: 0,02). Los mapas y los datos de los otros años siguen en el repo por si se vuelven a usar.

## Cómo abrirla

Desde la raíz del repo `npm run dev` en la raíz del repo (app Earthbeat) → `http://localhost:5173/sonido/luces/`. Celular: `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/public/sonido/luces/index.html`.
Teclado: Espacio reproducir/pausar, ← → cambiar de fecha. Exportar WAV (2012 + año elegido).

## Datos

`imagen-a-sonido/luces_5276/radar_luces.mjs` → `resultados/luces_radar.json` (malla 192 columnas × 16 franjas por año, brillo 0–1000). Medido sobre el WAV en 8D (2012 vs 2023): −20,5 LUFS, pico −5,7 dBFS, 0 saturación, sin clics nuevos frente a la versión estéreo.

Imágenes: NASA/SVS 5276. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0).
