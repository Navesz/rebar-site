#!/usr/bin/env node
// GERA OS ÍCONES E O CARTÃO DE COMPARTILHAMENTO, sem dependência nenhuma.
//
// Por que rasterizar à mão em vez de instalar `sharp` ou `resvg`: a casa não
// aceita dependência para o que um built-in resolve, e PNG é literalmente
// buffer RGBA + `zlib.deflateSync` + CRC32. O `sharp` existe em
// `node_modules` como dependência transitiva do Next, mas depender do que
// não está declarado é pior que declarar: some numa atualização e ninguém
// entende por quê.
//
// A geometria não mora aqui — mora em `lib/marca.ts`, e é a MESMA que o
// componente React desenha. Node 24 apaga os tipos na importação, então o
// script lê o `.ts` direto, sem passo de build.
//
// Rode assim, da raiz do projeto:
//   node ferramental/gerar-icones.mjs
//
// Ele reescreve: public/icone-192.png, public/icone-512.png, public/og.png,
// app/apple-icon.png, app/icon.svg e public/marca.svg.

import { deflateSync } from "node:zlib"
import { writeFileSync, readFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { FORMAS, LADO, RAIO_DO_LADRILHO } from "../lib/marca.ts"

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..")

// ───────────────────────────────────────────────────────────── cor
//
// As cores nascem em oklch, no mesmo espaço em que `app/globals.css` declara
// os tokens — assim o ícone e o site falam da mesma cor, e não de duas que
// só parecem iguais no monitor de quem escolheu.

function oklchParaRgb(L, C, Hgraus) {
  const h = (Hgraus * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3

  const lineares = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]

  return lineares.map((v) => {
    const g = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
    return Math.max(0, Math.min(255, Math.round(g * 255)))
  })
}

// Os três tons da marca, COPIADOS do tema escuro de `app/globals.css` —
// `--background`, `--brand` e `--foreground` do bloco `.dark`. O ícone tem
// fundo próprio e é visto sobre a barra do navegador, do dock ou do feed, que
// são escuros com muito mais frequência do que claros; usar o tema claro aqui
// daria um ladrilho branco que some no fundo branco de todo lugar.
const ACO = oklchParaRgb(0.178, 0.013, 258)
const OXIDO = oklchParaRgb(0.715, 0.155, 54)
const GELO = oklchParaRgb(0.962, 0.005, 255)

// ───────────────────────────────────────────────────────── rasterizador
//
// Cobertura por distância com sinal: para cada pixel, mede a distância até a
// borda de cada barra e converte em opacidade. Sai antisserrilhado de graça e
// exato em qualquer tamanho — supersampling daria o mesmo resultado gastando
// dezesseis vezes mais conta.

function distanciaAteBarra(px, py, barra) {
  const cx = barra.x + barra.largura / 2
  const cy = barra.y + barra.altura / 2

  let dx = px - cx
  let dy = py - cy

  if (barra.giro) {
    const t = (-barra.giro * Math.PI) / 180
    const cos = Math.cos(t)
    const sen = Math.sin(t)
    const rx = dx * cos - dy * sen
    dy = dx * sen + dy * cos
    dx = rx
  }

  const r = barra.raio
  const qx = Math.abs(dx) - barra.largura / 2 + r
  const qy = Math.abs(dy) - barra.altura / 2 + r
  const fora = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
  return fora + Math.min(Math.max(qx, qy), 0) - r
}

// Distância até um quadrado de canto arredondado — o ladrilho do ícone.
function distanciaAteLadrilho(px, py, lado, raio) {
  return distanciaAteBarra(px, py, {
    x: 0,
    y: 0,
    largura: lado,
    altura: lado,
    raio,
  })
}

function coberturaDaMarca(px, py, unidadesPorPixel) {
  let a = 0
  for (const forma of FORMAS) {
    const d = distanciaAteBarra(px, py, forma.barra)
    const ai = Math.max(0, Math.min(1, 0.5 - d / unidadesPorPixel))
    a = forma.operacao === "tinta" ? Math.max(a, ai) : Math.min(a, 1 - ai)
  }
  return a
}

// ───────────────────────────────────────────────────────── alfabeto
//
// "REBAR" desenhado com as mesmas barras da marca — o wordmark é vergalhão
// dobrado, não uma fonte emprestada. Cada letra é descrita numa caixa 60×84
// e devolve barras já deslocadas para a posição pedida.

const T = 14 // bitola do wordmark
const RW = 2.5

function letra(nome, x, y, alturaDaCaixa) {
  const e = alturaDaCaixa / 84 // escala a partir da caixa de desenho
  const t = T * e
  const r = RW * e
  const l = 60 * e
  const h = alturaDaCaixa
  const barra = (bx, by, bl, ba) => ({
    x: x + bx,
    y: y + by,
    largura: bl,
    altura: ba,
    raio: r,
  })
  const meio = (h - t) / 2

  switch (nome) {
    case "R":
      return [
        barra(0, 0, t, h),
        barra(0, 0, l, t),
        barra(l - t, 0, t, meio + t),
        barra(0, meio, l, t),
        // A perna sai de baixo do arco e vai até a linha de base, na mesma
        // proporção da perna da marca — o wordmark é a marca escrita.
        entreBarras(x + l * 0.5, y + h * 0.6, x + l * 0.9, y + h * 0.93, t, r),
      ]
    case "E":
      return [
        barra(0, 0, t, h),
        barra(0, 0, l, t),
        barra(0, meio, l * 0.86, t),
        barra(0, h - t, l, t),
      ]
    case "B":
      return [
        barra(0, 0, t, h),
        barra(0, 0, l, t),
        barra(l - t, 0, t, meio + t),
        barra(0, meio, l, t),
        barra(l - t, meio, t, h - meio),
        barra(0, h - t, l, t),
      ]
    case "A":
      return [
        barra(0, t * 0.9, t, h - t * 0.9),
        barra(0, 0, l, t),
        barra(l - t, 0, t, h),
        barra(0, meio, l, t),
      ]
    default:
      throw new Error(`letra sem desenho: ${nome}`)
  }
}

function entreBarras(x1, y1, x2, y2, espessura, raio) {
  const comprimento = Math.hypot(x2 - x1, y2 - y1) + espessura
  const giro = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return {
    x: (x1 + x2) / 2 - comprimento / 2,
    y: (y1 + y2) / 2 - espessura / 2,
    largura: comprimento,
    altura: espessura,
    raio,
    giro,
  }
}

function palavra(texto, x, y, altura, espaco) {
  const largura = (60 * altura) / 84
  const barras = []
  let cursor = x
  for (const c of texto) {
    barras.push(...letra(c, cursor, y, altura))
    cursor += largura + espaco
  }
  return { barras, largura: cursor - x - espaco }
}

function coberturaDeBarras(px, py, barras, unidadesPorPixel) {
  let a = 0
  for (const b of barras) {
    const d = distanciaAteBarra(px, py, b)
    a = Math.max(a, Math.max(0, Math.min(1, 0.5 - d / unidadesPorPixel)))
  }
  return a
}

// ───────────────────────────────────────────────────────────── png

const TABELA_CRC = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = TABELA_CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pedaco(tipo, dados) {
  const tamanho = Buffer.alloc(4)
  tamanho.writeUInt32BE(dados.length)
  const corpo = Buffer.concat([Buffer.from(tipo, "latin1"), dados])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(corpo))
  return Buffer.concat([tamanho, corpo, crc])
}

