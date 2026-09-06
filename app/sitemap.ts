import type { MetadataRoute } from "next"

import {
  IDIOMAS,
  IDIOMA_PADRAO,
  caminhoDe,
  site,
  textos,
} from "@/conteudo/carregar"
import { hreflangDe } from "@/lib/metadados"
import { ROTAS } from "@/lib/rotas"

/**
 * `force-static` é O QUE FAZ ESTE ARQUIVO EXISTIR sob `output: "export"`. Rota
 * de metadado é tratada como dinâmica por padrão, e export não tem servidor
 * para atender rota dinâmica: sem esta linha o `sitemap.xml` não é emitido, o
 * build não reclama, e a ausência só aparece no Search Console semanas depois.
 * Vale igual para `robots.ts` e `manifest.ts`.
 */
export const dynamic = "force-static"

/**
 * AS ROTAS SAEM DE `lib/rotas.ts`, MULTIPLICADAS PELOS IDIOMAS.
 *
 * A versão anterior lia `Object.keys(site.paginas)` e montava `/${chave}/` — o
 * próprio comentário dela admitia ser "segunda fonte que envelhece", e
 * envelheceu na primeira mudança de verdade: com `/docs/installation` a URL
 * deixou de ser o nome do campo de conteúdo, e a lista teria publicado
 * `/instalacao/`, que não existe mais. Agora a rota tem uma fonte só, e o
 * índice não pode discordar do que o build emite.
 *
 * Cada URL leva as OUTRAS DUAS em `alternates.languages`. Sem isso o buscador
 * vê três páginas parecidas e escolhe uma para indexar — as versões traduzidas
 * somem do índice sem nada acusar, que é a falha silenciosa deste projeto na
 * forma de SEO.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const absoluta = (idioma: (typeof IDIOMAS)[number], rota: string) => {
    const caminho = caminhoDe(idioma, rota)
    // Barra final porque `trailingSlash: true` no `next.config.ts` torna essa
    // a forma CANONICA -- a sem barra passa a redirecionar. Publicar no indice
    // a forma que redireciona custa um salto a cada visita do robo.
    return `${site.meta.urlBase}${caminho === "/" ? "/" : `${caminho}/`}`
  }

  return ROTAS.flatMap((rota) =>
    IDIOMAS.filter(
      // A home existe sempre; as páginas de documentação são bloco condicional
      // no conteúdo. Anunciar `/es/docs/usage/` num idioma sem `paginas` seria
      // mandar o robô a uma rota que responde 404.
      (idioma) => rota.chave === "inicio" || textos(idioma).paginas !== null
    ).map((idioma) => ({
      url: absoluta(idioma, rota.caminho),
      // Data de CONTEÚDO, não `new Date()`. Com `new Date()` o mesmo commit
      // gera bytes diferentes a cada build, e build que não é reprodutível não
      // dá para comparar entre duas rodadas.
      lastModified: site.meta.atualizadoEm,
      changeFrequency: "monthly" as const,
      // Menor que a raiz e igual entre si: ordenar documentação por palpite de
      // importância é inventar um número que ninguém mediu.
      priority: rota.chave === "inicio" ? 1 : 0.8,
      // O `hreflang` sai de `hreflangDe`, o MESMO que monta o `<link
      // rel="alternate">` do `<head>`. Escrever a chave à mão aqui já tinha
      // produzido a divergência na primeira rodada: o sitemap anunciava
      // `pt-br` e o HTML `pt-BR`, dois textos para a mesma versão.
      alternates: {
        languages: {
          ...Object.fromEntries(
            IDIOMAS.map((outro) => [
              hreflangDe(outro),
              absoluta(outro, rota.caminho),
            ])
          ),
          "x-default": absoluta(IDIOMA_PADRAO, rota.caminho),
        },
      },
    }))
  )
}
