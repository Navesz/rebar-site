"use client"

/**
 * O painel de código do site: uma barra de cromo com abas ou nome de arquivo,
 * o código embaixo, e um botão de copiar que não mente.
 *
 * TODO RÓTULO ENTRA POR PROP, e isso não é gosto: a regra
 * `conteudo-fora-do-codigo` do portão diz que texto não mora em `.tsx`, e este
 * site sai em três idiomas. Um "Copiar" escrito aqui dentro sairia em português
 * nas três versões sem quebrar build nenhum — a falha apareceria no visitante
 * espanhol, calada. O `conteudo/esquema.ts` já reserva `rotulos.copiar` e
 * `rotulos.copiado`; é de lá que eles vêm.
 *
 * NÃO COLORE SINTAXE, e é decisão, não falta. Nenhum destacador entra (`shiki`,
 * `prism`, `highlight.js`): a pilha está fechada e dependência nova precisa de
 * motivo escrito. O corpo fica monocromático; o que ganha cor são as DUAS
 * coisas que o componente sabe de fato — o `$` do prompt e o nome do arquivo.
 * Pintar palavra-chave por adivinhação de linguagem é mentir com confiança.
 *
 * O QUE VAI PARA A ÁREA DE TRANSFERÊNCIA É A PROP, NUNCA O DOM. O `$` existe só
 * na tela: `aria-hidden` para o leitor de tela e `select-none` para ficar de
 * fora até da seleção do recuo. Colar `$ npm install` num terminal é o defeito
 * clássico do bloco que renderiza o prompt como texto de verdade.
 *
 * O RECUO DE CÓPIA DO `comando.tsx` FICA INTEIRO. Sem `navigator.clipboard` —
 * ou com a permissão negada — o botão SELECIONA o código para a pessoa copiar
 * pelo teclado. Botão que some deixa sem saída, e botão que finge ter copiado é
 * pior do que os dois.
 */

