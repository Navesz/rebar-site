import type { NextConfig } from "next"

import site from "./conteudo/site.json"

/**
 * O CAMINHO EM QUE O SITE MORA, derivado de `meta.urlBase` e de mais lugar
 * nenhum.
 *
 * GitHub Pages de projeto publica em `https://dono.github.io/repositorio`, e
 * sem `basePath` o Next emite `/_next/...` e `/og.png` a partir da RAIZ do
 * domínio: a página abre, o HTML chega, e todo CSS, JS e imagem tomam 404. O
 * defeito não aparece em `next dev`, que serve na raiz — aparece publicado.
 *
 * Ele NÃO é um campo novo do conteúdo de propósito. O endereço do site já está
 * escrito uma vez, em `meta.urlBase`, e é ele que vira `metadataBase`. Um
 * segundo campo com o mesmo caminho é a segunda fonte que diverge — o defeito
 * do `Navesz/Galegos#1` com outra roupa.
 */
const caminhoBase = new URL(site.meta.urlBase).pathname.replace(/\/+$/, "")

const nextConfig: NextConfig = {
  // SSG puro. É o que faz og:image existir: WhatsApp, LinkedIn, Slack e Discord
  // não executam JavaScript, então meta tag pintada no cliente não existe para
  // eles. Medido no spike de 31/08 — todas as rotas "prerendered as static
  // content", out/index.html com 12 KB e a meta absoluta lá dentro.
  output: "export",
  // Domínio próprio (`https://padaria.com.br`) devolve caminho vazio, e aí as
  // duas chaves ficam FORA do objeto: `basePath: ''` é aceito, mas
  // `assetPrefix: ''` muda o comportamento do Next em versões diferentes, e
  // chave que só existe quando significa alguma coisa é mais fácil de conferir.
  ...(caminhoBase ? { basePath: caminhoBase, assetPrefix: caminhoBase } : {}),
  images: {
    // NÃO É OPCIONAL, e não é preferência. O otimizador de imagem do Next é um
    // serviço que roda em servidor; `output: "export"` não sobe servidor nenhum.
    // Sem esta linha o build reprova assim que encontra um <Image>.
    unoptimized: true,
  },
}

export default nextConfig
