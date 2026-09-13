import { constants, copyFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

function arquivosEm(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name)
    if (entrada.isDirectory()) return arquivosEm(caminho)
    return entrada.isFile() ? [caminho] : []
  })
}

export function conferirExportacao(pasta, urlBase) {
  const raiz = resolve(pasta)
  const arquivos = arquivosEm(raiz)
  let segmentos = 0

  // Next 16.3.4 usa path.relative no export e só substitui barras POSIX no
  // nome público do segmento. No Windows, o cliente pede um arquivo plano
  // que saiu em subpastas. Materializamos o nome público sem alterar o Next,
  // sem apagar originais e sem sobrescrever um destino de conteúdo diferente.
  for (const arquivo of arquivos) {
    const partes = relative(raiz, arquivo).split(sep)
    const inicio = partes.findIndex((parte) => parte.startsWith('__next.'))
    if (inicio < 0 || inicio === partes.length - 1 || !arquivo.endsWith('.txt')) continue
    const destino = join(raiz, ...partes.slice(0, inicio), partes.slice(inicio).join('.'))
    if (existsSync(destino)) {
      if (!readFileSync(destino).equals(readFileSync(arquivo))) {
        throw new Error(`Segmentos conflitantes: ${relative(raiz, destino)}`)
      }
      continue
    }
    copyFileSync(arquivo, destino, constants.COPYFILE_EXCL)
    segmentos++
  }

  const base = new URL(urlBase.replace(/\/+$/, '') + '/')
  const htmls = arquivos.filter((arquivo) => arquivo.endsWith('.html'))
  if (!htmls.length) throw new Error('A exportação não contém nenhuma página HTML.')
  let referencias = 0
  for (const arquivo of htmls) {
    const html = readFileSync(arquivo, 'utf8')
    const caminho = relative(raiz, arquivo)
      .split(sep)
      .join('/')
      .replace(/index\.html$/, '')
    const origem = new URL(caminho, base)
    for (const achado of html.matchAll(
      /<(?:a|link|script|img|source)\b[^>]*?\b(?:href|src)="([^"]+)"/g,
    )) {
      const url = new URL(achado[1].replaceAll('&amp;', '&'), origem)
      if (url.origin !== base.origin) continue
      if (!url.pathname.startsWith(base.pathname)) {
        throw new Error(
          `${relative(raiz, arquivo)}: referência fora do caminho publicado: ${url.pathname}`,
        )
      }
      let destino = resolve(raiz, decodeURIComponent(url.pathname.slice(base.pathname.length)))
      if (destino !== raiz && !destino.startsWith(raiz + sep)) {
        throw new Error(`Referência fora da exportação: ${url.pathname}`)
      }
      if (existsSync(destino) && statSync(destino).isDirectory())
        destino = join(destino, 'index.html')
      if (!existsSync(destino)) {
        throw new Error(`${relative(raiz, arquivo)}: arquivo ausente: ${url.pathname}`)
      }
      if (url.hash && destino.endsWith('.html')) {
        const id = decodeURIComponent(url.hash.slice(1))
        const destinoHtml = readFileSync(destino, 'utf8')
        if (!destinoHtml.includes(`id="${id}"`)) {
          throw new Error(`${relative(raiz, arquivo)}: âncora ausente: ${url.pathname}${url.hash}`)
        }
      }
      referencias++
    }
  }
  return { paginas: htmls.length, referencias, segmentos }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const projeto = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const site = JSON.parse(readFileSync(join(projeto, 'conteudo/site.json'), 'utf8'))
  const resultado = conferirExportacao(join(projeto, 'out'), site.meta.urlBase)
  console.log(
    `Exportação conferida: ${resultado.paginas} páginas, ${resultado.referencias} referências locais, ` +
      `${resultado.segmentos} segmentos normalizados.`,
  )
}
