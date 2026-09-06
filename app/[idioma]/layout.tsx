import type { Metadata, Viewport } from "next"

import "../globals.css"
import { Casca } from "@/components/casca"
import { IDIOMAS_TRADUZIDOS } from "@/conteudo/carregar"
import { metadadosDaRaiz, viewportPadrao } from "@/lib/metadados"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

/**
 * O LAYOUT RAIZ DOS IDIOMAS TRADUZIDOS: `/pt-br` e `/es`.
 *
 * É o segundo layout raiz do site — ele escreve o próprio `<html>`, com o
 * `lang` do idioma do segmento. O primeiro é `app/(ingles)/layout.tsx`, e os
 * dois existem porque o `lang` muda entre eles; um layout comum acima teria de
 * escolher um valor e mentir para o outro.
 *
 * O preço, que o `route-groups.md` do Next nomeia: navegar entre um layout raiz
 * e outro recarrega a página inteira. Aqui isso só acontece ao TROCAR DE
 * IDIOMA, que é exatamente quando recarregar é o certo.
 *
 * `generateStaticParams` mora NESTE layout e não em cada página: o Next gera
 * params para o segmento dinâmico deste nível e os herda em toda a subárvore,
 * então uma cópia em cada `page.tsx` seria a mesma lista escrita cinco vezes.
 */
export const dynamicParams = false

export function generateStaticParams() {
  // Só os TRADUZIDOS. O inglês mora na raiz e não passa por aqui — gerá-lo
  // também publicaria `/en/…` como cópia de `/…`, com duas canônicas brigando.
  return IDIOMAS_TRADUZIDOS.map((idioma) => ({ idioma }))
}

export async function generateMetadata({
  params,
}: ParametrosDeIdioma): Promise<Metadata> {
  return metadadosDaRaiz(await idiomaTraduzido(params))
}

export const viewport: Viewport = viewportPadrao

export default async function LayoutRaiz({
  children,
  params,
}: Readonly<ParametrosDeIdioma & { children: React.ReactNode }>) {
  return <Casca idioma={await idiomaTraduzido(params)}>{children}</Casca>
}
