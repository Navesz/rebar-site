import { CoreografiaDaEsteira } from "@/components/coreografia-da-home"
import { PainelDeCodigo } from "@/components/painel-de-codigo"
import { PASSO_DA_ESTEIRA } from "@/components/passos-da-home"
import { textos, type Idioma } from "@/conteudo/carregar"

/**
 * A ETIQUETA DE IDIOMA DO PLACAR, e ela NÃO acompanha a página.
 *
 * A saída não se traduz nos três arquivos de texto, e isso é decisão de projeto
 * escrita em `conteudo/esquema.ts` e repetida em `components/paginas/uso.tsx`:
 * é o que o programa IMPRIME de verdade, e o programa imprime em português.
 * Traduzir seria publicar a captura de uma execução que nunca aconteceu.
 *
 * A consequência ficava sem conserto: "11 de 13 · 1 não se aplica" saía dentro
 * de `<html lang="en">` e de `<html lang="es-ES">`, e o leitor de tela lê o que
 * o `lang` mais próximo mandar. Sem esta etiqueta, "não se aplica" é
 * pronunciado com os fonemas de inglês — vira ruído, e nem o rótulo `saída` ao
 * lado ajuda, porque ESSE é traduzido. Um atributo por bloco de texto é
 * exatamente o remédio que o HTML tem para isso.
 *
 * O VALOR SAI DO CONTEÚDO, e não de um `"pt-BR"` digitado aqui. `tagDeIdioma` é
 * campo obrigatório do esquema e é ele que o `<html>` da versão portuguesa já
 * usa; ler daqui é ter uma fonte só. Cravado no `.tsx`, ele seria a segunda —
 * e no dia em que a tag mudar, só uma das duas muda, sem nada acender.
 */
const IDIOMA_DO_PLACAR = textos("pt-br").tagDeIdioma

/**
 * A SEÇÃO EM QUE A RÉGUA RODA — e é onde o GSAP se justifica na home.
 *
 * O que ela mostra é o bloco `paginas.uso`: as maneiras de invocar o checker e,
 * junto do primeiro exemplo que tem uma, a SAÍDA de verdade — o placar com o
 * ✓, o ✗ e o traço do "não se aplica". É o que o portão barra, impresso pelo
 * próprio programa, e não uma ilustração de portão.
 *
 * POR QUE COREOGRAFIA DE ROLAGEM AQUI, e não um `Revelar` a mais. A leitura
 * desta seção É uma sequência: comando, comando, comando, e o placar
 * imprimindo. Amarrar essa sequência à rolagem faz a página andar no ritmo de
 * quem lê — parar de rolar para de imprimir. Um `whileInView` dispararia tudo
 * de uma vez na entrada e a sequência viraria um bloco só, que é o mesmo que
 * não ter sequência. A fronteira de `components/revelar.tsx` está escrita
 * nessa linha: Motion para bloco que entrou, GSAP para linha do tempo.
 *
 * A COLUNA DA ESQUERDA FICA PARADA COM `position: sticky`, E NÃO COM `pin`. O
 * `pin` do ScrollTrigger só existe dentro do ramo `COM_MOVIMENTO` do
 * `matchMedia`: quem pediu menos movimento receberia esta mesma seção com a
 * coluna solta, num layout que ninguém desenhou nem revisou. `sticky` é
 * layout, vale para todo mundo, e sobra para o GSAP só o que é animação.
 *
 * O COMANDO É `PainelDeCodigo`, E O PLACAR NÃO É. A linha entre os dois é o
 * que cada bloco PEDE que a pessoa faça.
 *
 * O comando é para copiar, e ele estava sendo um `<pre>` cru — mesmo grafite,
 * mesmo `$`, e nada acontecia ao clicar. Na MESMA página, meia dobra acima, o
 * painel do hero já tinha ensinado o contrário: grafite com `$` = o painel
 * inteiro copia, o ícone acende quando o mouse entra, e o visto confirma. Cinco
 * blocos idênticos que não respondem depois disso não são "sem função": eles
 * desmentem o que a página acabou de ensinar, e o custo cai em quem aprendeu.
 * O painel também traz de graça o que o `<pre>` só tinha pela metade — botão
 * alcançável pelo teclado, `aria-live` do "copiado", e o recuo de seleção
 * quando `navigator.clipboard` não existe.
 *
 * O placar continua sendo `<pre>`, e a exceção tem motivo. Aquele componente
 * entrega o código como um bloco, e aqui cada LINHA é um alvo da linha do
 * tempo — não dá para escaloná-las sem um nó por linha. Recortar o componente
 * de fora, por seletor, seria depender do HTML interno dele, que não é meu e
 * muda sem avisar. E ninguém copia saída de terminal para colar em lugar
 * nenhum: dar a ela o botão de copiar seria convidar para uma ação que não
 * existe — a mesma divisão que `components/paginas/uso.tsx` já faz. O que este
 * bloco copia do painel é o que importa: os mesmos tokens de grafite, e NENHUMA
 * leitura do conteúdo para pintar cor. Ler o ✗ e pintá-lo de vermelho seria
 * adivinhar o formato da saída de um programa que pode mudar a saída amanhã — a
 * mesma mentira com confiança que `painel-de-codigo.tsx` recusa ao não colorir
 * sintaxe.
 *
 * OS ATRIBUTOS DE DADO SÃO O CONTRATO COM A COREOGRAFIA, e a troca do `<pre>`
 * pelo painel não encosta em nenhum deles: `PASSO_DA_ESTEIRA.item` vive no
 * `<li>`, `PASSO_DA_ESTEIRA.linha` em cada linha do placar, e
 * `PASSO_DA_ESTEIRA.fita` na fita — os três continuam onde estavam, fora do
 * componente novo. É a precaução que `components/passos-da-home.ts` pede por
 * escrito: seletor que não casa com nada não quebra build nem tipo, ele só
 * apaga a animação em silêncio.
 */
