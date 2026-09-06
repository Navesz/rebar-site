import type { Metadata } from "next"

import { Instalacao } from "@/components/paginas/instalacao"
import { metadadosDeDoc } from "@/lib/metadados"
import { idiomaTraduzido, type ParametrosDeIdioma } from "@/lib/parametros"

export async function generateMetadata({
  params,
}: ParametrosDeIdioma): Promise<Metadata> {
  return metadadosDeDoc(await idiomaTraduzido(params), "instalacao")
}

export default async function Pagina({ params }: ParametrosDeIdioma) {
  return <Instalacao idioma={await idiomaTraduzido(params)} />
}
