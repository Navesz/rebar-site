/**
 * O ÍNDICE DA BUSCA ⌘K: o site inteiro num array, montado no BUILD.
 *
 * POR QUE NO ESCOPO DO MÓDULO. O site é `output: "export"` — não há servidor
 * para consultar em tempo de execução e não há banco. O índice é calculado
 * quando o `next build` avalia este módulo, e o que viaja para o navegador é só
 * o resultado: objetos rasos de quatro campos. Quem importa este arquivo é
 * `components/cabecalho.tsx`, que é componente de SERVIDOR — então nem os três
 * JSON de texto nem o validador de `conteudo/esquema.ts` entram no bundle do
 * cliente. É a mesma fronteira que a navegação antiga já respeitava: o servidor
 * lê o conteúdo, o cliente recebe o que vai mostrar.
 *
 * UM IDIOMA POR PÁGINA, e isso é sobre o link, não sobre bytes. Resultado em
 * inglês na paleta de quem lê em espanhol leva a pessoa para outra versão do
 * site sem ela ter pedido — a troca de idioma acontece por um clique numa busca.
 * Os três são montados aqui porque o export gera os três de qualquer maneira; o
 * que não acontece é os três viajarem juntos na mesma página.
 *
 * AS ÂNCORAS SAEM DE `lib/ancoras.ts`, que já existia quando este arquivo foi
 * escrito. Um slug próprio aqui seria a segunda função com a mesma intenção que
 * aquele arquivo documenta: ela diverge no primeiro caso de borda e o link não
 * navega para lugar nenhum, sem 404, sem erro de console, sem nada vermelho.
 *
 * O LIMITE DE HOJE, dito de frente: só `/docs` emite os `id` correspondentes —
 * `components/paginas/documentacao.tsx` escreve um `id` por seção. As páginas de
 * instalação, uso e módulos ainda não têm `id` nenhum no DOM (conferido nos
 * quatro arquivos de `components/paginas/`), então o fragmento delas leva ao
 * TOPO da página certa em vez da linha certa. O fragmento é escrito assim mesmo
 * por dois motivos: ele passa a funcionar sozinho no dia em que aquelas páginas
 * emitirem `ancorasDe(...)`, e o `href` é a IDENTIDADE do item na paleta —
 * `paleta-de-busca.tsx` usa `key={item.href}`, então dois itens com o mesmo
 * `href` colidiriam como chave de React e a lista mostraria a mesma linha duas
 * vezes.
 */

import {
  IDIOMAS,
  caminhoDe,
  textos,
  type Idioma,
  type Textos,
} from "@/conteudo/carregar"
import { ancorasDe } from "@/lib/ancoras"
import type { ItemDeBusca } from "@/lib/busca"
import { ROTAS, type ChaveDeDoc } from "@/lib/rotas"

/** O bloco `paginas` já estreitado: ele é opcional e tudo-ou-nada no esquema. */
type Paginas = NonNullable<Textos["paginas"]>

/**
 * Um pedaço de página: o título que vira âncora, o texto que casa E aparece, e
 * o `texto` que casa e NÃO aparece — o comando daquele passo/exemplo/módulo.
 */
type Trecho = { titulo: string; trecho: string; texto?: string }

/**
 * O QUE INDEXAR DENTRO DE CADA PÁGINA, e o `satisfies` é o que cobra a lista
 * inteira.
 *
 * Cada página tem uma forma diferente de filho — passo, exemplo, módulo,
 * seção —, então não há como varrer isto genericamente sem perder o campo que
 * vale a pena casar. O `Record<ChaveDeDoc, …>` fecha a única fresta que
 * importa: página nova no esquema sem entrada aqui NÃO COMPILA, e o defeito que
 * ela evitaria é o silencioso — a página existe, é publicada, e a busca não a
 * conhece. Ninguém abre um chamado dizendo "a busca não achou o que eu nem sei
 * que existe".
 *
 * O `trecho` cai para o `comando` quando não há nota: é o que a pessoa vai
 * digitar de qualquer forma ("npx", "rebar-check") e é a única linha daquele
 * passo que sempre existe.
 *
 * O `texto` É O COMANDO, SEMPRE, e ele entrou porque aquele `??` acima nunca
 * dispara: conferido nos três `conteudo/textos/*.json`, os cinco passos e os
 * cinco exemplos TÊM nota, e o `comando` dos quatro módulos nem candidato a
 * `trecho` era. Resultado medido antes desta linha: dos 14 comandos que o site
 * manda digitar, ZERO estava no índice — `--json` não devolvia resultado
 * nenhum em idioma nenhum, e os "acertos" de `npx` eram n-p-x achados
 * espalhados em prosa, que é pior que não achar nada.
 *
 * Ele é campo separado e não um `trecho` mais longo por dois motivos: `trecho`
 * é DESENHADO na linha da paleta (viraria uma tira de terminal truncada no
 * lugar do resumo) e pesa 0.35, e comando com peso de resumo sequestra o
 * ranking — os catorze começam com o mesmo "npx github:Navesz/rebar". Em
 * `lib/busca.ts` ele pontua a 0.2, que é o menor peso da escala.
 */
