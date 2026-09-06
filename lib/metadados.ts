/**
 * O `<head>` de toda página, montado num lugar só.
 *
 * POR QUE ISTO NÃO É REPETIDO EM CADA `page.tsx`. Um site em três idiomas tem
 * quinze páginas, e cada uma precisa declarar as OUTRAS quatorze existirem — é
 * isso que `alternates.languages` diz ao buscador. Escrito à mão, o erro que
 * aparece não é um erro: é uma página que se anuncia sozinha no mundo, indexada
 * como duplicata das outras duas, sem nada ficar vermelho em lugar nenhum.
 *
 * O DEFEITO QUE ISTO CONSERTA JÁ ESTAVA PUBLICADO: no build anterior,
 * `out/docs/index.html` carregava `<link rel="canonical">` apontando para a
 * RAIZ do site. A tag vinha do layout, nenhuma página a sobrescrevia, e as
 * quatro páginas de documentação declaravam-se todas a home. Com o helper, a
 * canônica é derivada da rota e não há como esquecer.
 */
import type { Metadata, Viewport } from "next"

import {
  IDIOMAS,
  IDIOMA_PADRAO,
  caminhoDe,
  site,
  textos,
  type Idioma,
} from "@/conteudo/carregar"
import { rotaDe, type ChaveDeDoc, type ChaveDeRota } from "@/lib/rotas"

/**
 * O `hreflang` de cada idioma, DERIVADO do segmento de URL.
 *
 * `pt-br` vira `pt-BR` porque o hreflang quer a região em caixa alta; `en` e
 * `es` ficam como estão, e é de propósito que não viram `en-US` e `es-ES`. O
 * segmento da URL já declara a granularidade que o site escolheu servir: a
 * versão inglesa atende quem lê inglês, não só quem mora nos Estados Unidos, e
 * um hreflang mais estreito que o público faz o buscador oferecer a página
 * errada a quem está fora da região.
 *
 * Derivar em vez de escrever um mapa mantém UMA fonte: idioma novo em `IDIOMAS`
 * já entra aqui, e não há a segunda lista para alguém esquecer.
 */
export const hreflangDe = (idioma: Idioma): string =>
  idioma.replace(/-(.+)$/, (_, regiao: string) => `-${regiao.toUpperCase()}`)

/**
 * O caminho com barra no fim, que é a forma CANÔNICA sob `trailingSlash: true`.
 *
 * Sem a barra, o GitHub Pages responde com um redirecionamento — e anunciar no
 * `<link rel="canonical">` a forma que redireciona custa um salto a cada visita
 * do robô, além de o buscador ter de decidir sozinho qual das duas é a boa.
 */
const comBarra = (caminho: string): string =>
  caminho.endsWith("/") ? caminho : `${caminho}/`

/** A canônica e as alternativas de UMA rota, nos três idiomas. */
function alternativas(
  idioma: Idioma,
  chave: ChaveDeRota
): Metadata["alternates"] {
  const rota = rotaDe(chave)
  const languages: Record<string, string> = {}
  for (const outro of IDIOMAS) {
    languages[hreflangDe(outro)] = comBarra(caminhoDe(outro, rota))
  }
  // `x-default` é o que o buscador serve a quem não casa com nenhum hreflang.
  // Aponta para o inglês porque o inglês é a raiz do site, e mandar esse
  // visitante para uma rota com prefixo seria oferecer a versão traduzida como
  // se fosse a original.
  languages["x-default"] = comBarra(caminhoDe(IDIOMA_PADRAO, rota))
  return { canonical: comBarra(caminhoDe(idioma, rota)), languages }
}

/**
 * O og montado por extenso em toda página, e não herdado do layout.
 *
 * Herdar parecia mais curto e escondia o defeito: os campos que a página não
 * declara caem para os do layout, então uma página de documentação publicava o
 * `og:url` da home. WhatsApp, LinkedIn e Slack não executam JavaScript e não
 * conferem nada — eles mostram o que está na tag.
 */
