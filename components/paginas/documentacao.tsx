import { notFound } from "next/navigation"

import { ArtigoDeDoc } from "@/components/artigo-de-doc"
import { Revelar } from "@/components/revelar"
import { TituloDeSecao } from "@/components/titulo-de-secao"
import { textos, type Idioma } from "@/conteudo/carregar"
import { ancorasDe } from "@/lib/ancoras"

/**
 * A PÁGINA DE DOCUMENTAÇÃO: seções ancoradas, e não mais um acordeão.
 *
 * O QUE ELA ERA, E POR QUE MUDOU. Era um `Accordion` com TODOS os itens abertos
 * por padrão — um acordeão que não acordeona. Ele custava três coisas e não
 * pagava nenhuma:
 *
 *   · o conteúdo já estava todo na tela, então o controle de abrir e fechar
 *     servia só para ESCONDER o que a pessoa veio ler;
 *   · o `id` morava no item do acordeão, e o link do índice levava para um
 *     `<button>` — se alguém fechasse a seção, a âncora passava a apontar para
 *     um painel colapsado e o salto parava no lugar errado;
 *   · a ALTURA da página mudava a cada clique, que é exatamente o que um
 *     scrollspy de rolagem não pode ter debaixo dele sem remedir.
 *
 * Agora são `<section>` com `<h2 id>` — a forma que faz o índice da direita e o
 * scrollspy terem sentido, e a mesma que `tailwindcss.com/docs` e
 * `nextjs.org/docs` usam.
 *
 * O TÍTULO ANCORADO SAIU DAQUI e virou `components/titulo-de-secao.tsx`. Ele
 * era marcação escrita à mão nesta página e SÓ nesta: as outras três tinham o
 * `id` e não tinham o `#`, então apanhar o link de uma seção era possível em
 * uma das quatro páginas de documentação. As decisões que ele carrega — o nome
 * acessível vindo de `aria-labelledby` em vez de um rótulo inventado, e o
 * `hidden lg:inline-flex` que mantém o alvo fora das telas de toque — estão
 * escritas lá, onde agora valem para todas as páginas.
 */
export function Documentacao({ idioma }: { idioma: Idioma }) {
  const p = textos(idioma).paginas?.docs
  if (!p) notFound()

  const ancoras = ancorasDe(p.secoes.map((secao) => secao.titulo))
  const indice = p.secoes.map((secao, i) => ({
    id: ancoras[i],
    titulo: secao.titulo,
  }))

  return (
    <ArtigoDeDoc
      idioma={idioma}
      chave="docs"
      titulo={p.titulo}
      resumo={p.resumo}
      indice={indice}
    >
      <div className="flex flex-col gap-14">
        {p.secoes.map((secao, i) => (
          <section key={secao.titulo}>
            <Revelar atraso={Math.min(i, 3) * 0.04}>
              <TituloDeSecao id={ancoras[i]} className="text-h2">
                {secao.titulo}
              </TituloDeSecao>

              <p className="mt-4 text-body text-muted-foreground">
                {secao.corpo}
              </p>

              {secao.itens.length ? (
                // Marcador de lista de verdade, e não um ícone de "check" por
                // item: estes itens são EVIDÊNCIA ("3 de 6 repositórios sem
                // CI"), e um visto ao lado de um número ruim afirma o
                // contrário do que a linha diz.
                //
                // `marker:text-brand` e NÃO `marker:text-brand-border`: o
                // marcador é TINTA, e `--brand-border` é o token de borda —
                // ele está anotado em `globals.css` com 3,07:1 no claro e
                // 3,42:1 no escuro, que é contraste de linha de 1px e não de
                // símbolo que a pessoa precisa ver. Com `--brand` os mesmos
                // pontos vão a 5,07:1 e 7,13:1 sobre o fundo da página.
                <ul className="mt-5 flex list-disc flex-col gap-2 pl-5 marker:text-brand">
                  {secao.itens.map((item) => (
                    <li key={item} className="pl-1 text-sm leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </Revelar>
          </section>
        ))}
      </div>
    </ArtigoDeDoc>
  )
}
