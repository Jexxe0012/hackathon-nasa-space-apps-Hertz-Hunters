# Earth Jukebox

Proyecto del equipo Hertz Hunters para el NASA Space Apps Challenge.

Earth Jukebox presenta cuatro visualizaciones de la Tierra con imágenes, descripciones en español y audio de prueba. Una persona puede elegir una pista, leer qué representa y recorrer el audio con el teclado. La aplicación lleva el diseño **Enfoque** a React, TypeScript y Vite, con iconos pixel art, un visor central y controles de reproducción al pie. [Diseño de Enfoque en Figma](https://www.figma.com/design/4q6sU5VYc8qZHcr2rmdSLO?node-id=6-11720)

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

Las imágenes, las fuentes y los MP3 se sirven desde el proyecto. La aplicación funciona sin claves API. Python, Pillow y FFmpeg solo intervienen al regenerar los MP3 con `python scripts/sonify.py`.

## Escuchar una imagen

Al entrar, la pantalla de bienvenida explica el propósito de la aplicación y lleva a la colección. El logotipo permite regresar al inicio.

Al abrir la aplicación aparece un aviso de accesibilidad que también se presenta a los lectores de pantalla mediante una región de anuncios. La bienvenida ofrece un acceso a las opciones de contraste y movimiento. La voz integrada de la aplicación está pendiente; por ahora se utiliza el lector de pantalla del dispositivo.

En **Colección** puedes elegir cualquiera de las cuatro pistas. **Sobre la pista** incluye su periodo, variable, procedencia y límites de interpretación. El visor muestra la imagen fuente de NASA.

El reproductor aparece al seleccionar una pista y permanece disponible al regresar a la colección durante la misma visita.

Al pulsar **Reproducir** se escucha una muestra provisional de 48 segundos. El generador divide la imagen fuente en 96 franjas verticales y calcula el brillo medio de cada una. Dentro de esa imagen, una franja más clara produce una nota más aguda. Cada nota dura medio segundo. El fondo y los rótulos también afectan al cálculo. Los tonos expresan brillo relativo y el contador indica tiempo de escucha. Diego Fuentes se encargará del diseño y la validación de los sonidos del proyecto.

La propuesta del equipo distingue los discos temporales de océano y luces nocturnas de las imágenes estáticas de bosques y aerosoles. El reproductor actual reproduce muestras de audio y muestra una imagen por pista; la selección de fechas, la exploración espacial con teclado, el asistente y la interfaz bilingüe están pendientes de desarrollo. El mapa nocturno actual es la imagen Black Marble de 2016, usada como referencia visual mientras se integra la serie 2012–2023.

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

Josué trabaja en el diseño y la interfaz accesible. Diego Fuentes se encarga de los sonidos y Diego del bot guía. El backend lo desarrollará el integrante asignado por el equipo. Las sonificaciones actuales son una base de prueba pendiente de revisión por Diego Fuentes.

Agrupamos los cambios por tarea en ramas de trabajo. Usamos mensajes como `feat(datos)`, `feat(reproductor)`, `fix(accesibilidad)` y `docs(readme)`. Cuando una tarea cambia lo que puede hacer la aplicación o cómo ejecutarla, actualizamos este README.
