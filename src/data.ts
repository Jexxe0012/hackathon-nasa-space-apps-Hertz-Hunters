import { translateText, type Language } from './translations'

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
  "Each track uses a sound engine that reads data from its NASA image. The sound guide explains what each sound represents."

type TrackDetails = Omit<Track, 'audio' | 'image' | 'duration' | 'credit' | 'scene'> & { credit?: string; scene: string }

const details: TrackDetails[] = [
  {
    id: 'corrientes-temperatura',
    title: "Currents and temperature",
    shortTitle: "Currents and temperature",
    period: "Mar 2007–Feb 2008",
    kind: "ECCO2 ocean model",
    variable: "Sea temperature off El Salvador",
    unit: "Sea surface temperature in °C",
    pattern: "A year of sea temperatures off the Salvadoran coast, week by week. Above are the Pacific and a close-up of the coast; below, the year's curve unfolds with the sound. Temperatures stay around 29 °C from April to October, then drop sharply in November.",
    limit: "This model covers a single year: you hear the seasonal cycle, not global warming. Temperature is read from the color of the current lines, with a maximum error of 0.46 °C.",
    source: 'https://svs.gsfc.nasa.gov/3912/',
    alt: "The Pacific Ocean with colored currents and Central America along its eastern edge.",
    scene: 'oceano',
    story: {
      title: "A year by the sea in El Salvador",
      teaser: "The sea you know has a story to tell, too.",
      introduction: "Think of a visit to the Salvadoran coast. Now explore a year offshore: waves and piano guide you through temperature changes, week by week.",
      listenFor: "Listen for the melody rising and the rhythm of the waves changing. These are data turned into sound, not a recording of the sea.",
      action: "Explore a year by the sea",
    },
    guide: [
      "You hear just two sounds: ocean waves and a piano melody.",
      "A higher melody means warmer water. Each half degree moves one step up a pentatonic scale. When the temperature crosses a step, the new note sounds at that moment.",
      "More frequent waves and notes mean a more active sea. Above 27 °C, the waves break with foam. A sea temperature of 26.5 °C supports hurricane formation (NOAA).",
      "Press Play to hear the full year in about 30 seconds. Use the scene's week control to explore a single week.",
    ],
  },
  {
    id: 'altura-de-bosques',
    title: "Forest height",
    shortTitle: "Forest height",
    period: "Apr 2019–Apr 2020",
    kind: "GEDI satellite observation",
    variable: "Forest canopy height",
    unit: "Relative height (taller / shorter)",
    pattern: "A 16-point path heads south from the heart of the Amazon. The forest stays tall, then drops to less than a third of its height between two points: this is where the tall forest ends.",
    limit: "This GEDI visualization is a single snapshot, with no before-and-after comparison: it does not measure deforestation. The edge aligns with the arc of deforestation monitored by NASA and Brazil's INPE. Shadows on the 3D globe make the heights approximate.",
    source: 'https://svs.gsfc.nasa.gov/4950/',
    alt: "A globe centered on the Americas, with green areas and relief representing forest canopy height.",
    scene: 'bosques',
    story: {
      title: "From the heart of the Amazon to the forest edge",
      teaser: "Climb to the treetops with the piano and hear where the forest changes.",
      introduction: "Imagine climbing from the ground to a treetop with each note. This 16-point path takes you from the Amazon's interior to its southern edge.",
      listenFor: "Listen for how high each piano staircase reaches. This journey compares places within one visualization; it does not show forest loss over time.",
      action: "Explore the Amazon",
    },
    guide: [
      "At each point, the piano climbs a staircase of notes from the ground to the canopy: the taller the forest, the higher it reaches.",
      "In the heart of the Amazon, the staircases are long. At the edge, they cut off suddenly and stay low.",
      "The bars beneath the globe light up with the sound; orange bars mark the edge.",
    ],
  },
  {
    id: 'aerosoles',
    title: "Aerosols",
    shortTitle: "Aerosols",
    period: "Aug 19, 2025 · 20:00 UTC",
    kind: "GEOS atmospheric model",
    variable: "Types of airborne particles",
    unit: "Aerosol categories",
    pattern: "A single moment in Earth's atmosphere, told through stories: the journey of Saharan dust, Africa (dust in the north, smoke in the south), the Americas, the southern oceans, and the whole planet.",
    limit: "The legend has no numbers: particle type is inferred from color and quantity from brightness. Each type has its own scale. On that day, Saharan dust stopped about 2,700 km from El Salvador.",
    source: 'https://svs.gsfc.nasa.gov/5669/',
    alt: "A dark world map with broad bands of green, purple, orange, and blue particles.",
    scene: 'aerosoles',
    story: {
      title: "The journey of Saharan dust",
      teaser: "Follow a journey across the Atlantic with your ears.",
      introduction: "Air connects places that seem far apart. Start in the Sahara and follow the dust across the Atlantic in a scene from August 19, 2025. Then explore other stories from the same map.",
      listenFor: "The flute represents dust, and the sound follows the route. The map shows one moment from an atmospheric model, not a measurement of the air you breathe today.",
      action: "Follow the dust's journey",
    },
    guide: [
      "A line moves across the story's region and plays what it touches. In the dust story, it travels from east to west, like the wind.",
      "Each particle type has an instrument: dust is a flute, sea salt is bells, sulfates are a marimba, and black carbon is a low piano.",
      "The north has higher notes; the south has lower ones. More intense color means louder, more frequent notes. Choose a story and turn particle types on or off in the scene.",
    ],
  },
  {
    id: 'luces-nocturnas',
    title: "Night lights",
    shortTitle: "Night lights",
    period: '2012–2023',
    kind: "VIIRS satellite observation",
    variable: "Visible light at night",
    unit: "Relative brightness, no units",
    pattern: "A line sweeps the night map from west to east, turning lights into piano notes. Listen to annual averages from 2012 to 2023. The opening story starts in 2020 and lets you compare it with 2019.",
    limit: "Each map is an average of a whole year, not a day or a lockdown. Brightness is read from images on a shared relative scale. A difference between 2019 and 2020 alone cannot be attributed to the pandemic.",
    source: 'https://svs.gsfc.nasa.gov/5276/',
    credit: 'NASA SVS 5276 · Black Marble, Suomi NPP / VIIRS',
    alt: "A world map at night with dark blue continents and clusters of white and golden lights.",
    scene: 'luces',
    story: {
      title: "What did the world's night lights sound like during the pandemic?",
      teaser: "Return to 2020 and hear the lights of a year that changed our routines.",
      introduction: "Remember how your routine changed in 2020? Revisit that year from a different perspective: listen to Earth's night lights. Start with 2020 and compare it with 2019, then explore other years.",
      listenFor: "Where there is light, the piano plays. Compare where notes appear and how strong they are. You are hearing annual averages; the map alone cannot explain what caused the changes.",
      action: "Explore the lights of 2020",
      initialYear: 2020,
      comparisonYear: 2019,
    },
    guide: [
      "The scanning line plays what it touches: light becomes piano notes; darkness becomes silence.",
      "More light means louder, more frequent notes. The north has higher notes; the south has lower ones. Sound moves from left to right with the line.",
      "The story starts in 2020 and offers a 2019 → 2020 comparison: first you hear the reference year, then the selected year. You can change both years in the scene.",
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
  scene: `${base}sonido/${track.scene}/index.html?embed=1&v=7` +
    (track.story.initialYear ? `&anio=${track.story.initialYear}&comparar=${track.story.comparisonYear}` : ''),
}))

const spanishTracks: Track[] = tracks.map(track => {
  const t = (text: string) => translateText('es', text)
  return {
    ...track,
    title: t(track.title), shortTitle: t(track.shortTitle), period: t(track.period),
    kind: t(track.kind), variable: t(track.variable), unit: t(track.unit),
    pattern: t(track.pattern), limit: t(track.limit), alt: t(track.alt),
    guide: track.guide.map(t),
    story: {
      ...track.story,
      title: t(track.story.title), teaser: t(track.story.teaser),
      introduction: t(track.story.introduction), listenFor: t(track.story.listenFor), action: t(track.story.action),
    },
  }
})

export function getTracks(language: Language): Track[] {
  return language === 'es' ? spanishTracks : tracks
}
