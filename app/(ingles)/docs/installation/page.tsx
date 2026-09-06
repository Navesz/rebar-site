import type { Metadata } from "next"

import { Instalacao } from "@/components/paginas/instalacao"
import { IDIOMA_PADRAO } from "@/conteudo/carregar"
import { metadadosDeDoc } from "@/lib/metadados"

export const metadata: Metadata = metadadosDeDoc(IDIOMA_PADRAO, "instalacao")

export default function Pagina() {
  return <Instalacao idioma={IDIOMA_PADRAO} />
}
