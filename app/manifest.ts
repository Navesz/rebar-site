import type { MetadataRoute } from "next"

import { IDIOMA_PADRAO, publico, site, textos } from "@/conteudo/carregar"

// Ver a nota de `sitemap.ts`.
export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  // O MANIFESTO É UM SÓ, e ele fala o idioma da RAIZ.
  //
  // `manifest.webmanifest` é um arquivo por site, não por rota: o navegador o
  // busca uma vez a partir do `<link rel="manifest">`. Escrever três seria
  // inventar um recurso que o padrão não tem — e `start_url` aponta para `/`,
  // que é a versão inglesa. Quem instalar o app a partir de `/pt-br` continua
  // com o atalho abrindo a raiz, e isso é o comportamento certo enquanto o
  // manifesto não puder variar.
  const t = textos(IDIOMA_PADRAO)

  return {
    name: site.identidade.nome,
    short_name: t.nomeCurto,
    description: t.descricao,
    start_url: publico("/"),
    display: "standalone",
    lang: t.tagDeIdioma,
    background_color: site.meta.cores.fundo,
    theme_color: site.meta.cores.tema,
    // Os dois ícones são GERADOS junto com o og — PNG de verdade, escrito com
    // `zlib`, que é built-in. Declarar ícone que não existe é pior que não
    // declarar: o navegador pede, toma 404, e o manifesto fica meio válido.
    icons: [
      { src: publico("/icone-192.png"), sizes: "192x192", type: "image/png" },
      {
        src: publico("/icone-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  }
}
