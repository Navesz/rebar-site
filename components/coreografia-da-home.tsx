"use client"

/**
 * AS DUAS COREOGRAFIAS DA HOME, e nenhuma das duas é estado de componente.
 *
 * A fronteira que `components/revelar.tsx` declarou continua inteira, e este
 * arquivo é o outro lado dela. Motion revela BLOCO que entrou na tela — é o
 * `Revelar`, e a home usa nos destaques e nos atalhos. GSAP faz LINHA DO
 * TEMPO: a chegada do hero, que tem ordem e ritmo, e a esteira presa à posição
 * da rolagem. Nenhuma das duas cabe num `whileInView` — uma é uma partitura de
 * cinco tempos, a outra é um `scrub`.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * COMO ESTA PÁGINA NUNCA FICA VAZIA. É a decisão mais importante do arquivo.
 *
 * O jeito comum de escrever entrada é `opacity-0` no CSS e o JS subindo para 1.
 * Aqui isso seria um defeito com três vítimas de uma vez, e nenhuma delas
 * acende erro em lugar nenhum:
 *
 *   · quem pediu `prefers-reduced-motion: reduce` — o ramo `COM_MOVIMENTO` do
 *     `matchMedia` nunca casa, o GSAP nunca roda, e o `opacity-0` do CSS fica
 *     de pé PARA SEMPRE. Hero em branco, para exatamente quem já tinha pedido
 *     menos da interface.
 *   · quem lê o HTML sem executar nada — o rastreador de busca e o leitor com
 *     JS desligado. Este site é `output: "export"`: o arquivo que sai do build
 *     é o que essas duas recebem, e conteúdo escondido por CSS sai escondido
 *     no arquivo.
 *   · quem tem JS que morreu no caminho — rede, extensão, um erro em outro
 *     bundle. Mesma tela em branco, e nem um log.
 *
 * A REGRA, então, e ela não tem exceção neste arquivo: NENHUM CSS ESCONDE
 * NADA. Todo estado inicial invisível é escrito pelo próprio GSAP, com
 * `.from()`, DENTRO de `mm.add(COM_MOVIMENTO, …)`. Assim o estado escondido só
 * existe quando existe também a linha do tempo que o desfaz — e o `revert()`
 * do `gsap.context()` (ver `lib/animacao.ts`) apaga até os estilos inline na
 * limpeza, inclusive quando alguém liga a preferência no meio da sessão.
 * Tirando o GSAP da equação por qualquer motivo, o que sobra é o HTML
 * estático: completo e opaco.
 *
 * O PREÇO DISSO, dito de frente, e o conserto. `.from()` só roda no efeito, ou
 * seja DEPOIS da primeira pintura. Numa carga lenta a pessoa vê o hero
 * inteiro, ele some e volta a aparecer — isso não é entrada, é piscada. Por
 * isso a partitura de chegada só roda se a hidratação chegou dentro de
 * `JANELA_DE_ENTRADA`; passada a janela, o título já foi lido e a entrada
 * correta é nenhuma. Repare na direção do recuo: em todo caminho de escape
 * desta página, o que sobra é a página COMPLETA.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * O QUE ESTE ARQUIVO CONHECE DO MOLDE É UM ATRIBUTO, e os nomes dele moram em
 * `components/passos-da-home.ts` — módulo comum, sem diretiva, importado dos
 * dois lados. O porquê de não morarem aqui está escrito lá, e vale a leitura:
 * exportação de módulo `"use client"` lida por componente de servidor não
 * devolve o valor, devolve uma referência opaca.
 */

import type { ReactNode } from "react"
import gsap from "gsap"

import {
  COM_MOVIMENTO,
  concluirMesmoSemQuadros,
  ENTRADA,
  useCoreografia,
} from "@/lib/animacao"
import { cn } from "@/lib/utils"
import {
  naEsteira,
  noHero,
  PASSO_DA_ESTEIRA,
  type PassoDoHero,
} from "@/components/passos-da-home"

/**
 * Quanto tempo depois da navegação a chegada do hero ainda é chegada.
 *
 * Um segundo, e o número é a fronteira entre duas coisas diferentes: até aí a
 * animação ACOMPANHA a página aparecendo; depois disso ela reanima um texto
 * que a pessoa já leu, o que na tela se parece com uma falha de renderização.
 * `performance.now()` conta desde o início da navegação, então este mesmo
 * número também desliga a partitura na navegação de cliente — voltar para a
 * home pelo menu não redesenha o hero do zero, e ali a piscada seria certa.
 */
