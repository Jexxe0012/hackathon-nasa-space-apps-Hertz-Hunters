# CLAUDE.md · Hertz Hunters · The Earth Information Jukebox (rama `fuentes`)

Rama de Diego Fuentes: **imagen → sonido**. Las ramas `josue` (interfaz visual) y `diego` (bot guía, el otro Diego) no se tocan desde aquí.
Contexto completo del reto (análisis, decisiones, bitácora): carpeta local `C:\Users\ADMIN\Desktop\NASA-SpaceApps-2026-EarthJukebox\` (no está en el repo).

## Reglas
- Nunca inventar ni suavizar datos. Si una semana o zona no se lee bien, queda como `null` y se dice.
- El 3912 es **una simulación de un año** (ECCO2, mar 2007 – feb 2008): se oye el ciclo de las estaciones, **no** calentamiento global.
- Las imágenes de la NASA **no van al repo** (`.gitignore`). Al repo van scripts, JSON de resultados y gráficas.
  Excepción (15/11): copias livianas WebP de la vista del Pacífico (48 semanas, 5 MB) en `sonido/oceano/mapas/`, para mostrar el mapa sincronizado con el sonido.

## Color → °C (océano 3912) — método decidido
- Mapa: frames globales planos 2048×1024 (`global_semanal/`, 48 frames, 1 por semana). La vista del Pacífico es un globo: solo para lo visual, no para medir.
- Se lee el **tono (hue)** del color, no el RGB: baja ordenado en la barra de 228° (0 °C) a 354° (32 °C); los tonos > 300° se cuentan como negativos para que sea una sola subida. No cambia si la línea es más clara u oscura.
- Solo pixeles de **línea de corriente**: croma (max−min) > 0.15 y brillo > 0.25. Fuera: fondo negro y tierra gris.
- Temperatura de una zona = **mediana** de sus pixeles de línea; mínimo 8 pixeles, si no `null`.
- Controles: la barra leída contra sí misma da error máx. 0,46 °C; el filtro flexible da lo mismo que el estricto (±0,2 °C en zonas tropicales) y lee más semanas.
- En latitudes altas las líneas son oscuras y el método no es fiable: usarlo solo en zonas tropicales.

## Zonas (`imagen-a-sonido/oceano_3912/leer_zonas.py`)
- Costa de El Salvador, franja de **~20 a ~176 km mar adentro** (la primera fila pegada a la costa casi no tiene líneas; 1 pixel ≈ 19–20 km):
  - `oeste_acajutla`: lon −90,15 a −89,45
  - `centro_la_libertad`: lon −89,45 a −88,60
  - `este_el_cuco_fonseca`: lon −88,60 a −87,70
- Comparación: `lengua_fria_ecuatorial` (lon −110 a −95, lat −2 a 2) y `caribe` (lon −80 a −72, lat 13 a 17).

- **Zona sonora `costa`** (`costa.py`): las 3 zonas se unen en una, nombre en la app **"frente a Surf City · costa salvadoreña"**. Por semana = mediana de las zonas con lectura; si ninguna tiene, `null`. Resultado: 48 de 48 semanas con dato (40 con 3 zonas, 7 con 2, 1 con 1). El Caribe queda solo para comparar.

## Dónde quedan los resultados
- `imagen-a-sonido/oceano_3912/resultados/oceano_3912_costa.json` → **el que carga el motor de sonido**: `series.costa` y `series.caribe` = {semana, fecha, temperatura_c}.
- `resultados/oceano_3912_zonas.json` → lectura por zona: `registros` = {semana, fecha, zona, temperatura_c, pixeles_leidos, rango_intercuartil_c, se_lee_bien}.
- `resultados/resumen.json` → mínimos/máximos, semanas bajo 26,5 °C, diferencias entre zonas.
- `resultados/oceano_3912_zonas.png` → gráfica del año.
- Regenerar: `python leer_zonas.py [carpeta_3912_oceano]`, luego `python analizar.py` y `python costa.py` (dependencias en `imagen-a-sonido/requirements.txt`).

## Principio de sonido (vale para todos los discos)
- **La emoción sigue al dato, nunca al revés. Si el dato no cambia, la emoción no cambia.**
- Emoción solo por activación (tempo, densidad, aspereza), por comparación (antes/después, umbrales con fuente) y por significado (cercanía local).
- Nada de música de fondo, rangos inflados, alarmas sin fuente ni sonidos "tristes" para decir que algo está mal.

## Reglas de sonido del Océano (motor en `sonido/oceano/`) — versión 2: olas + melodía
- La versión 1 (pad continuo + pulsos + aspereza de 45 Hz + voz de los meses) se **descartó** el 15/11 tras escucharla: zumbido, demasiado llena, monótona y no se oía el cambio. No volver a ella.
- **Solo dos cosas suenan: el mar (olas) y una melodía (piano real; campana como alternativa).** Nada de colchón de fondo ni capas extra.
- **Melodía = temperatura**, pentatónica, un escalón por cada 0,5 °C (≈ error de lectura), escala fija para todas las zonas (24 °C = La3). **Cada cambio de escalón suena en el momento en que empieza la semana**: se oye la subida y la caída nota por nota.
- **Ritmo = activación**: notas más seguidas (1/s a 26 °C, el doble cada 2 °C más) y olas más seguidas (una cada 4,4 s a 26 °C, la mitad de tiempo cada 2,5 °C más), más llenas y brillantes.
- **26,5 °C** = umbral que favorece la formación de huracanes (NOAA). **Zona neutra 26–27 °C** (error de lectura 0,46 °C): mar liso.
- **Sobre 27 °C: espuma** (las olas rompen con un siseo en la cresta) que crece hasta 29,3 °C. Reemplaza a la aspereza. **Bajo 26 °C**: mar en calma.
- **Sin voz en la página**: la voz para personas ciegas la pone el bot (rama `diego`).

## Motor de sonido (`sonido/oceano/`, detalle en su `LEEME.md`)
- `motor-oceano.js` (reglas + instrumento + reproductor, Tone.js 14.8.49), `app.js` (interfaz mínima, teclado, balance mar ↔ melodía, exportar WAV), `index.html`. La interfaz bonita es de Josué.
- Piano: Salamander Grand Piano (Alexander Holm, CC BY 3.0) cargado desde tonejs.github.io; si no carga, suena la campana.
- El mismo código suena en vivo y genera el WAV (`Tone.Offline`): demo = 48 semanas en 27,8 s, archivo de 30,0 s. Los eventos (semana, nota, ola) se programan en orden de tiempo: si no, el WAV (que se programa de una vez) pierde notas.
- Medido sobre el WAV: ~−20 LUFS, pico ~−3,5 dBFS, 0 saturación, 0 clics.
- **Visual sincronizado**: el mapa del Pacífico cambia cada semana en dos paneles (mundo completo con recuadro + zoom a la costa con la franja medida punteada; nada encima del mapa, textos debajo: pedido de Diego), la curva del año se dibuja mientras suena y el zoom y el punto brillan en cada nota. Todo con el reloj del audio menos la latencia de salida (se ve cuando se oye). Ubicación de la costa por proyección del globo (centro 480,270, radio 340, lon −132,6°): aproximada ±7 px. `motor.notasVisuales` = momentos de cada nota, para que Josué conecte sus animaciones.
- El limitador del navegador suma ganancia automática (+2,28 dB con techo −4, medido); se compensa con un recorte justo después.

## Disco Luces (5276) — `sonido/luces/`, datos en `imagen-a-sonido/luces_5276/`
- Versión 1 (solo El Salvador: destellos + nota por año) **descartada** el 15/11: sonaba bien pero no se entendía a qué aludía el sonido.
- **Versión 2: radar global + fechas importantes.** Una línea recorre el mapa del mundo de noche de oeste a este en 12 s y suena lo que toca: cada franja de latitud es una nota (norte agudo, sur grave, pentatónica La2–La5), más luz = nota más fuerte y repetida más seguido, sin luz = silencio; el sonido viaja de izquierda a derecha con la línea. Piano real, máx. 3 notas nuevas por paso, notas cortas.
- Fechas: un acontecimiento por año 2012–2023 (sobre todo hitos de la NASA, más la pandemia en 2020). **Cada mapa es el promedio del año, no del día**: se dice en la página. Botón para comparar 2012 → año elegido (25 s).
- Datos: `radar_luces.mjs` (Node; en esta PC no había numpy/Pillow) → `luces_radar.json`: malla 192 columnas × 16 franjas (72°N–56°S) por año, brillo 0–1000 normalizado con el máximo de todos los años (comparable entre años); se tapa el texto del año de cada imagen. Luz total del mundo: 2023 = 1,37× 2012; 2020 < 2019.
- Mapa 3840×2160 = mundo estirado a 16:9 (x=(lon+180)/360·W, y=(90−lat)/180·H, comprobado con el delta del Nilo). `leer_luces.mjs` / `luces_5276.json` (El Salvador) quedan de la v1.
- Medido sobre el WAV (2012 vs 2023): −20,7 LUFS, pico −5,3 dBFS, 0 clics.
