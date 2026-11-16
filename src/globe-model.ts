const COLUMNS = 360
const ROWS = 180
const HEIGHT_SCALE = 0.0007 // Exaggerated display scale, not Earth-scale metres.

const vertexSource = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aUv;
  uniform float uAngle;
  uniform float uAspect;
  varying vec3 vNormal;
  varying vec2 vUv;
  vec3 turn(vec3 p) {
    float c = cos(uAngle), s = sin(uAngle);
    vec3 r = vec3(p.x*c + p.z*s, p.y, -p.x*s + p.z*c);
    float tilt = 0.12;
    return vec3(r.x, r.y*cos(tilt)-r.z*sin(tilt), r.y*sin(tilt)+r.z*cos(tilt));
  }
  void main() {
    vec3 p = turn(aPosition);
    vNormal = turn(aNormal);
    vUv = aUv;
    gl_Position = vec4(p.x * 0.88 / uAspect, p.y * 0.88, -p.z * 0.4, 1.0);
  }
`

const fragmentSource = `
  precision mediump float;
  uniform sampler2D uData;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vec4 sample = texture2D(uData, vUv);
    vec3 color = vec3(0.12, 0.36, 0.48);
    if (sample.r > 0.5) {
      color = vec3(0.46, 0.47, 0.44);
      if (sample.b > 0.5) {
        float h = sample.g * 127.5;
        vec3 low = vec3(0.29, 0.27, 0.16);
        vec3 medium = vec3(0.28, 0.48, 0.20);
        vec3 high = vec3(0.62, 0.74, 0.31);
        vec3 tall = vec3(0.93, 0.92, 0.67);
        color = h < 20.0 ? mix(low, medium, h / 20.0)
          : h < 40.0 ? mix(medium, high, (h - 20.0) / 20.0)
          : mix(high, tall, clamp((h - 40.0) / 30.0, 0.0, 1.0));
      }
    }
    float light = max(0.0, dot(normalize(vNormal), normalize(vec3(-0.45, 0.65, 1.0))));
    gl_FragColor = vec4(color * (0.46 + 0.62 * light), 1.0);
  }
`

export function createGlobeModel(canvas: HTMLCanvasElement, data: HTMLImageElement) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false })
  if (!gl) throw new Error('WebGL unavailable')
  const resources: WebGLBuffer[] = []
  const shaders: WebGLShader[] = []
  const program = gl.createProgram()!
  const texture = gl.createTexture()!

  function dispose() {
    resources.forEach(buffer => gl!.deleteBuffer(buffer))
    shaders.forEach(shader => gl!.deleteShader(shader))
    gl!.deleteTexture(texture)
    gl!.deleteProgram(program)
  }

  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type)!
      shaders.push(shader)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Shader failed')
      gl.attachShader(program, shader)
    }
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Globe program failed')
    gl.useProgram(program)

    const sampler = document.createElement('canvas')
    sampler.width = data.naturalWidth
    sampler.height = data.naturalHeight
    const context = sampler.getContext('2d', { willReadFrequently: true })!
    context.drawImage(data, 0, 0)
    const pixels = context.getImageData(0, 0, sampler.width, sampler.height).data
    const positions = new Float32Array((COLUMNS + 1) * (ROWS + 1) * 3)
    const normals = new Float32Array(positions.length)
    const uvs = new Float32Array((COLUMNS + 1) * (ROWS + 1) * 2)
    const indices = new Uint16Array(COLUMNS * ROWS * 6)

    for (let row = 0; row <= ROWS; row++) {
      const latitude = Math.PI / 2 - row / ROWS * Math.PI
      for (let column = 0; column <= COLUMNS; column++) {
        const longitude = column / COLUMNS * Math.PI * 2 - Math.PI
        const i = row * (COLUMNS + 1) + column
        const x = Math.floor(column % COLUMNS / COLUMNS * sampler.width)
        const y = Math.min(sampler.height - 1, Math.floor(row / ROWS * sampler.height))
        const p = (y * sampler.width + x) * 4
        const height = pixels[p + 2] > 127 ? pixels[p + 1] / 2 : 0
        const radius = 1 + height * HEIGHT_SCALE
        positions.set([Math.cos(latitude) * Math.sin(longitude) * radius, Math.sin(latitude) * radius, Math.cos(latitude) * Math.cos(longitude) * radius], i * 3)
        uvs.set([column / COLUMNS, row / ROWS], i * 2)
      }
    }
    let count = 0
    for (let row = 0; row < ROWS; row++) {
      for (let column = 0; column < COLUMNS; column++) {
        const a = row * (COLUMNS + 1) + column
        const b = a + COLUMNS + 1
        indices.set([a, b, a + 1, a + 1, b, b + 1], count)
        count += 6
      }
    }
    // Area-weighted vertex normals preserve the measured relief under lighting.
    for (let i = 0; i < indices.length; i += 3) {
      const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3
      const ax = positions[b] - positions[a], ay = positions[b + 1] - positions[a + 1], az = positions[b + 2] - positions[a + 2]
      const bx = positions[c] - positions[a], by = positions[c + 1] - positions[a + 1], bz = positions[c + 2] - positions[a + 2]
      const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx
      for (const index of [a, b, c]) {
        normals[index] += nx
        normals[index + 1] += ny
        normals[index + 2] += nz
      }
    }
    // The duplicated UV seam must share a normal so it is invisible under light.
    for (let row = 0; row <= ROWS; row++) {
      const left = row * (COLUMNS + 1) * 3
      const right = (row * (COLUMNS + 1) + COLUMNS) * 3
      for (let axis = 0; axis < 3; axis++) {
        const value = normals[left + axis] + normals[right + axis]
        normals[left + axis] = value
        normals[right + axis] = value
      }
    }
    for (let i = 0; i < normals.length; i += 3) {
      const length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1
      normals[i] /= length
      normals[i + 1] /= length
      normals[i + 2] /= length
    }
    for (const [name, values, size] of [['aPosition', positions, 3], ['aNormal', normals, 3], ['aUv', uvs, 2]] as const) {
      const buffer = gl.createBuffer()!
      resources.push(buffer)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, values, gl.STATIC_DRAW)
      const location = gl.getAttribLocation(program, name)
      gl.enableVertexAttribArray(location)
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0)
    }
    const indexBuffer = gl.createBuffer()!
    resources.push(indexBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    // UV v=0 is north, matching row zero of the georeferenced PNG.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.uniform1i(gl.getUniformLocation(program, 'uData'), 0)
    gl.enable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 0)
    const angleLocation = gl.getUniformLocation(program, 'uAngle')
    const aspectLocation = gl.getUniformLocation(program, 'uAspect')

    return {
      draw(angle: number) {
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(angleLocation, angle)
        gl.uniform1f(aspectLocation, canvas.width / canvas.height)
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
      },
      dispose,
    }
  } catch (error) {
    dispose()
    throw error
  }
}
