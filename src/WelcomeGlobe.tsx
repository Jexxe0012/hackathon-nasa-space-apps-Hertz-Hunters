import { useEffect, useRef, useState } from 'react'
import { createGlobeModel } from './globe-model'

type Props = { reducedMotion: boolean; forestImage: string }
const initialAngle = -20 * Math.PI / 180

export function WelcomeGlobe({ reducedMotion, forestImage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const modelRef = useRef<ReturnType<typeof createGlobeModel> | null>(null)
  const angleRef = useRef(initialAngle)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [visible, setVisible] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const [systemReduced, setSystemReduced] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const motionOff = reducedMotion || systemReduced

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setSystemReduced(preference.matches)
    const updateVisibility = () => setHidden(document.hidden)
    preference.addEventListener('change', updateMotion)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      preference.removeEventListener('change', updateMotion)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false
    setReady(false)
    setError(false)
    const image = new Image()
    image.src = `${import.meta.env.BASE_URL}media/globe-geodata.png`
    image.decode().then(() => {
      if (disposed) return
      try {
        modelRef.current = createGlobeModel(canvas, image)
        resize()
        setReady(true)
      } catch {
        setError(true)
      }
    }).catch(() => { if (!disposed) setError(true) })

    function resize() {
      if (!canvas) return
      const size = Math.max(1, Math.round(canvas.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2)))
      canvas.width = size
      canvas.height = size
      modelRef.current?.draw(angleRef.current)
    }
    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    resizeObserver.observe(canvas)
    visibilityObserver.observe(canvas)
    const onLost = (event: Event) => {
      event.preventDefault()
      setReady(false)
      setError(true)
    }
    const onRestored = () => setAttempt(value => value + 1)
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    return () => {
      disposed = true
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      modelRef.current?.dispose()
      modelRef.current = null
    }
  }, [attempt])

  useEffect(() => {
    if (!ready || paused || motionOff || !visible || hidden) return
    let frame = 0
    let last = 0
    function tick(time: number) {
      if (!last) last = time
      if (time - last >= 1000 / 30) {
        angleRef.current = (angleRef.current - Math.min(time - last, 100) * 0.00011) % (Math.PI * 2)
        modelRef.current?.draw(angleRef.current)
        last = time
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ready, paused, motionOff, visible, hidden])

  function turn() {
    angleRef.current -= Math.PI / 2
    modelRef.current?.draw(angleRef.current)
  }

  return (
    <figure className="welcome__visual">
      <div className="welcome__globe" data-ready={ready} aria-hidden="true">
        <img src={forestImage} alt="" />
        <canvas ref={canvasRef} width="680" height="680" />
      </div>
      <figcaption>
        Altura estimada del dosel · GEDI, abril–julio de 2019
        <span>Relieve exagerado. Zonas grises: sin mediciones.</span>
        <a href="https://doi.org/10.5281/zenodo.5704852" target="_blank" rel="noreferrer">Fuente de los datos del globo</a>
      </figcaption>
      {ready && <>
        <div className="welcome__globe-legend" role="img" aria-label="Escala de altura: de cero a setenta metros, de marrón a verde y amarillo claro.">
          <span aria-hidden="true" />
          <div aria-hidden="true"><span>0 m</span><span>70 m</span></div>
        </div>
        <div className="welcome__globe-actions" role="group" aria-label="Controles del globo">
          {!motionOff && <button className="welcome__globe-control" type="button" onClick={() => setPaused(!paused)}>
            {paused ? 'Reanudar giro' : 'Pausar giro'}
          </button>}
          <button className="welcome__globe-control" type="button" onClick={turn}>Ver otro lado</button>
        </div>
      </>}
      {error && <p className="welcome__globe-error" role="status">
        No se pudo cargar el giro. Se muestra la imagen original.
        <button className="welcome__globe-control" type="button" onClick={() => setAttempt(value => value + 1)}>Reintentar</button>
      </p>}
    </figure>
  )
}
