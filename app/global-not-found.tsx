import type { Metadata, Viewport } from "next"
import Link from "next/link"

import "./globals.css"
import { Casca } from "@/components/casca"
import { IDIOMAS, IDIOMA_PADRAO, caminhoDe, textos } from "@/conteudo/carregar"
import {
  hreflangDe,
  metadadosDoNaoEncontrado,
  viewportPadrao,
} from "@/lib/metadados"

/**
 * A PÁGINA QUE O GITHUB PAGES SERVE PARA TODO ENDEREÇO QUE NÃO EXISTE.
 *
 * O QUE ELA SUBSTITUI, medido em `out/404.html` do build anterior: o 404 de
 * fábrica do Next. `<html>` SEM atributo `lang`, sem o CSS do site, sem
 * cabeçalho, sem rodapé, com o texto "404 | This page could not be found." e
 * ZERO links — 8.197 bytes de página sem uma saída. Aquele arquivo é o que o
 * Pages devolve para QUALQUER caminho desconhecido, `/pt-br/qualquer-coisa` e
 * `/es/qualquer-coisa` inclusive. Quem seguia um link antigo caía nele: o slug
 * das rotas passou a ser inglês, então `/docs/instalacao` deixou de existir, e
 * quem tinha o endereço salvo chegava numa página em inglês sem caminho de
 * volta.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUE ELA RENDERIZA A `IDIOMA_PADRAO`, E OFERECE AS TRÊS HOME.
 *
 * O GitHub Pages é servidor de arquivo estático: ele serve UM `404.html` para
 * os três idiomas, e não há como ele escolher o idioma pelo caminho pedido —
 * não há `middleware` (o `output: "export"` não tem), não há redirecionamento
 * por servidor, e adivinhar pelo `Accept-Language` exigiria JavaScript
 * decidindo para onde a pessoa vai, que é pior que a página não decidir.
 *
 * A saída honesta é dizer o que se sabe: a página se declara na
 * `IDIOMA_PADRAO` — `<html lang="en-US">`, que é a verdade sobre o texto que
 * está nela — e oferece as TRÊS home como saída, cada link com `hrefLang` e
 * `lang` do seu idioma. Quem veio de `/es` reconhece "Español" na lista sem
 * precisar ler o inglês em volta, e o leitor de tela troca de voz no link
 * certo porque o `lang` está nele.
 * ─────────────────────────────────────────────────────────────────────────
 * A CASCA É REUSADA, E O `<html>` VEM DELA.
 *
 * Este arquivo mora na RAIZ de `app/`, e a raiz não tem `layout.tsx`: os dois
 * layouts raiz do site são `app/(ingles)/layout.tsx` e `app/[idioma]/layout.tsx`,
 * e o Next não escolhe entre eles para o 404. Daí `Casca`, que já emite `<html>`,
 * `<body>`, o link de pular, o cabeçalho, a busca e o rodapé: escrever essa
 * marcação de novo aqui seria a segunda cópia que diverge no dia em que alguém
 * acrescentar um provider a uma e esquecer a outra.
 *
 * O NOME DO ARQUIVO É `global-not-found`, E ISSO É A DIFERENÇA ENTRE MARCAÇÃO
 * VÁLIDA E MARCAÇÃO CONSERTADA. Como `app/not-found.tsx`, o Next embrulhava
 * esta página num layout embutido próprio — `<html><body>` sem atributo nenhum
 * —, e o `<html>` da casca saía aninhado dentro daquele `<body>`. O navegador
 * conserta (a especificação manda copiar os atributos do `<html>` de dentro
 * para a raiz que já existe, e foi medido: um `<html>` só no DOM, `lang`
 * certo, zero erro no console) — mas depender do conserto do analisador é o
 * oposto do que este site defende. Com `experimental.globalNotFound` ligado no
 * `next.config.ts`, o Next pula o embrulho e o `out/404.html` começa direto no
 * `<html lang="en-US" class="…">`. O doc empacotado nomeia esta arquitetura —
 * múltiplos layouts raiz — como o caso de uso da bandeira.
 *
 * O preço: a página não herda layout nenhum, então importa o próprio
 * `globals.css` (a linha lá em cima), e a bandeira é experimental.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * NENHUM LITERAL DE CONTEÚDO AQUI. Os dois textos são `rotulos.naoEncontrado`
 * e `rotulos.voltarParaOInicio`, e os nomes dos idiomas saem de
 * `nomeDoIdioma` de cada arquivo — que já é escrito no próprio idioma.
 */
export const metadata: Metadata = metadadosDoNaoEncontrado(IDIOMA_PADRAO)

// O `viewport` também é declarado aqui, e não herdado: sem layout raiz, não há
// de quem herdar. Sem esta linha a barra do navegador nesta página seria a
// única do site sem `theme-color`.
export const viewport: Viewport = viewportPadrao

/** O `id` do parágrafo que dá nome à lista de saídas. */
const SAIDAS = "saidas-do-nao-encontrado"

export default function NaoEncontrado() {
  const t = textos(IDIOMA_PADRAO)

  return (
    <Casca idioma={IDIOMA_PADRAO}>
      {/* `max-w-5xl` e `px-4 sm:px-6`: a mesma coluna do hero e do cabeçalho.
          Uma página de erro numa medida própria é a que mais denuncia que foi
          escrita por último. */}
      <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <h1 className="text-h1">{t.rotulos.naoEncontrado}</h1>

        <p
          id={SAIDAS}
          className="mt-5 max-w-2xl text-lead text-muted-foreground"
        >
          {t.rotulos.voltarParaOInicio}
        </p>

        {/* Uma LISTA, e não três botões soltos: são três destinos irmãos, e o
            leitor de tela anuncia "3 itens" antes do primeiro. O nome da lista
            vem do parágrafo acima por `aria-labelledby` — inventar um rótulo
            só para leitor de tela seria um quarto texto para manter em três
            idiomas, dizendo o que já está escrito na tela. */}
        <ul
          aria-labelledby={SAIDAS}
          className="mt-8 flex list-none flex-wrap gap-3"
        >
          {IDIOMAS.map((outro) => {
            const dele = textos(outro)
            return (
              <li key={outro}>
                {/* `hrefLang` E `lang`, que não são a mesma coisa: `hrefLang`
                    diz em que idioma está a página do OUTRO lado do link — é
                    para o buscador e para o navegador; `lang` diz em que
                    idioma está o TEXTO do link, e é o que faz o leitor de tela
                    pronunciar "Português (Brasil)" com fonemas portugueses no
                    meio de uma página declarada em inglês. */}
                <Link
                  href={caminhoDe(outro, "/")}
                  hrefLang={hreflangDe(outro)}
                  lang={dele.tagDeIdioma}
                  className="inline-flex min-h-11 items-center rounded-md border border-brand-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                >
                  {dele.nomeDoIdioma}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </Casca>
  )
}
