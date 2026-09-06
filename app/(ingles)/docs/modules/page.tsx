import type { Metadata } from "next"

import { Modulos } from "@/components/paginas/modulos"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"
import { metadadosDeDoc } from "@/lib/metadados"

export const metadata: Metadata = metadadosDeDoc(IDIOMA_PADRAO, "modulos")

export default function Pagina() {
  return <Modulos idioma={IDIOMA_PADRAO} />
}
