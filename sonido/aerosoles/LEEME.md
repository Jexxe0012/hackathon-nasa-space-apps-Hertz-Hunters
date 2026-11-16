# Disco Aerosoles · radar de 4 instrumentos (NASA SVS 5669)

Las partículas que flotan en el aire de todo el planeta el **19 de agosto de 2025 a las 20:00 UTC** (2 p.m. en El Salvador), según el modelo **GEOS** de la NASA. Es un modelo (combina satélites, estaciones y observaciones), no una foto.

## Un día en el aire, en historias

Como Luces se cuenta con fechas y el Océano con lo local, Aerosoles se cuenta con **el viaje**: la atmósfera conecta lugares lejanos. Eliges una historia y el radar recorre esa zona con su instrumento al frente. Siempre se ve el mapa completo (sin zoom: las ampliaciones se veían borrosas); la zona se marca con un recuadro y el resto se oscurece. La fecha (19 ago 2025, 2 p.m. hora de El Salvador) va sobre el mapa:

| Historia | Zona y sentido | Suena |
|---|---|---|
| El viaje del polvo del Sahara | de África al Caribe, **de este a oeste** (como el viento) | polvo |
| El aire sobre El Salvador ese día | Centroamérica | los 4 (hay sulfatos, no polvo) |
| El huracán Erin | Atlántico occidental | sal marina + polvo |
| Volcanes que respiran | Kilauea, luego Etna | sulfatos |
| Incendios | España, luego sur de África | carbono negro |
| Todo el planeta | el mundo, oeste a este | los 4 |

**Dato honesto para lo local:** ese día el polvo llegó al Caribe oriental (~5.000 km de viaje) y se detuvo a ~2.700 km de El Salvador; sobre el país había sulfatos. En el Caribe occidental se ve un rastro lila muy tenue, por debajo de lo que cuenta el radar (máx. 1/1000). No decimos que llegó al país porque la imagen no lo muestra.

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

Historias: malla fina 384 × 34 (0,94° × 4°) recortada a cada zona; las filas se reparten en 12 escalones (zonas chicas). Volumen igualado por historia (−20,4 a −22,6 LUFS). En volcanes y Centroamérica el detector de clics marca los golpes de marimba, pero su energía sobre 6 kHz es −45 dBFS (menor que en la mezcla completa, que marca 0): no son clics.
