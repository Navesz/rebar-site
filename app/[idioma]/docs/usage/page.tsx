import type { Metadata } from "next"

import { Uso } from "@/components/paginas/uso"
import { metadadosDeDoc } from "@/lib/metadados"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

export async function generateMetadata({
  params,
}: ParametrosDeIdioma): Promise<Metadata> {
  return metadadosDeDoc(await idiomaTraduzido(params), "uso")
}

export default async function Pagina({ params }: ParametrosDeIdioma) {
  return <Uso idioma={await idiomaTraduzido(params)} />
}
