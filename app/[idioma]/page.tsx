import { Inicio } from "@/components/paginas/inicio"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

/**
 * A home traduzida: `/pt-br` e `/es`.
 *
 * Sem `generateMetadata` aqui de propósito — o layout raiz deste segmento já
 * declara título, descrição e `alternates` da rota `inicio`, e repeti-los seria
 * a segunda fonte. As páginas de `/docs` é que sobrescrevem, porque a rota
 * delas é outra.
 */
export default async function Pagina({ params }: ParametrosDeIdioma) {
  return <Inicio idioma={await idiomaTraduzido(params)} />
}
