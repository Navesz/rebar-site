import { notFound } from "next/navigation"
import { ArrowRight, Info } from "lucide-react"
import Link from "next/link"

import { ArtigoDeDoc } from "@/components/artigo-de-doc"
import { PainelDeCodigo } from "@/components/painel-de-codigo"
import { Revelar } from "@/components/revelar"
import { TituloDeSecao } from "@/components/titulo-de-secao"
import { caminhoDe, textos, type Idioma } from "@/conteudo/carregar"
import { ancorasDe } from "@/lib/ancoras"
import { rotaDe } from "@/lib/rotas"

/**
 * A PÁGINA-ASSINATURA: passo numerado à esquerda, comando à direita.
 *
 * A forma é a de `tailwindcss.com/docs/installation/using-vite`, e ela não é
 * cópia de estilo — é a única que resolve o problema de ler documentação de
 * instalação: o texto explica POR QUE o passo existe e o comando é o que se
 * copia. Empilhados, os dois competem pela mesma coluna e o olho tem de pular
 * de um para o outro a cada passo; lado a lado, a explicação fica parada
 * enquanto a mão vai no botão de copiar.
 *
 * A DECISÃO DE QUANDO EMPILHAR É DO CONTÊINER, e não da janela. `@container` no
 * `<ol>` mais `@2xl:` nos filhos: o artigo perde 15rem para a barra lateral e
 * 14rem para a trilha da direita, então "a janela é larga" não responde à
 * pergunta que importa, que é "sobrou largura para duas colunas AQUI". Com
 * media query, a mesma tela de 1280px daria duas colunas de 20rem espremidas.
 *
 * `paginas` é bloco condicional no esquema, então pode não existir — e o tipo
 * obriga a tratar. `notFound()` em vez de renderizar vazio: uma rota que
 * responde 200 com nada dentro é pior que uma que não existe, porque entra no
 * índice de busca e o visitante chega numa página em branco.
 */
export function Instalacao({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  // O bloco inteiro é estreitado de uma vez, e não passo a passo: é assim que
  // o "próximo passo" lá embaixo alcança `paginas.uso` sem um segundo
  // `notFound()` que nunca dispararia.
  const paginas = t.paginas
  if (!paginas) notFound()
  const p = paginas.instalacao

  // Uma chamada, dois consumidores: os `id` dos `<h2>` e os `href` do índice.
  const ancoras = ancorasDe(p.passos.map((passo) => passo.titulo))
  const indice = p.passos.map((passo, i) => ({
    id: ancoras[i],
    titulo: passo.titulo,
  }))

  const rotulosDoPainel = {
    copiar: t.rotulos.copiar,
    copiado: t.rotulos.copiado,
  }

  return (
    <ArtigoDeDoc
      idioma={idioma}
      chave="instalacao"
      titulo={p.titulo}
      resumo={p.resumo}
      indice={indice}
      largura="ampla"
    >
      <ol className="@container flex flex-col gap-12">
        {p.passos.map((passo, i) => (
          <li key={passo.titulo}>
            {/* O atraso cresce com o índice para os passos entrarem em
                cascata, e para no quinto: escada longa demais vira espera. */}
            <Revelar
              atraso={Math.min(i, 4) * 0.06}
              className="grid gap-5 @2xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] @2xl:items-start @2xl:gap-10"
            >
              <div>
                <div className="flex items-center gap-3">
                  {/* O número é `aria-hidden` porque a ordem já está dita pela
                      marcação: isto é um `<ol>`, e o leitor de tela anuncia
                      "item 3 de 5" sozinho. Lido, ele viraria "três três". */}
                  <span
                    aria-hidden
                    className="flex size-7 shrink-0 items-center justify-center rounded-full border border-brand-border/60 bg-brand-subtle font-mono text-caption text-brand-subtle-foreground tabular-nums"
                  >
                    {i + 1}
                  </span>
                  {/* O MESMO título ancorado de `/docs`, e não um `<h2 id>` de
                      novo à mão: o `id` sozinho serve ao índice, mas é o `#`
                      que deixa a pessoa apanhar o link do passo para mandar a
                      alguém — e era exatamente ele que faltava aqui. */}
                  <TituloDeSecao id={ancoras[i]} className="text-h4">
                    {passo.titulo}
                  </TituloDeSecao>
                </div>
                {passo.nota ? (
                  <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                    <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
                    <span>{passo.nota}</span>
                  </p>
                ) : null}
              </div>

              {/* `prompt="$"` e não um `$` digitado dentro do comando: o painel
                  desenha o cifrão com `aria-hidden` e `select-none`, então o
                  que vai para a área de transferência é só o comando. Colar
                  `$ npx …` num terminal é o defeito clássico do bloco que
                  renderiza o prompt como texto de verdade. */}
              <PainelDeCodigo
                abas={[{ rotulo: passo.titulo, codigo: passo.comando }]}
                prompt="$"
                rotulos={rotulosDoPainel}
              />
            </Revelar>
          </li>
        ))}
      </ol>

      {/*
       * O PRÓXIMO PASSO, e ele não repete o rodapé de anterior/próximo que vem
       * logo abaixo: aquele é o paginador, com o nome curto da página; este é
       * a chamada, com o TÍTULO e o RESUMO de "uso". Quem termina de instalar
       * precisa saber o que a próxima página entrega, e não só como ela se
       * chama.
       */}
      <Revelar>
        <aside className="mt-16 rounded-xl border border-brand-border/50 bg-brand-subtle/40 p-6">
          <p className="text-caption font-medium tracking-wide text-brand-subtle-foreground uppercase">
            {t.rotulos.proximo}
          </p>
          <p className="mt-2 text-h4">{paginas.uso.titulo}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {paginas.uso.resumo}
          </p>
          {/* O HOVER NÃO MEXE NA COR, pela mesma medida que `components/hero.tsx`
              já anotou no CTA gêmeo: `bg-brand/90` não escurece o botão, ele o
              deixa TRANSLÚCIDO — compila para `color-mix(… var(--brand) 90%,
              transparent)` — e aqui ele compõe com o `bg-brand-subtle/40` do
              próprio aviso. Medido: os 5,14:1 de `brand-foreground` sobre
              `brand` caem para 4,36:1 no tema claro, abaixo do piso de 4,5:1, e
              isto é texto de 14px, que não tem a folga do texto grande. No
              escuro cai de 6,88:1 para 5,84:1 — passa, mas é cor que ninguém
              mediu, porque estado de hover não sai em auditoria automática.
              O que muda no hover é a elevação e a seta. */}
          <Link
            href={caminhoDe(idioma, rotaDe("uso"))}
            className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-foreground shadow-raised transition-shadow hover:shadow-overlay focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
          >
            {t.rotulos.comecar}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </aside>
      </Revelar>
    </ArtigoDeDoc>
  )
}
