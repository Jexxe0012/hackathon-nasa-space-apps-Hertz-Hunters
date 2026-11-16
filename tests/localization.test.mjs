import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { test } from 'node:test'
import ts from 'typescript'

const root = path.resolve(import.meta.dirname, '..')
const cache = new Map()
function loadSource(relative) {
  const filename = path.resolve(root, relative)
  if (cache.has(filename)) return cache.get(filename)
  const source = fs.readFileSync(filename, 'utf8').replaceAll('import.meta.env.BASE_URL', "'/'")
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const module = { exports: {} }
  const require = name => loadSource(path.relative(root, path.resolve(path.dirname(filename), name + '.ts')))
  vm.runInNewContext('(function(require, module, exports) {' + js + '\n})', {}, { filename })(require, module, module.exports)
  cache.set(filename, module.exports)
  return module.exports
}

const { translateText, speechLanguage, narrationVoice } = loadSource('src/translations.ts')
const { spanishMessages } = loadSource('src/messages.ts')
const { tracks, getTracks } = loadSource('src/data.ts')

test('English is the source language and Spanish is explicit', () => {
  assert.equal(translateText('en', 'Play'), 'Play')
  assert.equal(translateText('es', 'Play'), 'Reproducir')
  assert.equal(translateText('es', '{volume} percent', { volume: 65 }), '65 por ciento')
  assert.equal(translateText('en', '{volume} percent', { volume: 65 }), '65 percent')
})

test('translations preserve every named placeholder', () => {
  const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
  for (const [english, spanish] of Object.entries(spanishMessages))
    assert.deepEqual(placeholders(spanish), placeholders(english), english)
})

test('every literal UI message has a Spanish translation', () => {
  const missing = new Set()
  for (const file of fs.readdirSync(path.join(root, 'src')).filter(file => /\.tsx?$/.test(file))) {
    const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, 'src', file), 'utf8'), ts.ScriptTarget.Latest, true)
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(source) === 't') {
        const message = node.arguments[0]
        if (message && ts.isStringLiteral(message) && !(message.text in spanishMessages)) missing.add(message.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  assert.deepEqual([...missing], [])
})

test('all four datasets, stories and guides switch language without changing their identity or sources', () => {
  const spanish = getTracks('es')
  assert.equal(tracks.length, 4)
  tracks.forEach((english, index) => {
    const localized = spanish[index]
    for (const key of ['id', 'source', 'scene', 'image', 'audio']) assert.equal(localized[key], english[key])
    for (const key of ['title', 'shortTitle', 'kind', 'variable', 'unit', 'pattern', 'limit', 'alt']) {
      assert.ok(english[key] in spanishMessages, key + ': ' + english[key])
      assert.equal(localized[key], translateText('es', english[key]))
    }
    for (const key of ['title', 'teaser', 'introduction', 'listenFor', 'action']) {
      assert.ok(english.story[key] in spanishMessages, key + ': ' + english.story[key])
      assert.equal(localized.story[key], translateText('es', english.story[key]))
    }
    english.guide.forEach((text, guideIndex) => {
      assert.ok(text in spanishMessages, text)
      assert.equal(localized.guide[guideIndex], translateText('es', text))
    })
  })
  assert.equal(getTracks('en'), tracks)
})

test('narration requests the selected language and never selects a voice from the other language', () => {
  const voices = [{ lang: 'es-ES', name: 'Spanish' }, { lang: 'en-GB', name: 'British English' }, { lang: 'en-US', name: 'US English' }]
  assert.equal(speechLanguage('en'), 'en-US')
  assert.equal(speechLanguage('es'), 'es-ES')
  assert.equal(narrationVoice(voices, 'en').name, 'US English')
  assert.equal(narrationVoice(voices, 'es').name, 'Spanish')
  assert.equal(narrationVoice(voices.slice(0, 2), 'en').name, 'British English')
  assert.equal(narrationVoice(voices.slice(0, 1), 'en'), undefined)
})

function sceneBridge(search, stored) {
  const window = {}
  vm.runInNewContext(fs.readFileSync(path.join(root, 'public/sonido/comun/incrustado.js'), 'utf8'), {
    window, URLSearchParams, location: { search }, localStorage: { getItem: () => stored, setItem: () => {} },
  })
  return window.EIJ
}

test('standalone sound scenes default to English, honor Spanish, and validate URL preferences', () => {
  assert.equal(sceneBridge('', null).idiomaInicial(), 'en')
  assert.equal(sceneBridge('', 'es').idiomaInicial(), 'es')
  assert.equal(sceneBridge('?lang=en', 'es').idiomaInicial(), 'en')
  assert.equal(sceneBridge('?lang=es', null).idiomaInicial(), 'es')
  assert.equal(sceneBridge('?lang=fr', 'fr').idiomaInicial(), 'en')
})
