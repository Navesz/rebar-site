import { strict as assert } from 'node:assert'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { conferirExportacao } from '../ferramental/conferir-exportacao.mjs'

const BASE = 'https://exemplo.invalid/site'

function exportacao(t) {
  const pasta = mkdtempSync(join(tmpdir(), 'rebar-exportacao-'))
  t.after(() => rmSync(pasta, { recursive: true, force: true }))
  writeFileSync(join(pasta, 'index.html'), '<h1 id="inicio">Início</h1>')
  return pasta
}

test('segmentos aninhados ficam acessíveis pelo nome que o navegador solicita', (t) => {
  const pasta = exportacao(t)
  mkdirSync(join(pasta, '__next.$d$idioma', 'docs'), { recursive: true })
  writeFileSync(join(pasta, '__next.$d$idioma', 'docs', '__PAGE__.txt'), 'segmento original')
  const resultado = conferirExportacao(pasta, BASE)
  assert.equal(resultado.segmentos, 1)
  assert.equal(
    readFileSync(join(pasta, '__next.$d$idioma.docs.__PAGE__.txt'), 'utf8'),
    'segmento original',
  )
  assert.equal(conferirExportacao(pasta, BASE).segmentos, 0)
})

test('exportação que já tem nomes planos é preservada; conflito de conteúdo reprova', (t) => {
  const pasta = exportacao(t)
  writeFileSync(join(pasta, '__next.grupo.__PAGE__.txt'), 'correto')
  assert.equal(conferirExportacao(pasta, BASE).segmentos, 0)
  mkdirSync(join(pasta, '__next.grupo'))
  writeFileSync(join(pasta, '__next.grupo', '__PAGE__.txt'), 'diferente')
  assert.throws(() => conferirExportacao(pasta, BASE), /Segmentos conflitantes/)
  assert.equal(readFileSync(join(pasta, '__next.grupo.__PAGE__.txt'), 'utf8'), 'correto')
})

test('link local, âncora e recurso ausentes impedem aprovação da exportação', (t) => {
  const pasta = exportacao(t)
  for (const html of [
    '<a href="/site/ausente/">Ausente</a>',
    '<a href="#ausente">Ausente</a>',
    '<script src="/site/ausente.js"></script>',
    '<link href="/fora.css" rel="stylesheet">',
  ]) {
    writeFileSync(join(pasta, 'index.html'), html)
    assert.throws(() => conferirExportacao(pasta, BASE), /ausente|fora do caminho/)
  }
})

test('links relativos, consultas, âncoras e referências externas são aceitos', (t) => {
  const pasta = exportacao(t)
  mkdirSync(join(pasta, 'docs'))
  writeFileSync(join(pasta, 'docs', 'index.html'), '<h1 id="instalacao">Instalação</h1>')
  writeFileSync(join(pasta, 'estilo.css'), 'body {}')
  writeFileSync(
    join(pasta, 'index.html'),
    '<a href="docs/?a=1&amp;b=2#instalacao">Docs</a><link href="/site/estilo.css?v=1" rel="stylesheet"><a href="https://externo.invalid/">Externo</a>',
  )
  assert.deepEqual(conferirExportacao(pasta, BASE), { paginas: 2, referencias: 2, segmentos: 0 })
})
