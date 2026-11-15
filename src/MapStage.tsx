import { useEffect, useRef, useState } from 'react'
import type { Track } from './data'
import './map-stage.css'

type StageProps = { track: Track }
type Mode = 'pixel' | 'original'
type RGB = readonly [number, number, number]

const ocean: RGB = [13, 22, 41]
const land: RGB[] = [
  [47, 48, 97],
  [66, 65, 126],
  [80, 82, 152],
  [100, 102, 176],
]
const shoreline: RGB = [120, 132, 193]
const city: RGB[] = [
  [186, 130, 90],
  [246, 185, 89],
  [255, 218, 114],
  [255, 241, 179],
]

/** Sample the actual Black Marble plate. Peak pooling keeps small lights visible at display scale. */
function renderNightPlate(source: ImageData, output: ImageData) {
  const { width, height, data } = output
  const cells = width * height
  const meanTone = new Uint8Array(cells)
  const lights = new Uint8Array(cells)
  for (let y = 0; y < height; y++) {
    const top = Math.floor((y * source.height) / height)
    const bottom = Math.floor(((y + 1) * source.height) / height)
    for (let x = 0; x < width; x++) {
      const start = Math.floor((x * source.width) / width)
      const end = Math.floor(((x + 1) * source.width) / width)
      let tone = 0
      let brightest = 0
      for (let sy = top; sy < bottom; sy++) {
        for (let sx = start; sx < end; sx++) {
          const p = (sy * source.width + sx) * 4
          const r = source.data[p],
            g = source.data[p + 1],
            b = source.data[p + 2]
          tone += (r + g + b) / 3
          if (r > b * 0.88) brightest = Math.max(brightest, r)
        }
      }
      const i = y * width + x
      meanTone[i] = tone / Math.max(1, (bottom - top) * (end - start))
      lights[i] = brightest
    }
  }

  for (let i = 0; i < cells; i++) {
    const level = meanTone[i]
    const light = lights[i]
    let color = ocean
    if (level > 12) {
      const coast =
        (i % width > 0 && meanTone[i - 1] <= 12) ||
        (i >= width && meanTone[i - width] <= 12)
      color = coast
        ? shoreline
        : land[level < 20 ? 0 : level < 30 ? 1 : level < 44 ? 2 : 3]
    }
    if (light > 60)
      color = city[light < 86 ? 0 : light < 127 ? 1 : light < 182 ? 2 : 3]
    const offset = i * 4
    data[offset] = color[0]
    data[offset + 1] = color[1]
    data[offset + 2] = color[2]
    // Transparent seas let the surrounding map grid continue through the oceans.
    data[offset + 3] = color === ocean ? 0 : 255
  }
}

function paintPlate(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  isBlackMarble: boolean,
) {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return false
  // The 2016 JPEG includes a credit strip below its 2:1 equirectangular map.
  const mapHeight = isBlackMarble
    ? Math.min(image.naturalWidth / 2, image.naturalHeight)
    : image.naturalHeight
  const ratio = image.naturalWidth / mapHeight
  canvas.width = Math.min(image.naturalWidth, 244)
  canvas.height = Math.max(1, Math.round(canvas.width / ratio))
  if (isBlackMarble) {
    const sampler = document.createElement('canvas')
    sampler.width = Math.min(image.naturalWidth, 1024)
    sampler.height = Math.round(sampler.width / ratio)
    const pixels = sampler.getContext('2d', { willReadFrequently: true })
    if (!pixels) return false
    pixels.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      mapHeight,
      0,
      0,
      sampler.width,
      sampler.height,
    )
    const plate = context.createImageData(canvas.width, canvas.height)
    renderNightPlate(
      pixels.getImageData(0, 0, sampler.width, sampler.height),
      plate,
    )
    context.putImageData(plate, 0, 0)
  } else {
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const plate = context.getImageData(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < plate.data.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        plate.data[i + channel] = Math.round(plate.data[i + channel] / 17) * 17
      }
    }
    context.putImageData(plate, 0, 0)
  }
  return true
}

function Plate({
  track,
  night,
  mode,
}: {
  track: Track
  night: boolean
  mode: Mode
}) {
  const image = useRef<HTMLImageElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const original = image.current
    const target = canvas.current
    if (!original || !target) return
    const render = () => {
      if (!original.naturalWidth) return
      try {
        setReady(paintPlate(target, original, night))
      } catch {
        setReady(false)
      } // If canvas readback is unavailable, retain the image and its text alternative.
    }
    if (original.complete) render()
    original.addEventListener('load', render)
    return () => original.removeEventListener('load', render)
  }, [night, track.image])

  const showPixel = mode === 'pixel' && ready
  return (
    <div className="plate-image" data-night={night} data-pixel={showPixel}>
      <img
        ref={image}
        src={track.image}
        alt={track.alt}
        className="plate-original"
      />
      <canvas ref={canvas} className="plate-canvas" aria-hidden="true" />
    </div>
  )
}

export function MapStage({ track }: StageProps) {
  const [mode, setMode] = useState<Mode>('pixel')
  return (
    <figure
      className="map-stage"
      aria-label={`Visualización de ${track.title}`}
    >
      <figcaption className="map-stage__caption">
        <span className="map-stage__source">
          <span className="map-stage__mark" aria-hidden="true" />
          {track.credit}
        </span>
        <div
          className="map-stage__modes"
          role="group"
          aria-label="Presentación de la imagen"
        >
          <button
            type="button"
            onClick={() => setMode('pixel')}
            aria-pressed={mode === 'pixel'}
          >
            Arte píxel
          </button>
          <button
            type="button"
            onClick={() => setMode('original')}
            aria-pressed={mode === 'original'}
          >
            Original NASA
          </button>
        </div>
      </figcaption>
      <div className="map-stage__field">
        <span className="map-stage__ruler" aria-hidden="true" />
        <Plate
          key={track.image}
          track={track}
          night={track.id === 'luces-nocturnas'}
          mode={mode}
        />
        <i
          className="map-stage__corner map-stage__corner--nw"
          aria-hidden="true"
        />
        <i
          className="map-stage__corner map-stage__corner--ne"
          aria-hidden="true"
        />
        <i
          className="map-stage__corner map-stage__corner--sw"
          aria-hidden="true"
        />
        <i
          className="map-stage__corner map-stage__corner--se"
          aria-hidden="true"
        />
      </div>
    </figure>
  )
}

export default MapStage
