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
      <div
        ref={barra}
        className="h-full w-full origin-left scale-x-0 bg-primary"
      />
    </div>
  )
}
