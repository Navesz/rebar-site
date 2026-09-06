/**
 * A FONTE ÚNICA DAS ROTAS: a chave em português, o caminho em inglês.
 *
 * As duas metades existem porque são duas coisas diferentes, e confundi-las é o
 * que produzia a divergência antiga:
 *
 *   · a CHAVE é como o código chama a página. Ela combina com a chave de
 *     `paginas` no conteúdo e com a de `rotulos.navegacao`, então rota nova sem
 *     texto — ou texto sem rota — vira erro de tipo em vez de link para o vazio.
 *   · o CAMINHO é o que o visitante vê na barra de endereço, e ele é IGUAL nos
 *     três idiomas (o prefixo é a única diferença, e quem o põe é `caminhoDe`).
 *
 * O `sitemap.ts` lia `Object.keys(site.paginas)` e montava `/${chave}/`: isso
 * amarrava a URL ao nome do campo de conteúdo, e com `/docs/installation` a
 * amarra deixou de valer. O arquivo dizia no próprio comentário que era
 * "segunda fonte que envelhece"; agora a fonte é esta lista, e o sitemap deriva
 * dela.
 */
export const ROTAS = [
  { chave: "inicio", caminho: "/" },
  { chave: "docs", caminho: "/docs" },
  { chave: "instalacao", caminho: "/docs/installation" },
  { chave: "uso", caminho: "/docs/usage" },
  { chave: "modulos", caminho: "/docs/modules" },
] as const

export type Rota = (typeof ROTAS)[number]
export type ChaveDeRota = Rota["chave"]

/**
 * As rotas que têm um bloco em `paginas` do conteúdo — todas menos a home.
 *
 * O tipo é o que amarra as duas listas: usar esta chave para indexar
 * `textos(idioma).paginas` só compila enquanto as duas coincidirem. Rota nova
 * sem bloco de conteúdo é erro de tipo, e não uma página em branco no ar.
 */
export type ChaveDeDoc = Exclude<ChaveDeRota, "inicio">

/**
 * O caminho de uma chave, sem procurar na lista à mão em cada componente.
 *
 * `Record` construído por `reduce` e não escrito de novo: um mapa literal ao
 * lado da lista seria a segunda fonte, e a divergência entre os dois é um
 * `href` que aponta para uma rota que o build não emitiu.
 */
const POR_CHAVE = ROTAS.reduce(
  (mapa, rota) => {
    mapa[rota.chave] = rota.caminho
    return mapa
  },
  {} as Record<ChaveDeRota, string>
)

export function rotaDe(chave: ChaveDeRota): string {
  return POR_CHAVE[chave]
}

/**
 * As rotas que vivem DENTRO de `/docs`, na ordem da barra lateral.
 *
 * Derivada por prefixo, e não digitada: mover uma página para dentro ou para
 * fora de `/docs` é mudar o caminho acima, e esta lista acompanha sozinha.
 */
export const ROTAS_DE_DOCS = ROTAS.filter((rota) =>
  rota.caminho.startsWith("/docs/")
)
