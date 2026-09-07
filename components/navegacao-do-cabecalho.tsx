"use client"

/**
 * A NAVEGAÇÃO DO CABEÇALHO nas duas larguras — a fila no desktop e a gaveta no
 * celular.
 *
 * POR QUE AS DUAS NO MESMO ARQUIVO, e não uma em `menu-mobile.tsx`. Elas
 * renderizam a MESMA lista de rotas e dependem da MESMA regra de item ativo, e
 * essa regra é sutil o bastante para não sobreviver a duas cópias (o parágrafo
 * de `rotaAtiva`, abaixo, explica o que ela corrige). Separá-las criaria dois
 * arquivos que precisam ser corrigidos juntos para sempre — que é o defeito que
 * este repositório persegue no resto do código. O que muda entre as duas é
 * layout, e layout é `className`.
 *
 * ELAS RECEBEM TEXTO PRONTO e não importam `@/conteudo/carregar`: componente de
 * cliente que importa o carregador empacota os três JSON de texto e o validador
 * do esquema no bundle do navegador para escrever cinco palavras. Quem lê o
 * conteúdo é `components/cabecalho.tsx`, que é servidor.
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { BookOpen, Boxes, Download, House, Menu, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"
import { MarcaGitHub } from "@/components/marca-github"
import type { ChaveDeRota } from "@/lib/rotas"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

/** O ícone não atravessa a fronteira servidor→cliente; a chave, sim. */
const ICONES: Record<ChaveDeRota, typeof House> = {
  inicio: House,
  docs: BookOpen,
  instalacao: Download,
  uso: Terminal,
  modulos: Boxes,
}

export type ItemDeNavegacao = {
  chave: ChaveDeRota
  href: string
  rotulo: string
}

/**
 * O ITEM ATIVO É O DE CAMINHO MAIS LONGO QUE CASA, e não todo item que casa.
 *
 * Com `/instalacao` e `/docs` lado a lado, um `startsWith` por item bastava.
 * Com `/docs/installation` DENTRO de `/docs` — e com a home, que é prefixo de
 * tudo —, ele marcava vários: `aria-current="page"` repetido na mesma barra (o
 * leitor de tela anuncia três páginas atuais) e vários `layoutId` iguais
 * brigando pelo mesmo sublinhado. Medido no primeiro build da árvore nova, em
 * `out/pt-br/docs/installation/index.html`.
 *
 * O teste é `===` OU `startsWith(href + "/")`, e a barra no segundo caso é o
 * que faz ele aguentar o `trailingSlash: true` do `next.config.ts`: o endereço
 * real é `/docs/`, o `href` é `/docs`, e a igualdade sozinha nunca casaria.
 */
function rotaAtiva(
  caminho: string,
  itens: readonly ItemDeNavegacao[]
): ItemDeNavegacao | undefined {
  return itens.reduce<ItemDeNavegacao | undefined>((melhor, item) => {
    const casa = caminho === item.href || caminho.startsWith(`${item.href}/`)
    if (!casa) return melhor
    return !melhor || item.href.length > melhor.href.length ? item : melhor
  }, undefined)
}

/** A fila de links do desktop. */
export function NavegacaoDoCabecalho({
  itens,
  rotulo,
  className,
}: {
  itens: readonly ItemDeNavegacao[]
  rotulo: string
  className?: string
}) {
  const caminho = usePathname()
  const ativo = rotaAtiva(caminho, itens)
  const reduzido = useReducedMotion()

  return (
    <nav aria-label={rotulo} className={className}>
      <ul className="flex items-center gap-0.5">
        {itens.map((item) => {
          const estaAtivo = ativo?.chave === item.chave
          return (
            <li key={item.chave} className="relative">
              <Link
                href={item.href}
                // Cor E `aria-current`, sempre os dois: só a cor deixa a barra
                // muda para leitor de tela e ilegível para quem não distingue
                // os dois tons de aço.
                aria-current={estaAtivo ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm transition-colors",
                  estaAtivo
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.rotulo}
              </Link>
              {/* O sublinhado encosta na borda de baixo do cabeçalho: a barra
                  tem 80px (`h-header`), o link tem 40px e está centrado, então
                  sobram 20px de cada lado — daí o `-bottom-5`.

                  `layoutId` faz ele DESLIZAR entre os itens em vez de sumir e
                  reaparecer. É o caso em que o Motion paga sozinho: o elemento
                  é o mesmo, a posição é que muda. Para quem pediu menos
                  movimento ele troca de lugar sem percurso — a informação
                  (onde estou) é a mesma, o deslocamento é que sai. */}
              {estaAtivo ? (
                <motion.span
                  layoutId="cabecalho-rota-ativa"
                  className="absolute inset-x-3 -bottom-5 h-0.5 rounded-full bg-brand"
                  transition={
                    reduzido
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 30 }
                  }
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * A gaveta do celular. Ela substitui a barra de rolagem horizontal que existia
 * aqui — fila que rola de lado esconde os últimos itens atrás de um gesto que
 * nada anuncia, e no toque ela ainda briga com a rolagem da página.
 */
export function MenuMobile({
  itens,
  rotulos,
  repositorio,
  className,
}: {
  itens: readonly ItemDeNavegacao[]
  rotulos: {
    menu: string
    fechar: string
    navegacaoPrincipal: string
    repositorio: string
  }
  /** `null` quando o bloco opcional `identidade.repositorio` não existe. */
  repositorio: string | null
  className?: string
}) {
  const caminho = usePathname()
  const ativo = rotaAtiva(caminho, itens)
  // A gaveta é controlada porque quem a fecha é o link: `SheetClose` em volta
  // de um `<Link>` transformaria a âncora num botão do Base UI (`useButton`),
  // e âncora que perde a semântica de link perde junto o "abrir em nova aba" e
  // o anúncio de destino no leitor de tela.
  const [aberto, setAberto] = useState(false)

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={rotulos.menu}
            // 44px no toque, contra os 36px do resto da barra: este é o único
            // controle que a pessoa precisa acertar antes de ver qualquer
            // outro, e é o alvo mínimo recomendado para o dedo.
            className={cn("size-11", className)}
          />
        }
      >
        <Menu aria-hidden className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="gap-0"
        rotuloDeFechar={rotulos.fechar}
      >
        <SheetHeader className="border-b border-border px-4 py-3.5">
          <SheetTitle>{rotulos.menu}</SheetTitle>
        </SheetHeader>

        <nav
          aria-label={rotulos.navegacaoPrincipal}
          className="min-h-0 flex-1 overflow-y-auto p-2"
        >
          <ul className="flex flex-col gap-0.5">
            {itens.map((item) => {
              const Icone = ICONES[item.chave]
              const estaAtivo = ativo?.chave === item.chave
              return (
                <li key={item.chave}>
                  <Link
                    href={item.href}
                    aria-current={estaAtivo ? "page" : undefined}
                    onClick={() => setAberto(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                      estaAtivo
                        ? "bg-brand-subtle font-medium text-brand-subtle-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icone aria-hidden className="size-4" />
                    {item.rotulo}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* O repositório sai da barra abaixo de `lg` e reaparece aqui: no
            celular ele competiria por 36px com a busca e com o tema, e é o
            único dos três que ninguém abre no meio de uma leitura. */}
        {repositorio ? (
          <div className="border-t border-border p-2">
            <a
              href={repositorio}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MarcaGitHub className="size-4" />
              {rotulos.repositorio}
            </a>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
