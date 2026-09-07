/**
 * A MOLDURA DE `/docs`, escrita uma vez e usada pelos DOIS layouts de
 * documentação — o do inglês na raiz e o dos traduzidos sob `[idioma]`.
 *
 * É a mesma razão de `components/casca.tsx` existir: dois arquivos de layout
 * com a marcação copiada divergem no dia em que alguém acrescenta um grupo à
 * barra e esquece o gêmeo, e a página que ficou para trás continua respondendo
 * 200 — só que sem metade da navegação. Aqui os dois layouts são cascas de três
 * linhas em volta deste componente.
 *
 * ESTE COMPONENTE É DE SERVIDOR, e a fronteira está no lugar certo: ele lê o
 * conteúdo, monta `href` e rótulo de cada item, e entrega a
 * `BarraLateralDocs` — que é de cliente só porque precisa de `usePathname`
 * para saber qual item marcar.
 *
 * A LARGURA É DE TRÊS COLUNAS, e por isso `max-w-[100rem]` e não `max-w-5xl`:
 * a barra come 15rem à esquerda e o índice 14rem à direita. Com o limite antigo
 * sobrariam 40rem de artigo numa tela de 1440px, e a página de instalação —
 * que é código AO LADO do texto — voltaria a empilhar em toda tela existente.
 */

import type { ReactNode } from "react"

import { BarraLateralDocs } from "@/components/barra-lateral-docs"
import { GRUPOS_DE_DOCS } from "@/components/navegacao-de-docs"
import { caminhoDe, textos, type Idioma } from "@/conteudo/carregar"
import { rotaDe } from "@/lib/rotas"

export function MolduraDeDocumentacao({
  idioma,
  children,
}: {
  idioma: Idioma
  children: ReactNode
}) {
  const t = textos(idioma)

  // NENHUM `href` ESCRITO À MÃO: o caminho sai de `rotaDe` e o prefixo de
  // idioma de `caminhoDe`. Uma string montada aqui seria a segunda regra de
  // prefixo do projeto, e a divergência entre as duas é link quebrado que o
  // build estático não vê.
  const grupos = GRUPOS_DE_DOCS.map(({ grupo, paginas }) => ({
    chave: grupo,
    rotulo: t.rotulos.grupos[grupo],
    itens: paginas.map((chave) => ({
      chave,
      href: caminhoDe(idioma, rotaDe(chave)),
      rotulo: t.rotulos.navegacao[chave],
    })),
  }))

  return (
    // `lg:items-start` é o que faz o `sticky` da barra funcionar: num flex de
    // linha o padrão é `stretch`, a coluna ficaria com a altura do artigo
    // inteiro e não teria para onde grudar. No celular a direção é coluna e o
    // `stretch` volta a ser o que se quer — daí o prefixo de tela.
    <div className="mx-auto flex w-full max-w-[100rem] flex-col px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:px-8">
      <BarraLateralDocs
        grupos={grupos}
        rotuloDasSecoes={t.rotulos.secoes}
        // `secoes` e nao `menu`: abaixo de lg esta pagina ja tem o
        // hamburguer do cabecalho chamado "Menu", e dois controles com o mesmo
        // nome abrindo gavetas diferentes deixam quem navega por voz sem como
        // escolher. O rotulo ja existe nos tres idiomas e ja e o titulo desta
        // propria gaveta.
        rotuloDoMenu={t.rotulos.secoes}
        rotuloDeFechar={t.rotulos.fechar}
      />
      {/* `min-w-0` porque um filho de flex tem `min-width: auto` por padrão, e
          basta um comando longo dentro de um `<pre>` para ele empurrar a coluna
          e a página inteira rolar na horizontal. */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
