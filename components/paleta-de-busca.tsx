"use client"

/**
 * A PALETA ⌘K — o gatilho no cabeçalho e o diálogo que ele abre.
 *
 * POR QUE NÃO `shadcn add command`. No estilo `base-nova` o registro do
 * `command` declara `"dependencies": ["cn", "cmdk"]`, e `cmdk` é uma SEGUNDA
 * biblioteca de UI dentro de um projeto que já decidiu a sua. É o mesmo defeito
 * que `revelar.tsx` documenta para as libs de animação, só que em componente: a
 * paleta viria com um sistema de foco, de rolagem e de teclado próprio,
 * paralelo ao do Base UI, e a partir daí todo conserto de acessibilidade
 * precisaria ser feito duas vezes.
 *
 * O QUE ENTROU NO LUGAR, e ele já estava instalado: `@base-ui/react` 1.8 traz
 * `./autocomplete`, que é a implementação do padrão combobox da APG —
 * `role="listbox"`, `aria-activedescendant`, navegação por setas, foco que não
 * sai do campo. A composição é a que a própria documentação do Base UI publica
 * para este caso: `<Autocomplete.Root open inline>` DENTRO do `Dialog`. O
 * `inline` diz "não abra popup nenhum, a lista é renderizada aqui mesmo" — o
 * popup é o diálogo, e o `open` fixo em `true` é o que mantém a lista visível,
 * já que quem controla abertura é o `Dialog`. Nada de lista à mão: a primitiva
 * serviu, e serviu inteira.
 *
 * O FILTRO É NOSSO, e isto é deliberado. O `filter` do Base UI recebe um item e
 * devolve `true`/`false` — ele decide QUEM entra, nunca em que ORDEM. Numa
 * busca de documentação a ordem é o produto: o primeiro resultado é o que a
 * pessoa vai apertar. Por isso `lib/busca.ts` pontua e ordena, e o resultado
 * entra por `filteredItems`, que é a porta documentada para filtragem externa.
 *
 * NENHUM TEXTO VISÍVEL NASCE AQUI. Tudo que se lê vem de `rotulos`, porque o
 * site é en/pt-br/es e conteúdo não mora no código. As duas exceções são "⌘" e
 * "Ctrl", e elas não são conteúdo: são o nome gravado na tecla que a pessoa vai
 * apertar, igual nos três idiomas, e traduzi-las seria mentir sobre o teclado.
 */

import Link from "next/link"
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { Search } from "lucide-react"

import { filtrar, type ItemDeBusca } from "@/lib/busca"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

/**
 * A tecla modificadora DESTE teclado — e o motivo de ela não sair de um
 * `useEffect`.
 *
 * O site é `output: "export"`: existe UM HTML, gerado uma vez, servido igual
 * para o Mac e para o resto. Decidir entre "⌘" e "Ctrl" durante o render do
 * servidor é impossível, e decidir no primeiro render do cliente é pior — o
 * HTML hidratado teria um texto e a árvore React outro, que é erro de
 * hidratação e o React descarta a árvore inteira para reconstruir.
 *
 * A saída óbvia seria `useEffect` + `setState`, e ela está barrada neste
 * projeto: `comando.tsx` documenta a mesma tentativa sendo reprovada por
 * `react-hooks/set-state-in-effect`, com a razão certa — valor DERIVADO DO
 * AMBIENTE não é estado que muda, e escondê-lo atrás de um render extra faz o
 * conteúdo piscar na primeira pintura.
 *
 * `useSyncExternalStore` é exatamente o mecanismo que falta aí, e é built-in do
 * React: o terceiro argumento é o retrato do SERVIDOR (usado também no render
 * de hidratação, então o HTML bate) e o segundo é o do cliente, lido depois que
 * a hidratação termina. Sem effect, sem estado, sem aviso.
 *
 * O retrato do servidor é "Ctrl" e não vazio de propósito: é o valor correto
 * para todo mundo que não está no macOS, então a esmagadora maioria nunca vê
 * troca alguma — e "Ctrl" é mais largo que "⌘", de modo que a única troca que
 * existe encolhe a tecla em vez de empurrar o cabeçalho.
 */
const SEM_ASSINATURA = () => () => {}

function lerModificador(): string {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  const plataforma = nav.userAgentData?.platform ?? navigator.platform
  return /mac|iphone|ipad|ipod/i.test(plataforma) ? "⌘" : "Ctrl"
}

