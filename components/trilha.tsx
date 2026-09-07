/**
 * A TRILHA (breadcrumb) do topo de cada página de documentação.
 *
 * Ela existe por um motivo prático e não decorativo: com quatro páginas sob
 * `/docs` e quinze rotas no site, quem chega pelo buscador cai no meio da
 * árvore sem ter passado pela raiz. A trilha é o único elemento da página que
 * diz onde ela mora.
 *
 * O ÚLTIMO DEGRAU NÃO É LINK, e é o `BreadcrumbPage` que faz isso: link para a
 * página em que já se está é o degrau que ninguém clica duas vezes sem
 * desconfiar de que a página travou.
 *
 * O `aria-label` VEM DE FORA. O `components/ui/breadcrumb.tsx` nasce com
 * `aria-label="breadcrumb"` escrito em inglês, e ele é arquivo do shadcn — não
 * se edita. A prop passa por cima (o `{...props}` vem depois do padrão), e é
 * assim que a moldura sai nos três idiomas em vez de num só.
 */

import { Fragment } from "react"
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { caminhoDe, textos, type Idioma } from "@/conteudo/carregar"
import { rotaDe, type ChaveDeDoc } from "@/lib/rotas"
import { cn } from "@/lib/utils"

export function Trilha({
  idioma,
  chave,
  className,
}: {
  idioma: Idioma
  chave: ChaveDeDoc
  className?: string
}) {
  const t = textos(idioma)

  // A raiz da documentação só entra quando NÃO é ela a página atual — senão o
  // mesmo rótulo apareceria duas vezes seguidas, uma como link e outra como
  // degrau final.
  const acima = [
    { chave: "inicio" as const, rotulo: t.rotulos.navegacao.inicio },
    ...(chave === "docs"
      ? []
      : [{ chave: "docs" as const, rotulo: t.rotulos.navegacao.docs }]),
  ]

  return (
    <Breadcrumb aria-label={t.rotulos.trilha} className={cn(className)}>
      {/* `text-caption` (13px) contra o `text-sm` (14px) que o
          `components/ui/breadcrumb.tsx` traz na base. As duas SOBREVIVIAM ao
          `cn`: o merge lia os tokens da escala do projeto como `text-<cor>`,
          não como tamanho, e o atributo publicado saía com as duas — 12
          páginas de `out/` com `text-sm ... text-caption` e 14px na tela, mais
          o `text-muted-foreground` da base apagado por engano, porque o merge
          achava que `text-caption` era a cor que o substituía. Quem conserta é
          o grupo `font-size` estendido em `lib/utils.ts`; veja lá antes de
          mexer aqui. */}
      <BreadcrumbList className="text-caption">
        {acima.map((degrau) => (
          // Fragmento, e não um `BreadcrumbItem` envolvendo os dois: o
          // separador do shadcn JÁ É um `<li role="presentation">`, e `li`
          // dentro de `li` é marcação inválida — a lista sai com um item a
          // menos em alguns leitores de tela.
          <Fragment key={degrau.chave}>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={<Link href={caminhoDe(idioma, rotaDe(degrau.chave))} />}
              >
                {degrau.rotulo}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{t.rotulos.navegacao[chave]}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
