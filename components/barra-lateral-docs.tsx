"use client"

/**
 * A BARRA LATERAL DE `/docs`, e ela é a mesma lista nos dois tamanhos de tela:
 * coluna fixa no desktop, `Sheet` no celular. Uma barra espremida em 12rem no
 * telefone é a pior das três opções — ocupa metade da largura de leitura para
 * mostrar quatro links cortados.
 *
 * ELA RECEBE TEXTO PRONTO, como a `navegacao.tsx`, e pelo mesmo motivo: este é
 * um componente de cliente, e importar `conteudo/carregar` aqui empacotaria os
 * três JSON de texto mais o validador inteiro no bundle do navegador para
 * mostrar quatro rótulos. Quem lê o conteúdo é a moldura, do lado do servidor.
 *
 * O ITEM ATIVO É O DE CAMINHO MAIS LONGO QUE CASA, e não todo item que casa —
 * a mesma armadilha que `navegacao.tsx` documenta, e que aqui é pior porque as
 * QUATRO rotas moram sob `/docs`: um `startsWith` por item marcaria "docs" e
 * "instalação" ao mesmo tempo em `/docs/installation/`, e o leitor de tela
 * anunciaria duas páginas atuais na mesma lista.
 */

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeft } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { GrupoDeDocs } from "@/components/navegacao-de-docs"
import type { ChaveDeDoc } from "@/lib/rotas"
import { cn } from "@/lib/utils"

export type ItemDeDoc = {
  chave: ChaveDeDoc
  href: string
  rotulo: string
}

export type GrupoRenderizado = {
  chave: GrupoDeDocs
  rotulo: string
  itens: readonly ItemDeDoc[]
}

/**
 * A chave da página atual, ou nenhuma.
 *
 * `trailingSlash` está ligado no `next.config.ts`, então `usePathname` devolve
 * `/docs/installation/` enquanto o `href` construído é `/docs/installation`. O
 * teste cobre as duas formas — igualdade exata E prefixo com barra — porque a
 * comparação ingênua entre elas falha justamente na configuração publicada, e
 * não em `next dev`.
 */
function chaveAtiva(
  grupos: readonly GrupoRenderizado[],
  caminho: string
): ChaveDeDoc | undefined {
  let melhor: ItemDeDoc | undefined

  for (const grupo of grupos) {
    for (const item of grupo.itens) {
      const casa = caminho === item.href || caminho.startsWith(`${item.href}/`)
      if (!casa) continue
      if (!melhor || item.href.length > melhor.href.length) melhor = item
    }
  }

  return melhor?.chave
}

/**
 * A lista em si, desenhada duas vezes — na coluna e dentro da gaveta.
 *
 * `prefixo` existe porque as duas cópias VIVEM NO MESMO DOCUMENTO ao mesmo
 * tempo (a coluna fica `hidden` no celular, e `hidden` continua sendo DOM):
 * sem ele, os dois `aria-labelledby` apontariam para o mesmo `id` repetido e a
 * segunda lista tomaria o nome da primeira.
 */
