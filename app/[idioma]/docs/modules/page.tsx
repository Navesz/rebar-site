import type { Metadata } from "next"

import { Modulos } from "@/components/paginas/modulos"
import { metadadosDeDoc } from "@/lib/metadados"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

export async function generateMetadata({
  params,
}: ParametrosDeIdioma): Promise<Metadata> {
  return metadadosDeDoc(await idiomaTraduzido(params), "modulos")
}

export default async function Pagina({ params }: ParametrosDeIdioma) {
  return <Modulos idioma={await idiomaTraduzido(params)} />
}
