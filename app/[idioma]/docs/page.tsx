import type { Metadata } from "next"

import { Documentacao } from "@/components/paginas/documentacao"
import { metadadosDeDoc } from "@/lib/metadados"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

export async function generateMetadata({
  params,
}: ParametrosDeIdioma): Promise<Metadata> {
  return metadadosDeDoc(await idiomaTraduzido(params), "docs")
}

export default async function Pagina({ params }: ParametrosDeIdioma) {
  return <Documentacao idioma={await idiomaTraduzido(params)} />
}
