import { Inicio } from "@/components/paginas/inicio"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"

/**
 * A home em inglês, servida em `/`.
 *
 * A casca é curta de propósito: o título e as alternativas de idioma já saem do
 * layout raiz, que declara `alternates` para a rota `inicio`. Repetir os
 * metadados aqui seria a segunda fonte, e a que envelhece é sempre a de baixo.
 */
export default function Pagina() {
  return <Inicio idioma={IDIOMA_PADRAO} />
}
