export interface Track {
  id: string
  title: string
  shortTitle: string
  period: string
  kind: string
  variable: string
  unit: string
  pattern: string
  limit: string
  source: string
  credit: string
  image: string
  audio: string
  alt: string
  duration: number
  /** Escena sonora interactiva (motor de sonido de Diego Fuentes) que se muestra en el visor. */
  scene?: string
  /** Guía sonora: cómo se convierte el dato en sonido en esta pista. */
  guide: string[]
  story: {
    title: string
    teaser: string
    introduction: string
    listenFor: string
    action: string
    initialYear?: number
    comparisonYear?: number
  }
}

export const listeningLegend =
  'Cada disco suena con un motor que lee los datos de su imagen de la NASA. La guía sonora de cada pista explica qué representa cada sonido.'

type TrackDetails = Omit<Track, 'audio' | 'image' | 'duration' | 'credit' | 'scene'> & { credit?: string; scene: string }

const details: TrackDetails[] = [
  {
    id: 'corrientes-temperatura',
    title: 'Corrientes y temperatura',
    shortTitle: 'Corrientes y temperatura',
    period: 'Mar 2007–feb 2008',
    kind: 'Modelo oceánico ECCO2',
    variable: 'Temperatura del mar frente a El Salvador',
    unit: 'Temperatura superficial en °C',
    pattern: 'El mar frente a la costa salvadoreña durante un año, semana a semana. Arriba, todo el Pacífico y un zoom a la costa; abajo, la curva del año se dibuja mientras suena. Ronda los 29 °C de abril a octubre y cae de golpe en noviembre.',
    limit: 'Es un modelo de un solo año: se escucha el ciclo de las estaciones, no el calentamiento global. La temperatura se lee del color de las líneas de corriente (error máximo 0,46 °C).',
    source: 'https://svs.gsfc.nasa.gov/3912/',
    alt: 'Vista del Pacífico con corrientes de colores y Centroamérica en su borde oriental.',
    scene: 'oceano',
    story: {
      title: 'Un año junto al mar de El Salvador',
      teaser: 'El mar que conoces también tiene una historia que contar.',
      introduction: 'Piensa en una visita a la costa salvadoreña. Ahora recorre un año frente a ella: las olas y el piano te guían por los cambios de temperatura, semana a semana.',
      listenFor: 'Escucha cuándo sube la melodía y cómo cambia el ritmo de las olas. Son datos convertidos en sonido, no una grabación del mar.',
      action: 'Explorar el año junto al mar',
    },
    guide: [
      'Solo suenan dos cosas: el mar (olas) y una melodía de piano.',
      'Melodía más aguda = mar más caliente. Cada medio grado sube un escalón de una escala pentatónica; cuando la temperatura cambia de escalón, la nota nueva suena en ese momento.',
      'Olas y notas más seguidas = mar más activo. Sobre 27 °C las olas rompen con espuma. 26,5 °C es la temperatura del mar que favorece la formación de huracanes (NOAA).',
      'Reproducir escucha el año completo en unos 30 segundos. El control de semanas del visor permite detenerse en una semana.',
    ],
  },
  {
    id: 'altura-de-bosques',
    title: 'Altura de bosques',
    shortTitle: 'Altura de bosques',
    period: 'Abr 2019–abr 2020',
    kind: 'Observación satelital GEDI',
    variable: 'Altura del dosel forestal',
    unit: 'Altura relativa (más alto / más bajo)',
    pattern: 'Un camino de 16 puntos baja del corazón del Amazonas hacia el sur. El bosque se mantiene alto y, de un punto al siguiente, cae a menos de un tercio de su altura: ahí se acaba el bosque alto.',
    limit: 'GEDI es una sola foto, sin antes y después: no mide la deforestación. Ese borde coincide con el arco de la deforestación que vigilan la NASA y el INPE de Brasil. El globo 3D tiene sombras: las alturas son aproximadas.',
    source: 'https://svs.gsfc.nasa.gov/4950/',
    alt: 'Globo centrado en América con zonas verdes y relieve que representan la altura del dosel forestal.',
    scene: 'bosques',
    story: {
      title: 'Del corazón del Amazonas al borde del bosque',
      teaser: 'Sube con el piano hasta las copas y escucha dónde cambia el bosque.',
      introduction: 'Imagina que puedes subir desde el suelo hasta la copa de un árbol con cada nota. Este camino de 16 puntos te lleva del interior del Amazonas hacia su borde sur.',
      listenFor: 'Presta atención a la altura que alcanza cada escalera de piano. El recorrido compara lugares de una misma visualización; no muestra una pérdida de bosque a lo largo del tiempo.',
      action: 'Recorrer el Amazonas',
    },
    guide: [
      'En cada punto del camino, el piano sube una escalera de notas desde el suelo hasta la copa: mientras más alto el bosque, más arriba llega.',
      'En el corazón del Amazonas las escaleras son largas; en el borde se cortan de golpe y quedan abajo.',
      'Las barras bajo el globo se encienden al sonar; las naranjas marcan el borde.',
    ],
  },
  {
    id: 'aerosoles',
    title: 'Aerosoles',
    shortTitle: 'Aerosoles',
    period: '19 ago 2025 · 20:00 UTC',
    kind: 'Modelo atmosférico GEOS',
    variable: 'Tipos de partículas suspendidas',
    unit: 'Categorías de aerosol',
    pattern: 'Un solo momento del aire del planeta, contado en historias: el viaje del polvo del Sahara, África (polvo al norte, humo al sur), nuestro continente, los mares del sur y todo el planeta.',
    limit: 'La leyenda no tiene números: el tipo sale del color y la cantidad, del brillo; cada tipo usa su propia escala. Ese día el polvo del Sahara se detuvo a unos 2.700 km de El Salvador.',
    source: 'https://svs.gsfc.nasa.gov/5669/',
    alt: 'Mapamundi oscuro con extensas bandas de partículas verdes, violetas, anaranjadas y azules.',
    scene: 'aerosoles',
    story: {
      title: 'El viaje del polvo del Sahara',
      teaser: 'Sigue con el oído un viaje que cruza el Atlántico.',
      introduction: 'El aire conecta lugares que parecen lejanos. Empieza en el Sahara y sigue el polvo sobre el Atlántico en una escena del 19 de agosto de 2025. Después puedes explorar otras historias del mismo mapa.',
      listenFor: 'La flauta representa el polvo y el sonido avanza con el recorrido. El mapa muestra un momento de un modelo atmosférico, no una medición del aire que respiras hoy.',
      action: 'Seguir el viaje del polvo',
    },
    guide: [
      'Una línea recorre la zona de la historia y suena lo que toca. En el viaje del polvo va de este a oeste, como el viento.',
      'Cada partícula tiene su instrumento: polvo = flauta, sal marina = campanitas, sulfatos = marimba, carbono negro = piano grave.',
      'Norte agudo, sur grave. Color más intenso = notas más fuertes y más seguidas. En el visor puedes elegir la historia y apagar tipos.',
    ],
  },
  {
    id: 'luces-nocturnas',
    title: 'Luces nocturnas',
    shortTitle: 'Luces nocturnas',
    period: '2012–2023',
    kind: 'Observación satelital VIIRS',
    variable: 'Luz visible de noche',
    unit: 'Brillo relativo, sin unidades',
    pattern: 'Una línea recorre el mapa nocturno de oeste a este y transforma las luces en piano. Puedes escuchar los promedios anuales de 2012 a 2023. La historia de entrada prepara 2020 y permite compararlo con 2019.',
    limit: 'Cada mapa es el promedio de todo un año, no de un día ni de un confinamiento. El brillo se lee de imágenes en una escala relativa común. Una diferencia entre 2019 y 2020 no permite atribuir por sí sola su causa a la pandemia.',
    source: 'https://svs.gsfc.nasa.gov/5276/',
    credit: 'NASA SVS 5276 · Black Marble, Suomi NPP / VIIRS',
    alt: 'Mapa mundial nocturno con continentes azul oscuro y agrupaciones de luces blancas y doradas.',
    scene: 'luces',
    story: {
      title: '¿Cómo sonaban las luces del mundo durante la pandemia?',
      teaser: 'Vuelve a 2020 y escucha las luces de un año que cambió nuestras rutinas.',
      introduction: '¿Recuerdas cómo cambió tu rutina en 2020? Acércate a ese año desde otra perspectiva: escucha las luces nocturnas del planeta. Empieza por 2020 y compáralo con 2019; después puedes recorrer otros años.',
      listenFor: 'Donde hay luz suena el piano. Compara dónde aparecen las notas y con qué intensidad. Escuchas promedios anuales; el mapa por sí solo no explica las causas de los cambios.',
      action: 'Explorar las luces de 2020',
      initialYear: 2020,
      comparisonYear: 2019,
    },
    guide: [
      'La línea del radar suena lo que toca: donde hay luz suena el piano; donde está oscuro, silencio.',
      'Más luz = notas más fuertes y más seguidas. Norte agudo, sur grave. El sonido viaja de izquierda a derecha con la línea.',
      'La historia empieza con 2020 y ofrece comparar 2019 → 2020: primero escuchas el año de referencia y luego el elegido. Puedes cambiar ambos años en el visor.',
    ],
  },
]
const base = import.meta.env.BASE_URL
const mediaBase = `${base}media/`
const sceneCovers: Record<string, string> = {
  oceano: 'sonido/oceano/mapas/s01.webp',
  bosques: 'sonido/bosques/globo.webp',
  luces: 'sonido/luces/mapas/mundo_2020.webp',
}

export const tracks: Track[] = details.map((track) => ({
  credit: 'NASA Scientific Visualization Studio',
  ...track,
  image: sceneCovers[track.scene] ? `${base}${sceneCovers[track.scene]}` : `${mediaBase}${track.id}.webp`,
  audio: `${mediaBase}${track.id}.mp3`,
  duration: 48,
  scene: `${base}sonido/${track.scene}/index.html?embed=1&v=${track.scene === 'luces' ? 5 : 4}` +
    (track.story.initialYear ? `&anio=${track.story.initialYear}&comparar=${track.story.comparisonYear}` : ''),
}))