import { useEffect, useRef, useState, type Ref } from "react"
import { Check, Copy, Terminal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type Aba = { rotulo: string; codigo: string }

/** Os mesmos nomes do bloco `rotulos` de `conteudo/esquema.ts`, de propósito. */
export type RotulosDoPainel = { copiar: string; copiado: string }

/** A barra de cima. O `pb` fica com quem chama: com aba ele é zero. */
const cromo =
  "flex items-center gap-2 border-b border-code-border bg-code-chrome pr-1.5 pl-3 text-code-chrome-foreground"

export function PainelDeCodigo({
  abas,
  arquivo,
  rotulos,
  prompt,
  className,
}: {
  /** Uma aba só = painel simples, sem barra de abas visível. */
  abas: Aba[]
  /** Nome do arquivo, mostrado no lugar das abas quando não há abas. */
  arquivo?: string
  /** Rótulos de interface, sempre vindos de fora — i18n. */
  rotulos: RotulosDoPainel
  /** O que aparece antes de cada linha quando o bloco é de terminal. */
  prompt?: string
  className?: string
}) {
  const [ativa, setAtiva] = useState(0)
  const [copiado, setCopiado] = useState(false)
  const codigo = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!copiado) return
    const t = setTimeout(() => setCopiado(false), 1600)
    return () => clearTimeout(t)
  }, [copiado])

  function copiar() {
    const texto = abas[ativa]?.codigo ?? ""
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(
        () => setCopiado(true),
        // Permissão negada não pode virar um "copiado" mentiroso: cai no mesmo
        // recuo de quem não tem a API.
        () => selecionar()
      )
      return
    }
    selecionar()
  }

  function selecionar() {
    const no = codigo.current
    if (!no) return
    const faixa = document.createRange()
    faixa.selectNodeContents(no)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(faixa)
  }

  // A barra de cromo só existe quando tem o que mostrar. Uma aba só e sem nome
  // de arquivo é um comando solto, e ali a barra seria uma faixa vazia ocupando
  // altura para não informar nada.
  const comAbas = abas.length > 1
  const comCromo = comAbas || Boolean(arquivo)

  const painel = cn(
    "relative overflow-hidden rounded-xl border border-code-border bg-code text-code-foreground shadow-raised",
    className
  )

  // Sem cromo o botão flutua sobre o código, como no `comando.tsx` — e aí a
  // linha tem de parar antes dele, senão o primeiro comando passa por baixo.
  const recuo = comCromo ? "pr-4" : "pr-14"

  const controle = (
    <>
      {/*
       * O NOME ACESSÍVEL DO BOTÃO NÃO MUDA. Trocar "Copiar" por "Copiado"
       * renomeia o controle debaixo do dedo de quem navega por voz: o comando
       * "clicar em Copiar" deixaria de existir por um segundo e meio, logo
       * depois de a pessoa o ter usado. O estado vai para esta região de
       * status, que é o lugar do anúncio; para quem enxerga, o ícone e a dica.
       */}
      <span role="status" aria-live="polite" className="sr-only">
        {copiado ? rotulos.copiado : ""}
      </span>
      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={copiar}
                // O `ghost` do tema pinta o hover com `muted`, que no claro é
                // quase branco e estouraria sobre o grafite. A superfície de
                // hover aqui é a própria borda do painel: um degrau acima do
                // fundo nos DOIS temas, que é o que este painel precisa por ser
                // escuro nos dois.
                className="ml-auto shrink-0 text-code-chrome-foreground hover:bg-code-border hover:text-code-tab-foreground dark:hover:bg-code-border"
              />
            }
          >
            {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
            <span className="sr-only">{rotulos.copiar}</span>
          </TooltipTrigger>
          <TooltipContent>
            {copiado ? rotulos.copiado : rotulos.copiar}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )

  // Lista vazia não rende uma caixa de grafite oca: rende nada. O tipo `Aba[]`
  // não sabe dizer "pelo menos uma", e isto vem de JSON.
  if (abas.length === 0) return null

  if (!comAbas) {
    return (
      <div className={painel}>
        {arquivo ? (
          <div className={cn(cromo, "py-1.5")}>
            {prompt ? (
              <Terminal aria-hidden className="size-3.5 shrink-0" />
            ) : null}
            <span className="truncate font-mono text-xs text-code-tab-foreground">
              {arquivo}
            </span>
            {controle}
          </div>
        ) : (
          <div className="absolute top-2 right-2 z-10">{controle}</div>
        )}
        <Corpo
          codigo={abas[0].codigo}
          prompt={prompt}
          recuo={recuo}
          refDoCodigo={codigo}
        />
      </div>
    )
  }

  return (
    <Tabs
      value={ativa}
      onValueChange={(valor) => {
        setAtiva(Number(valor))
        // Trocar de aba zera o "copiado": manter o visto de pé enquanto o botão
        // já copia outro gerenciador de pacotes é afirmar uma cópia que não
        // aconteceu.
        setCopiado(false)
      }}
      // O `Tabs` nasce com `gap-2`, e aqui a barra encosta no código: o painel é
      // uma janela só, não duas peças empilhadas.
      className={cn(painel, "gap-0")}
    >
      {/* `pb-0` para o sublinhado da aba ativa cair EM CIMA do divisor. */}
      <div className={cn(cromo, "pt-1.5 pb-0")}>
        {prompt ? <Terminal aria-hidden className="size-3.5 shrink-0" /> : null}
        <TabsList
          variant="line"
          // As abas rolam na horizontal em tela estreita em vez de espremer o
          // rótulo, e sem barra: a própria aba cortada já anuncia que há mais. No
          // código, embaixo, a decisão é a oposta — e o porquê está lá.
          className="no-scrollbar min-w-0 flex-1 justify-start overflow-x-auto rounded-none bg-transparent p-0"
        >
          {abas.map((aba, i) => (
            <TabsTrigger
              key={i}
              value={i}
              // `after:bottom-0` COM o mesmo prefixo de variante do `tabs.tsx`, e
              // não solto: lá a classe é
              // `group-data-horizontal/tabs:after:bottom-[-5px]`, que tem
              // especificidade maior e venceria calada de um `after:bottom-0`
              // cru. Com o prefixo igual, o `tailwind-merge` apaga a de lá antes
              // de a CSS ter de decidir.
              className="h-full flex-none rounded-none text-code-chrome-foreground after:bg-code-prompt group-data-horizontal/tabs:after:bottom-0 hover:text-code-tab-foreground dark:text-code-chrome-foreground dark:hover:text-code-tab-foreground data-active:text-code-tab-foreground dark:data-active:text-code-tab-foreground"
            >
              {aba.rotulo}
            </TabsTrigger>
          ))}
        </TabsList>
        {controle}
      </div>
      {abas.map((aba, i) => (
        <TabsContent
          key={i}
          value={i}
          // O painel do Base UI entra na tabulação por padrão, o que a APG só
          // manda fazer quando não há nada focável dentro. Aqui há: o `<pre>`
          // logo abaixo. Dois pousos seguidos no mesmo lugar é ruído.
          tabIndex={-1}
        >
          <Corpo
            codigo={aba.codigo}
            prompt={prompt}
            recuo={recuo}
            refDoCodigo={i === ativa ? codigo : undefined}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

function Corpo({
  codigo,
  prompt,
  recuo,
  refDoCodigo,
}: {
  codigo: string
  prompt?: string
  recuo: string
  refDoCodigo?: Ref<HTMLElement>
}) {
  // Quebrar em linhas é trabalho do prompt. Sem ele o texto entra inteiro no
  // `<pre>`, que já preserva espaço e quebra — e aí a seleção do recuo devolve
  // exatamente os bytes que a prop trouxe, sem um nó a mais no meio.
  const linhas = prompt ? codigo.split("\n") : null

  return (
    <pre
      // Região que rola e não tem nada focável dentro fica inalcançável pelo
      // teclado (WCAG 2.1.1): sem isto, um comando longo em tela estreita não
      // pode ser lido até o fim sem mouse.
      tabIndex={0}
      // A barra de rolagem FICA visível aqui, ao contrário da das abas: no
      // código ela é a única pista de que há texto além da borda direita.
      className="overflow-x-auto py-4 text-sm leading-relaxed focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
    >
      {/* `w-fit min-w-full` para o realce de linha ir até a borda mesmo quando o
          código é mais estreito que o painel, e acompanhar a linha mais longa
          quando é mais largo. */}
      <code
        ref={refDoCodigo}
        className={cn(
          "block w-fit min-w-full font-mono",
          !linhas && cn("pl-4", recuo)
        )}
      >
        {linhas
          ? linhas.map((linha, i) => {
              const temTexto = linha.trim() !== ""
              return (
                // `min-h-[1lh]` porque bloco vazio tem altura ZERO e o intervalo
                // entre dois comandos sumiria; `1lh` é uma linha deste mesmo
                // elemento, então acompanha o `leading-relaxed`.
                //
                // O realce para em 10% de alfa por medida, não por gosto: é o
                // teto anotado no `globals.css`, com o `$` em 5.57:1 no claro e
                // 6.02:1 no escuro SOBRE a linha realçada. Mais alfa e ele
                // atravessa o piso de 4.5:1.
                <span
                  key={i}
                  className={cn(
                    "block min-h-[1lh] pl-4",
                    recuo,
                    temTexto && "bg-code-line"
                  )}
                >
                  {temTexto ? (
                    <span
                      aria-hidden
                      className="pr-2 text-code-prompt select-none"
                    >
                      {prompt}
                    </span>
                  ) : null}
                  {linha}
                </span>
              )
            })
          : codigo}
      </code>
    </pre>
  )
}
