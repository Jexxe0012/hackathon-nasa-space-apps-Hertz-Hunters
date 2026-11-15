# Disco Océano · motor de sonido (NASA SVS 3912)

El mar frente a la costa salvadoreña ("frente a Surf City") durante un año simulado por la NASA (ECCO2, mar 2007 – feb 2008), convertido en sonido en vivo en el navegador. Es el ciclo de las estaciones, **no** calentamiento global.

**Solo suenan dos cosas: el mar (olas) y una melodía (piano).** Sin voz: la voz para personas ciegas la pone el bot.

## Cómo abrirla

La página carga un JSON, así que **no funciona con doble clic** (`file://`): necesita un servidor web, aunque sea local.

- **En la computadora**, desde la raíz del repo:
  ```bash
  python -m http.server 8000
  ```
  y abrir `http://localhost:8000/sonido/oceano/`
- **En el celular (misma red Wi‑Fi)**: `python -m http.server 8000 --bind 0.0.0.0` en la computadora, ver su IP con `ipconfig` y abrir `http://<IP>:8000/sonido/oceano/` (Windows puede pedir permiso de firewall: aceptar en redes privadas).
- **En el celular, sin servidor** (repo público, rama `fuentes`):
  `https://raw.githack.com/diegonoetorresvillatoro-netizen/hackathon-nasa-space-apps-Hertz-Hunters/fuentes/sonido/oceano/index.html`
- Necesita internet (Tone.js y las muestras del piano vienen de la web). En iPhone, quitar el modo silencio.

## Uso

| Acción | Teclado | Pantalla |
|---|---|---|
| Año completo en 30 s (demo) | — | **Escuchar el año (30 s)** |
| Reproducir / pausar | Espacio | Reproducir / Pausar |
| Semana anterior / siguiente | ← → | botones o deslizador |
| Instrumento de la melodía | — | Melodía: Piano / Campana |
| Balance entre el mar y la melodía | — | Mar ↔ Melodía (−12 a +6 dB) |
| Archivo para el video | — | Exportar el año en WAV (30,0 s, 48 kHz, estéreo; usa el instrumento y el balance elegidos) |

## Lo que se ve

El mapa de la NASA (vista del Pacífico, `mapas/`) cambia semana a semana con el sonido, en dos paneles: el mundo completo (con un recuadro en la zona ampliada) y un zoom a la costa de El Salvador con un recuadro punteado sobre la franja de mar que escuchamos (aproximada). Los textos van debajo, nunca sobre el mapa. Debajo, la curva de temperatura se dibuja mientras suena, con el umbral de 26,5 °C y la zona neutra. El zoom y el punto de la curva brillan en cada nota. Todo va con el reloj del audio.

## Qué suena y por qué

| Dato | Sonido |
|---|---|
| Temperatura | **Melodía**: pentatónica, un escalón por cada 0,5 °C (≈ error de lectura). Escala fija: 24 °C = La3. Cada cambio de escalón suena al empezar la semana |
| Activación | **Ritmo**: notas más seguidas (1/s a 26 °C, el doble cada 2 °C) y olas más seguidas (una cada 4,4 s a 26 °C, la mitad de tiempo cada 2,5 °C), más llenas y brillantes |
| Sobre 27 °C | **Espuma**: las olas rompen con un siseo en la cresta, que crece hasta 29,3 °C |
| 26–27 °C | Zona neutra alrededor del umbral de 26,5 °C (huracanes, NOAA): mar liso |
| Bajo 26 °C | Mar en calma: olas lentas y largas, notas espaciadas |

Principio: **la emoción sigue al dato**. No hay música de fondo, ni sonidos tristes, ni alarmas.

## Calidad (medida sobre el WAV exportado)

- Sonoridad **~−20 LUFS**, pico **~−3,5 dBFS**, **0** muestras saturadas, **0** clics (piano y campana igualados).
- Todo cambio de volumen va con rampas; cada ola empieza desde el silencio sin saltos.

## Para Josué y el bot (Diego 2)

- Datos: `imagen-a-sonido/oceano_3912/resultados/oceano_3912_costa.json` → `series.costa` y `series.caribe` = `{semana, fecha, temperatura_c}`.
- `motor-oceano.js` expone `window.MotorOceano` (requiere Tone.js 14.8):
  - `new MotorOceano.Reproductor()` → `cargar(temps)`, `iniciarDemo()`, `alternar()`, `irA(i)`, `semanaActual()`, `fijarTemperatura(t)`, `usarMar(db)`, `alTerminarDemo`.
  - `MotorOceano.cargarPiano()` y `reproductor.usarPiano(piano)` para la melodía de piano.
  - `MotorOceano.describir(temp, 'es'|'en')` → nota, notas por segundo, segundos por ola, espuma y zona (para "¿por qué suena así?" y para que el bot lo diga).
  - `MotorOceano.renderizar(temps, {instrumento, marDb})` → AudioBuffer del año completo.
- Ajustes rápidos (en `motor-oceano.js`): `NIVEL.*` (mezcla), `REGLAS.*` (reglas), `DEMO.semana` (duración de la demo).

Piano: Salamander Grand Piano, de Alexander Holm (CC BY 3.0).
