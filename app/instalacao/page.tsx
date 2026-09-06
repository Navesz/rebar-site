import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Terminal } from "lucide-react"

import { Comando } from "@/components/comando"
import { Revelar } from "@/components/revelar"
import { Badge } from "@/components/ui/badge"
import { site } from "@/conteudo/carregar"

/**
 * `paginas` é bloco condicional no esquema, então pode não existir — e o tipo
 * obriga a tratar. `notFound()` em vez de renderizar vazio: uma rota que
 * responde 200 com nada dentro é pior que uma que não existe, porque entra no
 * índice de busca e o visitante chega numa página em branco.
 */
export const metadata: Metadata = { title: "Instalação" }

export default function Pagina() {
  const p = site.paginas?.instalacao
  if (!p) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Revelar>
        <h1 className="text-4xl font-semibold tracking-tight">{p.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {p.resumo}
        </p>
      </Revelar>

      <ol className="mt-12 space-y-10">
        {p.passos.map((passo, i) => (
          <li key={passo.titulo}>
            {/* O atraso cresce com o índice para os passos entrarem em
                cascata, e para no quinto: escada longa demais vira espera. */}
            <Revelar atraso={Math.min(i, 4) * 0.06}>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="font-mono tabular-nums">
                  {i + 1}
                </Badge>
                <h2 className="text-xl font-medium">{passo.titulo}</h2>
              </div>
              <Comando className="mt-4">{passo.comando}</Comando>
              {passo.nota ? (
                <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Terminal aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{passo.nota}</span>
                </p>
              ) : null}
            </Revelar>
          </li>
        ))}
      </ol>
    </div>
  )
}
