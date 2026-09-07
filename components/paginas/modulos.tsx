import { notFound } from "next/navigation"
import { CircleAlert } from "lucide-react"

import { ArtigoDeDoc } from "@/components/artigo-de-doc"
import { PainelDeCodigo } from "@/components/painel-de-codigo"
import { Revelar } from "@/components/revelar"
import { TituloDeSecao } from "@/components/titulo-de-secao"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { textos, type Idioma } from "@/conteudo/carregar"
import { ancorasDe } from "@/lib/ancoras"

/**
 * A REFERÊNCIA DOS MÓDULOS: nome, resumo, comando, os números e o limite.
 *
 * OS NÚMEROS SÃO TIPOGRAFIA, E NÃO ETIQUETA. Eles moravam dentro de `Badge`,
 * onde valor e rótulo saíam do mesmo tamanho e do mesmo peso — "23 regras" lido
 * como uma expressão só, em letra de 12px. São a informação mais densa da
 * página e agora têm a hierarquia que isso pede: o VALOR grande e monoespaçado,
 * o RÓTULO pequeno embaixo. `tabular-nums` para as casas alinharem entre os
 * módulos: sem ele, `23` e `18` na mesma linha ficam com larguras diferentes e
 * a coluna balança.
 *
 * A marcação é `<dl>` porque é literalmente isso — um termo e o valor dele. O
 * `<dt>` vem ANTES do `<dd>` no DOM, que é o que o HTML exige, e o
 * `flex-col-reverse` inverte a ORDEM VISUAL sem mexer na ordem do documento.
 *
 * O LIMITE É UM `Alert`, e não uma nota de rodapé. A doutrina desta árvore é
 * que o limite declarado vale mais que a capacidade declarada; enterrá-lo em
 * letra miúda contradiria a própria página, que é sobre não confundir aparato
 * com coisa.
 */
export function Modulos({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const p = t.paginas?.modulos
  if (!p) notFound()

  const ancoras = ancorasDe(p.itens.map((modulo) => modulo.nome))
  const indice = p.itens.map((modulo, i) => ({
    id: ancoras[i],
    titulo: modulo.nome,
  }))

  const rotulosDoPainel = {
    copiar: t.rotulos.copiar,
    copiado: t.rotulos.copiado,
  }

  return (
    <ArtigoDeDoc
      idioma={idioma}
      chave="modulos"
      titulo={p.titulo}
      resumo={p.resumo}
      indice={indice}
    >
      {/* `@container` e não breakpoint de janela: com a trilha da direita
          aberta o artigo perde 14rem, e uma media query daria duas colunas de
          card espremidas justamente na largura em que elas não cabem. */}
      <div className="@container grid gap-6 @3xl:grid-cols-2">
        {p.itens.map((modulo, i) => (
          <div key={modulo.nome} className="h-full">
            <Revelar atraso={Math.min(i, 4) * 0.06} className="h-full">
              <Card className="h-full gap-5">
                <CardHeader>
                  {/* `text-h3` (20–23px) e não `text-h4` (18px): o NOME DO
                      MÓDULO é o maior texto do cartão. Estava ao contrário —
                      o número da métrica saía em `text-h3` e o nome em
                      `text-h4`, então em /docs/modules o texto que mais
                      chamava em cada cartão era "23" ou "18", e não
                      "rebar-check". O número é a informação mais densa da
                      página, mas quem procura um módulo procura pelo nome
                      dele; a métrica só faz sentido depois de saber de qual
                      módulo ela é. */}
                  <TituloDeSecao id={ancoras[i]} className="font-mono text-h3">
                    {modulo.nome}
                  </TituloDeSecao>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {modulo.resumo}
                  </p>
                </CardHeader>

                {/* `flex-1` para o `mt-auto` do alerta ter contra o que
                    empurrar: sem ele os quatro cards da grade alinham o topo e
                    deixam o limite em alturas diferentes, que é onde o olho
                    para de comparar módulo com módulo. */}
                <CardContent className="flex flex-1 flex-col gap-5">
                  <PainelDeCodigo
                    abas={[{ rotulo: modulo.nome, codigo: modulo.comando }]}
                    prompt="$"
                    rotulos={rotulosDoPainel}
                  />

                  {modulo.numeros.length ? (
                    <dl className="flex flex-wrap gap-x-8 gap-y-4 border-y border-border/60 py-4">
                      {modulo.numeros.map((numero) => (
                        <div
                          key={numero.rotulo}
                          className="flex min-w-0 flex-col-reverse"
                        >
                          <dt className="text-caption text-muted-foreground">
                            {numero.rotulo}
                          </dt>
                          {/* `text-h4` (18px): um degrau ABAIXO do nome do
                              módulo e dois ACIMA do rótulo — o valor continua
                              sendo o maior texto do par, sem disputar o
                              cartão com o título. */}
                          <dd className="font-mono text-h4 tabular-nums">
                            {numero.valor}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  {/* `bg-muted` sobre o `bg-card` do `Alert`: dentro de um
                      `Card` as duas superfícies são a MESMA cor, e o alerta
                      desapareceria no fundo em que está apoiado. */}
                  <Alert className="mt-auto bg-muted/60 px-3 py-2.5">
                    <CircleAlert aria-hidden />
                    <AlertTitle>{p.rotuloLimite}</AlertTitle>
                    <AlertDescription className="leading-relaxed">
                      {modulo.limite}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </Revelar>
          </div>
        ))}
      </div>
    </ArtigoDeDoc>
  )
}
