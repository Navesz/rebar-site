'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Layers3, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Textos } from '@/conteudo/esquema'

const observarHidratacao = () => () => {}
const noCliente = () => true
const noServidor = () => false

export function InteracaoDaEscultura({
  children,
  textos,
}: {
  children: ReactNode
  textos: Textos['home']['escultura']
}) {
  const escopo = useRef<HTMLElement>(null)
  const [separada, separar] = useState(false)
  const pronta = useSyncExternalStore(observarHidratacao, noCliente, noServidor)

  useEffect(() => {
    const figura = escopo.current
    if (!figura) return

    const preferencia = window.matchMedia(
      '(prefers-reduced-motion: no-preference) and (hover: hover)',
    )
    let quadro = 0
    let x = 0
    let y = 0

    function repousar() {
      cancelAnimationFrame(quadro)
      quadro = 0
      figura!.style.removeProperty('--giro-x')
      figura!.style.removeProperty('--giro-y')
    }

    function inclinar(evento: PointerEvent) {
      if (!preferencia.matches || evento.pointerType === 'touch') return
      const caixa = figura!.getBoundingClientRect()
      x = Math.max(-1, Math.min(1, ((evento.clientX - caixa.left) / caixa.width - 0.5) * 2))
      y = Math.max(-1, Math.min(1, ((evento.clientY - caixa.top) / caixa.height - 0.5) * 2))
      if (quadro) return

      // Só há quadros quando o ponteiro se move; a peça em repouso não mantém
      // loop de renderização, inclusive fora da tela ou em aba oculta.
      quadro = requestAnimationFrame(() => {
        figura!.style.setProperty('--giro-x', `${-12 - y * 9}deg`)
        figura!.style.setProperty('--giro-y', `${-24 + x * 16}deg`)
        quadro = 0
      })
    }

    figura.addEventListener('pointermove', inclinar, { passive: true })
    figura.addEventListener('pointerleave', repousar)
    preferencia.addEventListener('change', repousar)
    document.addEventListener('visibilitychange', repousar)

    return () => {
      repousar()
      figura.removeEventListener('pointermove', inclinar)
      figura.removeEventListener('pointerleave', repousar)
      preferencia.removeEventListener('change', repousar)
      document.removeEventListener('visibilitychange', repousar)
    }
  }, [])

  return (
    <figure ref={escopo} className="escultura" data-separada={separada}>
      {children}
      <figcaption className="escultura-legenda">
        <span className="escultura-rotulo">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
          {textos.rotulo}
        </span>
        <Button
          type="button"
          variant="ghost"
          className="escultura-controle min-h-11 gap-2 rounded-full px-4 text-xs text-muted-foreground"
          aria-pressed={separada}
          disabled={!pronta}
          onClick={() => separar((valor) => !valor)}
        >
          {separada ? <RotateCcw aria-hidden="true" /> : <Layers3 aria-hidden="true" />}
          {separada ? textos.reunir : textos.explorar}
        </Button>
        <span className="escultura-dica">{textos.dica}</span>
      </figcaption>
    </figure>
  )
}
