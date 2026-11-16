# Disco Aerosoles · "Un día en el aire del planeta" (NASA SVS 5669)

Las partículas que flotan en el aire de todo el planeta el **19 de agosto de 2025 a las 20:00 UTC** (2 p.m. en El Salvador), según el modelo **GEOS** de la NASA. Es un modelo de un solo momento (combina satélites, estaciones y observaciones), no una foto ni un promedio.

Como Luces se cuenta con fechas y el Océano con lo local, Aerosoles se cuenta con **el viaje**: la atmósfera conecta lugares lejanos.

## Historias (pocas y grandes)

Siempre se ve el mapa completo (sin zooms: las ampliaciones se veían borrosas). La zona de la historia se marca con un recuadro, el resto se oscurece y la línea del radar la recorre. La fecha va arriba del mapa.

| Historia | Zona y sentido | Suena |
|---|---|---|
| El viaje del polvo del Sahara | de África al Caribe, **de este a oeste** (como el viento) | polvo |
| África: polvo al norte, humo al sur | todo el continente | polvo + carbono negro |
| El aire sobre nuestro continente | América, de oeste a este | los 4 |
| Los mares del sur | océano Austral, vuelta completa | sal marina |
| Todo el planeta | el mundo, oeste a este | los 4 |

**Dato honesto para lo local:** ese día el polvo llegó al Caribe oriental (~5.000 km de viaje) y se detuvo a ~2.700 km de El Salvador; sobre El Salvador y Centroamérica había sulfatos y nada de polvo (en el Caribe occidental, apenas un rastro lila por debajo de lo que cuenta el radar).

## Cómo suena

| Tipo (color NASA) | De dónde viene | Instrumento |
|---|---|---|
| Polvo (lila) | desiertos | flauta suave con vibrato (viento) |
| Sal marina (gris azulado) | el mar | campanitas de cristal |
| Sulfatos (verde) | industria y volcanes | marimba |
| Carbono negro (rojo) | humo de incendios | piano grave |

Norte agudo, sur grave (pentatónica, cada instrumento en su registro). Más intenso el color = nota más fuerte y más seguida; sin ese tipo, su instrumento calla. El sonido sigue a la línea (izquierda/derecha). Cada tipo se puede apagar. Sin voz (la pone el bot). El polvo antes era ruido filtrado y sonaba a aplausos: se cambió por la flauta.

## Honestidad del dato

La leyenda **no tiene números**: el tipo sale del color más parecido y la cantidad de lo brillante. Cada tipo usa su propia escala. Donde se mezclan dos tipos cuenta el que domina; luces de ciudades y tierra gris se descartan. Verificado con las historias de la NASA (Erin = sal, Atlántico = polvo, España y sur de África = carbono negro, Etna y Kilauea = sulfatos).

## Abrir

`python -m http.server 8000` en la raíz del repo → `http://localhost:8000/sonido/aerosoles/`. Celular: `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/sonido/aerosoles/index.html`.
Teclado: Espacio reproducir/pausar, ← → cambiar de historia; tocar el mapa empieza ahí. Exportar WAV de la historia elegida.

## Datos y calidad

`imagen-a-sonido/aerosoles_5669/leer_aerosoles.mjs` (Node) → `resultados/aerosoles_radar.json`: por tipo, malla 192 × 16 (todo el planeta) y malla fina 384 × 34 (historias). Volumen igualado por historia: −20,2 a −21 LUFS; sin saturación.

Imagen: NASA/SVS 5669. Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0).
