/**
 * A ORDEM EDITORIAL DA DOCUMENTAÇÃO, escrita uma vez, lida por três peças.
 *
 * Quem consome esta lista:
 *   · `barra-lateral-docs.tsx` desenha os grupos na ordem em que estão aqui;
 *   · `anterior-proximo.tsx` percorre a sequência ACHATADA para descobrir quem
 *     vem antes e quem vem depois da página atual;
 *   · `moldura-de-documentacao.tsx` monta o `href` e o rótulo de cada item.
 *
 * Escrita três vezes, ela divergiria na primeira reordenação: a barra lateral
 * mostraria "uso" depois de "módulos" e o rodapé continuaria mandando o
 * visitante para "módulos" depois de "uso". Nada disso quebra build nenhum — é
 * o visitante que descobre, andando em círculo.
 *
 * ESTE ARQUIVO É `.ts` E NÃO `.tsx`, e não é detalhe: ele é importado tanto do
 * lado do servidor (a moldura, o rodapé) quanto do lado do cliente (a barra
 * lateral, que precisa de `usePathname`). Um módulo de dado puro atravessa a
 * fronteira sem arrastar nada — o que atravessa daqui para o navegador são
 * quatro strings, e não o carregador de conteúdo inteiro.
 */

import type { Textos } from "@/conteudo/carregar"
import type { ChaveDeDoc } from "@/lib/rotas"

/**
 * Os grupos possíveis saem do ESQUEMA DO CONTEÚDO, e não de uma lista literal
 * escrita aqui: `rotulos.grupos` já declara quais existem, e derivar o tipo
 * dele faz um grupo inventado no `.tsx` virar erro de tipo em vez de um rótulo
 * `undefined` na tela.
 */
export type GrupoDeDocs = keyof Textos["rotulos"]["grupos"]

/**
 * A divisão editorial: o que se lê para começar, e o que se consulta depois.
 *
 * `as const satisfies` faz as duas coisas de uma vez — o `as const` preserva os
 * literais (é deles que sai a prova de totalidade lá embaixo) e o `satisfies`
 * cobra que toda chave seja uma rota de documentação de verdade — um
 * `"instalcao"` digitado errado não compila.
 *
 * `docs` ABRE A SEQUÊNCIA, e não a fecha. Ela era o ÚLTIMO item, em
 * "referência", e isso contradizia as outras duas peças que o visitante vê: é
 * o primeiro link do cabeçalho (que sai de `ROTAS`, na ordem docs → instalação
 * → uso → módulos) e é a página que a trilha apresenta como mãe de todas as
 * outras ("Home › Docs › Installation"). Na prática, quem chegava na raiz da
 * documentação — o começo declarado — encontrava um rodapé sem "próximo" e um
 * "anterior" apontando para módulos, que é o fim. A raiz é o que se lê para
 * COMEÇAR; "referência" fica com o que se consulta depois.
 */
export const GRUPOS_DE_DOCS = [
  { grupo: "comecar", paginas: ["docs", "instalacao", "uso"] },
  { grupo: "referencia", paginas: ["modulos"] },
] as const satisfies readonly {
  grupo: GrupoDeDocs
  paginas: readonly ChaveDeDoc[]
}[]

/** A mesma ordem, achatada — é a sequência de leitura do site. */
export const ORDEM_DOS_DOCS = GRUPOS_DE_DOCS.flatMap((g) => g.paginas)

/**
 * O DENTE DA TOTALIDADE, e ele é do compilador.
 *
 * `ExigirVazio<T extends never>` só aceita `never`. Enquanto a lista acima
 * cobrir toda `ChaveDeDoc`, o `Exclude` é `never` e a linha compila calada; no
 * dia em que `lib/rotas.ts` ganhar uma rota de documentação que ninguém pôs
 * aqui, o `Exclude` vira o nome dela e o `npx tsc --noEmit` reprova NOMEANDO a
 * rota órfã.
 *
 * Sem isto a página nova nasce inalcançável pela barra lateral e fora do
 * anterior/próximo: ela existe, responde 200, entra no sitemap, e não há um
 * único link para ela no site. É o tipo de buraco que só o visitante encontra.
 */
type ExigirVazio<T extends never> = T
export type DocSemLugarNaBarra = ExigirVazio<
  Exclude<ChaveDeDoc, (typeof ORDEM_DOS_DOCS)[number]>
>
