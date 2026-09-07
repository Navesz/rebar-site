"use client"

/**
 * O SELETOR DE IDIOMA, e o que ele resolve é UMA coisa: continuar na mesma
 * página.
 *
 * O seletor que leva para a home do outro idioma é o seletor que ensina a
 * pessoa a não trocar de idioma. Quem está no meio de `/docs/installation` e
 * cai em `/es` perdeu o lugar e ainda tem de reencontrar a página — na segunda
 * vez que isso acontece, ela desiste e lê no idioma errado. Como a ROTA é a
 * mesma nos três idiomas (decisão registrada em `conteudo/carregar.ts`: o slug
 * não se traduz), o conserto é aritmética de prefixo: tira o do idioma atual,
 * põe o do idioma de destino.
 *
 * POR QUE O PREFIXO CHEGA PRONTO, em vez de este arquivo chamar `caminhoDe`.
 * Importar `@/conteudo/carregar` num componente de cliente empacota os três
 * JSON de texto e o validador inteiro do esquema no bundle do navegador para
 * calcular uma concatenação. Quem chama `caminhoDe` é o servidor, em
 * `components/cabecalho.tsx`; o que atravessa a fronteira é a string
 * (`""`, `"/pt-br"`, `"/es"`). O único pedaço da regra que se repete aqui é o
 * `prefixo + rota` — e o caso especial da raiz junto, porque é ele que separa
 * `/pt-br` de `/pt-br/`.
 */

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type OpcaoDeIdioma = {
  /** O prefixo desta versão: `""` para a raiz, `/pt-br` e `/es` nas outras. */
  prefixo: string
  /** A tag BCP 47, para o `hreflang` do link. */
  tag: string
  /** O nome escrito NO PRÓPRIO idioma — é o que a pessoa procura na lista. */
  nome: string
  atual: boolean
}

/**
 * A rota nua: sem prefixo de idioma e sem a barra final.
 *
 * A BARRA FINAL existe porque `next.config.ts` liga `trailingSlash: true` — o
 * endereço real é `/pt-br/docs/`, e não `/pt-br/docs`. Sem tirá-la aqui, o
 * caminho remontado sairia `/es/docs/` num lugar e `/es/docs` noutro; o Next
 * normaliza os dois, mas a comparação `caminho === prefixo` (o caso da home
 * traduzida) falharia calada e a troca de idioma na home levaria para
 * `/es//`.
 */
function rotaSemIdioma(caminho: string, prefixos: readonly string[]): string {
  const nua = caminho.length > 1 ? caminho.replace(/\/+$/, "") : caminho

  for (const prefixo of prefixos) {
    // A raiz não tem prefixo para tirar: `""` casaria com tudo.
    if (!prefixo) continue
    if (nua === prefixo) return "/"
    // A barra no teste é o que impede `/es` de morder uma rota que só COMEÇA
    // com essas letras.
    if (nua.startsWith(`${prefixo}/`)) return nua.slice(prefixo.length)
  }

  return nua
}

export function SeletorDeIdioma({
  idiomas,
  rotulo,
  className,
}: {
  idiomas: readonly OpcaoDeIdioma[]
  rotulo: string
  className?: string
}) {
  const caminho = usePathname()
  const rota = rotaSemIdioma(
    caminho,
    idiomas.map((idioma) => idioma.prefixo)
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={rotulo}
            title={rotulo}
            className={className}
          />
        }
      >
        <Languages aria-hidden className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-auto min-w-48">
        {idiomas.map(({ prefixo, tag, nome, atual }) => (
          <DropdownMenuItem
            key={tag}
            render={
              <Link
                // `/pt-br` na home e `/pt-br/docs` fora dela: sem o caso
                // especial, a home traduzida viraria `/pt-br/`, que é a mesma
                // página com outro endereço — e duas URLs para uma página é o
                // que faz canônica brigar com canônica.
                href={rota === "/" ? prefixo || "/" : `${prefixo}${rota}`}
                hrefLang={tag}
                // `lang` alem de `hrefLang`, e sao coisas diferentes: um fala
                // do DESTINO, o outro do TEXTO desta linha. Sem ele o leitor de
                // tela pronuncia "Portugues (Brasil)" com a fonetica da pagina
                // atual, e o nome do idioma sai irreconhecivel justamente para
                // quem precisa dele para escolher.
                lang={tag}
                aria-current={atual ? "true" : undefined}
              />
            }
            // 44px no toque, como o gatilho da gaveta: errar aqui nao fecha um
            // menu, TROCA a versao do site e a pessoa perde o lugar na leitura.
            // `lg:min-h-0` devolve a densidade onde o ponteiro e preciso — e o
            // mesmo par que a barra lateral e o indice ja usam.
            //
            // `cursor-pointer` porque estes três itens são ÂNCORAS, e não
            // comandos de menu: o `dropdown-menu.tsx` do shadcn traz
            // `cursor-default` — que é o certo para um item que executa uma ação
            // ali mesmo — e o `render` de `Link` herda essa classe junto com o
            // resto. O resultado era a seta comum sobre um link que troca de
            // página; a mãozinha é a única pista de que dali se sai daqui, e
            // ela é a mesma de qualquer outro link do site. O conserto é no
            // ponto de chamada: mexer no componente mudaria o cursor de TODO
            // item de menu do site, inclusive os que de fato só agem.
            className="min-h-11 cursor-pointer justify-between gap-6 lg:min-h-0"
          >
            {nome}
            {/* O visto marca o idioma corrente para quem enxerga; o
                `aria-current` acima faz o mesmo para quem escuta. Um sem o
                outro deixa metade das pessoas sem saber onde está. */}
            {atual ? <Check aria-hidden className="text-brand" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
