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
    alt: 'Mapa mundial con trazos rojos y amarillos cerca del ecuador, verdes y azules hacia los polos.',
    scene: 'oceano',
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
    alt: 'Globo con África en primer plano y zonas verdes con relieve que representan el dosel forestal.',
    scene: 'bosques',
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
    pattern: 'Elige una fecha importante y una línea recorre el mundo de noche de ese año, de oeste a este. En 2023 el planeta tiene un 37 % más de luz que en 2012; en 2020 hubo menos luz que en 2019.',
    limit: 'Cada mapa es el promedio de todo un año, no del día de la fecha. La NASA no da unidades: el brillo es relativo y comparable entre años.',
    source: 'https://svs.gsfc.nasa.gov/5276/',
    credit: 'NASA SVS 5276 · Black Marble, Suomi NPP / VIIRS',
    alt: 'Mapa mundial nocturno con continentes azul oscuro y agrupaciones de luces blancas y doradas.',
    scene: 'luces',
    guide: [
      'La línea del radar suena lo que toca: donde hay luz suena el piano; donde está oscuro, silencio.',
      'Más luz = notas más fuertes y más seguidas. Norte agudo, sur grave. El sonido viaja de izquierda a derecha con la línea.',
      'Con «Comparar 2012 →» del visor escuchas 2012 y luego tu año, uno tras otro.',
    ],
  },
]
const base = import.meta.env.BASE_URL
const mediaBase = `${base}media/`

export const tracks: Track[] = details.map((track) => ({
  credit: 'NASA Scientific Visualization Studio',
  ...track,
  image: `${mediaBase}${track.id}.webp`,
  audio: `${mediaBase}${track.id}.mp3`,
  duration: 48,
  scene: `${base}sonido/${track.scene}/index.html?embed=1&v=4`, // v: evita copias viejas en caché
}))
