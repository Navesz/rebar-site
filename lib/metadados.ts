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
        // O ALT SAI DO IDIOMA, e não de `site.meta.og`. Medido no build
        // anterior: os 15 HTMLs — os cinco ingleses e os cinco espanhóis
        // incluídos — carregavam
        // `og:image:alt="Cartão de compartilhamento de rebar — …"`, em
        // português, dentro do mesmo `<head>` em que `og:title` e
        // `og:description` já vinham traduzidos. Caminho, largura e altura
        // continuam vindo do compartilhado porque são fatos da imagem; o alt é
        // a frase que o leitor de tela pronuncia, e ela se traduz.
        alt: t.og.alt,
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
 * O `<head>` DA PÁGINA 404, e ele é o único deste arquivo que não herda nada.
 *
 * `app/not-found.tsx` não está dentro de layout raiz nenhum (o site tem dois, e
 * o Next não escolhe entre eles para o 404), então não existe o
 * `title.template` que as 15 rotas herdam de `metadadosDaRaiz`. O gabarito é
 * aplicado AQUI, com o mesmo `gabaritoDeTitulo` do idioma — escrever "· rebar"
 * à mão seria a segunda fonte do sufixo, que diverge no dia em que o nome
 * mudar.
 *
 * O QUE ELE DE PROPÓSITO NÃO TEM:
 *   · `alternates` — o GitHub Pages serve `out/404.html` para QUALQUER endereço
 *     desconhecido, então não há rota canônica a declarar. Anunciar uma seria
 *     dizer ao buscador que `/pt-br/qualquer-coisa` é a mesma página que
 *     `/es/outra-coisa`.
 *   · `openGraph` — 404 não é página para compartilhar, e um cartão bonito num
 *     link quebrado só faz o link parecer bom.
 *   · `robots` — o Next já emite `<meta name="robots" content="noindex"/>` na
 *     rota `_not-found` sozinho. Medido no `out/404.html` do build anterior,
 *     que era o 404 de fábrica e já saía com a tag. Repeti-la aqui publicaria
 *     a mesma diretiva duas vezes.
 */
export function metadadosDoNaoEncontrado(idioma: Idioma): Metadata {
  const t = textos(idioma)
  return { title: t.gabaritoDeTitulo.replace("%s", t.rotulos.naoEncontrado) }
}

/**
 * A COR DA BARRA DO NAVEGADOR, que até aqui não existia.
 *
 * Sem `themeColor`, o Android e o iOS em modo standalone pintam a barra de
 * branco por conta própria — e num site com tema escuro isso deixa uma faixa
 * clara acima do conteúdo. As duas cores saem de `meta.cores`, as MESMAS que o
 * manifesto já usa: uma fonte só, e não um `#0f172a` repetido em três arquivos
 * que alguém troca em dois.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O LIMITE, DECLARADO: A META SEGUE O SISTEMA, O SITE SEGUE A CLASSE.
 *
 * As duas linhas abaixo são resolvidas pelo NAVEGADOR, por
 * `prefers-color-scheme`. O tema desta página não é: `next-themes` está montado
 * com `attribute="class"` e `defaultTheme="system"`
 * (`components/theme-provider.tsx`), e escreve `.dark` no `<html>`. Enquanto o
 * visitante fica em "Sistema" — o padrão — os dois concordam. No instante em
 * que ele escolhe "Escuro" no seletor (ou aperta `d`) com o celular no claro, a
 * barra de endereço fica do tema OPOSTO ao da página.
 *
 * POR QUE NÃO É CONSERTADO AQUI, e isto é decisão, não esquecimento. A meta
 * teria de ser reescrita a partir do tema RESOLVIDO, que só existe no
 * navegador, e as duas formas de fazer isso custam mais que o defeito:
 *
 *   · componente de cliente com `useTheme()` — o valor chega `undefined` no
 *     render do servidor e no de hidratação, então escrever a tag exige estado
 *     derivado do ambiente dentro de um effect. É exatamente o padrão que
 *     `components/seletor-de-tema.tsx` documenta como barrado neste projeto:
 *     a regra `react-hooks/set-state-in-effect` do `eslint-config-next`
 *     reprova, e a correção chegaria um quadro DEPOIS da primeira pintura — a
 *     barra piscaria na cor errada antes de acertar. O seletor escapou disso
 *     porque CSS resolve `.dark` sem JavaScript; uma `<meta>` não tem essa
 *     saída.
 *   · script bloqueante próprio, lendo `localStorage` antes da pintura — seria
 *     uma SEGUNDA implementação da resolução de tema, ao lado da que
 *     `next-themes` já embute. Duas fontes da mesma verdade divergem na
 *     primeira mudança de chave de armazenamento, e divergem em silêncio: a
 *     barra fica de uma cor, a página de outra, e nada acende. É o defeito do
 *     §12.3 trocado de lugar.
 *
 * O que fica: quem usa "Sistema" (o padrão) vê a cor certa sempre; quem força o
 * tema contra o sistema vê a barra do navegador na outra cor. É uma faixa de
 * 24px numa preferência minoritária, contra uma dependência de effect em todas
 * as 15 rotas.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const viewportPadrao: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.meta.cores.fundo },
    { media: "(prefers-color-scheme: dark)", color: site.meta.cores.tema },
  ],
}
