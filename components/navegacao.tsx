"use client"

/**
 * A navegação, e o `aria-current` que a torna legível sem enxergar a cor.
 *
 * O item ativo é marcado por DUAS coisas ao mesmo tempo: cor e
 * `aria-current="page"`. Só a cor deixaria a navegação muda para leitor de tela
 * e ilegível para quem não distingue os dois tons — e é o tipo de omissão que
 * nenhuma régua deste projeto pega, porque acessibilidade automática pega
 * talvez metade.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { BookOpen, Boxes, Download, Home, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"

const ITENS = [
  { href: "/", rotulo: "Início", Icone: Home },
  { href: "/instalacao", rotulo: "Instalação", Icone: Download },
  { href: "/uso", rotulo: "Uso", Icone: Terminal },
  { href: "/modulos", rotulo: "Módulos", Icone: Boxes },
  { href: "/docs", rotulo: "Docs", Icone: BookOpen },
] as const

export function Navegacao() {
  const caminho = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2">
        {ITENS.map(({ href, rotulo, Icone }) => {
          // `startsWith` só para as filhas: sem o caso especial da raiz, `/`
          // ficaria ativa em todas as rotas ao mesmo tempo.
          const ativo =
            href === "/" ? caminho === "/" : caminho.startsWith(href)
          return (
            <li key={href} className="relative shrink-0">
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  ativo
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icone aria-hidden className="size-4" />
                {rotulo}
              </Link>
              {/* `layoutId` faz o sublinhado DESLIZAR entre os itens em vez de
                  sumir e reaparecer. É o caso em que o Motion paga sozinho: o
                  elemento é o mesmo, a posição é que muda. */}
              {ativo ? (
                <motion.span
                  layoutId="nav-ativo"
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
