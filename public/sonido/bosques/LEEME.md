# Disco Bosques · "Del corazón del Amazonas al borde donde se acaba el bosque" (NASA SVS 4950, GEDI)

La altura de los bosques medida por **GEDI**, un láser de la NASA en la Estación Espacial Internacional (2019–2020). La NASA solo publica estos datos como un **globo 3D con relieve y sombras**.

## La historia

Un camino de **16 puntos en línea recta**, del corazón del Amazonas hacia el sur. El bosque se mantiene alto y, de un punto al siguiente, **cae a menos de un tercio de su altura**: ahí se acaba el bosque alto. En el sur del Amazonas ese borde coincide con el **"arco de la deforestación"** que vigilan la NASA y el INPE de Brasil, donde el bosque da paso a sabana natural y a campos de cultivo y ganado.

**Honestidad:** GEDI es una foto de 2019–2020, sin antes y después: **no mide la deforestación**. Muestra dónde se acaba el bosque alto; la página lo dice así.

## Cómo suena: "subir el árbol"

En cada punto (1,1 s), el **piano sube una escalera de notas desde el suelo hasta la copa** (pentatónica Mi3 → Sol#5); la copa se queda sonando. Más alto el bosque = la escalera llega más arriba. En el Amazonas, escaleras largas; en el borde, cortas y abajo. Es otro sonido que los radares de los demás discos (a pedido de Diego: el radar con marimba ya sonaba repetido). Sin voz (la pone el bot).

## Lo que se ve

El globo completo con el camino punteado y el punto actual; debajo, 16 barras que se encienden al sonar (las del borde en naranja). Texto: corazón del Amazonas → el borde → más allá del borde.

## Datos y calidad

`imagen-a-sonido/bosques_4950/leer_bosques.mjs` → `resultados/bosques_radar.json` → `transecto` (16 puntos: posición en la imagen, vegetación, altura aproximada). Luz del globo corregida con el brillo del mar cercano; alturas aproximadas: se dice "más alto / más bajo", sin metros. Medido sobre el WAV: ~−20 LUFS, 0 clics, sin saturación.

Abrir: `npm run dev` en la raíz del repo (app Earthbeat) → `http://localhost:5173/sonido/bosques/` · Teclado: Espacio, ← →. Imagen: NASA/SVS 4950. Piano: Salamander Grand Piano (CC BY 3.0).
