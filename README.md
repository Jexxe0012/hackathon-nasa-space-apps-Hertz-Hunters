# Earthbeat

Proyecto del equipo Hertz Hunters para el NASA Space Apps Challenge.

Earthbeat presenta cuatro visualizaciones de la Tierra con imágenes, descripciones en español y audio de prueba. Una persona puede elegir una pista, leer qué representa y recorrer el audio con el teclado. La aplicación lleva el diseño **Enfoque** a React, TypeScript y Vite, con iconos pixel art, un visor central y controles de reproducción al pie. [Diseño de Enfoque en Figma](https://www.figma.com/design/4q6sU5VYc8qZHcr2rmdSLO?node-id=6-11720)

Cada disco tiene un fondo inspirado en su tema: océano, bosques, aerosoles y un cielo estrellado para luces nocturnas. El modo de alto contraste utiliza un fondo limpio para facilitar la lectura.

La interfaz combina detalles pixel art con títulos de mayor legibilidad y fondos suaves para reducir la carga visual.

## Ejecutar en local

Con Node.js 22.12 o posterior y npm, ejecuta desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

Abre la dirección que imprime Vite. Para generar la versión de producción y revisarla en local:

```sh
npm run build
npm run preview
```

Las imágenes, las fuentes, los MP3 de prueba y las escenas sonoras se sirven desde el proyecto (las escenas cargan Tone.js y las muestras de piano desde la web). La aplicación funciona sin claves API. Python, Pillow y FFmpeg solo intervienen al regenerar los MP3 con `python scripts/sonify.py`.

## Escuchar una imagen

Al entrar, la pantalla de bienvenida explica el propósito de la aplicación y lleva a la colección. El logotipo permite regresar al inicio.

El globo de bienvenida usa una malla 3D con cartografía global de Natural Earth y alturas estimadas del dosel GEDI de abril a julio de 2019, publicadas por Lang y colaboradores. Ambas capas comparten coordenadas WGS84: el modelo gira sin reconstruir hemisferios a partir de fotografías. El relieve está exagerado para hacerlo visible; las zonas sin mediciones aparecen grises. El giro puede pausarse y se detiene con movimiento reducido. [Fuentes, atribución y procesamiento del globo](docs/globo-datos.md).

Al abrir la aplicación aparece un aviso de accesibilidad que también se presenta a los lectores de pantalla mediante una región de anuncios. La bienvenida ofrece un acceso a las opciones de contraste y movimiento. La voz integrada de la aplicación está pendiente; por ahora se utiliza el lector de pantalla del dispositivo.

En **Colección** puedes elegir cualquiera de las cuatro pistas. **Sobre la pista** incluye su periodo, variable, procedencia y límites de interpretación. El visor muestra la imagen fuente de NASA.

El reproductor aparece al seleccionar una pista y permanece disponible al regresar a la colección durante la misma visita.

Cada pista muestra en el visor su **escena sonora**: el mapa de la NASA con una línea de escucha, sus historias y su curva o barras, todo sincronizado con el sonido. El reproductor del pie controla esa escena: **Reproducir**, la barra de avance y el volumen mueven el motor de sonido de la pista. Las escenas viven en `public/sonido/` (motor de Diego Fuentes, Tone.js) y leen datos ya extraídos de las imágenes (`public/sonido/datos/`, generados en `imagen-a-sonido/`).

| Pista | Qué se escucha |
| --- | --- |
| Corrientes y temperatura | El mar frente a El Salvador durante un año: olas y melodía de piano; más agudo = más caliente; espuma sobre 27 °C. |
| Luces nocturnas | Una fecha importante de 2012–2023: un radar recorre el mundo de noche; donde hay luz suena el piano. Comparación con 2012. |
| Aerosoles | Historias de un solo día (19 ago 2025): un instrumento por partícula (polvo, sal marina, sulfatos, carbono negro). |
| Altura de bosques | Del corazón del Amazonas al borde donde se acaba el bosque alto: el piano «sube el árbol» en cada punto. |

El principio de diseño: la emoción sigue al dato; si el dato no cambia, el sonido no cambia. Los límites de cada dato (modelo de un año, mapas promediados, alturas aproximadas) se explican en «Sobre la pista». Cada escena también se puede abrir sola en `sonido/<disco>/` (por ejemplo `sonido/oceano/`) con su opción para exportar el audio en WAV.

Con **Tab** y **Mayús + Tab** se recorren los controles. Los primeros enlaces de salto llevan al contenido o al reproductor. Las flechas ajustan el avance y el volumen. **Ajustes** conserva las preferencias de contraste y movimiento en el navegador.

## Fuentes y créditos

Las fichas científicas remiten a NASA Scientific Visualization Studio. La imagen actual de luces nocturnas es el mosaico Black Marble de 2016 de NASA Goddard. Los enlaces identifican la visualización y el archivo concreto usado actualmente para cada pista.

| Pista | Recursos originales |
| --- | --- |
| Corrientes y temperatura | [Ficha NASA](https://svs.gsfc.nasa.gov/3912/) · [Imagen utilizada](https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/flat_global_ecco2_2028x1024.25000.jpg) |
| Altura de bosques | [Ficha NASA](https://svs.gsfc.nasa.gov/4950/) · [Imagen utilizada](https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004950/GEDI_global.0900_print.jpg) |
| Aerosoles | [Ficha NASA](https://svs.gsfc.nasa.gov/5669/) · [Imagen utilizada](https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005669/Aerosols_2025-08-19T20_00_00_1920x1080.png) |
| Luces nocturnas | [Serie 2012–2023](https://svs.gsfc.nasa.gov/5276/) · [SVS 5313](https://svs.gsfc.nasa.gov/5313/) · [Imagen de referencia actual](https://svs.gsfc.nasa.gov/vis/a030000/a030800/a030876/BlackMarble_2016_global_7km_print.jpg) |

El catálogo y las descripciones están en [src/data.ts](src/data.ts). El generador está en [scripts/sonify.py](scripts/sonify.py). Las licencias de Silkscreen y Atkinson Hyperlegible se incluyen en [public/licenses](public/licenses).

## Desarrollo en equipo

Josué trabaja en el diseño y la interfaz accesible. Diego Fuentes se encarga de los sonidos y Diego del bot guía. El backend lo desarrollará el integrante asignado por el equipo. Los sonidos de las cuatro pistas son los motores de Diego Fuentes (rama `fuentes`).

Agrupamos los cambios por tarea en ramas de trabajo. Usamos mensajes como `feat(datos)`, `feat(reproductor)`, `fix(accesibilidad)` y `docs(readme)`. Cuando una tarea cambia lo que puede hacer la aplicación o cómo ejecutarla, actualizamos este README.
