import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

import { CoreografiaDoHero } from "@/components/coreografia-da-home"
import { Marca } from "@/components/marca"
import { PASSO_DO_HERO } from "@/components/passos-da-home"
import { PainelDeCodigo } from "@/components/painel-de-codigo"
import { caminhoDe, site, textos, type Idioma } from "@/conteudo/carregar"
import { rotaDe } from "@/lib/rotas"

/**
 * A PRIMEIRA DOBRA: marca, título, o que a ferramenta é, para onde ir, e o
 * comando — nessa ordem, que é a ordem em que a pergunta aparece na cabeça de
 * quem chega.
 *
 * COMPONENTE DE SERVIDOR, de propósito, e é o que faz este bloco sair inteiro
 * no HTML estático. O `"use client"` fica só em `coreografia-da-home.tsx`, que
 * recebe isto aqui como `children` já renderizado: o carregador de conteúdo e
 * os três arquivos de texto não atravessam a fronteira, e o rastreador de
 * busca lê o título sem executar uma linha de JS. É a mesma disciplina que
 * `components/navegacao.tsx` anotou.
 *
 * O `data-entrada` é o contrato com a partitura, e o valor vem de
 * `components/passos-da-home.ts` em vez de ser digitado aqui: seletor que não
 * casa com nada não quebra build nenhum — ele só apaga a animação, calado. E o
 * objeto mora naquele arquivo, e não no da partitura, porque exportação de
 * módulo `"use client"` lida por componente de servidor não devolve o valor.
 *
 * O BOTÃO DE WHATSAPP SAIU DAQUI, e isso não perde nada. Ele era a chamada
 * principal quando a home não tinha para onde mandar ninguém; agora a chamada
 * é `rotulos.comecar`, que leva à instalação. O bloco `identidade.whatsapp`
 * continua cobrado como total pelo mapa `CONTATOS` de `components/rodape.tsx`
 * — ou seja, preenchê-lo no JSON continua obrigando alguém a renderizá-lo, e a
 * garantia de "campo preenchido nunca fica invisível" não passava por aqui.
 */
