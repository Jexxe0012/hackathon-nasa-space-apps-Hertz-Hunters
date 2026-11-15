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
  'Escuchas la imagen de izquierda a derecha. Cada medio segundo suena una de sus 96 franjas verticales. ' +
  'El brillo medio determina la nota: las franjas más oscuras de esta imagen suenan graves y las más claras, agudas. ' +
  'El fondo y los rótulos también influyen. La duración corresponde al recorrido de la imagen.'

type TrackDetails = Omit<Track, 'audio' | 'image' | 'duration' | 'credit'> & { credit?: string }

const details: TrackDetails[] = [
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
    id: 'perpetual-ocean',
    title: 'Perpetual Ocean 2',
    shortTitle: 'Perpetual Ocean 2',
    period: '2021–2023',
    kind: 'Modelo oceánico',
    variable: 'Circulación del agua oceánica',
    unit: 'Trayectorias representadas por líneas',
    pattern: 'Sobre el océano aparecen líneas curvas entrelazadas. La imagen muestra la circulación que simula el modelo.',
    limit: 'Esta portada corresponde a la versión de circulación. Las versiones de temperatura y salinidad tienen sus propias escalas.',
    source: 'https://svs.gsfc.nasa.gov/5479/',
    alt: 'Globo con el Pacífico en primer plano. Numerosos trazos azul claro describen curvas y remolinos.',
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
    id: 'calidad-del-aire',
    title: 'Calidad del aire',
    shortTitle: 'Calidad del aire',
    period: 'Jul–ago 2024',
    kind: 'Modelo atmosférico GEOS-CF',
    variable: 'Partículas PM2.5, ozono, monóxido de carbono y óxidos de nitrógeno',
    unit: 'Una escala por contaminante',
    pattern: 'Cada franja del globo muestra un contaminante distinto. Los cambios de color se interpretan dentro de su propia franja.',
    limit: 'Los tonos de dos franjas pueden representar contaminantes y unidades diferentes. Para comparar concentraciones se necesita su escala.',
    source: 'https://svs.gsfc.nasa.gov/5533/',
    alt: 'Globo dividido en cuatro bandas de colores, con cada contaminante identificado por un rótulo.',
  },
  {
    id: 'dioxido-de-carbono',
    title: 'Dióxido de carbono',
    shortTitle: 'Dióxido de carbono',
    period: 'Ene–mar 2020',
    kind: 'Modelo atmosférico GEOS',
    variable: 'Concentración atmosférica de CO₂',
    unit: 'Partes por millón en los datos del modelo',
    pattern: 'Nubes de puntos coloreados muestran la distribución del CO₂ simulado sobre el globo.',
    limit: 'La perspectiva y la transparencia modifican la apariencia del fotograma. La altura de la nota describe su brillo.',
    source: 'https://svs.gsfc.nasa.gov/5196/',
    alt: 'Globo oscuro centrado en Asia y el Índico con concentraciones de puntos anaranjados sobre tierra.',
  },
  {
    id: 'rayos',
    title: 'Rayos desde la ISS',
    shortTitle: 'Rayos desde la ISS',
    period: '2017–2023',
    kind: 'Observación satelital LIS',
    variable: 'Destellos detectados desde la Estación Espacial Internacional',
    unit: 'Eventos en ventanas de diez días',
    pattern: 'Los puntos superpuestos al mapa indican detecciones del sensor de rayos. La imagen agrupa detecciones durante varios días.',
    limit: 'La cobertura depende del paso del sensor. Cada nota reúne el brillo de una franja que puede contener muchos destellos.',
    source: 'https://svs.gsfc.nasa.gov/5011/',
    alt: 'Mapa mundial gris oscuro con grupos de pequeños destellos amarillos sobre los continentes.',
  },
  {
    id: 'rio-atmosferico',
    title: 'Río atmosférico',
    shortTitle: 'Río atmosférico',
    period: 'Fecha del fotograma sin confirmar',
    kind: 'Reanálisis MERRA-2',
    variable: 'Transporte de vapor de agua y capas meteorológicas',
    unit: 'La unidad depende de la capa',
    pattern: 'Una banda de humedad atraviesa el Pacífico hacia la costa de Norteamérica. El reanálisis combina observaciones y un modelo atmosférico.',
    limit: 'Hay varias capas superpuestas. Su luminosidad conjunta no determina una cantidad de vapor.',
    source: 'https://svs.gsfc.nasa.gov/4960/',
    alt: 'Vista oblicua del Pacífico con una banda azul alargada que se dirige hacia Norteamérica.',
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
]

const mediaBase = `${import.meta.env.BASE_URL}media/`

export const tracks: Track[] = details.map((track) => ({
  credit: 'NASA Scientific Visualization Studio',
  ...track,
  image: `${mediaBase}${track.id}.webp`,
  audio: `${mediaBase}${track.id}.mp3`,
  duration: 48,
}))
