import { notFound } from "next/navigation"
import { CornerDownRight, Lightbulb } from "lucide-react"

import { ArtigoDeDoc } from "@/components/artigo-de-doc"
import { PainelDeCodigo } from "@/components/painel-de-codigo"
import { Revelar } from "@/components/revelar"
import { TituloDeSecao } from "@/components/titulo-de-secao"
import { textos, type Idioma } from "@/conteudo/carregar"
import { ancorasDe } from "@/lib/ancoras"

/**
 * O IDIOMA DA SAIDA DO PROGRAMA, que nao e o da pagina.
 *
 * O placar do rebar sai em portugues porque e o que o programa realmente
 * imprime — traduzi-lo seria publicar uma saida que nao existe, e essa decisao
 * ja esta escrita no contrato de conteudo. Mas dentro de `<html lang="en">` ou
 * `<html lang="es-ES">` o leitor de tela pronuncia esse portugues com fonemas
 * de ingles ou de espanhol, e "11 de 13 · 1 nao se aplica" sai irreconhecivel.
 * A marca vai no elemento que carrega a saida, e nao na `<figure>`: a legenda
 * ao lado dela E traduzida.
 *
 * O valor sai do conteudo, e nao de um literal — a mesma regra que vale para
 * todo o resto do site.
 */
const IDIOMA_DA_SAIDA = textos("pt-br").tagDeIdioma

/**
 * A PÁGINA DE USO: um exemplo por seção, o comando e — quando existe — a saída.
 *
 * O BLOCO DE SAÍDA NÃO PARECE UM BLOCO DE COMANDO, E É DE PROPÓSITO. São três
 * diferenças, e cada uma responde a uma pergunta que o visitante faz sem
 * perceber:
 *
 *   · SEM `$` e sem botão de copiar — "isto eu digito?" Não: ninguém copia
 *     saída de terminal para colar em lugar nenhum. Um botão de copiar aqui
 *     seria um convite a uma ação que não existe.
 *   · SUPERFÍCIE CLARA e borda TRACEJADA, contra o grafite sólido do painel de
 *     código — "de onde isto veio?" Do programa, e não da pessoa.
 *   · a etiqueta `rotulos.saida` em cima, que é o único texto de interface
 *     dentro do bloco.
 *
 * O TEXTO DA SAÍDA NÃO É TRADUZIDO, nos três idiomas, e isso é decisão do
 * projeto escrita no esquema: é o que o programa imprime, e o programa imprime
 * em português. Traduzir seria publicar a captura de uma execução que nunca
 * existiu — a mentira do `ui-falso` com roupa de documentação. O RÓTULO ao lado
 * é que muda: ele é da interface, ela é do programa.
 */
export function Uso({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const p = t.paginas?.uso
  if (!p) notFound()

  const ancoras = ancorasDe(p.exemplos.map((exemplo) => exemplo.titulo))
  const indice = p.exemplos.map((exemplo, i) => ({
    id: ancoras[i],
    titulo: exemplo.titulo,
  }))

  const rotulosDoPainel = {
    copiar: t.rotulos.copiar,
    copiado: t.rotulos.copiado,
  }

  return (
    <ArtigoDeDoc
      idioma={idioma}
      chave="uso"
      titulo={p.titulo}
      resumo={p.resumo}
      indice={indice}
    >
      <div className="flex flex-col gap-14">
        {p.exemplos.map((exemplo, i) => (
          // O `id` VAI NO `<h2>` e não no `<section>`: é o `<h2>` que o
          // ScrollTrigger mede, e é para ele que a âncora salta — com o
          // `scroll-padding-top` global tirando o cabeçalho do caminho. Um
          // `id` na seção e outro no título seriam dois pontos de chegada para
          // o mesmo link.
          <section key={exemplo.titulo}>
            <Revelar atraso={Math.min(i, 4) * 0.06}>
              <TituloDeSecao id={ancoras[i]} className="text-h3">
                {exemplo.titulo}
              </TituloDeSecao>

              <PainelDeCodigo
                className="mt-4"
                abas={[{ rotulo: exemplo.titulo, codigo: exemplo.comando }]}
                prompt="$"
                rotulos={rotulosDoPainel}
              />

              {exemplo.saida ? (
                <figure className="mt-4 overflow-hidden rounded-xl border border-dashed border-border">
                  {/* `font-medium` porque as OUTRAS TRÊS etiquetas em
                      versalete do site já o têm — a dos grupos em
                      `barra-lateral-docs.tsx`, a do `indice-da-pagina.tsx` e a
                      da chamada final em `paginas/instalacao.tsx`, todas com o
                      mesmo `text-caption ... tracking-wide uppercase` — e esta
                      era a única sem. Em caixa alta e 13px o peso normal fica
                      visivelmente mais fino que o das irmãs, e duas etiquetas
                      do mesmo papel com pesos diferentes leem como dois papéis
                      diferentes. */}
                  <figcaption className="flex items-center gap-1.5 border-b border-dashed border-border bg-muted/40 px-3 py-1.5 text-caption font-medium tracking-wide text-muted-foreground uppercase">
                    <CornerDownRight aria-hidden className="size-3.5" />
                    {t.rotulos.saida}
                  </figcaption>
                  {/* Região que rola e não tem nada focável dentro fica
                      inalcançável pelo teclado (WCAG 2.1.1): sem o `tabIndex`,
                      uma saída larga em tela estreita não pode ser lida até o
                      fim sem mouse. É a mesma decisão do painel de código. */}
                  <pre
                    lang={IDIOMA_DA_SAIDA}
                    tabIndex={0}
                    className="overflow-x-auto bg-muted/20 px-4 py-3 text-sm leading-relaxed focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  >
                    <code>{exemplo.saida}</code>
                  </pre>
                </figure>
              ) : null}

              {exemplo.nota ? (
                <p className="mt-4 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{exemplo.nota}</span>
                </p>
              ) : null}
            </Revelar>
          </section>
        ))}
      </div>
    </ArtigoDeDoc>
  )
}
