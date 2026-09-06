/**
 * O ponto único onde o conteúdo vira dado tipado — e o ponto onde o build morre
 * se ele divergir do esquema.
 *
 * A validação roda no ESCOPO DO MÓDULO de propósito. Os dois layouts raiz
 * importam daqui, o `next build` avalia este módulo para pré-renderizar as
 * rotas, e um campo faltando lança antes de qualquer HTML sair. É o que separa
 * esquema de decoração: decoração é o que só roda quando alguém lembra de
 * chamar.
 *
 * OS TRÊS IDIOMAS SÃO VALIDADOS TODOS, SEMPRE, e não sob demanda. `TEXTOS` é um
 * literal avaliado na carga do módulo: chamar `textos("en")` já custou a
 * validação de `es` e `pt-br` também. Fosse preguiçoso, um `es.json` quebrado
 * só reprovaria quando alguém pedisse a página espanhola — e no export estático
 * isso é exatamente a rota que ninguém abre em `next dev`.
 */
import { esquemaSite, esquemaTextos } from "./esquema"
import type { Compartilhado, Textos } from "./esquema"
import bruto from "./site.json"
import brutoEn from "./textos/en.json"
import brutoEs from "./textos/es.json"
import brutoPtBr from "./textos/pt-br.json"

/**
 * OS IDIOMAS DO SITE, na ordem em que aparecem para quem escolhe.
 *
 * A ordem não é alfabética: o padrão vem primeiro porque é o que a raiz serve,
 * e os dois traduzidos seguem. `as const` é o que faz `Idioma` ser a união dos
 * três literais em vez de `string` — rota com idioma que não existe vira erro
 * de tipo, e não 404 descoberto em produção.
 */
export const IDIOMAS = ["en", "pt-br", "es"] as const

export type Idioma = (typeof IDIOMAS)[number]

/**
 * O IDIOMA DA RAIZ. `/` é inglês; `/pt-br` e `/es` levam prefixo.
 *
 * Decisão do dono, e ela tem uma consequência que este arquivo carrega: o
 * padrão NÃO tem prefixo, então `caminhoDe` é a única peça que sabe disso. Cada
 * componente montando o próprio `href` seria a segunda fonte que diverge — e a
 * divergência aqui é link quebrado, que o build não vê.
 */
export const IDIOMA_PADRAO: Idioma = "en"

/**
 * OS QUE LEVAM PREFIXO, derivados por subtração e nunca digitados de novo.
 *
 * É o que `generateStaticParams()` de `app/[idioma]` devolve. Uma segunda lista
 * escrita à mão publicaria o idioma novo no seletor e não geraria a pasta dele:
 * o link existiria e daria 404, sem erro em lugar nenhum.
 */
export const IDIOMAS_TRADUZIDOS: readonly Idioma[] = IDIOMAS.filter(
  (idioma) => idioma !== IDIOMA_PADRAO
)

/** O que é igual nos três idiomas: identidade do negócio e meta técnico. */
export const site: Compartilhado = esquemaSite(bruto, "site")

const TEXTOS: Record<Idioma, Textos> = {
  en: esquemaTextos(brutoEn, "en"),
  "pt-br": esquemaTextos(brutoPtBr, "pt-br"),
  es: esquemaTextos(brutoEs, "es"),
}

/** Todo texto que alguém lê, no idioma pedido. */
export function textos(idioma: Idioma): Textos {
  return TEXTOS[idioma]
}

/**
 * Estreita o `string` que vem de `params` para `Idioma`.
 *
 * `app/[idioma]` recebe `{ idioma: string }` do Next, e com
 * `dynamicParams = false` o valor SEMPRE está em `IDIOMAS_TRADUZIDOS` em tempo
 * de build. O tipo, porém, continua `string` — e sem esta guarda a página faria
 * um `as Idioma` que mente. Aqui a mentira vira `notFound()`.
 */
export function ehIdioma(valor: string): valor is Idioma {
  return (IDIOMAS as readonly string[]).includes(valor)
}

/**
 * O CAMINHO DE UMA ROTA NUM IDIOMA, e é a única peça que sabe que o padrão não
 * leva prefixo.
 *
 *   caminhoDe("en", "/docs")     → "/docs"
 *   caminhoDe("pt-br", "/docs")  → "/pt-br/docs"
 *   caminhoDe("es", "/")         → "/es"
 *
 * A rota entra em INGLÊS nos três idiomas — decisão do dono, e ela é o que faz
 * o mesmo conteúdo ter um caminho comparável entre as versões. Traduzir o slug
 * multiplicaria por três a superfície de link quebrado a cada renomeação.
 */
export function caminhoDe(idioma: Idioma, rota: string): string {
  if (idioma === IDIOMA_PADRAO) return rota
  return rota === "/" ? `/${idioma}` : `/${idioma}${rota}`
}

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

export type { Compartilhado, Textos }
// `Contato` e `Whatsapp` saem por aqui porque quem renderiza importa DESTE
// arquivo, nunca do esquema: a porta é uma só. `Contato` é o que faz o mapa do
// rodapé ser cobrado como total; `Whatsapp` é o bloco já estreitado que
// `linkWhatsapp` exige — sem ele o botão não compila sem tratar o `null`.
export type { Contato, Whatsapp } from "./esquema"
export { linkWhatsapp } from "./esquema"
