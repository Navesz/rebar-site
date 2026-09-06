import { notFound } from "next/navigation"
import { CircleAlert } from "lucide-react"

import { Comando } from "@/components/comando"
import { Revelar } from "@/components/revelar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { textos, type Idioma } from "@/conteudo/carregar"

export function Modulos({ idioma }: { idioma: Idioma }) {
  const p = textos(idioma).paginas?.modulos
  if (!p) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Revelar>
        <h1 className="text-4xl font-semibold tracking-tight">{p.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {p.resumo}
        </p>
      </Revelar>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {p.itens.map((m, i) => (
          <Revelar key={m.nome} atraso={Math.min(i, 4) * 0.06}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-mono text-base">{m.nome}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {m.resumo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Comando>{m.comando}</Comando>

                {m.numeros.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {m.numeros.map((n) => (
                      <li key={n.rotulo}>
                        <Badge variant="secondary" className="font-normal">
                          <span className="font-mono tabular-nums">
                            {n.valor}
                          </span>
                          <span className="ml-1.5 text-muted-foreground">
                            {n.rotulo}
                          </span>
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {/* O LIMITE TEM O MESMO PESO VISUAL DO RESUMO, de propósito.
                    Módulo descrito só pelo que faz é propaganda; a doutrina
                    desta árvore é que o limite declarado vale mais que a
                    capacidade declarada, e enterrar isso em letra miúda
                    contradiria a própria página. */}
                <div className="flex gap-2 border-t border-border/60 pt-4">
                  <CircleAlert
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {p.rotuloLimite}{" "}
                    </span>
                    {m.limite}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Revelar>
        ))}
      </div>
    </div>
  )
}
