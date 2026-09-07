import Link from "next/link"

import { Marca } from "@/components/marca"
import {
  MenuMobile,
  NavegacaoDoCabecalho,
} from "@/components/navegacao-do-cabecalho"
import { PaletaDeBusca } from "@/components/paleta-de-busca"
import { SeletorDeIdioma } from "@/components/seletor-de-idioma"
import { SeletorDeTema } from "@/components/seletor-de-tema"
import { buttonVariants } from "@/components/ui/button"
import {
  IDIOMAS,
  caminhoDe,
  site,
  textos,
  type Idioma,
} from "@/conteudo/carregar"
import { indiceDeBusca } from "@/lib/indice-de-busca"
import { ROTAS } from "@/lib/rotas"
import { cn } from "@/lib/utils"
import { MarcaGitHub } from "@/components/marca-github"

/**
 * O CABEÇALHO DO SITE — e ele é um componente de SERVIDOR de propósito.
 *
 * Aqui dentro há quatro coisas com estado (a busca, o tema, o idioma, a
 * gaveta), e a saída fácil seria marcar o arquivo inteiro com `"use client"`.
 * O preço disso seria mandar para o navegador, em JavaScript, a marca, o nome
 * do site, o link do repositório e a moldura — marcação que nunca muda e que
 * no `output: "export"` já está pronta no HTML. Cada peça interativa é uma ilha
 * de cliente com props serializáveis, e esta casca é HTML estático.
 *
 * A CONSEQUÊNCIA QUE IMPORTA é a que a navegação antiga já documentava: o
 * conteúdo é lido AQUI. Um componente de cliente que importasse
 * `@/conteudo/carregar` empacotaria os três JSON de texto e o validador de
 * `conteudo/esquema.ts` no bundle do navegador — para escrever cinco palavras
 * e montar meia dúzia de `href`.
 *
 * A ALTURA É `h-header`, que é o próprio `--desvio-do-cabecalho` (5rem = 80px)
 * — e ela não é escolha de gosto. Três componentes desta árvore grudam em
 * `top-header`: a barra lateral de `/docs`, o índice "nesta página" e a coluna
 * da esteira. Uma barra mais BAIXA que aquele número abre uma fresta entre ela
 * e cada coluna grudada, e o texto da página rola dentro da fresta; uma barra
 * mais ALTA come o começo de toda âncora, porque o `scroll-padding-top` global
 * sai da mesma variável. Um número, um lugar.
 *
 * `sticky` e não `fixed`: `fixed` tira o cabeçalho do fluxo e obriga toda
 * página a compensar a altura com um `padding-top` — compensação que uma
 * página nova esquece e ninguém percebe até o primeiro título sumir por baixo
 * da barra. `z-40` e não `z-50` porque a barra de progresso mora em `z-50`, e
 * ela tem de continuar visível por cima do cabeçalho.
 */