function montarPng(largura, altura, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(largura, 0)
  ihdr.writeUInt32BE(altura, 4)
  ihdr[8] = 8 // bits por canal
  ihdr[9] = 6 // RGBA
  const linhas = Buffer.alloc(altura * (largura * 4 + 1))
  for (let y = 0; y < altura; y++) {
    const destino = y * (largura * 4 + 1)
    linhas[destino] = 0 // filtro "nenhum": o desenho é liso, filtrar não paga
    rgba.copy(linhas, destino + 1, y * largura * 4, (y + 1) * largura * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pedaco("IHDR", ihdr),
    pedaco("IDAT", deflateSync(linhas, { level: 9 })),
    pedaco("IEND", Buffer.alloc(0)),
  ])
}

function escreverPng(caminho, largura, altura, rgba) {
  writeFileSync(caminho, montarPng(largura, altura, rgba))
}

// O `.ico` existe por um motivo só: Safari antigo e leitores de feed ainda
// pedem `/favicon.ico` e ignoram o `icon.svg`. O contêiner aqui carrega PNG
// dentro (suportado desde o Windows Vista), e não bitmap DIB — DIB exigiria
// máscara AND invertida e paleta, 300 linhas para servir navegador que já não
// existe.
function escreverIco(caminho, tamanhos) {
  const imagens = tamanhos.map((t) => montarPng(t, t, rasterizarIcone(t)))

  const cabecalho = Buffer.alloc(6 + imagens.length * 16)
  cabecalho.writeUInt16LE(0, 0) // reservado
  cabecalho.writeUInt16LE(1, 2) // 1 = ícone
  cabecalho.writeUInt16LE(imagens.length, 4)

  let deslocamento = cabecalho.length
  imagens.forEach((png, i) => {
    const e = 6 + i * 16
    // 0 quer dizer 256 neste campo de um byte só; os tamanhos aqui são menores.
    cabecalho[e] = tamanhos[i] % 256
    cabecalho[e + 1] = tamanhos[i] % 256
    cabecalho.writeUInt16LE(1, e + 4) // planos
    cabecalho.writeUInt16LE(32, e + 6) // bits por pixel
    cabecalho.writeUInt32LE(png.length, e + 8)
    cabecalho.writeUInt32LE(deslocamento, e + 12)
    deslocamento += png.length
  })

  writeFileSync(caminho, Buffer.concat([cabecalho, ...imagens]))
}

