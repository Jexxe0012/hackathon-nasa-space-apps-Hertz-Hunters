# CLAUDE.md · Hertz Hunters · The Earth Information Jukebox (rama `fuentes`)

Rama de Diego Fuentes: **imagen → sonido**. Las ramas `josue` (interfaz visual) y `diego` (bot guía, el otro Diego) no se tocan desde aquí.
Contexto completo del reto (análisis, decisiones, bitácora): carpeta local `C:\Users\ADMIN\Desktop\NASA-SpaceApps-2026-EarthJukebox\` (no está en el repo).

## Reglas
- Nunca inventar ni suavizar datos. Si una semana o zona no se lee bien, queda como `null` y se dice.
- El 3912 es **una simulación de un año** (ECCO2, mar 2007 – feb 2008): se oye el ciclo de las estaciones, **no** calentamiento global.
- Las imágenes de la NASA **no van al repo** (`.gitignore`). Al repo van scripts, JSON de resultados y gráficas.

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

## Reglas de sonido del Océano (motor en `sonido/oceano/`)
- Instrumento: **pad** suave (voces levemente desafinadas, ataque lento, filtro de agudos, chorus y reverb).
- **Altura = temperatura**, en escala **pentatónica**: un escalón por cada 0,5 °C (≈ el error de lectura). Escala fija para todas las zonas (24 °C = La2), sin estirarla al rango de cada zona.
- **Ritmo = activación**: más caliente, pulsos más seguidos (1 pulso/s a 26 °C y el doble por cada 2 °C más).
- **26,5 °C** = umbral que favorece la formación de huracanes (NOAA).
- **Zona neutra 26–27 °C** (±0,5 °C, del tamaño del error de lectura de 0,46 °C): sonido limpio; la voz dice "cerca del umbral".
- **Sobre 27 °C**: la aspereza (modulación de amplitud rápida, 45 Hz) crece poco a poco hasta el máximo del año (~29,3 °C, tope fijo).
- **Bajo 26 °C**: limpio y calmado.
- **Voz**: números redondos ("unos 29 grados").
- Calidad: todo cambio con rampas suaves (cero clics), limitador al final, volumen parejo entre graves y agudos, máximo 3–4 notas a la vez. El WAV exportado usa el mismo motor.

## Motor de sonido (`sonido/oceano/`, detalle en su `LEEME.md`)
- `motor-oceano.js` (reglas + instrumento + reproductor, Tone.js 14.8.49), `app.js` (interfaz mínima accesible, voz ES/EN, teclado, exportar WAV), `index.html`. La interfaz bonita es de Josué.
- El mismo código suena en vivo y genera el WAV (`Tone.Offline`): demo = 48 semanas en 27,8 s, archivo de 30,0 s.
- Medido sobre el WAV: −19 LUFS, pico −5 dBFS (el limitador, techo −4 dBFS, no actúa), 0 saturación, 0 clics; volumen ±0,7 dB entre notas de la costa; aspereza 0 hasta 27 °C.
- Desafinación del pad fija en Hz (no en cents) y capa grave sin desafinar: si no, aparecen latidos cuyo ritmo depende de la nota y compiten con los pulsos (el dato).
- El limitador del navegador suma ganancia automática (+2,28 dB con techo −4, medido); se compensa con un recorte justo después.
