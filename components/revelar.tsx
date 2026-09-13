'use client'

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

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

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
      className={cn('revelar-entrada', className)}
      // O servidor não conhece a preferência de movimento. O recuo inicial
      // fica no CSS, que já conhece a mídia antes da hidratação; alternar
      // `initial` aqui produzia atributos diferentes entre servidor e cliente.
      // O conteúdo permanece visível mesmo se o JavaScript não carregar.
      initial={false}
      whileInView={{ y: 0 }}
      // `once` porque animação que repete a cada rolagem vira ruído no terceiro
      // encontro, e a margem negativa dispara um pouco antes da borda para o
      // elemento não chegar já animado quando a rolagem é rápida.
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: reduzido ? 0 : 0.45,
        delay: reduzido ? 0 : atraso,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