function aberturaDeGrafo(
  idioma: Idioma,
  chave: ChaveDeRota,
  titulo: string,
  descricao: string
): Metadata["openGraph"] {
  const t = textos(idioma)
  return {
    type: "website",
    // O og quer `pt_BR`; o atributo `lang` do HTML quer `pt-BR`. Mesmo dado,
    // dois formatos — derivado, para o JSON não ter de guardar os dois.
    locale: t.tagDeIdioma.replace("-", "_"),
    url: comBarra(caminhoDe(idioma, rotaDe(chave))),
    siteName: site.identidade.nome,
    title: titulo,
    description: descricao,
    images: [
      {
        url: site.meta.og.caminho,
        width: site.meta.og.largura,
        height: site.meta.og.altura,
        alt: site.meta.og.alt,
      },
    ],
  }
}

/** O `<head>` do layout raiz de um idioma: é ele que fixa a base das URLs. */
export function metadadosDaRaiz(idioma: Idioma): Metadata {
  const t = textos(idioma)
  return {
    // `metadataBase` é a peça que faz o resto funcionar: é ela que transforma
    // `/og.png` na URL ABSOLUTA que sai no HTML. WhatsApp, LinkedIn, Slack e
    // Discord não resolvem caminho relativo e não executam JavaScript — sem a
    // base, a tag sai relativa e o preview do link vem vazio. Foi essa
    // propriedade que o spike de 31/08 mediu no `out/index.html`.
    metadataBase: new URL(site.meta.urlBase),
    title: { default: t.titulo, template: t.gabaritoDeTitulo },
    description: t.descricao,
    applicationName: site.identidade.nome,
    alternates: alternativas(idioma, "inicio"),
    openGraph: aberturaDeGrafo(idioma, "inicio", t.titulo, t.descricao),
    twitter: {
      card: "summary_large_image",
      title: t.titulo,
      description: t.descricao,
      images: [site.meta.og.caminho],
    },
  }
}

/** O `<head>` de uma página filha. O título entra no gabarito do layout. */
export function metadadosDaPagina(
  idioma: Idioma,
  chave: ChaveDeRota,
  titulo: string,
  descricao: string
): Metadata {
  return {
    title: titulo,
    description: descricao,
    alternates: alternativas(idioma, chave),
    openGraph: aberturaDeGrafo(idioma, chave, titulo, descricao),
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descricao,
      images: [site.meta.og.caminho],
    },
  }
}

/**
 * O `<head>` de uma página de documentação, tirado do próprio conteúdo dela.
 *
 * Título e descrição saem de `paginas.<chave>`, e não de um literal na página:
 * o `<title>` de `/docs/usage` é o mesmo texto que o `<h1>` mostra, nos três
 * idiomas, sem ninguém manter os dois. `paginas` é bloco condicional, então o
 * recuo é a identidade do site — nunca uma página sem título.
 */
export function metadadosDeDoc(idioma: Idioma, chave: ChaveDeDoc): Metadata {
  const t = textos(idioma)
  const pagina = t.paginas?.[chave]
  return metadadosDaPagina(
    idioma,
    chave,
    pagina?.titulo ?? t.titulo,
    pagina?.resumo ?? t.descricao
  )
}

/**
 * A COR DA BARRA DO NAVEGADOR, que até aqui não existia.
 *
 * Sem `themeColor`, o Android e o iOS em modo standalone pintam a barra de
 * branco por conta própria — e num site com tema escuro isso deixa uma faixa
 * clara acima do conteúdo. As duas cores saem de `meta.cores`, as MESMAS que o
 * manifesto já usa: uma fonte só, e não um `#0f172a` repetido em três arquivos
 * que alguém troca em dois.
 */
export const viewportPadrao: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.meta.cores.fundo },
    { media: "(prefers-color-scheme: dark)", color: site.meta.cores.tema },
  ],
}