export function Hero({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const instalacao = t.paginas?.instalacao
  const repositorio = site.identidade.repositorio

  return (
    <CoreografiaDoHero className="border-b border-border/60">
      {/* `px-4 sm:px-6` E NÃO `px-6`, e a diferença é uma coluna que o site
          inteiro já tinha decidido. `components/cabecalho.tsx:90`,
          `components/rodape.tsx:106` e `components/moldura-de-documentacao.tsx:57`
          usam todos `px-4 sm:px-6`; as quatro faixas da home usavam `px-6`
          fixo. Num telefone de 390px isso põe a MESMA marca em duas colunas na
          mesma rolagem: a do cabeçalho começa em x=16, a do hero em x=24, e o
          rodapé volta para x=16 — 8px de degrau, três vezes, na única largura
          em que 8px de margem ainda valem alguma coisa. A partir de 640px o
          `sm:px-6` devolve os 24px e nada muda no desktop. */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28">
        {/* A marca vai num elemento próprio, e não com o atributo no `<svg>`:
            o alvo da escala precisa ser um bloco, e o `Marca` é uma peça de
            identidade que serve cabeçalho, rodapé e hero sem saber de
            animação nenhuma. */}
        <div data-entrada={PASSO_DO_HERO.marca} className="w-fit">
          <Marca className="size-12 text-brand sm:size-14" />
        </div>

        <h1 data-entrada={PASSO_DO_HERO.titulo} className="mt-8 text-h1">
          {t.home.titulo}
        </h1>

        {/* `max-w-2xl` no subtítulo e não na faixa inteira: a medida de leitura
            confortável é a do PARÁGRAFO, e prendê-la no contêiner encolheria
            junto o painel de comando e a grade de baixo. */}
        <p
          data-entrada={PASSO_DO_HERO.subtitulo}
          className="mt-5 max-w-2xl text-lead text-muted-foreground"
        >
          {t.home.subtitulo}
        </p>

        {/*
         * OS DOIS BOTÕES MEDEM O MESMO PORQUE A ALTURA AGORA É DA CAIXA, e não
         * a soma do recuo. Com `py-2.5` eles eram dimensionados de dentro para
         * fora, e a conta, tirada dos tokens que o build emite de verdade
         * (`--text-sm: .875rem`, `--text-sm--line-height: calc(1.25 / .875)`,
         * `--spacing: .25rem`): a linha do `text-sm` são 14px × 1,4286 = 20px,
         * mais 10px + 10px de recuo = 40px de botão cheio. O vazado tem
         * `border`, e borda fica POR FORA do recuo quando a altura vem dele:
         * 40 + 1 + 1 = 42px. Dois botões lado a lado na primeira dobra com 2px
         * de degrau entre eles — e nenhum dos dois chegando aos 44px que este
         * projeto cobra como alvo de toque em SEIS arquivos:
         * `navegacao-do-cabecalho.tsx`, `seletor-de-idioma.tsx`,
         * `seletor-de-tema.tsx`, `barra-lateral-docs.tsx`,
         * `indice-da-pagina.tsx` e `paginas/instalacao.tsx`.
         *
         * `min-h-11` são exatamente esses 44px (11 × 4px), e `min-height` é
         * medida de CAIXA: com o `box-sizing: border-box` do preflight o 1px da
         * borda cabe DENTRO dos 44 em vez de somar a eles. Os dois passam a
         * 44px cravados, com borda e sem — e `items-center` continua sendo quem
         * centra o rótulo na altura que sobrou. É a mesma forma do botão de
         * `components/paginas/instalacao.tsx:128`, que já tinha essa medida.
         *
         * O `px-5` FICA, e a largura continua diferente entre os dois: são
         * rótulos diferentes, então ela nunca foi igual, e os mesmos 2px de
         * borda continuam somando na horizontal. O que se alinha lado a lado é
         * a linha de baixo — e essa é a altura.
         */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          {/* A chamada principal só existe se o destino existir. `paginas` é
              bloco condicional no esquema, e a rota de instalação responde
              `notFound()` sem ele: um botão para uma página que não foi gerada
              é link morto publicado com confiança.

              E o hover dela NÃO MEXE NA COR, o que é medida e não gosto: os
              5,14:1 de `brand-foreground` sobre `brand` estão anotados em
              `globals.css`, e tanto um `opacity-90` quanto um `bg-brand/90`
              puxam os DOIS para perto do fundo da página e derrubam o número —
              sem ninguém remedir, porque estado de hover não sai em auditoria
              automática. O que muda no hover é a elevação e a seta. */}
          {instalacao ? (
            <Link
              data-entrada={PASSO_DO_HERO.acao}
              href={caminhoDe(idioma, rotaDe("instalacao"))}
              className="group inline-flex min-h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-medium text-brand-foreground shadow-raised transition-shadow hover:shadow-overlay focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {t.rotulos.comecar}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ) : null}

          {/* O RÓTULO É `rotulos.repositorio` E NÃO `repositorio.rotulo`, e a
              diferença importa: o `rotulo` do JSON mora em `site.json`, que é
              o arquivo COMPARTILHADO pelos três idiomas — ele sairia em
              português na versão inglesa. Ele continua sendo renderizado onde
              é a legenda do link, no rodapé; aqui o que se lê é o rótulo de
              interface, que é traduzido.

              `rel="noreferrer"` sozinho basta: ele implica o `noopener` em
              todo navegador atual, e escrever os dois é repetir a mesma
              garantia com nome diferente. */}
          {repositorio ? (
            <a
              data-entrada={PASSO_DO_HERO.acao}
              href={repositorio.url}
              rel="noreferrer"
              target="_blank"
              className="group inline-flex min-h-11 items-center gap-2 rounded-md border border-brand-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-brand-subtle focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              {t.rotulos.repositorio}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform group-hover:-translate-y-0.5"
              />
            </a>
          ) : null}
        </div>

        {/* O COMANDO É LIDO DO PRIMEIRO PASSO DA INSTALAÇÃO, e não digitado
            aqui. Escrito no JSX, seria a mesma invocação em dois lugares — e
            no dia em que ela mudar, só um dos dois muda, sem nada acender. */}
        {instalacao ? (
          <div data-entrada={PASSO_DO_HERO.painel} className="mt-10 max-w-xl">
            <PainelDeCodigo
              // Uma aba só e sem nome de arquivo: o painel não desenha a barra
              // de cromo e o botão de copiar flutua sobre o comando. O
              // `rotulo` é exigido pelo tipo `Aba` e só apareceria com uma
              // segunda aba — o título da página é o valor honesto para ele.
              abas={[
                {
                  rotulo: instalacao.titulo,
                  codigo: instalacao.passos[0].comando,
                },
              ]}
              prompt="$"
              rotulos={{ copiar: t.rotulos.copiar, copiado: t.rotulos.copiado }}
            />
          </div>
        ) : null}
      </div>
    </CoreografiaDoHero>
  )
}
