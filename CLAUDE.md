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

## Dónde quedan los resultados
- `imagen-a-sonido/oceano_3912/resultados/oceano_3912_zonas.json` → **para el motor de sonido**: `registros` = {semana, fecha, zona, temperatura_c, pixeles_leidos, rango_intercuartil_c, se_lee_bien}.
- `resultados/resumen.json` → mínimos/máximos, semanas bajo 26,5 °C, diferencias entre zonas.
- `resultados/oceano_3912_zonas.png` → gráfica del año.
- Regenerar: `python leer_zonas.py [carpeta_3912_oceano]` y luego `python analizar.py` (dependencias en `imagen-a-sonido/requirements.txt`).
