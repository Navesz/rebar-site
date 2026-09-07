"use client"

/**
 * O ÍNDICE "NESTA PÁGINA", em duas formas, e o scrollspy que marca onde a
 * pessoa está.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUE O SCROLLSPY É GSAP E NÃO MOTION. A fronteira que
 * `components/revelar.tsx` declara vale inteira aqui: Motion cuida de estado de
 * COMPONENTE (entrou na tela, trocou de rota), GSAP cuida de LINHA DO TEMPO
 * AMARRADA À POSIÇÃO DA PÁGINA. Qual seção está sob os olhos é exatamente a
 * segunda coisa — não é estado do React, é posição de rolagem —, e é por isso
 * que a marcação aqui é feita por ATRIBUTO no DOM em vez de `useState`.
 *
 * A diferença não é de gosto: um `setState` por gatilho de rolagem re-renderiza
 * a lista inteira a cada seção atravessada, e numa rolagem rápida por seis
 * seções isso é seis renders do React para trocar duas classes. O `ScrollTrigger`
 * escreve `data-ativo` e `aria-current` direto no elemento, e o React não
 * precisa saber — ele não vai re-renderizar estes nós, porque nada do lado dele
 * mudou.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O ALGORITMO, e ele é o mais simples que está CERTO: a seção ativa é a ÚLTIMA
 * cujo título já passou da metade da tela. Um gatilho por título, `onEnter`
 * descendo e `onLeaveBack` subindo. Nada de `start`/`end` cobrindo a seção
 * inteira, que é a versão que quase todo mundo escreve e que erra em dois
 * lugares: a última seção, sempre mais curta que a tela, nunca chega a ficar
 * ativa; e o vão entre o fim de uma seção e o começo da outra deixa o índice
 * sem nenhum item marcado.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O `mm.add` COM DUAS CONDIÇÕES faz dois trabalhos numa chamada só:
 *
 *   · `larga` — os gatilhos só existem quando a trilha da direita está na tela.
 *     Sem isto eles seriam criados no celular também, medindo posições de uma
 *     lista com `display: none` (onde `offsetTop` é 0) para mover um marcador
 *     que ninguém vê. O `matchMedia` do GSAP cria e desfaz sozinho quando a
 *     janela cruza a medida — é para isso que ele existe.
 *   · `comMovimento` — o marcador DESLIZA para quem não pediu menos movimento e
 *     SALTA para quem pediu. O que a preferência desliga é o deslocamento, e não
 *     a informação: qual seção está ativa continua sendo marcada nos dois casos,
 *     porque isso é conteúdo e não animação.
 */

import { useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ChevronDown, List } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { COM_MOVIMENTO, ENTRADA, useCoreografia } from "@/lib/animacao"
import { cn } from "@/lib/utils"

export type ItemDoIndice = {
  /** O `id` do `<h2>` correspondente — vem de `lib/ancoras.ts`. */
  id: string
  titulo: string
}

/**
 * O `xl` do Tailwind escrito por extenso, porque o GSAP não lê a classe.
 *
 * As duas medidas TÊM de ser a mesma: é `xl` que revela a trilha da direita, e
 * é aqui que os gatilhos nascem. Divergir em um passo de breakpoint produz uma
 * faixa de larguras em que a trilha aparece sem nunca marcar nada, ou em que os
 * gatilhos medem uma lista escondida.
 */
const TELA_COM_TRILHA = "(min-width: 80rem)"

/** O ponto da tela onde um título passa a valer como "seção atual". */
const LINHA_DE_CORTE = "top center"