function misturar(alvo, i, cor, alfa) {
  if (alfa <= 0) return
  for (let c = 0; c < 3; c++) {
    alvo[i + c] = Math.round(alvo[i + c] * (1 - alfa) + cor[c] * alfa)
  }
  alvo[i + 3] = Math.round(alvo[i + 3] * (1 - alfa) + 255 * alfa)
}

// ───────────────────────────────────────────────────────────── ícone

function rasterizarIcone(tamanho) {
  const rgba = Buffer.alloc(tamanho * tamanho * 4)
  const unidades = LADO / tamanho // unidades de desenho por pixel
  // A marca ocupa 76% do ladrilho, centrada — margem menor que essa faz o R
  // encostar no canto arredondado quando o sistema operacional corta o ícone.
  const escala = 0.76
  const deslocamento = (LADO * (1 - escala)) / 2

  for (let y = 0; y < tamanho; y++) {
    for (let x = 0; x < tamanho; x++) {
      const px = (x + 0.5) * unidades
      const py = (y + 0.5) * unidades
      const i = (y * tamanho + x) * 4

      const dLadrilho = distanciaAteLadrilho(px, py, LADO, RAIO_DO_LADRILHO)
      const aFundo = Math.max(0, Math.min(1, 0.5 - dLadrilho / unidades))
      misturar(rgba, i, ACO, aFundo)

      const mx = (px - deslocamento) / escala
      const my = (py - deslocamento) / escala
      const aMarca = coberturaDaMarca(mx, my, unidades / escala)
      misturar(rgba, i, OXIDO, aMarca * aFundo)
    }
  }

  return rgba
}

function gerarIcone(caminho, tamanho) {
  escreverPng(caminho, tamanho, tamanho, rasterizarIcone(tamanho))
  return `${caminho} (${tamanho}×${tamanho})`
}

// ───────────────────────────────────────────────────────── cartão og

