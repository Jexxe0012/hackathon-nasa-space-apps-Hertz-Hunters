# Experiencia guiada de Earthbeat

La experiencia guiada es la entrada inicial. La experiencia visual sigue disponible y la elección se conserva en `earthbeat.experience` en el navegador. La voz propia requiere una elección nueva de la persona: no habla automáticamente al abrir el sitio.

El idioma inicial es inglés, sin depender del idioma del dispositivo. El selector Language / Idioma cambia toda la experiencia y conserva la preferencia en `earthbeat.language`. El atributo `lang` de la página y las escenas sigue esa elección para los lectores de pantalla. La web no puede modificar la configuración ni las voces instaladas de TalkBack. [Documentación en inglés](guided-experience.md).

## Lectura y voz

- **Con mi lector de pantalla**: interfaz semántica, foco en el encabezado al cambiar de paso y controles nativos. Compatible por diseño con TalkBack, NVDA y VoiceOver; no activa ni detecta el lector del sistema.
- **Con voz de Earthbeat**: usa `SpeechSynthesis`, con una voz en inglés de forma predeterminada, o español al elegirlo en el selector de idioma. Permite repetir, detener y ajustar la velocidad. Si el navegador no ofrece esa API o falla la voz, permanece disponible la lectura normal con tecnología de asistencia.
- La guía y la sonificación no se programan juntas: reproducir o intervenir en una escena cancela la voz de guía; repetir la lectura solicita pausar la escena. Cambiar de paso detiene la guía y desmonta la escena anterior.
- El bot conversacional del equipo sigue siendo un trabajo separado: esta voz lee el contenido de la interfaz y no responde preguntas ni crea interpretaciones.

TalkBack es una función de Android. [Google explica cómo activarlo](https://support.google.com/accessibility/android/answer/6007100?hl=es). Earthbeat no puede encenderlo desde la web y conserva sus gestos habituales. La disponibilidad y pronunciación de la voz integrada dependen del dispositivo y del navegador.

## Navegación

Después de la bienvenida hay cuatro pasos: elegir historia, conocerla, escuchar y explorar, y revisar qué cuenta el dato. No es obligatorio atravesar toda la guía para usar la experiencia visual.

En el área de lectura, clic derecho avanza y clic izquierdo regresa. La navegación por clic se puede desactivar en Preferencias. No se interceptan controles, enlaces, el menú contextual por teclado ni activaciones táctiles o sintéticas del lector. En el primer paso se debe elegir una historia antes de continuar. Los botones Anterior y Siguiente siempre ofrecen la alternativa nativa. Las flechas solo cambian de paso desde texto no interactivo; no sustituyen la operación de selectores y barras.

La lectura al detener el ratón sobre texto o controles es opcional, requiere la voz propia activada, espera 600 ms y no funciona mientras suena una escena. La voz propia también lee el control al recibir foco por teclado. No se necesita mover el ratón para completar ninguna tarea.

La vista guiada prioriza resúmenes y controles; las imágenes y gráficas decorativas de las escenas se ocultan en ella. Los años, comparaciones, recorridos, instrumentos y otras opciones siguen disponibles. La vista visual conserva mapas y gráficas. Las escenas comparten los mismos datos y motores de Fuentes.

## Contrato entre la guía y las escenas

`?guiado=1&contraste=1` activa la presentación de controles y el tema de contraste. El puente `incrustado.js` acepta `pausar` además de los mensajes existentes y valida que lleguen del padre y del mismo origen. Las escenas notifican `entrada` cuando se usa un control, para cancelar la narración antes de empezar a sonar. La síntesis de voz se cancela al salir de la experiencia.

## Validación necesaria

Comprobar en navegador: primera visita guiada, cambio de experiencia y persistencia, elección de las cuatro historias, pasos anterior/siguiente, clics en texto y controles, navegación con teclado, pausa/repetición de voz, reproducción de datos, salida durante la reproducción, contraste y móvil. Verificar también la alternativa sin API de voz.

La inspección del árbol accesible y las pruebas en escritorio no reemplazan una prueba real en Android con TalkBack, NVDA/VoiceOver y personas ciegas. Esa validación de uso debe realizarse antes de afirmar compatibilidad comprobada con esos lectores.