const JANELA_DE_ENTRADA = 1000

type Movimento = {
  quando: number
  duracao: number
  /** O estado de PARTIDA. Nunca sai daqui para o CSS — ver o cabeçalho. */
  de: gsap.TweenVars
  escalonar?: number
}

/**
 * A PARTITURA DE CHEGADA DO HERO, em segundos, e os números ficam juntos
 * porque são a promessa que o cabeçalho faz.
 *
 * A leitura não espera a animação: o título parte de `quando: 0.06` e fecha
 * em 0,48 s — com `power3.out` ele passa dos 90% de opacidade antes da
 * metade disso. A partitura inteira acaba em 0,89 s, e o que chega por último
 * é o painel de comando, que é o que a pessoa vai usar depois de ler.
 *
 * SÃO CINCO TEMPOS DIFERENTES, e não cinco `fade` iguais escalonados: a marca
 * cresce, o título e o subtítulo sobem em distâncias diferentes, os dois
 * botões entram em cascata curta, e o painel chega com um resto de escala,
 * como uma janela que assenta. Seis fades idênticos seriam uma lista se
 * apresentando, não uma primeira dobra.
 */
const PARTITURA: Record<PassoDoHero, Movimento> = {
  marca: { quando: 0, duracao: 0.5, de: { opacity: 0, scale: 0.84, y: 8 } },
  titulo: { quando: 0.06, duracao: 0.42, de: { opacity: 0, y: 26 } },
  subtitulo: { quando: 0.18, duracao: 0.44, de: { opacity: 0, y: 18 } },
  acao: {
    quando: 0.28,
    duracao: 0.4,
    de: { opacity: 0, y: 12 },
    escalonar: 0.07,
  },
  painel: {
    quando: 0.34,
    duracao: 0.55,
    de: { opacity: 0, y: 26, scale: 0.985 },
  },
}

/**
 * Quanto a nervura do fundo ANDA A MENOS que a página, em porcentagem da
 * própria altura. Catorze por cento: o bastante para o fundo ter profundidade
 * e pouco o bastante para a malha não desencontrar do topo do hero, que é
 * onde a máscara radial a segura.
 */
const PARALAXE_DA_NERVURA = 14

/**
 * O HERO: a malha de fundo com paralaxe, e a partitura de chegada por cima.
 *
 * Recebe `children` em vez de props de texto de propósito — o molde continua
 * sendo componente de SERVIDOR e chega aqui já renderizado, então nada do
 * conteúdo entra no bundle. Este arquivo só conhece atributos.
 */
