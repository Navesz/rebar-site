/**
 * O RODAPÉ DE PÁGINA: quem vem antes e quem vem depois na sequência de leitura.
 *
 * A sequência sai de `ORDEM_DOS_DOCS`, a MESMA lista que desenha a barra
 * lateral. Uma ordem escrita aqui de novo seria a segunda fonte, e a
 * divergência entre as duas manda o visitante para uma página que a barra
 * mostra em outro lugar — andar em círculo é o defeito mais barato de produzir
 * e o mais caro de perceber, porque nada quebra.
 *
 * O RÓTULO É O DA NAVEGAÇÃO, e não o `titulo` da página, de propósito: é o
 * mesmo texto que a barra lateral mostra, então o visitante reconhece o destino
 * antes de clicar. `paginas` é bloco opcional no esquema e `rotulos.navegacao`
 * não é — usar o rótulo também tira daqui um `notFound` que não teria o que
 * fazer no rodapé de uma página que já renderizou.
 */

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { ORDEM_DOS_DOCS } from "@/components/navegacao-de-docs"
import { caminhoDe, textos, type Idioma } from "@/conteudo/carregar"
import { rotaDe, type ChaveDeDoc } from "@/lib/rotas"
import { cn } from "@/lib/utils"

export function AnteriorProximo({
  idioma,
  chave,
  className,
}: {
  idioma: Idioma
  chave: ChaveDeDoc
  className?: string
}) {
  const t = textos(idioma)
  const posicao = ORDEM_DOS_DOCS.indexOf(chave)
  const anterior = posicao > 0 ? ORDEM_DOS_DOCS[posicao - 1] : undefined
  const proximo =
    posicao >= 0 && posicao < ORDEM_DOS_DOCS.length - 1
      ? ORDEM_DOS_DOCS[posicao + 1]
      : undefined

  if (!anterior && !proximo) return null

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {anterior ? (
        <Salto
          idioma={idioma}
          chave={anterior}
          rotulo={t.rotulos.anterior}
          destino={t.rotulos.navegacao[anterior]}
          sentido="anterior"
        />
      ) : null}
      {proximo ? (
        <Salto
          idioma={idioma}
          chave={proximo}
          rotulo={t.rotulos.proximo}
          destino={t.rotulos.navegacao[proximo]}
          sentido="proximo"
          // Primeira página da sequência: sem o "anterior" para ocupar a
          // esquerda, o "próximo" iria parar lá e o sentido da seta brigaria
          // com a posição na tela.
          className={cn(!anterior && "sm:col-start-2")}
        />
      ) : null}
    </div>
  )
}

function Salto({
  idioma,
  chave,
  rotulo,
  destino,
  sentido,
  className,
}: {
  idioma: Idioma
  chave: ChaveDeDoc
  /** `rotulos.anterior` ou `rotulos.proximo` — a etiqueta pequena. */
  rotulo: string
  /** O nome da página de destino. */
  destino: string
  sentido: "anterior" | "proximo"
  className?: string
}) {
  const paraTras = sentido === "anterior"
  const Seta = paraTras ? ArrowLeft : ArrowRight

  return (
    <Link
      href={caminhoDe(idioma, rotaDe(chave))}
      // O nome acessível do link sai do próprio conteúdo — "Anterior" seguido
      // do nome da página —, então não há `aria-label` inventado aqui e o
      // rótulo continua saindo do JSON nos três idiomas.
      className={cn(
        "group flex flex-col gap-1 rounded-xl border border-border/70 px-4 py-3 transition-colors",
        "hover:border-brand-border hover:bg-brand-subtle/40",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        !paraTras && "sm:items-end sm:text-right",
        className
      )}
    >
      <span className="text-caption text-muted-foreground">{rotulo}</span>
      <span className="flex items-center gap-2 text-sm font-medium">
        {paraTras ? (
          <Seta
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5"
          />
        ) : null}
        {destino}
        {paraTras ? null : (
          <Seta
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        )}
      </span>
    </Link>
  )
}
