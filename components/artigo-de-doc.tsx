/**
 * O ARTIGO DE UMA PÁGINA DE DOCUMENTAÇÃO: trilha, título, resumo, índice,
 * corpo e o rodapé de anterior/próximo — nesta ordem, nas quatro páginas.
 *
 * POR QUE ISTO NÃO ESTÁ NO `layout.tsx`. O layout do App Router não sabe QUAL
 * filho está renderizando: ele recebe `children` e mais nada. A trilha precisa
 * da chave da rota, o índice precisa dos títulos daquela página, e o rodapé
 * precisa da posição dela na sequência — três coisas que só a página conhece.
 * O layout é a moldura de TRÊS COLUNAS (barra, conteúdo, trilha da direita); o
 * artigo é a moldura de DUAS (o texto e o índice), e é a página que a chama.
 *
 * O ÍNDICE APARECE DUAS VEZES E É A MESMA LISTA. `IndiceDaPagina` é a trilha
 * fixa da direita, a partir de `xl`; `IndiceRecolhivel` é o painel fechado no
 * topo do conteúdo, abaixo disso. As duas recebem os MESMOS `id`, que são os
 * mesmos que a página escreve nos `<h2>` — todos vindos de `lib/ancoras.ts`,
 * porque duas funções de slug divergem e o link morre calado.
 *
 * `indice.length > 1` E NÃO `> 0`: um índice com um item só é uma lista que
 * repete o título da página e não leva a lugar nenhum novo.
 */

import type { ReactNode } from "react"

import { AnteriorProximo } from "@/components/anterior-proximo"
import {
  IndiceDaPagina,
  IndiceRecolhivel,
  type ItemDoIndice,
} from "@/components/indice-da-pagina"
import { Revelar } from "@/components/revelar"
import { Trilha } from "@/components/trilha"
import { textos, type Idioma } from "@/conteudo/carregar"
import type { ChaveDeDoc } from "@/lib/rotas"
import { cn } from "@/lib/utils"

export function ArtigoDeDoc({
  idioma,
  chave,
  titulo,
  resumo,
  indice,
  largura = "leitura",
  children,
}: {
  idioma: Idioma
  chave: ChaveDeDoc
  titulo: string
  resumo: string
  indice: readonly ItemDoIndice[]
  /**
   * `leitura` limita o corpo à medida confortável de texto corrido; `ampla`
   * solta a coluna inteira, e existe para a página de instalação, cujo layout
   * é código AO LADO do texto — com o teto de leitura ela nunca teria largura
   * para as duas colunas e voltaria a empilhar em qualquer tela.
   */
  largura?: "leitura" | "ampla"
  children: ReactNode
}) {
  const t = textos(idioma)
  const comIndice = indice.length > 1

  return (
    <div className="flex w-full gap-12">
      {/* O TETO DE LEITURA NÃO TEM PREFIXO DE TELA, e a conta é a da moldura.
          Ele era `xl:max-w-3xl`, e `xl` é a largura em que a TRILHA DA DIREITA
          aparece — que é o oposto de quando o artigo fica largo demais:

            · de `lg` a `xl` (1024–1279px) o índice da direita está escondido
              (`hidden … xl:block`), então o artigo é a janela menos 4rem de
              `lg:px-8`, menos as 15rem da barra lateral, menos o `lg:gap-10` —
              21,5rem ao todo. Em 1279px isso dá 935px de corpo contra os 768px
              (48rem) em que o `<header>` para: um degrau de 167px entre o
              resumo e o primeiro parágrafo, e uma linha bem além da medida
              confortável. O artigo cruza as 48rem já em 1113px;
            · de `xl` para cima o índice volta e come 14rem mais o `gap-12`
              daqui, então o artigo é a janela menos 38,5rem — ele só passa de
              48rem acima de 1384px, que é onde o teto antigo começava a valer.
              Ou seja: o prefixo desligava o teto exatamente na faixa que
              precisava dele.

          Sem o prefixo o teto vale em toda largura, e o que ele muda é só onde
          havia degrau: acima de 1384px o valor é o mesmo de antes, abaixo de
          1024px a barra lateral vira gaveta e o artigo é a janela menos 3rem de
          `sm:px-6` — o que cruza as 48rem já em 816px, o mesmo defeito uma
          segunda vez, num tablet deitado. Nas larguras em que o artigo não
          chega a 48rem o teto não tem o que apertar. */}
      <article
        className={cn(
          "min-w-0 flex-1 pt-8 pb-20 lg:pt-10",
          largura === "leitura" && "max-w-3xl"
        )}
      >
        <Revelar>
          <Trilha idioma={idioma} chave={chave} />
          {/* `max-w-3xl` no cabeçalho mesmo na largura ampla: linha de resumo
              com 90rem de comprimento não se lê, ela se varre. */}
          <header className="mt-4 max-w-3xl">
            <h1 className="text-h1">{titulo}</h1>
            <p className="mt-4 text-lead text-muted-foreground">{resumo}</p>
          </header>
        </Revelar>

        {comIndice ? (
          <IndiceRecolhivel
            rotulo={t.rotulos.nestaPagina}
            itens={indice}
            className="mt-8"
          />
        ) : null}

        <div className="mt-12">{children}</div>

        <AnteriorProximo idioma={idioma} chave={chave} className="mt-16" />
      </article>

      {comIndice ? (
        <IndiceDaPagina rotulo={t.rotulos.nestaPagina} itens={indice} />
      ) : null}
    </div>
  )
}
