# Disco Océano · motor de sonido (NASA SVS 3912)

El mar frente a la costa salvadoreña ("frente a Surf City") durante un año simulado por la NASA (ECCO2, mar 2007 – feb 2008), convertido en sonido en vivo en el navegador. Es el ciclo de las estaciones, **no** calentamiento global.

## Cómo abrirla

La página carga un JSON, así que **no funciona con doble clic** (`file://`): necesita un servidor web, aunque sea local.

- **En la computadora**, desde la raíz del repo:
  ```bash
  python -m http.server 8000
  ```
  y abrir `http://localhost:8000/sonido/oceano/`
- **En el celular (misma red Wi‑Fi)**: `python -m http.server 8000 --bind 0.0.0.0` en la computadora, ver su IP con `ipconfig` y abrir `http://<IP>:8000/sonido/oceano/` en el celular (Windows puede pedir permiso de firewall: aceptar en redes privadas).
- **En el celular, sin servidor** (repo público, rama `fuentes`):
  `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/sonido/oceano/index.html`
- Necesita internet la primera vez (Tone.js viene de un CDN). En iPhone, quitar el modo silencio: si no, el audio web no suena.

## Uso

| Acción | Teclado | Pantalla |
|---|---|---|
| Año completo en 30 s (demo) | — | **Escuchar el año (30 s)** |
| Reproducir / pausar | Espacio | Reproducir / Pausar |
| Semana anterior / siguiente | ← → | botones o deslizador |
| Decir la semana y la temperatura | Enter | Decir la semana |
| Tres referencias (más fresco, umbral, más caliente) | — | Leyenda sonora |
| Explicación | — | ¿Por qué suena así? (con "Leer en voz alta") |
| Archivo para el video | — | Exportar el año en WAV (30,0 s, 48 kHz, estéreo) |

Voz en español o inglés (selector de idioma). Todo se usa solo con teclado y con lector de pantalla.

## Qué suena y por qué

| Dato | Sonido |
|---|---|
| Temperatura | **Altura**: pentatónica, un escalón por cada 0,5 °C (≈ error de lectura). Escala fija: 24 °C = La2 |
| Activación | **Pulsos**: 1 por segundo a 26 °C, el doble por cada 2 °C más |
| Sobre 27 °C | **Aspereza**: modulación de amplitud a 45 Hz, crece hasta 29,3 °C (máximo del año) |
| 26–27 °C | Zona neutra alrededor del umbral de 26,5 °C (huracanes, NOAA): limpio; la voz dice "cerca del umbral" |
| Bajo 26 °C | Limpio y calmado |

El instrumento es un **pad**: 3 sierras levemente desafinadas (separación fija en Hz, ondulan lento y siempre igual), un triángulo una octava abajo, filtro que sigue a la nota, chorus y una reverb propia sin graves ni agudos. Los pulsos son "gotas" una octava arriba.
Principio: **la emoción sigue al dato**. No hay música de fondo, ni sonidos tristes, ni alarmas, y el volumen no es un dato.

## Calidad (medida sobre el WAV exportado)

- Sonoridad **−19 LUFS**, pico **−5 dBFS**: el limitador (techo −4 dBFS) ni siquiera actúa. **0** muestras saturadas, **0** clics.
- Volumen parejo entre notas: ±0,7 dB en el rango de la costa (25,5–29,5 °C).
- Aspereza medida en la salida: 0 hasta 27 °C y crece pareja hasta ~29,5 °C.
- Todo cambio (nota, filtro, volumen, aspereza) va con rampas suaves. Como máximo suenan 3–4 notas a la vez.

## Para Josué y el bot (Diego 2)

- Datos: `imagen-a-sonido/oceano_3912/resultados/oceano_3912_costa.json` → `series.costa` y `series.caribe` = `{semana, fecha, temperatura_c}`.
- `motor-oceano.js` expone `window.MotorOceano` (requiere Tone.js 14.8):
  - `new MotorOceano.Reproductor()` → `cargar(temps)`, `iniciarDemo()`, `alternar()`, `irA(i)`, `semanaActual()`, `alTerminarDemo`.
  - `MotorOceano.describir(temp, 'es'|'en')` → nota, pulsos por segundo, aspereza y zona (sirve para "¿por qué suena así?").
  - `MotorOceano.renderizar(temps)` → AudioBuffer del año completo (es lo que usa "Exportar WAV").
- Ajustes rápidos (todos en `motor-oceano.js`): `REGLAS.asperezaProfMax` (cuánta aspereza), `NIVEL.*` (mezcla), `DEMO.semana` (duración de la demo).
