# Disco Luces · motor de sonido (NASA SVS 5276)

Las luces nocturnas de El Salvador vistas desde el espacio, de 2012 a 2023 (Black Marble, satélite VIIRS de la NASA y la NOAA), convertidas en sonido. Es una **observación real**. La barra de la NASA **no tiene números**: todo se compara con 2012 ("más luz / menos luz").

**Solo suenan dos cosas: destellos (las luces) y una nota de piano por año.** Sin voz (la pone el bot).

## Qué suena y por qué

| Dato | Sonido |
|---|---|
| Cuánta luz hay | **Destellos** de cristal: 5 por segundo con la luz de 2012, más en la misma proporción cuanta más luz |
| Dónde está la luz | Cada destello suena a la izquierda (oeste: Ahuachapán, Sonsonate) o a la derecha (este: San Miguel, La Unión) según cómo se reparte la luz ese año |
| Nivel de luz | **Piano**: un escalón de la pentatónica por cada 10 % más (o menos) de luz que en 2012 (2012 = La3) |

Lo que se oye con los datos: 2023 tiene ~65 % más luz que 2012, con bajones en 2016 y 2020 y un salto fuerte en 2022–2023. Más luz no es bueno ni malo por sí solo.

## Cómo abrirla

Igual que el Océano: desde la raíz del repo `python -m http.server 8000` y abrir `http://localhost:8000/sonido/luces/`. Celular sin servidor: `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/sonido/luces/index.html`.
Teclado: ← → año, Espacio reproducir/pausar. Botón para exportar los 12 años en WAV (30,0 s).

## Lo que se ve

El mundo de noche de cada año (con recuadro en la zona ampliada), un zoom a Centroamérica con El Salvador en recuadro punteado y la curva de luz relativa a 2012 que se dibuja mientras suena (gris punteada = Centroamérica, para comparar). Todo con el reloj del audio.

## Datos

`imagen-a-sonido/luces_5276/leer_luces.mjs` (Node, sin librerías) → `resultados/luces_5276.json`: `series.el_salvador` / `san_salvador` / `centroamerica` = `{anio, luz_relativa_2012, pixeles_encendidos, oeste_a_este}` y `cambio_2012_2023` (nuevas / apagadas). Medido sobre el WAV: ~−20 LUFS, 0 saturación, 0 clics.

Imágenes: NASA/SVS 5276. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0).
