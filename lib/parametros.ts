import { notFound } from "next/navigation"

import { IDIOMAS_TRADUZIDOS, type Idioma } from "@/conteudo/carregar"

/**
 * A forma dos parâmetros de `app/[idioma]`. Em Next 16 `params` é uma PROMISE —
 * ler `params.idioma` direto compila e devolve `undefined` em tempo de
 * execução, que é a falha silenciosa de sempre com roupa nova.
 */
export type ParametrosDeIdioma = { params: Promise<{ idioma: string }> }

/**
 * O `string` da URL virando `Idioma`, ou 404.
 *
 * A GUARDA É `IDIOMAS_TRADUZIDOS` E NÃO `IDIOMAS`, e a diferença importa: o
 * inglês mora na RAIZ, então `/en/docs` seria a mesma página que `/docs` com
 * outro endereço. Duas URLs para o mesmo conteúdo é conteúdo duplicado para o
 * buscador e duas canônicas brigando — e como `dynamicParams` é `false`, a rota
 * nem chega a ser gerada. Esta função é o que garante que ela também não
 * renderiza se alguém a alcançar por outro caminho.
 */
export async function idiomaTraduzido(
  params: ParametrosDeIdioma["params"]
): Promise<Idioma> {
  const { idioma } = await params
  const achado = IDIOMAS_TRADUZIDOS.find((candidato) => candidato === idioma)
  if (!achado) notFound()
  return achado
}