export function EsteiraDoPortao({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  const uso = t.paginas?.uso
  // Sem o bloco de documentação não há seção: `paginas` é condicional no
  // esquema, e uma faixa com título e nenhuma linha dentro é pior que faixa
  // nenhuma.
  if (!uso) return null

  // Os rótulos do painel saem uma vez e não a cada exemplo: são os mesmos
  // cinco vezes, e é `t.rotulos` — o bloco de INTERFACE, que se traduz — e não
  // qualquer coisa escrita neste `.tsx`. A mesma leitura de
  // `components/paginas/uso.tsx` e de `components/hero.tsx`.
  const rotulosDoPainel = {
    copiar: t.rotulos.copiar,
    copiado: t.rotulos.copiado,
  }

  return (
    <section className="border-y border-border/60 bg-muted/30">
      {/* `px-4 sm:px-6` é a coluna do cabeçalho, do rodapé e da moldura de
          documentação (`cabecalho.tsx:90`, `rodape.tsx:106`,
          `moldura-de-documentacao.tsx:57`). Esta faixa é a que mais sofria com
          o `px-6` fixo: ela tem fundo próprio, então num telefone de 390px o
          degrau de 8px aparecia como texto recuado DENTRO de uma superfície que
          vai de borda a borda. */}
      <CoreografiaDaEsteira className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* `top-header` sai do mesmo `--desvio-do-cabecalho` que o
              `scroll-padding-top` do `globals.css`: a coluna para na mesma
              altura em que uma âncora para, e não meio degrau acima. */}
          <div className="lg:sticky lg:top-header lg:self-start">
            <h2 className="text-h2">{uso.titulo}</h2>
            <p className="mt-4 text-lead text-muted-foreground">{uso.resumo}</p>
          </div>

          <div className="relative">
            {/* O TRILHO E A FITA. O trilho é a hairline que existe sempre; a
                fita é o óxido que a preenche conforme a rolagem. `origin-top`
                aqui e não no GSAP: a origem da transformação é geometria do
                elemento, e escrita na classe ela vale mesmo sem o script. */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-px overflow-hidden bg-border"
            >
              {/* `motion-reduce:hidden` NÃO É ENFEITE AQUI — é o conserto de
                  uma fita que MENTIA. Quem a preenche é o `.from({ scaleY: 0 })`
                  da partitura, e aquele `.from()` mora dentro do ramo
                  `COM_MOVIMENTO` do `matchMedia`: com `prefers-reduced-motion:
                  reduce`, o GSAP não roda e o estado escondido nunca é escrito.
                  A fita então nascia com `scaleY: 1` — 100% preenchida, do topo
                  ao pé da coluna, antes de a pessoa ter rolado um pixel. Um
                  indicador de progresso cravado no fim é pior que indicador
                  nenhum, e é o mesmo defeito que `barra-de-progresso.tsx`
                  anotou quando trocou a duração fixa pelo `scrub`.
                  Ela é `aria-hidden` e puramente decorativa, então esconder não
                  tira conteúdo de ninguém: o trilho de `bg-border` que a
                  envolve continua desenhando a coluna, que é a parte que
                  organiza a lista. E a classe é CSS, não JS — vale mesmo se o
                  script nunca chegar. */}
              <div
                data-esteira={PASSO_DA_ESTEIRA.fita}
                className="h-full w-full origin-top bg-brand motion-reduce:hidden"
              />
            </div>

            <ol className="space-y-12 pl-8">
              {uso.exemplos.map((exemplo) => (
                <li key={exemplo.titulo} data-esteira={PASSO_DA_ESTEIRA.item}>
                  <h3 className="text-h4">{exemplo.titulo}</h3>

                  {/* Uma aba só e sem nome de arquivo: o painel não desenha a
                      barra de cromo e o botão flutua sobre o comando, que é a
                      mesma forma do hero. O `rotulo` é exigido pelo tipo `Aba`
                      e só apareceria com uma segunda aba — o título do exemplo
                      é o valor honesto para ele. */}
                  <PainelDeCodigo
                    className="mt-3"
                    abas={[{ rotulo: exemplo.titulo, codigo: exemplo.comando }]}
                    prompt="$"
                    rotulos={rotulosDoPainel}
                  />

                  {/* O PLACAR, quando o exemplo tem um. `saida` é opcional no
                      esquema porque nem toda invocação imprime algo curto o
                      bastante para caber na tela — e ela NÃO se traduz nos três
                      arquivos, porque é o que o programa imprime de verdade, e
                      o programa imprime em português. */}
                  {exemplo.saida ? (
                    <figure className="mt-3">
                      <pre
                        // O `lang` VAI NO `<pre>`, que é o elemento que carrega
                        // a saída, e não na `<figure>`: a legenda ao lado é
                        // `rotulos.saida`, que É traduzido — etiquetar a
                        // figura inteira mandaria o leitor de tela pronunciar
                        // "output" e "salida" com fonemas de português. Ver
                        // `IDIOMA_DO_PLACAR` no topo do arquivo.
                        lang={IDIOMA_DO_PLACAR}
                        tabIndex={0}
                        className="overflow-x-auto rounded-lg border border-code-border bg-code px-4 py-3 text-caption text-code-foreground shadow-raised focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                      >
                        <code className="block w-fit min-w-full">
                          {exemplo.saida.split("\n").map((linha, l) => (
                            // `min-h-[1lh]` porque bloco vazio tem altura zero
                            // e o intervalo entre dois trechos sumiria; `1lh` é
                            // uma linha deste mesmo elemento.
                            <span
                              key={l}
                              data-esteira={PASSO_DA_ESTEIRA.linha}
                              className="block min-h-[1lh]"
                            >
                              {linha}
                            </span>
                          ))}
                        </code>
                      </pre>
                      <figcaption className="mt-2 text-caption text-muted-foreground">
                        {t.rotulos.saida}
                      </figcaption>
                    </figure>
                  ) : null}

                  {exemplo.nota ? (
                    <p className="mt-3 text-caption text-muted-foreground">
                      {exemplo.nota}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </CoreografiaDaEsteira>
    </section>
  )
}
