"use client"

/**
 * Revelação de componente ao entrar na tela. É o papel do Motion nesta árvore.
 *
 * A DIVISÃO DE TRABALHO, e ela é declarada porque a forense do próprio rebar
 * catalogou "três libs de animação sobrepostas" como defeito num repositório
 * real. Ter Motion e GSAP aqui só se sustenta se nunca fizerem a mesma coisa:
 *
 *   · Motion  — estado de COMPONENTE. Entrou na tela, saiu, trocou de rota.
 *               Vive dentro do ciclo de vida do React e some junto com ele.
 *   · GSAP    — COREOGRAFIA DE SCROLL. Uma linha do tempo amarrada à posição
 *               da página, que não é estado de componente nenhum.
 *
 * Se um dia os dois fizerem a mesma coisa, um dos dois sai — e o que fica é o
 * Motion, porque a maior parte desta interface é componente.
 */

import { motion, useReducedMotion } from "motion/react"
import type { ReactNode } from "react"

export function Revelar({
  children,
  atraso = 0,
  className,
}: {
  children: ReactNode
  atraso?: number
  className?: string
}) {
  // `prefers-reduced-motion` não é enfeite de acessibilidade: para quem tem
  // sensibilidade vestibular, movimento involuntário na tela causa enjoo. O
  // conteúdo aparece igual, sem o deslocamento.
  const reduzido = useReducedMotion()

  return (
    <motion.div
      className={className}
      // NÃO HÁ `opacity` NO ESTADO INICIAL, e a ausência é o conserto de um
      // defeito que estava PUBLICADO. `initial` é o que o Motion escreve no
      // HTML do servidor: com `opacity: 0` ali, as 15 rotas saíam do build
      // carregando `style="opacity:0;transform:translateY(16px)"` — medido em
      // `out/docs/index.html`, `out/pt-br/index.html` e `out/index.html`. Quem
      // abrisse a página sem o JavaScript do Motion ter rodado — rede que
      // cortou o pedaço, extensão que bloqueou, aba de fundo com o relógio de
      // quadros estrangulado — via cabeçalho, barra lateral e RODAPÉ, e nada no
      // meio. Uma documentação em branco que responde 200.
      //
      // O deslocamento pode ficar: 16px de desvio é invisível para quem lê, e
      // some no primeiro quadro para quem tem JS. Opacidade, não — ela é a
      // diferença entre ler e não ler. A revelação perde o esmaecer e mantém o
      // movimento, que é o que ela comunicava de fato.
      initial={reduzido ? false : { y: 16 }}
      whileInView={{ y: 0 }}
      // `once` porque animação que repete a cada rolagem vira ruído no terceiro
      // encontro, e a margem negativa dispara um pouco antes da borda para o
      // elemento não chegar já animado quando a rolagem é rápida.
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
