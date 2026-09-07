import type { ReactNode } from "react"

import { MolduraDeDocumentacao } from "@/components/moldura-de-documentacao"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"

/**
 * A moldura de `/docs` no idioma da raiz — casca de três linhas em volta de
 * `MolduraDeDocumentacao`, que é onde a barra lateral mora de verdade.
 *
 * O gêmeo é `app/[idioma]/docs/layout.tsx`, e a única diferença entre os dois é
 * de onde sai o idioma: aqui é constante, lá vem do segmento da URL.
 */
export default function LayoutDeDocs({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <MolduraDeDocumentacao idioma={IDIOMA_PADRAO}>
      {children}
    </MolduraDeDocumentacao>
  )
}