export function IndiceDaPagina({
  rotulo,
  itens,
  className,
}: {
  /** `rotulos.nestaPagina`. */
  rotulo: string
  itens: readonly ItemDoIndice[]
  className?: string
}) {
  // A lista de dependências tem de ser ESTÁVEL entre renders: `itens` é um
  // array novo a cada render (sai de um `.map` na página), e passá-lo direto
  // faria a coreografia ser destruída e recriada em toda renderização —
  // inclusive no meio de uma rolagem.
  const assinatura = itens.map((item) => item.id).join(" ")

  const escopo = useCoreografia<HTMLElement>(
    (mm, raiz) => {
      mm.add(
        { larga: TELA_COM_TRILHA, comMovimento: COM_MOVIMENTO },
        (contexto) => {
          if (!contexto.conditions?.larga) return
          const comMovimento = Boolean(contexto.conditions.comMovimento)

          const links = gsap.utils.toArray<HTMLAnchorElement>(
            "a[data-ancora]",
            raiz
          )
          const marcador = raiz.querySelector<HTMLElement>("[data-marcador]")
          if (links.length === 0 || !marcador) return

          // `-1` e não `0`: o primeiro `marcar` tem de POSICIONAR o marcador
          // sem animar. Deslizar de altura zero no canto superior até o item
          // certo é uma animação que anuncia a mecânica em vez do conteúdo.
          let ativo = -1

          const marcar = (indice: number) => {
            const alvo = Math.min(Math.max(indice, 0), links.length - 1)
            if (alvo === ativo) return
            const primeiraVez = ativo === -1
            ativo = alvo

            links.forEach((link, i) => {
              link.toggleAttribute("data-ativo", i === alvo)
              // `location` e não `page`: a página atual é a do endereço, que
              // quem marca é a barra lateral. Aqui o que se marca é o LUGAR
              // dentro dela, e é esse o token que a ARIA reserva para isso.
              if (i === alvo) link.setAttribute("aria-current", "location")
              else link.removeAttribute("aria-current")
            })

            const link = links[alvo]
            const destino = {
              y: link.offsetTop,
              height: link.offsetHeight,
              opacity: 1,
            }
            if (comMovimento && !primeiraVez) {
              gsap.to(marcador, {
                ...destino,
                duration: 0.24,
                ease: ENTRADA,
                // Rolagem rápida enfileira uma tween por seção atravessada, e
                // sem isto elas se somam: o marcador continua andando depois
                // de a rolagem parar.
                overwrite: true,
              })
            } else {
              gsap.set(marcador, destino)
            }
          }

          const gatilhos = links.map((link, i) => {
            const secao = document.getElementById(link.dataset.ancora ?? "")
            if (!secao) return null
            return ScrollTrigger.create({
              trigger: secao,
              start: LINHA_DE_CORTE,
              onEnter: () => marcar(i),
              // Subindo, quem volta a mandar é a seção ANTERIOR. O `Math.max`
              // dentro de `marcar` segura o `-1` do primeiro título.
              onLeaveBack: () => marcar(i - 1),
            })
          })

          // O ESTADO INICIAL NÃO SAI DOS CALLBACKS. `onEnter` só dispara quando
          // a linha é CRUZADA, e quem chega por link direto (`/docs#saida`) ou
          // recarrega a página no meio dela já está do outro lado de vários
          // gatilhos sem ter cruzado nenhum — o índice ficaria em branco.
          const primeiro = gatilhos.find((g) => g !== null)
          if (!primeiro) return
          const posicao = primeiro.scroll()
          let inicial = 0
          gatilhos.forEach((gatilho, i) => {
            if (gatilho && posicao >= gatilho.start) inicial = i
          })
          marcar(inicial)
        }
      )
    },
    [assinatura]
  )

  const idDoRotulo = "indice-da-pagina"

  return (
    <nav
      ref={escopo}
      aria-labelledby={idDoRotulo}
      className={cn(
        "sticky top-header hidden w-56 shrink-0 self-start py-10 xl:block",
        className
      )}
    >
      <div
        id={idDoRotulo}
        className="text-caption font-medium tracking-wide text-muted-foreground uppercase"
      >
        {rotulo}
      </div>
      <ul className="relative mt-3 max-h-[calc(100svh-var(--spacing-header)-8rem)] overflow-y-auto border-l border-border">
        {/* O marcador é UM elemento que se move, e não uma borda acesa por
            item: borda por item pisca de um lugar para o outro, e a mesma
            distância percorrida por um objeto só é o que diz para onde a
            leitura andou. `opacity-0` no começo para ele não aparecer no canto
            antes da primeira medida. */}
        <span
          data-marcador
          aria-hidden
          className="absolute top-0 left-0 w-0.5 rounded-full bg-brand opacity-0"
        />
        {itens.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              data-ancora={item.id}
              // O FOCO É CONTORNO PARA DENTRO, e não `ring`: o anel do
              // Tailwind é sombra desenhada PARA FORA da caixa, e a `<ul>` que
              // envolve estes links rola (`overflow-y-auto`, logo acima). O
              // navegador recorta o que passa da borda do scrollport, e o foco
              // no primeiro e no último item saía como dois tracinhos soltos,
              // um em cima e outro embaixo, sem os lados. Deslocado para
              // dentro, não há nada fora da caixa a recortar — é o mesmo
              // conserto que o `<pre>` de `painel-de-codigo.tsx` já carrega.
              // O `focus-visible:rounded-r-md` saiu junto: ele arredondava
              // aquele anel, e não sobrou anel para arredondar.
              className="block py-1.5 pr-2 pl-4 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-ativo:font-medium data-ativo:text-brand-subtle-foreground"
            >
              {item.titulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * A MESMA LISTA NO CELULAR, recolhida.
 *
 * SEM SCROLLSPY AQUI, e é decisão: o índice fica fechado, e marcar a seção
 * atual dentro de um painel fechado é medir a página para não mostrar nada.
 * Aberto, ele é uma lista de saltos — a pessoa escolhe e ele se fecha junto com
 * a navegação por âncora.
 *
 * Fechado por padrão porque ele mora ENTRE o resumo e o corpo da página: aberto,
 * empurraria o primeiro parágrafo para fora da tela em todo telefone.
 */
export function IndiceRecolhivel({
  rotulo,
  itens,
  className,
}: {
  rotulo: string
  itens: readonly ItemDoIndice[]
  className?: string
}) {
  const idDoRotulo = "indice-recolhivel"

  // CONTROLADO PARA PODER FECHAR SOZINHO. Solto, o `Collapsible` só obedece ao
  // próprio gatilho: a pessoa escolhia uma seção, a página rolava até ela e a
  // lista continuava aberta EM CIMA do texto pedido, empurrando-o para baixo
  // pela própria altura. É a mesma armadilha da gaveta da barra lateral — salto
  // por âncora não recarrega nada, então nenhum painel se fecha sozinho —, e o
  // conserto é o mesmo `aoNavegar` de lá, aqui escrito como estado.
  const [aberto, setAberto] = useState(false)

  return (
    <Collapsible
      open={aberto}
      onOpenChange={setAberto}
      className={cn("rounded-xl border border-border/70 xl:hidden", className)}
    >
      <CollapsibleTrigger
        id={idDoRotulo}
        className="group flex min-h-11 w-full items-center gap-2 px-4 text-sm font-medium transition-colors hover:text-brand-subtle-foreground focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <List aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        {rotulo}
        <ChevronDown
          aria-hidden
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul
          aria-labelledby={idDoRotulo}
          className="flex flex-col border-t border-border/70 px-2 py-2"
        >
          {itens.map((item) => (
            <li key={item.id} className="flex">
              <a
                href={`#${item.id}`}
                // Fechar AO ESCOLHER, e não ao rolar: o que a pessoa pediu foi
                // o texto da seção, e a lista aberta ficaria entre ela e ele.
                onClick={() => setAberto(false)}
                className="flex min-h-11 w-full items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.titulo}
              </a>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
