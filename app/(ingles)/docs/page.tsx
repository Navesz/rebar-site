import type { Metadata } from "next"

import { Documentacao } from "@/components/paginas/documentacao"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"
import { metadadosDeDoc } from "@/lib/metadados"

export const metadata: Metadata = metadadosDeDoc(IDIOMA_PADRAO, "docs")

export default function Pagina() {
  return <Documentacao idioma={IDIOMA_PADRAO} />
}
