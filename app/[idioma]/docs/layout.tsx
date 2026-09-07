import type { ReactNode } from "react"

import { MolduraDeDocumentacao } from "@/components/moldura-de-documentacao"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

/**
 * A moldura de `/docs` nos idiomas traduzidos — o gêmeo de
 * `app/(ingles)/docs/layout.tsx`.
 *
 * `params` é PROMISE no Next 16, e o layout é assíncrono por isso: ler
 * `params.idioma` direto compila e devolve `undefined` em execução, que é a
 * falha silenciosa de sempre com roupa nova. `idiomaTraduzido` também é a
 * guarda — `/en/docs` seria a mesma página que `/docs` com outro endereço, e
 * ela responde 404 em vez de publicar a duplicata.
 */
export default async function LayoutDeDocs({
  children,
  params,
}: Readonly<{ children: ReactNode }> & ParametrosDeIdioma) {
  return (
    <MolduraDeDocumentacao idioma={await idiomaTraduzido(params)}>
      {children}
    </MolduraDeDocumentacao>
  )
}
