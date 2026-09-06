import { notFound } from "next/navigation"
import { Lightbulb } from "lucide-react"

import { Comando } from "@/components/comando"
import { Revelar } from "@/components/revelar"
import { Separator } from "@/components/ui/separator"
import { textos, type Idioma } from "@/conteudo/carregar"

export function Uso({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const p = t.paginas?.uso
  if (!p) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Revelar>
        <h1 className="text-4xl font-semibold tracking-tight">{p.titulo}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {p.resumo}
        </p>
      </Revelar>

      <div className="mt-12 space-y-12">
        {p.exemplos.map((ex, i) => (
          <section key={ex.titulo}>
            <Revelar atraso={Math.min(i, 4) * 0.06}>
              <h2 className="text-xl font-medium">{ex.titulo}</h2>
              <Comando className="mt-4">{ex.comando}</Comando>

              {/* A saída é um bloco SEPARADO do comando, e não um comentário
                  dentro dele: quem copia o comando não quer levar a saída
                  junto, e quem lê a saída precisa saber que ela não é para
                  digitar.

                  O TEXTO DA SAÍDA NÃO É TRADUZIDO, nos três idiomas: é o que o
                  programa imprime, e o programa imprime em português. O rótulo
                  ao lado é que muda — ele é da interface, ela é do programa. */}
              {ex.saida ? (
                <figure className="mt-3">
                  <figcaption className="mb-2 text-xs tracking-wide text-muted-foreground uppercase">
                    {t.rotulos.saida}
                  </figcaption>
                  <pre className="overflow-x-auto rounded-lg border border-border/60 bg-background p-4 text-sm leading-relaxed">
                    <code className="font-mono">{ex.saida}</code>
                  </pre>
                </figure>
              ) : null}

              {ex.nota ? (
                <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{ex.nota}</span>
                </p>
              ) : null}
            </Revelar>
            {i < p.exemplos.length - 1 ? <Separator className="mt-12" /> : null}
          </section>
        ))}
      </div>
    </div>
  )
}
