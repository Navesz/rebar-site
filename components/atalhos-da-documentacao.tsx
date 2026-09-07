import Link from "next/link"
import { ArrowRight, BookOpen, Boxes, Download, Terminal } from "lucide-react"

import { Revelar } from "@/components/revelar"
import { caminhoDe, textos, type Idioma } from "@/conteudo/carregar"
import { rotaDe } from "@/lib/rotas"

/**
 * OS QUATRO ATALHOS PARA A DOCUMENTAÇÃO.
 *
 * A LISTA SAI DAQUI E NÃO DO CONTEÚDO, e a divisão é a mesma que o §12.3
 * fechou para o link do WhatsApp: o DESTINO é estrutura do site (o atalho
 * existe porque a rota existe, e a rota mora em `lib/rotas.ts`), enquanto o
 * TEXTO que descreve cada página já mora em `conteudo` como
 * `paginas.<chave>.titulo` e `.resumo`. Repetir o título aqui criaria a segunda
 * fonte, que diverge no dia em que alguém renomear a página — e um atalho com
 * o nome antigo não acende erro em lugar nenhum.
 *
 * O ÍCONE também é código: ele é a pista visual da seção, não uma frase que se
 * traduz. Ele repete o de `components/navegacao.tsx` de propósito — a mesma
 * página tem de ter a mesma cara na barra e no atalho, senão as duas pistas
 * disputam a memória de quem navega.
 *
 * A chave é `ChaveDeDoc` por tipagem: rota nova sem bloco de conteúdo — ou
 * bloco sem rota — é erro de compilação, e não um cartão para o vazio.
 */
const ATALHOS = [
  { chave: "instalacao", Icone: Download },
  { chave: "uso", Icone: Terminal },
  { chave: "modulos", Icone: Boxes },
  { chave: "docs", Icone: BookOpen },
] as const

export function AtalhosDaDocumentacao({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const paginas = t.paginas
  // Site gerado sem documentação não ganha quatro links para lugar nenhum.
  if (!paginas) return null

  return (
    // `px-4 sm:px-6` é a coluna que `cabecalho.tsx:90`, `rodape.tsx:106` e
    // `moldura-de-documentacao.tsx:57` já usam. Esta faixa fecha a home e
    // encosta no rodapé: com o `px-6` fixo que estava aqui, num telefone de
    // 390px o último cartão começava em x=24 e a marca do rodapé logo abaixo
    // em x=16 — 8px de degrau na emenda mais visível da página.
    <nav
      aria-label={t.rotulos.secoes}
      className="mx-auto grid w-full max-w-5xl gap-4 px-4 py-20 sm:grid-cols-2 sm:px-6 sm:py-24"
    >
      {ATALHOS.map(({ chave, Icone }, i) => {
        const pagina = paginas[chave]
        return (
          <Revelar
            key={chave}
            atraso={Math.min(i, 3) * 0.05}
            className="h-full"
          >
            <Link
              href={caminhoDe(idioma, rotaDe(chave))}
              className="group flex h-full flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-brand-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none sm:p-6"
            >
              <span className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-subtle text-brand-subtle-foreground">
                  <Icone aria-hidden className="size-4" />
                </span>
                <span className="flex flex-1 items-center gap-1.5 text-h4">
                  {pagina.titulo}
                  <ArrowRight
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                  />
                </span>
              </span>
              <span className="text-caption text-muted-foreground">
                {pagina.resumo}
              </span>
            </Link>
          </Revelar>
        )
      })}
    </nav>
  )
}
