"use client"

/**
 * Um comando copiável.
 *
 * SEM ESTADO PARA "DÁ PARA COPIAR?", e a razão é uma regra de lint que estava
 * certa. A primeira versão descobria `navigator.clipboard` num `useEffect` e
 * guardava em estado — `react-hooks/set-state-in-effect` reprovou, e com
 * motivo: é um valor derivado do ambiente, não um estado que muda, e escondê-lo
 * atrás de um render extra faz o botão piscar na primeira pintura.
 *
 * O botão aparece SEMPRE e o recuo é real: sem a API de área de transferência,
 * ele SELECIONA o texto do comando para a pessoa copiar com o teclado. Um botão
 * que some deixa a pessoa sem saída; um que finge ter copiado é pior ainda.
 *
 * O rótulo vai em `sr-only` em vez de `aria-label` porque assim o texto que o
 * leitor de tela anuncia e o que a pessoa vê são o MESMO, e não dois que
 * envelhecem separados.
 */

import { useEffect, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

export function Comando({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const [copiado, setCopiado] = useState(false)
  const codigo = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 1600)
    return () => clearTimeout(t)
  }, [copiado])

  function copiar() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(children).then(
        () => setCopiado(true),
        // Permissão negada não pode virar um "copiado" mentiroso: cai no
        // mesmo recuo de quem não tem a API.
        () => selecionar()
      )
      return
    }
    selecionar()
  }

  function selecionar() {
    const no = codigo.current
    if (!no) return
    const faixa = document.createRange()
    faixa.selectNodeContents(no)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(faixa)
  }

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border/60 bg-muted/50",
        className
      )}
    >
      <pre className="overflow-x-auto p-4 pr-12 text-sm leading-relaxed">
        <code ref={codigo} className="font-mono">
          {children}
        </code>
      </pre>
      <button
        type="button"
        onClick={copiar}
        className={cn(
          "absolute top-2.5 right-2.5 rounded-md p-2 transition-colors",
          "text-muted-foreground hover:bg-background hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        )}
      >
        {copiado ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
        <span className="sr-only">
          {copiado ? "Copiado" : "Copiar comando"}
        </span>
      </button>
    </div>
  )
}