function useTeclaModificadora(): string {
  return useSyncExternalStore(SEM_ASSINATURA, lerModificador, () => "Ctrl")
}

/**
 * Se o foco está num campo de texto qualquer da página.
 *
 * O atalho é global — ele escuta o `document` inteiro — então precisa recuar
 * quando a pessoa está escrevendo em outro lugar. Sem isto, ⌘K no meio de um
 * `textarea` rouba o que ela estava fazendo, e no macOS ainda por cima
 * atropela o Ctrl+K nativo (apagar até o fim da linha).
 */
function ehCampoDeTexto(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false
  if (alvo.isContentEditable) return true
  return ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName)
}

export function PaletaDeBusca({
  itens,
  rotulos,
  className,
}: {
  itens: ItemDeBusca[]
  rotulos: { buscar: string; buscarVazio: string; buscarDica: string }
  className?: string
}) {
  const [aberto, setAberto] = useState(false)
  const [consulta, setConsulta] = useState("")
  const gatilho = useRef<HTMLButtonElement>(null)
  const campo = useRef<HTMLInputElement>(null)
  const modificador = useTeclaModificadora()
  const idDaDica = useId()

  const resultados = useMemo(() => filtrar(itens, consulta), [itens, consulta])

  /**
   * O ATALHO. `key` e não `code`: a pessoa aperta a tecla que TEM "k" escrito
   * nela, e em teclado não-QWERTY `KeyK` fica noutro lugar.
   *
   * Com a paleta já aberta o campo em foco é o NOSSO, então aí o atalho fecha
   * em vez de recuar — é o único caso em que digitar num campo não desliga o
   * atalho, e é por isso que `aberto` entra na dependência em vez de virar um
   * `ref`: reassinar um `keydown` a cada abertura custa nada perto de manter
   * duas fontes da mesma verdade.
   *
   * O `preventDefault` é obrigatório e não é cosmético: Ctrl+K no Firefox foca
   * a barra de busca do navegador, e ⌘K abre o buscador em vários outros.
   */
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key.toLowerCase() !== "k") return
      if (!evento.metaKey && !evento.ctrlKey) return
      if (!aberto && ehCampoDeTexto(evento.target)) return
      evento.preventDefault()
      setAberto(!aberto)
    }

    document.addEventListener("keydown", aoTeclar)
    return () => document.removeEventListener("keydown", aoTeclar)
  }, [aberto])

  return (
    <Dialog
      open={aberto}
      onOpenChange={setAberto}
      // A consulta é zerada quando a animação de saída TERMINA, e não em
      // `onOpenChange`. Zerar no clique repovoa a lista com os resultados de
      // consulta vazia durante os ~100ms do fade — a pessoa vê a lista trocar
      // de conteúdo enquanto o painel some, o que parece falha de render.
      onOpenChangeComplete={(estaAberto) => {
        if (!estaAberto) setConsulta("")
      }}
    >
      <DialogTrigger
        ref={gatilho}
        render={
          <Button
            variant="outline"
            className={cn(
              "h-9 w-full justify-start gap-2 px-2.5 font-normal text-muted-foreground",
              className
            )}
          />
        }
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className="truncate">{rotulos.buscar}</span>
        {/* `aria-hidden`: o nome acessível do botão é o rótulo ao lado, e um
            leitor de tela soletrando "⌘ K" no meio dele só atrapalha. Some no
            celular, onde não há tecla nenhuma para apertar. */}
        <KbdGroup aria-hidden className="ml-auto max-sm:hidden">
          <Kbd>{modificador}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        // O `Dialog` do Base UI já devolve o foco ao fechar, mas o padrão dele
        // é "o gatilho OU o elemento que estava focado antes" — e quem abriu
        // por ⌘K estava focado em qualquer lugar. Apontar o gatilho torna o
        // retorno o mesmo pelos dois caminhos. `initialFocus` também é
        // explícito: o padrão foca o painel (e não o campo) quando a abertura
        // veio de toque, para não subir o teclado virtual — mas aqui o teclado
        // virtual É o ponto, ninguém abre uma busca para não digitar.
        initialFocus={campo}
        finalFocus={gatilho}
        className={cn(
          "top-[12vh] flex max-h-[min(32rem,calc(100dvh-16vh))] translate-y-0 flex-col gap-0 overflow-hidden p-0 shadow-overlay sm:max-w-xl",
          // Quem pediu menos movimento recebe o painel já no lugar, sem escala
          // nem deslocamento — a mesma decisão de `revelar.tsx` e da barra de
          // progresso. O `!` existe porque a regra que ele derruba
          // (`data-open:animate-in`) é uma utilitária como esta, e depender da
          // ordem em que o Tailwind as emite seria apostar, não decidir.
          "motion-reduce:animate-none! motion-reduce:transition-none!"
        )}
      >
        {/* O diálogo precisa de nome acessível; visível ele seria redundante
            com o campo logo abaixo, que diz a mesma coisa. */}
        <DialogTitle className="sr-only">{rotulos.buscar}</DialogTitle>

        <Autocomplete.Root
          open
          inline
          items={itens}
          filteredItems={resultados}
          value={consulta}
          onValueChange={setConsulta}
          // Ao apertar um item o Base UI escreve o rótulo dele no campo; sem
          // esta função o objeto vira "[object Object]" por um quadro, antes
          // de a rota trocar.
          itemToStringValue={(item: ItemDeBusca) => item.titulo}
          // `always` porque a lista já nasce visível dentro do diálogo: sem
          // realce inicial, o primeiro Enter não faz nada e a pessoa conclui
          // que a busca não responde ao teclado. `keepHighlight` impede que
          // tirar o mouse da lista apague o realce que o teclado deixou.
          autoHighlight="always"
          keepHighlight
        >
          <Autocomplete.InputGroup className="flex items-center gap-2.5 border-b border-border px-3.5">
            <Search
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            {/*
             * O campo é o primitivo cru, e NÃO `components/ui/input.tsx`. O
             * `Input` desenha borda, altura, cantos e anel de foco próprios —
             * dentro de um painel arredondado isso vira caixa dentro de caixa,
             * e o anel de foco apareceria no campo em vez de no painel. Aqui a
             * borda que existe é a linha que separa o campo da lista.
             */}
            <Autocomplete.Input
              ref={campo}
              aria-label={rotulos.buscar}
              aria-describedby={idDaDica}
              placeholder={rotulos.buscar}
              className="h-12 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground md:text-sm"
            />
          </Autocomplete.InputGroup>

          {/*
           * A ROLAGEM É UM `div` CRU, e não `components/ui/scroll-area.tsx`.
           *
           * O defeito que isso conserta: com o `ScrollArea` ali, um Tab dentro
           * da paleta levava o foco para o `ScrollArea.Viewport` — que é
           * focável — e a partir dali ↑, ↓ e Enter paravam de funcionar, porque
           * no padrão combobox quem move o realce é o CAMPO, via
           * `aria-activedescendant`. A paleta anunciava as três teclas no rodapé
           * e desligava as três no primeiro Tab, que é o gesto natural de quem
           * abre um diálogo e quer explorá-lo.
           *
           * `tabIndex={-1}` no Viewport seria o conserto de uma linha, e ele não
           * cabe aqui: `components/ui/scroll-area.tsx` é do outro agente. Passar
           * a prop pelo ponto de chamada também não resolve — CONFERIDO LENDO O
           * ARQUIVO: o `...props` dele é espalhado no `Root`, e o `Viewport` é
           * escrito com className fixa e sem repasse nenhum. Um `tabIndex` daqui
           * pousaria no invólucro que não rola e deixaria o focável de pé.
           *
           * O CUSTO, escrito: some a barra de rolagem desenhada (trilho de 10px
           * com polegar em `--border`), e `no-scrollbar` esconde também a
           * nativa — não sobra indicação visual de que a lista continua. O que
           * paga: `LIMITE` corta em 12 resultados e o painel mostra ~7, então o
           * que fica embaixo é meia linha aparecendo na aresta, que é
           * afordância; as setas rolam sozinhas (`scroll-my-1.5` abaixo); e a
           * alternativa, a barra nativa, é um trilho grosso do sistema dentro de
           * um painel arredondado — foi ela que o `ScrollArea` existia para
           * evitar. Uma peça a menos entre o campo e a lista.
           */}
          <div
            tabIndex={-1}
            className="no-scrollbar min-h-0 flex-1 overflow-y-auto"
          >
            {/* Este elemento fica SEMPRE montado — é ele que anuncia a
                mudança para o leitor de tela, e some com `display:none` ou
                render condicional o anúncio não sai. Quem aparece e some é o
                filho. */}
            <Autocomplete.Empty>
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                {rotulos.buscarVazio}
              </p>
            </Autocomplete.Empty>

            <Autocomplete.List className="p-1.5">
              {(item: ItemDeBusca, indice: number) => (
                <Autocomplete.Item
                  key={item.href}
                  index={indice}
                  value={item}
                  // `<a>` é focável por natureza, e no padrão combobox o foco
                  // NÃO sai do campo — quem anda pela lista é o
                  // `aria-activedescendant`. Sem isto, um Tab dentro do
                  // diálogo pularia de link em link e deixaria o campo, que é
                  // onde as setas funcionam.
                  tabIndex={-1}
                  onClick={() => setAberto(false)}
                  // `scroll-my-1.5` casa com o `p-1.5` da lista: o
                  // `scrollIntoView` que acompanha as setas respeita
                  // `scroll-margin`, então o item ativo para com o mesmo
                  // respiro da borda em vez de colar nela.
                  //
                  // DUAS PISTAS PARA O ITEM QUE O ENTER ABRE, e a segunda é a
                  // que carrega o peso. `bg-accent` fica — é a superfície de
                  // hover de menu do shadcn, discreta de propósito, e é o calor
                  // da casa —, mas ela sozinha era a pista ÚNICA de posição do
                  // teclado, e sozinha ela é invisível: medido (oklch → sRGB
                  // linear → luminância → WCAG 2.x), `--accent` sobre
                  // `--popover`, que é o painel do diálogo, dá 1,15:1 no claro
                  // (#f6ece3 sobre #fdfdfe) e 1,23:1 no escuro (#392920 sobre
                  // #181d24). Apertar ↓ três vezes não movia nada visível.
                  //
                  // A pista nova é a BARRA em `--brand`, que é como o resto do
                  // site diz "você está aqui": o sublinhado do item ativo da
                  // navegação (`navegacao-do-cabecalho.tsx`), a borda esquerda
                  // da barra lateral (`barra-lateral-docs.tsx`) e o cursor do
                  // índice (`indice-da-pagina.tsx`) são todos `bg-brand`. Ela
                  // NÃO depende da superfície: o `--brand` mede 5,22:1 sobre o
                  // painel e 4,54:1 sobre o próprio `--accent` no claro; 6,41:1
                  // e 5,22:1 no escuro. O pior dos quatro é 4,54:1, contra a
                  // mínima de 3:1 para pista não textual.
                  //
                  // Barra e não `ring-inset`: anel em volta da linha é o
                  // vocabulário de FOCO, e o foco desta lista não está na linha
                  // — está no campo, e é de lá que o `aria-activedescendant`
                  // aponta. Anelar a linha diria do teclado uma coisa que não é.
                  //
                  // Pseudo-elemento e não borda: o item é `grid` de duas
                  // colunas, então um filho a mais entraria no fluxo da grade;
                  // e `border-l-2` num `rounded-md` desenha um gancho curvo nos
                  // dois cantos. `inset-y-2` casa com os 8px de `rounded-md`, de
                  // modo que a barra só existe onde a aresta já é reta.
                  className="relative grid scroll-my-1.5 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-3 py-2 outline-none select-none before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-full data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:before:bg-brand"
                  // `next/link` e não `<a>`: a troca de página é de cliente, e
                  // o Enter da lista dispara um `click()` de verdade no
                  // elemento — o mesmo que o mouse dispara —, então o
                  // roteador atende os dois caminhos sem código extra. De
                  // brinde, o meio-clique e o "abrir em nova aba" continuam
                  // funcionando, o que uma lista de `<div>` perde.
                  render={<Link href={item.href} />}
                >
                  <span className="truncate text-sm font-medium">
                    {item.titulo}
                  </span>
                  {item.secao ? (
                    <span className="shrink-0 text-xs text-brand-subtle-foreground">
                      {item.secao}
                    </span>
                  ) : null}
                  {item.trecho ? (
                    <span className="col-start-1 truncate text-xs text-muted-foreground">
                      {item.trecho}
                    </span>
                  ) : null}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-3.5 py-2">
            <p id={idDaDica} className="text-xs text-muted-foreground">
              {rotulos.buscarDica}
            </p>
            <KbdGroup aria-hidden className="max-sm:hidden">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <Kbd>↵</Kbd>
            </KbdGroup>
          </div>
        </Autocomplete.Root>
      </DialogContent>
    </Dialog>
  )
}
