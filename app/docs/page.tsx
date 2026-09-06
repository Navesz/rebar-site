import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Check } from "lucide-react"

import { Revelar } from "@/components/revelar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { site } from "@/conteudo/carregar"

export const metadata: Metadata = { title: "Documentação" }

/**
 * O ÍNDICE E O CORPO SAEM DA MESMA LISTA, e por isso não podem divergir.
 * Um sumário escrito à mão ao lado das seções é a segunda fonte que envelhece
 * separada — exatamente o defeito que este projeto persegue no código.
 */
const ancora = (titulo: string) =>
  titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export default function Pagina() {
  const p = site.paginas?.docs
  if (!p) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Revelar>
        <h1 className="text-4xl font-semibold tracking-tight">{p.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {p.resumo}
        </p>
      </Revelar>

      <Revelar atraso={0.08}>
        <nav aria-label="Nesta página" className="mt-10">
          <h2 className="text-xs tracking-wide text-muted-foreground uppercase">
            Nesta página
          </h2>
          <ul className="mt-3 space-y-1.5">
            {p.secoes.map((s) => (
              <li key={s.titulo}>
                <a
                  href={`#${ancora(s.titulo)}`}
                  className="rounded text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {s.titulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Revelar>

      {/* Sem `type="multiple"`: isto é Base UI, não Radix — o Root já abre
          vários por padrão (`openMultiple`). Passar a prop do Radix aqui é
          erro de tipo, e foi o que o typecheck acusou. Numa página de
          referência a pessoa compara duas seções, e o acordeão que fecha a
          anterior a obriga a rolar duas vezes pelo mesmo par. */}
      <Accordion
        defaultValue={p.secoes.map((s) => ancora(s.titulo))}
        className="mt-10"
      >
        {p.secoes.map((s, i) => (
          <AccordionItem
            key={s.titulo}
            value={ancora(s.titulo)}
            id={ancora(s.titulo)}
            // `scroll-mt` para o cabeçalho fixo não cobrir o título ao pular
            // pela âncora — sem isto o link do índice leva a pessoa para o
            // meio do parágrafo.
            className="scroll-mt-20"
          >
            <AccordionTrigger className="text-left text-lg font-medium">
              {s.titulo}
            </AccordionTrigger>
            <AccordionContent>
              <Revelar atraso={Math.min(i, 3) * 0.04}>
                <p className="leading-relaxed text-muted-foreground">
                  {s.corpo}
                </p>
                {s.itens.length ? (
                  <ul className="mt-4 space-y-2">
                    {s.itens.map((item) => (
                      <li key={item} className="flex gap-2.5 text-sm">
                        <Check
                          aria-hidden
                          className="mt-0.5 size-4 shrink-0 text-primary"
                        />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Revelar>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