export function CoreografiaDoHero({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const escopo = useCoreografia<HTMLDivElement>((mm, hero) => {
    mm.add(COM_MOVIMENTO, () => {
      // A PARALAXE VALE SEMPRE, dentro deste ramo: ela é resposta à rolagem,
      // não à chegada, e não esconde coisa nenhuma — a nervura é decorativa e
      // `aria-hidden`. `ease: "none"` porque quem dita a curva aqui é o dedo
      // da pessoa na rolagem; qualquer easing sobre um `scrub` faz o fundo
      // acelerar sozinho e denuncia o truque.
      gsap.to("[data-nervura]", {
        yPercent: PARALAXE_DA_NERVURA,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })

      // Ver `JANELA_DE_ENTRADA`. Fora da janela não há animação de chegada — e
      // não há estado escondido nenhum para desfazer, porque quem o escreveria
      // é justamente o `.from()` abaixo.
      if (performance.now() > JANELA_DE_ENTRADA) return

      const linha = gsap.timeline({ defaults: { ease: ENTRADA } })
      for (const [passo, movimento] of Object.entries(PARTITURA)) {
        linha.from(
          noHero(passo as PassoDoHero),
          {
            ...movimento.de,
            duration: movimento.duracao,
            stagger: movimento.escalonar,
          },
          movimento.quando
        )
      }

      // A partir daqui o hero está escondido pelo `.from()` acima, e quem o
      // revela é o relógio de quadros. Se ele não andar, isto revela.
      return concluirMesmoSemQuadros(linha)
    })
  })

  return (
    <div
      ref={escopo}
      className={cn("relative isolate overflow-hidden", className)}
    >
      {/*
       * A NERVURA VIVE AQUI, e não no molde: ela é decoração pura, não tem
       * texto e é o único elemento que a paralaxe move. Nascendo dentro do
       * componente que a anima, não existe a terceira parte que esquece de
       * pôr o atributo — e o molde do hero fica só com conteúdo.
       *
       * `isolate` no pai é o que segura o `-z-10`: sem ele a malha desceria
       * para trás do fundo da página e sumiria. A altura extra e o topo
       * negativo dão folga para os 14% de deslocamento sem descobrir a borda
       * de baixo.
       */}
      <div
        aria-hidden
        data-nervura=""
        className="pointer-events-none absolute inset-x-0 -top-[25%] -z-10 h-[150%] nervura nervura-mascara"
      />
      {children}
    </div>
  )
}

/**
 * A ESTEIRA: uma linha do tempo amarrada à ROLAGEM, e não ao relógio.
 *
 * É o caso em que o `scrub` paga sozinho — a régua "roda" na velocidade em que
 * a pessoa desce a página, e parar de rolar para de rodar. Os números das
 * durações abaixo NÃO SÃO SEGUNDOS: num `scrub` a linha do tempo inteira é
 * esticada sobre a faixa de rolagem do gatilho, então o que eles dizem é
 * PROPORÇÃO — quanto do trecho cada coisa ocupa.
 *
 * SEM `pin`, e é decisão. O `pin` do ScrollTrigger reescreve o layout com um
 * `pin-spacer` e existe só dentro deste ramo do `matchMedia`: quem pediu menos
 * movimento receberia a mesma seção com a coluna solta, num layout que ninguém
 * desenhou. A fixação aqui é `position: sticky` no molde, que é LAYOUT e vale
 * para todo mundo — o GSAP fica só com a parte que é animação de verdade.
 */
export function CoreografiaDaEsteira({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const escopo = useCoreografia<HTMLDivElement>((mm, secao) => {
    mm.add(COM_MOVIMENTO, () => {
      const linha = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: secao,
          // A faixa começa com a seção já entrando na tela e termina quando o
          // pé dela encosta no pé da janela. Terminar em `bottom bottom` e não
          // depois é o que faz cada item ser revelado UM POUCO ANTES de chegar
          // ao olho: revelação que acontece atrás da dobra é revelação que
          // ninguém viu, e aí a coreografia inteira não mostrou nada.
          start: "top 75%",
          end: "bottom bottom",
          // `scrub` com número e não `true`: meio segundo de inércia tira o
          // serrilhado do trackpad sem soltar a animação da rolagem.
          scrub: 0.5,
        },
      })

      linha
        // A ORDEM AQUI NÃO É ENFEITE. O placar mora DENTRO do primeiro item, e
        // o item entra com `opacity: 0` — imprimir as linhas antes dele
        // aparecer seria animar dentro de uma caixa invisível, e a impressão
        // aconteceria para ninguém. Por isso o item vem primeiro, em `0`, e as
        // linhas começam em `1`, quando ele já assentou.
        .from(
          naEsteira(PASSO_DA_ESTEIRA.item),
          { opacity: 0, y: 18, duration: 1, stagger: 2 },
          0
        )
        // O placar imprime linha a linha, que é como ele sai no terminal.
        // `xPercent` pequeno para o texto parecer digitado, não arremessado.
        .from(
          naEsteira(PASSO_DA_ESTEIRA.linha),
          { opacity: 0, xPercent: -2, duration: 0.5, stagger: 0.35 },
          1
        )
        // A fita percorre a faixa INTEIRA — os mesmos 10 da linha do tempo:
        // ela é o progresso da esteira, e progresso que completa antes do fim
        // mente sobre onde a pessoa está, que é o defeito anotado em
        // `components/barra-de-progresso.tsx`.
        .from(naEsteira(PASSO_DA_ESTEIRA.fita), { scaleY: 0, duration: 10 }, 0)
    })
  })

  return (
    <div ref={escopo} className={className}>
      {children}
    </div>
  )
}
