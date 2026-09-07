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
  // CADA ROTA VIRA UMA PASTA COM `index.html`, e nao um arquivo `rota.html`.
  //
  // Medido no site publicado: sem esta linha, `/docs` respondia 200 e `/docs/`
  // respondia 404. O GitHub Pages serve `docs.html` para o caminho sem barra e
  // procura `docs/index.html` para o caminho com barra -- que nao existia. Uma
  // das duas formas da URL certa quebrava, e a que quebrava e justamente a que
  // navegador, ferramenta de link e gente digitando produzem sozinhos.
  //
  // Com a linha, o Pages redireciona a forma sem barra para a com barra e as
  // duas funcionam. O `sitemap.ts` acompanha, senao o indice publica a forma
  // que redireciona em vez da canonica.
  trailingSlash: true,
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
  experimental: {
    // A BANDEIRA EXISTE PARA ESTA ARQUITETURA, e o doc empacotado a nomeia:
    // `not-found.md` lista "your app has multiple root layouts … so there's no
    // single layout to compose a global 404 from" como o caso de uso de
    // `global-not-found`. É exatamente o nosso — os dois layouts raiz são
    // `app/(ingles)/layout.tsx` e `app/[idioma]/layout.tsx`.
    //
    // Sem ela, o `app/not-found.tsx` de topo era embrulhado num layout embutido
    // do Next (`<html><body>` sem atributo nenhum), e o `<html>` da nossa casca
    // saía ANINHADO dentro daquele `<body>`. O navegador conserta — a
    // especificação manda copiar os atributos do `<html>` de dentro para a raiz
    // que já existe, e foi medido: um `<html>` só no DOM, `lang` certo, zero
    // erro no console. Mas HTML que depende do conserto do analisador é
    // exatamente o que este site existe para não publicar.
    //
    // O preço declarado: a bandeira é experimental, e a página passa a NÃO
    // herdar layout nenhum — ela importa o próprio `globals.css`, que é o que
    // `app/global-not-found.tsx` já faz.
    globalNotFound: true,
  },
}

export default nextConfig
