"use client"

/**
 * A COREOGRAFIA DE SCROLL, num lugar só.
 *
 * A fronteira declarada em `components/revelar.tsx` continua valendo: Motion
 * cuida de estado de componente (entrou na tela, trocou de rota), GSAP cuida
 * de linha do tempo amarrada à posição da página. Este arquivo é o lado do
 * GSAP — e existe porque, com mais de uma coreografia no site, três coisas
 * passariam a ser copiadas de componente em componente e a divergir:
 *
 *   1. `gsap.registerPlugin(ScrollTrigger)` — registrar em todo `useEffect`
 *      funciona, mas espalha a decisão de qual plugin este site usa.
 *   2. o `gsap.context()` com `revert()` na limpeza — sem ele, cada visita à
 *      rota deixa um gatilho vivo e a animação acelera a cada volta (foi o
 *      defeito que `barra-de-progresso.tsx` documentou primeiro).
 *   3. o respeito a `prefers-reduced-motion` — que aqui NÃO é um `if` no topo
 *      e sim um `gsap.matchMedia()`: quem liga a preferência no meio da
 *      sessão vê a animação ser desfeita na hora, sem recarregar a página.
 */

import { useEffect, useRef, type DependencyList } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Consulta de mídia em vez de leitura única: `gsap.matchMedia` reavalia
// sozinho quando a preferência do sistema muda, e desfaz o que criou dentro
// do ramo que deixou de casar.
export const COM_MOVIMENTO = "(prefers-reduced-motion: no-preference)"

// A mesma curva do `Revelar`, para as duas bibliotecas não animarem com
// personalidades diferentes na mesma tela.
export const ENTRADA = "power3.out"

let plugadoUmaVez = false

function registrar() {
  if (plugadoUmaVez) return
  gsap.registerPlugin(ScrollTrigger)
  plugadoUmaVez = true
}

/**
 * Prende uma coreografia a um elemento. Devolve a `ref` que deve ir no
 * elemento que serve de escopo — todo seletor usado dentro de `coreografar`
 * é resolvido a partir dele, então `".titulo"` nunca alcança outra seção.
 *
 * O que você recebe:
 *   · `mm`    — o `matchMedia` do GSAP. Ponha a animação dentro de
 *               `mm.add(COM_MOVIMENTO, () => …)` e ela some sozinha para quem
 *               pediu menos movimento.
 *   · `escopo` — o elemento da ref, já garantido não nulo.
 */
export function useCoreografia<T extends HTMLElement = HTMLDivElement>(
  coreografar: (mm: gsap.MatchMedia, escopo: T) => void,
  dependencias: DependencyList = []
) {
  const escopo = useRef<T>(null)

  useEffect(() => {
    const alvo = escopo.current
    if (!alvo) return

    registrar()

    const contexto = gsap.context(() => {
      const mm = gsap.matchMedia()
      coreografar(mm, alvo)
    }, alvo)

    // `revert()` e não `kill()`: o contexto desfaz TUDO que nasceu dentro
    // dele, inclusive os ScrollTriggers e os estilos inline que o GSAP
    // escreveu — o elemento volta ao que o CSS diz.
    return () => contexto.revert()
    // A função de coreografia é recriada a cada render por definição; quem
    // controla a re-execução é a lista que o chamador passa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)

  return escopo
}

/**
 * Recalcula as posições de todos os gatilhos. Necessário depois de qualquer
 * mudança de altura que o GSAP não vê acontecer — abrir um accordion, carregar
 * fonte, trocar de idioma. Sem isto o gatilho continua medindo a página antiga
 * e dispara no lugar errado.
 */
export function remedirGatilhos() {
  if (!plugadoUmaVez) return
  ScrollTrigger.refresh()
}
