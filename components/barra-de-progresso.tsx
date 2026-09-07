"use client"

/**
 * A linha de progresso da leitura, presa à rolagem da página. É o papel do GSAP.
 *
 * POR QUE GSAP E NÃO MOTION AQUI. Isto não é estado de componente nenhum: é uma
 * linha do tempo amarrada à posição da PÁGINA, que existe antes de qualquer
 * componente montar e continua depois. O `ScrollTrigger` faz isso com um
 * `scrub` e nenhuma re-renderização do React — a barra anda no compositor, não
 * no ciclo de vida.
 *
 * Fazer o mesmo com Motion exigiria `useScroll` devolvendo um valor a cada
 * quadro, e a divisão que este projeto declarou em `revelar.tsx` deixaria de
 * valer: duas bibliotecas fazendo a mesma coisa é o defeito que a forense do
 * rebar catalogou, e a defesa é justamente esta fronteira.
 */

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export function BarraDeProgresso() {
  const barra = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const alvo = barra.current
    if (!alvo) return

    // Quem pediu menos movimento não recebe uma barra que se move: ela
    // simplesmente não aparece. É a mesma decisão do `Revelar`.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo(
        alvo,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            // `scrub: true` amarra o progresso da animação à posição da
            // rolagem em vez de disparar uma duração fixa. Sem isto a barra
            // completa sozinha e passa a mentir sobre onde a pessoa está.
            scrub: true,
          },
        }
      )
    })

    // `ctx.revert()` e não `kill()` solto: o contexto desfaz TUDO que foi criado
    // dentro dele, inclusive o ScrollTrigger. Em navegação de cliente, sem isto
    // cada visita à rota deixa um gatilho vivo e a barra acelera a cada volta.
    return () => ctx.revert()
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
    >
      {/* A TINTA É `brand`, E NÃO `primary`. `--primary` neste projeto é aço
          quase-preto no claro (oklch 0.245) e quase-branco no escuro (oklch
          0.928) — ou seja, a mesma tinta do texto e das arestas. Uma faixa
          dessa cor colada no topo, com 2px de altura, não lê como indicador:
          lê como a borda de baixo do cabeçalho, que já existe ali e é
          exatamente o que ela fica parecendo estar engrossando.

          `--brand` é o óxido, e é o que TODO indicador de posição deste site
          já usa: o item ativo da navegação, o do índice da página, o da barra
          lateral e a própria fita da esteira. Indicador de posição é uma
          família só — se o de leitura fosse de outra cor, ele estaria
          afirmando ser outra coisa. */}
      <div
        ref={barra}
        className="h-full w-full origin-left scale-x-0 bg-brand"
      />
    </div>
  )
}
