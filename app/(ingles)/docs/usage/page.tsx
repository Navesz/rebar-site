import type { Metadata } from "next"

import { Uso } from "@/components/paginas/uso"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"
import { metadadosDeDoc } from "@/lib/metadados"

export const metadata: Metadata = metadadosDeDoc(IDIOMA_PADRAO, "uso")

export default function Pagina() {
  return <Uso idioma={IDIOMA_PADRAO} />
}