export function Cabecalho({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)

  const itens = ROTAS.map((rota) => ({
    chave: rota.chave,
    href: caminhoDe(idioma, rota.caminho),
    rotulo: t.rotulos.navegacao[rota.chave],
  }))

  /**
   * O TOPO NÃO LEVA AS CINCO ROTAS. A home já é a marca à esquerda — todo site
   * ensina isso —, e repeti-la como link de texto gasta o lugar mais caro da
   * página com o destino que a pessoa já sabe alcançar. Ficam as quatro rotas
   * de documentação, que é o site inteiro fora da home; no celular a gaveta
   * lista as cinco, porque lá a marca divide espaço com quatro controles e
   * "clique na palavra rebar" deixa de ser óbvio.
   */
  const itensDoTopo = itens.filter((item) => item.chave !== "inicio")

  // O bloco do repositório é OPCIONAL no esquema (é `Contato`, o mesmo que o
  // rodapé cobra por `satisfies`): site gerado sem repositório não pode
  // publicar um link para `undefined`.
  const repositorio = site.identidade.repositorio

  const idiomas = IDIOMAS.map((outro) => ({
    // O prefixo da raiz é vazio; o dos traduzidos é `/pt-br`, `/es`. Ele sai de
    // `caminhoDe` para não existir uma segunda regra de prefixo do lado do
    // cliente — a raiz sem prefixo é decisão de UM arquivo só.
    prefixo: caminhoDe(outro, "/").replace(/^\/$/, ""),
    tag: textos(outro).tagDeIdioma,
    nome: textos(outro).nomeDoIdioma,
    atual: outro === idioma,
  }))

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-header max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link
          href={caminhoDe(idioma, "/")}
          className="flex shrink-0 items-center gap-2 rounded-md text-foreground transition-colors hover:text-brand"
        >
          <Marca className="size-6 text-brand" />
          <span className="font-heading text-base font-semibold tracking-tight">
            {site.identidade.nome}
          </span>
        </Link>

        <NavegacaoDoCabecalho
          itens={itensDoTopo}
          rotulo={t.rotulos.navegacaoPrincipal}
          className="ml-2 hidden lg:block"
        />

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          {/*
           * A BUSCA TEM LARGURA, e isso é metade do que faz uma busca ser
           * usada. O ícone solto não diz que existe busca — diz que existe um
           * ícone; a caixa com a palavra escrita e o `⌘K` ao lado diz as duas
           * coisas de uma vez, que é por onde `nextjs.org` e
           * `tailwindcss.com` resolvem isto.
           *
           * A largura mora AQUI, no invólucro, e não numa classe empurrada
           * para dentro do gatilho: o botão da paleta já nasce `w-full`, então
           * ele preenche o que este `div` mandar, e não há duas regras de
           * largura disputando a mesma aresta. Abaixo de `sm` sobra o
           * quadrado de 36px — `px-2.5` dos dois lados mais o ícone de 16px
           * dão exatamente 36 —, e o rótulo sai por `[&>span]:hidden`, na
           * mesma largura em que a própria paleta já esconde o `⌘K`.
           */}
          <div className="w-9 shrink-0 sm:w-52 lg:w-64">
            <PaletaDeBusca
              itens={indiceDeBusca(idioma)}
              rotulos={{
                buscar: t.rotulos.buscar,
                buscarVazio: t.rotulos.buscarVazio,
                buscarDica: t.rotulos.buscarDica,
              }}
              // `sr-only` e nao `hidden`: abaixo de 640px o rotulo tem de sumir
              // do layout e FICAR na arvore de acessibilidade. Com `hidden` o
              // botao virava um quadrado de 36px anunciado so como "botao" — a
              // busca do site sem nome nenhum no telefone. `sr-only` e
              // `position:absolute`, entao nao ocupa largura e o botao nao muda
              // de tamanho.
              className="max-sm:[&>span]:sr-only"
            />
          </div>

          <SeletorDeTema
            rotulos={{
              tema: t.rotulos.tema,
              claro: t.rotulos.temaClaro,
              escuro: t.rotulos.temaEscuro,
              sistema: t.rotulos.temaSistema,
            }}
          />

          <SeletorDeIdioma idiomas={idiomas} rotulo={t.rotulos.idioma} />

          {/* Link comum com as classes do botão, e não o `Button`: o `Button`
              é um componente de cliente, e este link não tem estado nenhum —
              montá-lo como ilha custaria JavaScript para renderizar uma âncora
              que o HTML já sabe fazer. Abaixo de `lg` ele se muda para a
              gaveta. */}
          {repositorio ? (
            <a
              href={repositorio.url}
              target="_blank"
              rel="noreferrer"
              title={t.rotulos.repositorio}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-lg" }),
                "hidden lg:inline-flex"
              )}
            >
              {/* `lucide-react` 1.41.0 não exporta `Github` — a biblioteca
                  tirou as marcas de terceiros. O símbolo do GitHub redesenhado
                  à mão aqui seria marca alheia copiada de memória, então o
                  ícone é o genérico do git e quem diz o destino é o nome
                  acessível. */}
              <MarcaGitHub className="size-4" />
              <span className="sr-only">{t.rotulos.repositorio}</span>
            </a>
          ) : null}

          <MenuMobile
            itens={itens}
            rotulos={{
              menu: t.rotulos.menu,
              fechar: t.rotulos.fechar,
              navegacaoPrincipal: t.rotulos.navegacaoPrincipal,
              repositorio: t.rotulos.repositorio,
            }}
            repositorio={repositorio?.url ?? null}
            className="lg:hidden"
          />
        </div>
      </div>
    </header>
  )
}
