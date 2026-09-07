"use client"

/**
 * O SELETOR DE TEMA — e o motivo de ele existir é que o atalho não bastava.
 *
 * `components/theme-provider.tsx` escuta a tecla `d` desde o começo e troca
 * claro/escuro. O problema não é o atalho: é que interface que só se opera por
 * atalho não ensinado não é operável. Ninguém aperta `d` num site que nunca
 * disse que existe um `d`. Daí as duas metades desta peça — um botão que se vê,
 * e o `<Kbd>` dentro do menu, que é onde a tecla finalmente é dita em voz alta.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * A DIVERGÊNCIA DE HIDRATAÇÃO, que é o defeito clássico deste componente.
 *
 * `next-themes` não sabe o tema no servidor: ele lê `localStorage` e a
 * preferência do sistema no navegador. `useTheme()` devolve `undefined` no
 * render do servidor E no render de hidratação. Escolher o ícone por esse valor
 * pinta um sol no HTML e uma lua na primeira árvore do cliente — o React acusa
 * a divergência e joga fora a árvore hidratada para reconstruir.
 *
 * A saída de sempre é `useState(false)` + `useEffect(() => setMontado(true))`,
 * e ela está barrada aqui por dois motivos: a regra `react-hooks/
 * set-state-in-effect`, que o `eslint-config-next` liga neste projeto e que
 * reprova valor derivado do ambiente virando estado, e o buraco visível — o
 * botão nasce vazio e o ícone aparece um quadro depois.
 *
 * O QUE ENTROU NO LUGAR: os DOIS ícones sempre no HTML, e o CSS escolhe.
 * `next-themes` já escreve a classe `.dark` no `<html>` por script bloqueante
 * ANTES da primeira pintura, e a variante `dark` deste projeto é
 * `&:is(.dark *)` (`app/globals.css`) — então `dark:hidden` e `hidden
 * dark:block` resolvem a troca sem JavaScript nenhum, sem estado e sem effect.
 * A marcação do servidor e a do cliente são idênticas por construção: não há
 * o que divergir.
 *
 * O tema SELECIONADO (claro/escuro/sistema) só é lido dentro do popup, e o
 * popup não existe no HTML — o `Menu.Portal` do Base UI monta o conteúdo na
 * abertura. Quando aquele `theme` é lido pela primeira vez a hidratação
 * terminou há muito tempo.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"

/**
 * A tecla que `theme-provider.tsx` escuta, escrita como ela aparece gravada no
 * teclado. Não é conteúdo e não se traduz — é o mesmo caso do "⌘"/"Ctrl" de
 * `paleta-de-busca.tsx`: traduzir seria mentir sobre a tecla que a pessoa tem
 * de apertar.
 */
const TECLA = "D"

/**
 * Os três valores que `next-themes` entende. Eles são a API da biblioteca, não
 * texto: o rótulo que a pessoa lê vem por `rotulos`, ao lado.
 */
const CLARO = "light"
const ESCURO = "dark"
const SISTEMA = "system"

export function SeletorDeTema({
  rotulos,
  className,
}: {
  rotulos: {
    tema: string
    claro: string
    escuro: string
    sistema: string
  }
  className?: string
}) {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={rotulos.tema}
            title={rotulos.tema}
            className={className}
          />
        }
      >
        <Sun aria-hidden className="size-4 dark:hidden" />
        <Moon aria-hidden className="hidden size-4 dark:block" />
      </DropdownMenuTrigger>

      {/* `w-auto` derruba o `w-(--anchor-width)` do componente: ancorado num
          botão de 36px, o menu nasceria com 36px de largura. */}
      <DropdownMenuContent align="end" className="w-auto min-w-44">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(valor) => setTheme(String(valor))}
        >
          {/* O rótulo do grupo é o que dá nome acessível ao conjunto de opções
              (o Base UI liga os dois por `aria-labelledby`). O `<Kbd>` vai
              `aria-hidden` para não entrar nesse nome: quem usa leitor de tela
              ouviria "Tema D" a cada abertura, e a tecla já foi anunciada por
              quem opera com as mãos, que é para quem ela serve. */}
          <DropdownMenuLabel className="flex items-center justify-between gap-6">
            {rotulos.tema}
            <Kbd aria-hidden>{TECLA}</Kbd>
          </DropdownMenuLabel>

          {/* 44px no toque nos tres, pelo mesmo motivo do seletor de idioma:
              o item nasce com 28px e sem folga do vizinho, e o dedo que erra
              troca o tema em vez de fechar o menu. */}
          <DropdownMenuRadioItem
            value={CLARO}
            closeOnClick
            className="min-h-11 lg:min-h-0"
          >
            <Sun aria-hidden />
            {rotulos.claro}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value={ESCURO}
            closeOnClick
            className="min-h-11 lg:min-h-0"
          >
            <Moon aria-hidden />
            {rotulos.escuro}
          </DropdownMenuRadioItem>
          {/* "Sistema" é o padrão de `theme-provider.tsx` e por isso está na
              lista: sem ele, quem trocou uma vez não tem como devolver a
              decisão ao sistema operacional. */}
          <DropdownMenuRadioItem
            value={SISTEMA}
            closeOnClick
            className="min-h-11 lg:min-h-0"
          >
            <Monitor aria-hidden />
            {rotulos.sistema}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
