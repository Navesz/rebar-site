/**
 * O ponto único onde `site.json` vira dado tipado — e o ponto onde o build
 * morre se ele divergir do esquema.
 *
 * A validação roda no ESCOPO DO MÓDULO de propósito. `app/layout.tsx` importa
 * daqui, o `next build` avalia este módulo para pré-renderizar a rota, e um
 * campo faltando lança antes de qualquer HTML sair. É o que separa esquema de
 * decoração: decoração é o que só roda quando alguém lembra de chamar.
 */
import bruto from "./site.json"
import { esquemaSite, type Site } from "./esquema"

export const site: Site = esquemaSite(bruto, "site")

/**
 * O caminho em que o site mora, tirado de `meta.urlBase` — `/rebar-site` no
 * GitHub Pages de projeto, `''` em domínio próprio.
 *
 * POR QUE ELE PRECISA EXISTIR À MÃO. O `basePath` do `next.config.ts` prefixa
 * o que o NEXT emite: `<script src>`, `<link rel="stylesheet">`, o `href` do
 * manifesto. Ele NÃO prefixa o conteúdo de `app/manifest.ts`, que é JSON que
 * este projeto escreve — então `"/icone-192.png"` lá dentro sai literal e vira
 * 404 no ar. Medido em 02/09 no `out/manifest.webmanifest` antes deste
 * conserto: os dois ícones e o `start_url` apontavam para a raiz do
 * `navesz.github.io`, que é o site de outra pessoa.
 *
 * O 404 de ícone de manifesto é silencioso do jeito que o §12.3 descreve: a
 * página abre, o navegador pede o ícone, toma 404 e não conta para ninguém.
 */
export const caminhoBase = new URL(site.meta.urlBase).pathname.replace(
  /\/+$/,
  ""
)

/** Um caminho de `public/` como o navegador tem de pedir. */
export const publico = (caminho: string): string => `${caminhoBase}${caminho}`
export type { Site }
// `Contato` e `Whatsapp` saem por aqui porque quem renderiza importa DESTE
// arquivo, nunca do esquema: a porta é uma só. `Contato` é o que faz o mapa da
// home ser cobrado como total; `Whatsapp` é o bloco já estreitado que
// `linkWhatsapp` exige — sem ele o botão não compila sem tratar o `null`.
export type { Contato, Whatsapp } from "./esquema"
export { linkWhatsapp } from "./esquema"