const DENTRO_DA_PAGINA = {
  // `docs` fica SEM `texto`, e não por esquecimento: a seção de documentação é
  // `{ titulo, corpo, itens }` no esquema — não existe campo `comando` para
  // pôr ali. Conferido nos três JSON: nenhum `corpo` nem `itens` de `/docs`
  // cita `npx` ou `npm run`, então não há comando escondido em prosa.
  docs: (p: Paginas) =>
    p.docs.secoes.map((secao) => ({
      titulo: secao.titulo,
      trecho: secao.corpo,
    })),
  instalacao: (p: Paginas) =>
    p.instalacao.passos.map((passo) => ({
      titulo: passo.titulo,
      trecho: passo.nota ?? passo.comando,
      texto: passo.comando,
    })),
  uso: (p: Paginas) =>
    p.uso.exemplos.map((exemplo) => ({
      titulo: exemplo.titulo,
      trecho: exemplo.nota ?? exemplo.comando,
      texto: exemplo.comando,
    })),
  modulos: (p: Paginas) =>
    p.modulos.itens.map((modulo) => ({
      titulo: modulo.nome,
      trecho: modulo.resumo,
      // O módulo é o caso em que o comando some por completo sem esta linha:
      // ele nunca foi candidato a `trecho`, que aqui é o resumo.
      texto: modulo.comando,
    })),
} satisfies Record<ChaveDeDoc, (paginas: Paginas) => Trecho[]>

/**
 * O índice de um idioma: as PÁGINAS primeiro, os pedaços delas depois.
 *
 * A ordem não é decorativa. `filtrar()` de `lib/busca.ts` devolve os primeiros
 * itens quando a consulta está vazia — é o que a paleta mostra no instante em
 * que abre —, e essa primeira tela é o que ensina o vocabulário do site. Com as
 * seções intercaladas, quem abre a paleta veria seis seções de `/docs` antes de
 * descobrir que existe uma página de instalação.
 */
function montar(idioma: Idioma): ItemDeBusca[] {
  const t = textos(idioma)
  const paginas = t.paginas

  const nivelDePagina: ItemDeBusca[] = []
  const nivelDeSecao: ItemDeBusca[] = []

  for (const rota of ROTAS) {
    const href = caminhoDe(idioma, rota.caminho)

    // A home não tem bloco em `paginas` — ela é `home`, com outra forma. O
    // título indexado é o RÓTULO da navegação e não `home.titulo`, que é o nome
    // do produto: numa lista de resultados "rebar" casaria com tudo e não
    // diria nada.
    if (rota.chave === "inicio") {
      nivelDePagina.push({
        href,
        titulo: t.rotulos.navegacao.inicio,
        trecho: t.home.subtitulo,
      })
      continue
    }

    // Site gerado sem documentação não tem a chave e não tem as rotas: a busca
    // fica com a home só, em vez de quebrar.
    if (!paginas) continue

    const pagina = paginas[rota.chave]
    // O TITULO INDEXADO E O ROTULO DA NAVEGACAO, e nao o titulo editorial da
    // pagina. O site chama a rota de "Usage" no cabecalho, na barra lateral, na
    // trilha e no paginador; `paginas.uso.titulo` e "How to use it". Quem digita
    // o nome que leu quatro vezes nao achava a pagina. O titulo editorial nao se
    // perde: vira a coluna da direita, que e onde ele explica.
    nivelDePagina.push({
      href,
      titulo: t.rotulos.navegacao[rota.chave],
      secao: pagina.titulo,
      trecho: pagina.resumo,
    })

    // A anotação é obrigatória, e não decorativa: com `satisfies`, cada entrada
    // de `DENTRO_DA_PAGINA` mantém o tipo INFERIDO do próprio literal, e o de
    // `docs` não tem `texto` nenhum — indexar o `Record` por uma chave variável
    // devolve a UNIÃO dos quatro, onde `filho.texto` não existe. Alargar para
    // `Trecho[]` é o que o `satisfies` já provou ser verdade para os quatro.
    const dentro: Trecho[] = DENTRO_DA_PAGINA[rota.chave](paginas)
    // `ancorasDe` e não `ancoraDe` item a item: é a versão que desempata título
    // repetido, e ela só sabe desempatar vendo a lista inteira de uma vez.
    const ancoras = ancorasDe(dentro.map((filho) => filho.titulo))

    dentro.forEach((filho, i) => {
      nivelDeSecao.push({
        href: `${href}#${ancoras[i]}`,
        titulo: filho.titulo,
        // A página vira a coluna da direita da linha na paleta: sem ela, "Uso"
        // e "O que ele não faz" chegam sem endereço nenhum.
        secao: pagina.titulo,
        trecho: filho.trecho,
        // O comando, que casa e não aparece. Coerente com o título indexado
        // logo acima ser o RÓTULO da navegação: os dois consertam o mesmo
        // defeito — a busca só conhecia o vocabulário editorial, e quem procura
        // digita o que leu no cabeçalho ou o que colou no terminal.
        texto: filho.texto,
      })
    })
  }

  return [...nivelDePagina, ...nivelDeSecao]
}

/**
 * OS TRÊS ÍNDICES, montados uma vez na carga do módulo.
 *
 * Eager e não sob demanda, pela mesma razão que `conteudo/carregar.ts` valida os
 * três idiomas sempre: o export estático gera as quinze rotas no mesmo build, e
 * memoizar caso a caso só acrescentaria um `Map` para economizar trabalho que
 * vai ser feito de qualquer jeito, três linhas adiante.
 */
const INDICE: Record<Idioma, ItemDeBusca[]> = IDIOMAS.reduce(
  (mapa, idioma) => {
    mapa[idioma] = montar(idioma)
    return mapa
  },
  {} as Record<Idioma, ItemDeBusca[]>
)

/** O que a paleta ⌘K recebe: o índice do idioma que está na tela, e só ele. */
export function indiceDeBusca(idioma: Idioma): ItemDeBusca[] {
  return INDICE[idioma]
}
