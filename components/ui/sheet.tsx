"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        // `bg-veu` e não `bg-black/10`: preto a 10% resolve o tema claro e não
        // faz NADA no escuro — medido, ele mudava a superfície escura em menos
        // de 3%, e a gaveta abria sem separar figura de fundo. O token de
        // `globals.css` tem a tinta do texto e alfa por tema (0.28 no claro,
        // 0.55 no escuro), que é onde o número precisa morar.
        "fixed inset-0 z-50 bg-veu transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        // Mesma decisão da paleta ⌘K: para quem pediu menos movimento o véu
        // aparece já opaco. O `!` existe porque a regra derrubada é uma
        // utilitária como esta, e depender da ordem em que o Tailwind as emite
        // seria apostar, não decidir.
        "motion-reduce:animate-none! motion-reduce:transition-none!",
        className
      )}
      {...props}
    />
  )
}

/**
 * O rótulo do botão de fechar é COBRADO PELO TIPO, e só quando o botão existe —
 * mesma união de `components/ui/dialog.tsx`, e pelo mesmo motivo: o "Close"
 * cravado que o `shadcn add` emite passaria em build, lint e teste, e só
 * apareceria para quem usa leitor de tela, em inglês, numa gaveta em espanhol.
 */
type FecharDaGaveta =
  | { showCloseButton: false; rotuloDeFechar?: undefined }
  | { showCloseButton?: true; rotuloDeFechar: string }

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  rotuloDeFechar,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
} & FecharDaGaveta) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          // `shadow-overlay` e não `shadow-lg`: a sombra do Tailwind é preta
          // fixa e some no tema escuro, onde não há o que escurecer. O token de
          // `globals.css` pinta com `--elevacao`, que troca por tema. A gaveta
          // flutua SOBRE a página (como a paleta ⌘K), por isso é `overlay` e
          // não `raised` — a escala do projeto tem duas alturas só, e `raised`
          // é para o que está apoiado na página, não por cima dela.
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-overlay transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem] data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          // As `translate-*-[2.5rem]` acima são 40px de deslize, e 40px é
          // movimento de sobra para quem marcou "reduzir movimento" no sistema
          // — a gaveta chega direto no lugar. Mesmo par (e mesmo `!`) da
          // `paleta-de-busca.tsx`: a regra derrubada é utilitária como esta, e
          // confiar na ordem de emissão do Tailwind seria apostar.
          "motion-reduce:animate-none! motion-reduce:transition-none!",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                // 44px, e não os 28px do `icon-sm` que o shadcn emite: as
                // gavetas SÓ existem abaixo de `lg` (as duas somem no
                // desktop), e o botão que as ABRE já é 44px por ser o alvo
                // mínimo recomendado para o dedo. Fechar não pode ser três
                // vezes mais difícil de acertar do que abrir.
                //
                // A âncora é o EIXO DO CABEÇALHO da gaveta, não o canto. Com
                // `px-4 py-3.5` e um título de 24px de altura de linha, o eixo
                // fica a 14+12 = 26px do topo: `top-1` (4px) + 22px de meio
                // botão cai exatamente nele. E o ícone de 16px, centrado nos
                // 44px, sobra 14px de cada lado — `right-0.5` (2px) põe a
                // borda direita dele nos mesmos 16px do `px-4` do cabeçalho.
                // A área de toque transborda para a aresta; o glifo não.
                // (Na gaveta do índice de docs, cujo cabeçalho usa o `p-4`
                // padrão, o eixo está a 28px e o X fica 2px acima dele.)
                className="absolute top-1 right-0.5 size-11"
                size="icon-lg"
              />
            }
          >
            <XIcon />
            <span className="sr-only">{rotuloDeFechar}</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
