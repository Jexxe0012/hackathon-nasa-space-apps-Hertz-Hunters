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
}

export const listeningLegend =
  'Esta sonificación es una muestra provisional basada en el brillo. Escuchas la imagen de izquierda a derecha. Cada medio segundo suena una de sus 96 franjas verticales. ' +
  'El brillo medio determina la nota: las franjas más oscuras de esta imagen suenan graves y las más claras, agudas. ' +
  'El fondo y los rótulos también influyen. La duración corresponde al recorrido de la imagen.'

type TrackDetails = Omit<Track, 'audio' | 'image' | 'duration' | 'credit'> & { credit?: string }

const details: TrackDetails[] = [
  {
    id: 'corrientes-temperatura',
    title: 'Corrientes y temperatura',
    shortTitle: 'Corrientes y temperatura',
    period: '2007–2008',
    kind: 'Modelo oceánico ECCO2',
    variable: 'Corrientes y temperatura superficial del mar',
    unit: 'Temperatura superficial en °C',
    pattern: 'Las líneas dibujan remolinos y recorridos en el océano. Sus colores representan la temperatura superficial del modelo.',
    limit: 'Los trazos muestran recorridos de un modelo. El brillo de una franja no permite recuperar una velocidad ni una temperatura exacta.',
    source: 'https://svs.gsfc.nasa.gov/3912/',
    alt: 'Mapa mundial con trazos rojos y amarillos cerca del ecuador, verdes y azules hacia los polos.',
  },
  {
    id: 'altura-de-bosques',
    title: 'Altura de bosques',
    shortTitle: 'Altura de bosques',
    period: 'Abr 2019–abr 2020',
    kind: 'Observación satelital GEDI',
    variable: 'Altura del dosel forestal',
    unit: 'Metros en los datos de GEDI',
    pattern: 'El color y el relieve indican cambios en la altura de las copas de los árboles. Las mediciones se realizaron con un láser desde la estación espacial.',
    limit: 'El relieve está exagerado y produce sombras. La cobertura de los puntos también interviene en el brillo.',
    source: 'https://svs.gsfc.nasa.gov/4950/',
    alt: 'Globo con África en primer plano y zonas verdes con relieve que representan el dosel forestal.',
  },
  {
    id: 'aerosoles',
    title: 'Aerosoles',
    shortTitle: 'Aerosoles',
    period: '19 ago 2025 · 20:00 UTC',
    kind: 'Modelo atmosférico GEOS',
    variable: 'Tipos de partículas suspendidas',
    unit: 'Categorías de aerosol',
    pattern: 'Bandas de color muestran la distribución de sal marina, polvo, humo y sulfatos en un mismo instante.',
    limit: 'Los colores se superponen. Las luces nocturnas del fondo también contribuyen al brillo del archivo.',
    source: 'https://svs.gsfc.nasa.gov/5669/',
    alt: 'Mapamundi oscuro con extensas bandas de partículas verdes, violetas, anaranjadas y azules.',
  },
  {
    id: 'luces-nocturnas',
    title: 'Luces nocturnas',
    shortTitle: 'Luces nocturnas',
    period: '2016',
    kind: 'Observación satelital',
    variable: 'Luz visible de noche',
    unit: 'Brillo relativo de la imagen',
    pattern: 'Los puntos de luz se agrupan y forman redes sobre los continentes. Entre ellos se extienden grandes zonas oscuras.',
    limit: 'Este mosaico reúne observaciones de 2016. Para medir un cambio entre años hacen falta imágenes comparables y datos de radiancia.',
    source: 'https://svs.gsfc.nasa.gov/30876/',
    credit: 'NASA Goddard Space Flight Center · Black Marble, Suomi NPP / VIIRS',
    alt: 'Mapa mundial nocturno con continentes azul oscuro y agrupaciones de luces blancas y doradas.',
  },
]
const mediaBase = `${import.meta.env.BASE_URL}media/`

export const tracks: Track[] = details.map((track) => ({
  credit: 'NASA Scientific Visualization Studio',
  ...track,
  image: `${mediaBase}${track.id}.webp`,
  audio: `${mediaBase}${track.id}.mp3`,
  duration: 48,
}))