function gerarOg(caminho, site) {
  const largura = 1200
  const altura = 630
  const rgba = Buffer.alloc(largura * altura * 4)

  // Fundo de aço com a nervura do vergalhão em diagonal, quase imperceptível:
  // dá textura sem competir com a marca na miniatura do feed.
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = (y * largura + x) * 4
      const faixa = ((x + y * 1.6) % 34) / 34
      const brilho = faixa < 0.5 ? 1.06 : 0.97
      rgba[i] = Math.min(255, Math.round(ACO[0] * brilho))
      rgba[i + 1] = Math.min(255, Math.round(ACO[1] * brilho))
      rgba[i + 2] = Math.min(255, Math.round(ACO[2] * brilho))
      rgba[i + 3] = 255
    }
  }

  // A composição fica centrada na altura do cartão: o recorte que o feed mostra
  // corta as bordas, não o meio.
  const marcaLado = 220
  const marcaX = 120
  const marcaY = (altura - marcaLado) / 2
  const nome = site.identidade.nome.toUpperCase()
  const alturaDaLetra = 96
  const { barras } = palavra(
    nome,
    400,
    altura / 2 - alturaDaLetra / 2 - 18,
    alturaDaLetra,
    22
  )

  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const i = (y * largura + x) * 4

      const mx = ((x + 0.5 - marcaX) * LADO) / marcaLado
      const my = ((y + 0.5 - marcaY) * LADO) / marcaLado
      if (mx > -4 && mx < LADO + 4 && my > -4 && my < LADO + 4) {
        misturar(rgba, i, OXIDO, coberturaDaMarca(mx, my, LADO / marcaLado))
      }

      misturar(rgba, i, GELO, coberturaDeBarras(x + 0.5, y + 0.5, barras, 1))
    }
  }

  // A régua sob o wordmark: a mesma cor da marca, fina, do começo do texto até
  // a largura da caixa de desenho.
  const yDaRegua = Math.round(altura / 2 + alturaDaLetra / 2 + 18)
  for (let y = yDaRegua; y < yDaRegua + 6; y++) {
    for (let x = 400; x < 880; x++) {
      misturar(rgba, (y * largura + x) * 4, OXIDO, 1)
    }
  }

  escreverPng(caminho, largura, altura, rgba)
  return `${caminho} (${largura}×${altura})`
}

// ───────────────────────────────────────────────────────────── svg

function svgDaMarca({ comLadrilho }) {
  const tinta = FORMAS.filter((f) => f.operacao === "tinta")
  const corte = FORMAS.filter((f) => f.operacao === "corte")

  const rect = (b, cor) => {
    const giro = b.giro
      ? ` transform="rotate(${b.giro.toFixed(3)} ${(
          b.x +
          b.largura / 2
        ).toFixed(3)} ${(b.y + b.altura / 2).toFixed(3)})"`
      : ""
    return `<rect x="${b.x.toFixed(3)}" y="${b.y.toFixed(3)}" width="${b.largura.toFixed(
      3
    )}" height="${b.altura.toFixed(3)}" rx="${b.raio}" fill="${cor}"${giro}/>`
  }

  const marca = [
    `<mask id="nervuras">`,
    `<rect width="${LADO}" height="${LADO}" fill="white"/>`,
    ...corte.map((f) => rect(f.barra, "black")),
    `</mask>`,
    `<g mask="url(#nervuras)">`,
    ...tinta.map((f) =>
      rect(f.barra, comLadrilho ? "var(--oxido)" : "currentColor")
    ),
    `</g>`,
  ].join("")

  const fundo = comLadrilho
    ? `<rect width="${LADO}" height="${LADO}" rx="${RAIO_DO_LADRILHO}" fill="var(--aco)"/>`
    : ""

  const variaveis = comLadrilho
    ? `<style>:root{--aco:rgb(${ACO.join(" ")});--oxido:rgb(${OXIDO.join(" ")})}</style>`
    : ""

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LADO} ${LADO}">${variaveis}${fundo}${marca}</svg>\n`
}

// ───────────────────────────────────────────────────────────── porta

const site = JSON.parse(
  readFileSync(join(RAIZ, "conteudo", "site.json"), "utf8")
)

mkdirSync(join(RAIZ, "public"), { recursive: true })

const feitos = [
  gerarIcone(join(RAIZ, "public", "icone-192.png"), 192),
  gerarIcone(join(RAIZ, "public", "icone-512.png"), 512),
  gerarIcone(join(RAIZ, "app", "apple-icon.png"), 180),
  gerarOg(join(RAIZ, "public", "og.png"), site),
]

// Três tamanhos e não um: 16 é a aba, 32 é a aba em tela retina e o atalho da
// barra de tarefas, 48 é o atalho na área de trabalho. Deixar o sistema
// reduzir o de 48 para 16 borra as nervuras num cinza sujo.
escreverIco(join(RAIZ, "app", "favicon.ico"), [16, 32, 48])
feitos.push("app/favicon.ico")

writeFileSync(join(RAIZ, "app", "icon.svg"), svgDaMarca({ comLadrilho: true }))
feitos.push("app/icon.svg")
writeFileSync(
  join(RAIZ, "public", "marca.svg"),
  svgDaMarca({ comLadrilho: false })
)
feitos.push("public/marca.svg")

process.stdout.write(`ícones gerados:\n  ${feitos.join("\n  ")}\n`)
