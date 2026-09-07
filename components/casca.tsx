import type { ReactNode } from "react"
import { Geist, Geist_Mono } from "next/font/google"

import { BarraDeProgresso } from "@/components/barra-de-progresso"
import { Cabecalho } from "@/components/cabecalho"
import { Rodape } from "@/components/rodape"
import { ThemeProvider } from "@/components/theme-provider"
import { textos, type Idioma } from "@/conteudo/carregar"
import { cn } from "@/lib/utils"

const fontSans = Geist({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

/**
 * O `<html>` INTEIRO, escrito uma vez e usado pelos DOIS layouts raiz.
 *
 * Por que há dois layouts raiz, e não um só: o inglês mora na raiz (`/`) e os
 * traduzidos moram sob `[idioma]`. O `lang` do `<html>` muda entre os dois, e
 * um atributo que muda por segmento não cabe num layout comum — é exatamente o
 * caso que o `route-groups.md` do Next nomeia para múltiplos layouts raiz.
 *
 * O que NÃO pode acontecer é a marcação nascer duas vezes: dois `<html>`
 * escritos à mão divergem no dia em que alguém acrescenta um provider a um e
 * esquece o outro, e a página que ficou para trás não acusa nada — ela só perde
 * o tema, ou a barra, e continua respondendo 200. Daí este arquivo: os layouts
 * raiz são cascas de três linhas em volta dele.
 *
 * NENHUM LITERAL DE CONTEÚDO AQUI. Até "Pular para o conteúdo" saiu para
 * `rotulos.pularParaConteudo`: enquanto o site tinha um idioma o literal era
 * dívida barata, com três ele publicaria a moldura em português nas três
 * versões.
 */
export function Casca({
  idioma,
  children,
}: {
  idioma: Idioma
  children: ReactNode
}) {
  const t = textos(idioma)

  return (
    <html
      lang={t.tagDeIdioma}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        fontSans.variable
      )}
    >
      <body>
        <ThemeProvider>
          {/* Pular para o conteudo, e ele vem ANTES da navegacao no DOM: quem
              navega por teclado nao deveria atravessar cinco links a cada
              pagina para chegar no texto. */}
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground focus:ring-2 focus:ring-ring"
          >
            {t.rotulos.pularParaConteudo}
          </a>
          <BarraDeProgresso />
          {/* O cabeçalho lê o conteúdo sozinho, e é por isso que só o idioma
              atravessa: ele é componente de servidor e monta ali dentro as
              rotas, os idiomas e o índice da busca. Repassar tudo por aqui
              deixaria esta casca sabendo o que cada peça do cabeçalho precisa
              — e mudar a barra passaria a exigir mexer nos dois arquivos. */}
          <Cabecalho idioma={idioma} />
          {/* `tabIndex={-1}` para o alvo do link de pular receber o FOCO, e
              nao so a rolagem: sem ele o proximo Tab volta para o cabecalho, e
              quem pulou o menu atravessa o menu de novo. Foco programatico nao
              acende `:focus-visible`, entao nada aparece na tela. */}
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          {/* O rodapé recebe o idioma, e o cabeçalho também: os dois montam
              texto de moldura. Ele não recebia nada até 06/09, e o preço
              estava publicado — o único link do rodapé, que é o último texto
              de toda página, saía em português nas 15 rotas. */}
          <Rodape idioma={idioma} />
        </ThemeProvider>
      </body>
    </html>
  )
}