function Lista({
  grupos,
  ativa,
  prefixo,
  aoNavegar,
}: {
  grupos: readonly GrupoRenderizado[]
  ativa: ChaveDeDoc | undefined
  prefixo: string
  aoNavegar?: () => void
}) {
  return (
    <div className="flex flex-col gap-7">
      {grupos.map((grupo) => {
        const idDoRotulo = `${prefixo}-${grupo.chave}`
        return (
          <div key={grupo.chave}>
            {/*
             * O rótulo do grupo NÃO é `<h2>`, e a omissão é deliberada: a barra
             * vem antes do `<h1>` da página no DOM, então um `h2` aqui abriria
             * a estrutura de cabeçalhos com o nível errado e empurraria as
             * seções do artigo para baixo. O nome da lista é dado por
             * `aria-labelledby`, que é o mecanismo próprio para isso.
             */}
            <div
              id={idDoRotulo}
              className="px-3 text-caption font-medium tracking-wide text-muted-foreground uppercase"
            >
              {grupo.rotulo}
            </div>
            <ul
              aria-labelledby={idDoRotulo}
              className="mt-2 flex flex-col border-l border-border"
            >
              {grupo.itens.map((item) => {
                const atual = item.chave === ativa
                return (
                  <li key={item.chave} className="flex">
                    <Link
                      href={item.href}
                      onClick={aoNavegar}
                      // Cor E `aria-current`, as duas: só a cor deixa a barra
                      // muda para leitor de tela e ilegível para quem não
                      // distingue os dois tons.
                      aria-current={atual ? "page" : undefined}
                      className={cn(
                        // `min-h-11` são os 44px de alvo de toque, e eles só
                        // caem no desktop, onde o ponteiro é preciso e a lista
                        // apertada mostra mais itens sem rolagem.
                        "-ml-px flex min-h-11 w-full items-center border-l px-3 text-sm transition-colors lg:min-h-0 lg:py-1.5",
                        // CONTORNO PARA DENTRO, e não `ring`: o anel do
                        // Tailwind é uma sombra desenhada PARA FORA da caixa, e
                        // a coluna que envolve esta lista rola
                        // (`overflow-y-auto` no `<nav>` abaixo). O navegador
                        // recorta tudo o que passa da borda do scrollport, e o
                        // foco no primeiro e no último item aparecia como dois
                        // tracinhos soltos — o de cima e o de baixo — sem os
                        // lados. Com o contorno deslocado para DENTRO não há
                        // nada fora da caixa para recortar. É o mesmo motivo
                        // que já leva o `<pre>` de `painel-de-codigo.tsx` a
                        // escrever o foco assim.
                        // O `focus-visible:rounded-r-md` saiu junto: ele
                        // existia só para arredondar aquele anel, e sem anel
                        // ficaria arredondando nada.
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                        atual
                          ? "border-brand font-medium text-brand-subtle-foreground"
                          : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      {item.rotulo}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export function BarraLateralDocs({
  grupos,
  rotuloDasSecoes,
  rotuloDoMenu,
  rotuloDeFechar,
}: {
  grupos: readonly GrupoRenderizado[]
  /** Nome acessível da navegação e título da gaveta — `rotulos.secoes`. */
  rotuloDasSecoes: string
  /** O texto do botão que abre a gaveta — `rotulos.menu`. */
  rotuloDoMenu: string
  rotuloDeFechar: string
}) {
  const caminho = usePathname()
  const ativa = chaveAtiva(grupos, caminho)
  const [aberta, setAberta] = useState(false)

  return (
    // `sticky` nos DOIS tamanhos, e é a mesma propriedade fazendo dois
    // trabalhos: no celular ela prende a faixa do botão logo abaixo do
    // cabeçalho; no desktop, a coluna inteira. `top-header` sai do mesmo
    // `--desvio-do-cabecalho` que o `scroll-padding-top` global — dois números
    // escritos à mão divergiriam no dia em que o cabeçalho mudasse de altura.
    <aside
      // `data-barra-de-docs` NÃO É GANCHO DE JAVASCRIPT: é a marca que o
      // `app/globals.css` procura com `body:has(...)` para dar
      // `scroll-margin-top: var(--altura-da-barra-de-docs)` a todo `[id]`
      // abaixo de `lg`. Abaixo desse tamanho a documentação tem DUAS barras
      // grudadas — o cabeçalho e a faixa logo aqui embaixo — e o
      // `scroll-padding-top` global só desconta a primeira: sem esta marca,
      // escolher uma seção no índice parava o título pedido ATRÁS da faixa, e a
      // pessoa lia o fim da seção anterior.
      //
      // A marca fica no `<aside>` porque ele é o elemento que só existe nas
      // páginas de `/docs`. A regra do CSS é de PRESENÇA, e um seletor de
      // presença ligado num lugar comum a todas as páginas desceria a âncora do
      // site inteiro por causa de uma barra que a maioria das páginas não tem.
      data-barra-de-docs
      className="sticky top-header z-30 w-full self-start lg:w-60 lg:shrink-0 lg:py-10"
    >
      <div className="-mx-4 flex items-center border-b border-border/60 bg-background/85 px-4 py-1.5 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <Sheet open={aberta} onOpenChange={setAberta}>
          <SheetTrigger
            render={
              // `-ml-3` desfaz o `px-3` DO PRÓPRIO BOTÃO. O container já recua
              // até a coluna de texto do artigo (o `px-4`/`sm:px-6` que ele
              // devolve depois do `-mx`), e o padding do botão somava por cima:
              // o ícone e a palavra começavam 13px à direita da primeira letra
              // do parágrafo — 12px de `px-3` mais 1px da borda transparente
              // que todo `Button` carrega. O `-ml-3` devolve os 12px; o pixel
              // da borda fica, e é o que sobra de desalinho.
              //
              // O `px-3` FICA, e é essa a razão de puxar pela margem em vez de
              // tirar o padding: ele é a superfície de hover do botão, e um
              // alvo colado no texto não tem por onde ser apontado.
              <Button
                variant="ghost"
                className="-ml-3 h-11 gap-2 px-3 text-sm"
              />
            }
          >
            <PanelLeft aria-hidden />
            {rotuloDoMenu}
          </SheetTrigger>
          <SheetContent
            side="left"
            // A LARGURA VAI COM O MESMO PREFIXO DE VARIANTE DE LÁ, e não solta.
            // O `sheet.tsx` traz `data-[side=left]:w-3/4` e
            // `data-[side=left]:sm:max-w-sm`, e o `tailwind-merge` só apaga uma
            // classe quando os modificadores também batem: um `w-[19rem]` cru
            // ficava AO LADO das duas em vez de no lugar delas, e aí quem
            // decidia era a ordem da folha de estilo — que é a de lá. A gaveta
            // abria com 384px no tablet de 768px (o teto do `max-w-sm`) e com
            // 281px no telefone de 375px (os três quartos), nunca com os 304px
            // pedidos. O `max-w` acompanha pelo mesmo motivo: sem ele o teto de
            // 24rem continuaria de pé, esperando uma tela larga para reaparecer.
            className="gap-0 data-[side=left]:w-[19rem] data-[side=left]:sm:max-w-[19rem]"
            rotuloDeFechar={rotuloDeFechar}
          >
            {/*
             * `py-3.5` NO LUGAR DO `p-4` DO COMPONENTE, e a conta é a do X: o
             * botão de fechar é `size-7` em `top-3`, então o centro dele cai em
             * 12 + 14 = 26px do topo da gaveta. Com o `p-4`, o título de
             * `text-base` (24px de entrelinha) tem o centro em 16 + 12 = 28px —
             * o X ficava 2px ACIMA da palavra. Com 14px em cima, 14 + 12 = 26px
             * e os dois caem no mesmo eixo; é a mesma medida que a gaveta do
             * menu principal já usa em `navegacao-do-cabecalho.tsx`.
             *
             * O ajuste é aqui, no ponto de chamada: o `p-4` é o padrão do
             * `SheetHeader` e vale para cabeçalho com descrição embaixo, que é
             * mais alto. `py-3.5` sobrescreve só o eixo vertical — o `px` de
             * 16px continua vindo do `p-4`.
             */}
            <SheetHeader className="py-3.5">
              <SheetTitle>{rotuloDasSecoes}</SheetTitle>
            </SheetHeader>
            <nav
              aria-label={rotuloDasSecoes}
              className="overflow-y-auto px-2 pb-6"
            >
              <Lista
                grupos={grupos}
                ativa={ativa}
                prefixo="gaveta"
                // Fechar ao navegar: a gaveta é a MESMA página do lado de
                // dentro do Next (navegação de cliente, sem recarregar), então
                // ela não some sozinha e o visitante ficaria olhando o menu
                // por cima do conteúdo que acabou de pedir.
                aoNavegar={() => setAberta(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <nav
        aria-label={rotuloDasSecoes}
        // A coluna rola sozinha quando a lista passa da altura da tela, e o
        // desconto de 5rem é o `py-10` que a envolve — sem ele o último item
        // fica embaixo da dobra sem barra de rolagem nenhuma.
        className="hidden max-h-[calc(100svh-var(--spacing-header)-5rem)] overflow-y-auto lg:block"
      >
        <Lista grupos={grupos} ativa={ativa} prefixo="coluna" />
      </nav>
    </aside>
  )
}
