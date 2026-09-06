"use client"

/**
 * A navegação, e o `aria-current` que a torna legível sem enxergar a cor.
 *
 * O item ativo é marcado por DUAS coisas ao mesmo tempo: cor e
 * `aria-current="page"`. Só a cor deixaria a navegação muda para leitor de tela
 * e ilegível para quem não distingue os dois tons — e é o tipo de omissão que
 * nenhuma régua deste projeto pega, porque acessibilidade automática pega
 * talvez metade.
 *
 * ELE RECEBE TEXTO PRONTO, e não importa `conteudo/carregar`. Este é um
 * componente de cliente: importar o carregador aqui empacotaria os três JSON de
 * texto e o validador inteiro no bundle do navegador, para mostrar cinco
 * palavras. O servidor lê o conteúdo e passa o que a barra precisa.
 *
 * ESTE ARQUIVO É PROVISÓRIO. Um cabeçalho novo — com busca, seletor de tema e
 * barra lateral de documentação — entra por cima dele na próxima rodada, então
 * o que está aqui é o mínimo para as quinze rotas serem alcançáveis.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { BookOpen, Boxes, Download, Home, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"
import type { ChaveDeRota } from "@/lib/rotas"

/** O ícone não atravessa a fronteira servidor→cliente; a chave, sim. */
const ICONES: Record<ChaveDeRota, typeof Home> = {
  inicio: Home,
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

export type OpcaoDeIdioma = {
  /** O prefixo desta versão: `""` para a raiz, `/pt-br` para as traduzidas. */
  prefixo: string
  /** A tag BCP 47, para o `hreflang` do link. */
  tag: string
  /** O nome escrito NO PRÓPRIO idioma — é o que a pessoa procura na lista. */
  nome: string
  atual: boolean
}

export function Navegacao({
  itens,
  idiomas,
  rotuloDaNavegacao,
  rotuloDeIdioma,
}: {
  itens: readonly ItemDeNavegacao[]
  idiomas: readonly OpcaoDeIdioma[]
  rotuloDaNavegacao: string
  rotuloDeIdioma: string
}) {
  const caminho = usePathname()

  // A MESMA PÁGINA NO OUTRO IDIOMA, e não a home dele. Trocar de idioma no meio
  // da documentação e cair na primeira tela é o seletor que faz a pessoa
  // desistir de trocar — e o caminho é o mesmo nos três idiomas, então o
  // conserto é só tirar e pôr o prefixo.
  const semPrefixo = idiomas.reduce((atual, { prefixo }) => {
    if (!prefixo) return atual
    if (atual === prefixo) return "/"
    return atual.startsWith(`${prefixo}/`) ? atual.slice(prefixo.length) : atual
  }, caminho)

  // O ITEM ATIVO É O DE CAMINHO MAIS LONGO QUE CASA, e não todo item que casa.
  //
  // Com `/instalacao` e `/docs` lado a lado, um `startsWith` por item bastava.
  // Com `/docs/installation` DENTRO de `/docs`, ele marcava os dois: dois
  // `aria-current="page"` na mesma barra (o leitor de tela anuncia duas páginas
  // atuais) e dois `layoutId` iguais brigando pelo mesmo sublinhado. Medido no
  // primeiro build da árvore nova, em `out/pt-br/docs/installation/index.html`.
  const ativo = itens.reduce<ItemDeNavegacao | undefined>((melhor, item) => {
    const casa = caminho === item.href || caminho.startsWith(`${item.href}/`)
    if (!casa) return melhor
    return !melhor || item.href.length > melhor.href.length ? item : melhor
  }, undefined)

  return (
    <nav
      aria-label={rotuloDaNavegacao}
      className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-2">
        <ul className="flex flex-1 gap-1 overflow-x-auto">
          {itens.map(({ chave, href, rotulo }) => {
            const Icone = ICONES[chave]
            const estaAtivo = ativo?.chave === chave
            return (
              <li key={chave} className="relative shrink-0">
                <Link
                  href={href}
                  aria-current={estaAtivo ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    estaAtivo
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
                {estaAtivo ? (
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

        <ul aria-label={rotuloDeIdioma} className="flex shrink-0 gap-1">
          {idiomas.map(({ prefixo, tag, nome, atual }) => (
            <li key={tag}>
              <Link
                href={
                  prefixo && semPrefixo === "/"
                    ? prefixo
                    : `${prefixo}${semPrefixo}`
                }
                hrefLang={tag}
                aria-current={atual ? "true" : undefined}
                className={cn(
                  "rounded-md px-2 py-2 text-sm transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  atual
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {nome}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
