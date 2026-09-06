import type { Metadata, Viewport } from "next"

import "../globals.css"
import { Casca } from "@/components/casca"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"
import { metadadosDaRaiz, viewportPadrao } from "@/lib/metadados"

/**
 * O LAYOUT RAIZ DO INGLÊS, que é o idioma da RAIZ do site.
 *
 * POR QUE ELE MORA NUM GRUPO `(ingles)` E NÃO EM `app/layout.tsx`. O site tem
 * dois layouts raiz — este e o de `app/[idioma]` — porque o `<html lang>` muda
 * entre eles, e o `route-groups.md` do Next é explícito: sem um `layout` de
 * topo, a rota `/` PRECISA morar dentro de um dos grupos. Deixá-la fora daria
 * "page without a root layout" no build.
 *
 * O parêntese é o que mantém a URL limpa: `app/(ingles)/page.tsx` responde em
 * `/`, e não em `/ingles`.
 *
 * NENHUM LITERAL DE CONTEÚDO AQUI: `metadadosDaRaiz` lê tudo de
 * `conteudo/textos/en.json` e de `conteudo/site.json`.
 */
export const metadata: Metadata = metadadosDaRaiz(IDIOMA_PADRAO)

export const viewport: Viewport = viewportPadrao

export default function LayoutRaiz({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <Casca idioma={IDIOMA_PADRAO}>{children}</Casca>
}
