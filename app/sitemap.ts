import type { MetadataRoute } from "next"

import { site } from "@/conteudo/carregar"

/**
 * `force-static` é O QUE FAZ ESTE ARQUIVO EXISTIR sob `output: "export"`. Rota
 * de metadado é tratada como dinâmica por padrão, e export não tem servidor
 * para atender rota dinâmica: sem esta linha o `sitemap.xml` não é emitido, o
 * build não reclama, e a ausência só aparece no Search Console semanas depois.
 * Vale igual para `robots.ts` e `manifest.ts`.
 */
export const dynamic = "force-static"

/**
 * AS ROTAS SAEM DO CONTEÚDO, NÃO DE UMA LISTA À MÃO.
 *
 * Uma lista escrita aqui seria a segunda fonte que envelhece separada: alguém
 * acrescenta uma página em `conteudo/site.json`, a rota existe, o build passa —
 * e ela nunca entra no índice de busca. A ausência não dá erro em lugar nenhum,
 * que é exatamente o modo de falha que este projeto persegue.
 *
 * Cada chave de `paginas` é a rota, então acrescentar uma seção ao conteúdo já
 * a coloca no sitemap. O que ainda é manual é o arquivo `app/<chave>/page.tsx`,
 * e a divergência nessa direção é barulhenta: a rota apareceria no sitemap e o
 * `npm run build` não emitiria a página.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const raiz = {
    url: site.meta.urlBase,
    // Data de CONTEÚDO, não `new Date()`. Com `new Date()` o mesmo commit gera
    // bytes diferentes a cada build, e build que não é reprodutível não dá para
    // comparar entre duas rodadas.
    lastModified: site.meta.atualizadoEm,
    changeFrequency: "monthly" as const,
    priority: 1,
  }

  const paginas = Object.keys(site.paginas ?? {}).map((chave) => ({
    url: `${site.meta.urlBase}/${chave}`,
    lastModified: site.meta.atualizadoEm,
    changeFrequency: "monthly" as const,
    // Menor que a raiz e igual entre si: ordenar documentação por palpite de
    // importância é inventar um número que ninguém mediu.
    priority: 0.8,
  }))

  return [raiz, ...paginas]
}
