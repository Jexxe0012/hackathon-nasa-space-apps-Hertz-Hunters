# Disco Aerosoles · radar de 4 instrumentos (NASA SVS 5669)

Las partículas que flotan en el aire de todo el planeta el **19 de agosto de 2025 a las 20:00 UTC** (2 p.m. en El Salvador), según el modelo **GEOS** de la NASA. Es un modelo (combina satélites, estaciones y observaciones), no una foto.

## Cómo suena

Una línea recorre el mapa de oeste a este en 15 s y suena lo que toca. **Cada tipo de partícula tiene su instrumento**:

| Tipo (color NASA) | De dónde viene | Instrumento |
|---|---|---|
| Polvo (lila) | desiertos | soplido de arena (ruido filtrado en la nota) |
| Sal marina (gris azulado) | el mar | campanitas de cristal |
| Sulfatos (verde) | industria y volcanes | marimba |
| Carbono negro (rojo) | humo de incendios | piano grave |

Norte agudo, sur grave (pentatónica, cada instrumento en su registro). Más intenso el color = nota más fuerte y más seguida. El sonido viaja de izquierda a derecha. Cada tipo se puede apagar para escuchar los demás. Cuando la línea pasa por las historias que destaca la NASA, un texto lo dice: Kilauea, huracán Erin, polvo del Sahara, incendios en España, Etna, quemas en el sur de África, polvo de Arabia, sal del océano Austral. Sin voz (la pone el bot).

## Honestidad del dato

La leyenda **no tiene números**: el tipo sale del color más parecido y la cantidad de lo brillante. Cada tipo usa su propia escala (no se compara cuánto polvo con cuánta sal). Donde se mezclan dos tipos cuenta el que domina; luces de ciudades y tierra gris se descartan. Comprobado: las historias de la NASA caen con el tipo correcto (Erin = sal, Atlántico = polvo, España y sur de África = carbono negro, Etna y Kilauea = sulfatos).

## Abrir

`python -m http.server 8000` en la raíz del repo → `http://localhost:8000/sonido/aerosoles/`. Celular: `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/sonido/aerosoles/index.html`.
Teclado: Espacio reproducir/pausar, ← → mover el radar; tocar el mapa empieza ahí. Exportar WAV (17,3 s, con los tipos prendidos).

## Datos

`imagen-a-sonido/aerosoles_5669/leer_aerosoles.mjs` (Node) → `resultados/aerosoles_radar.json`: por tipo, malla 192 columnas × 16 franjas (72°N–64°S), 0–1000. Medido sobre el WAV: ~−20,6 LUFS, 0 saturación.

Imagen: NASA/SVS 5669. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0).
