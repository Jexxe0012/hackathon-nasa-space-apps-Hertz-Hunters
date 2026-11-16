# Earthbeat

Proyecto del equipo Hertz Hunters para el NASA Space Apps Challenge.

Earthbeat presenta cuatro historias de la Tierra con imágenes, descripciones en español y escenas sonoras basadas en datos. Una persona puede elegir una historia, aprender qué representa cada sonido y explorarla con el teclado. La aplicación lleva el diseño **Enfoque** a React, TypeScript y Vite, con iconos pixel art, un visor central y controles de reproducción al pie. [Diseño de Enfoque en Figma](https://www.figma.com/design/4q6sU5VYc8qZHcr2rmdSLO?node-id=6-11720)

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

La primera visita abre la **experiencia guiada**, orientada a personas ciegas y con baja visión. Permite elegir entre el lector de pantalla del dispositivo y la voz opcional de Earthbeat. El recorrido lleva de la selección de historia a su contexto, escucha y límites de interpretación. El botón **Experiencia visual** abre la interfaz con colección y globo; desde esa vista se puede volver con **Experiencia guiada**. Se recuerda la experiencia elegida en este navegador.

El globo de bienvenida usa una malla 3D con cartografía global de Natural Earth y alturas estimadas del dosel GEDI de abril a julio de 2019, publicadas por Lang y colaboradores. Ambas capas comparten coordenadas WGS84: el modelo gira sin reconstruir hemisferios a partir de fotografías. El relieve está exagerado para hacerlo visible; las zonas sin mediciones aparecen grises. El giro puede pausarse y se detiene con movimiento reducido. [Fuentes, atribución y procesamiento del globo](docs/globo-datos.md).

TalkBack se activa en los ajustes de Android; la web ofrece encabezados, botones y controles nativos para usarlo, y también admite otros lectores de pantalla. La voz de Earthbeat utiliza la síntesis de voz del navegador, se activa por una acción de la persona y se puede detener o repetir. Elegir el lector de pantalla mantiene la voz propia apagada. La voz de guía se detiene al operar la escena o reproducir los datos. [Funcionamiento y comprobaciones de accesibilidad](docs/experiencia-guiada.md).

En el área de lectura de la experiencia guiada, después de comenzar, clic derecho avanza y clic izquierdo regresa. Los botones, enlaces, preferencias y controles de las escenas conservan su comportamiento normal. Se puede desactivar esta navegación. Con voz de Earthbeat, detener el ratón sobre un párrafo permite escucharlo; también se puede desactivar. Los botones **Anterior** y **Siguiente** ofrecen las mismas acciones mediante teclado o táctil. La experiencia guiada usa texto grande, contraste ajustable y evita las animaciones decorativas.

En **Colección** puedes elegir cualquiera de las cuatro pistas. **Sobre la pista** incluye su periodo, variable, procedencia y límites de interpretación. El visor muestra la imagen fuente de NASA.

El reproductor aparece al seleccionar una pista y permanece disponible al regresar a la colección durante la misma visita.

La bienvenida destaca una pregunta: «¿Cómo sonaban las luces del mundo durante la pandemia?». Al abrirla, la escena prepara el promedio de 2020 y ofrece comparar 2019 → 2020. La escucha empieza solo al pulsar Reproducir o Comparar. Se pueden cambiar tanto el año escuchado como el de referencia. El relato aporta contexto humano; los mapas anuales no permiten atribuir por sí solos una diferencia a la pandemia ni describen un día de confinamiento.

La colección también invita a escuchar un año frente a la costa salvadoreña, recorrer el Amazonas y seguir el polvo del Sahara. Cada historia incluye una indicación breve de qué escuchar y conserva la ficha científica y la guía del motor de Fuentes.

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

Las fichas científicas remiten a NASA Scientific Visualization Studio. La portada de luces nocturnas usa el mapa anual de 2020 de la serie 2012–2023; el visor permite recorrer los demás años. Los enlaces identifican las visualizaciones y sus imágenes de referencia.

| Pista | Recursos originales |
| --- | --- |
| Corrientes y temperatura | [Ficha NASA](https://svs.gsfc.nasa.gov/3912/) · [Portada del Pacífico](public/sonido/oceano/mapas/s01.webp) |
| Altura de bosques | [Ficha NASA](https://svs.gsfc.nasa.gov/4950/) · [Portada de América](public/sonido/bosques/globo.webp) |
| Aerosoles | [Ficha NASA](https://svs.gsfc.nasa.gov/5669/) · [Imagen utilizada](https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005669/Aerosols_2025-08-19T20_00_00_1920x1080.png) |
| Luces nocturnas | [Serie 2012–2023](https://svs.gsfc.nasa.gov/5276/) · [Portada de 2020](public/sonido/luces/mapas/mundo_2020.webp) |

El catálogo y las descripciones están en [src/data.ts](src/data.ts). El generador está en [scripts/sonify.py](scripts/sonify.py). Las licencias de Silkscreen y Atkinson Hyperlegible se incluyen en [public/licenses](public/licenses).

## Desarrollo en equipo

Josué trabaja en el diseño y la interfaz accesible. Diego Fuentes se encarga de los sonidos y Diego del bot guía. El backend lo desarrollará el integrante asignado por el equipo. Los sonidos de las cuatro pistas son los motores de Diego Fuentes (rama `fuentes`).

Agrupamos los cambios por tarea en ramas de trabajo. Usamos mensajes como `feat(datos)`, `feat(reproductor)`, `fix(accesibilidad)` y `docs(readme)`. Cuando una tarea cambia lo que puede hacer la aplicación o cómo ejecutarla, actualizamos este README.
