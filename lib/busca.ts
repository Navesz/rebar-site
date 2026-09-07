/**
 * A BUSCA DA DOCUMENTAÇÃO: o casamento e a ORDEM — que é onde ela é boa ou ruim.
 *
 * Um `includes()` insensível a caixa resolve a maioria dos casos e falha
 * justamente nos que decidem se a pessoa volta a usar a busca:
 *
 *   · quem digita "instalacao" sem cedilha e sem til não acha "Instalação";
 *   · quem digita "instal" recebe a página de instalação em algum lugar da
 *     lista, e não em PRIMEIRO — `includes()` casa, mas não ordena;
 *   · quem digita "mdl" não acha "Módulos", porque não existe essa substring.
 *
 * As três respostas estão aqui, e são três: normalizar o texto, casar por
 * SUBSEQUÊNCIA, e pontuar. As duas primeiras são baratas; a terceira é a que
 * faz o primeiro resultado ser o certo.
 *
 * POR QUE NÃO `Intl.Collator`. Ele é a forma correta de comparar strings
 * ignorando acento (`sensitivity: "base"`), e é o que o próprio Base UI usa no
 * filtro que não estamos usando. Mas `Collator` compara e diz se um texto
 * COMEÇA COM ou CONTÉM o outro — ele não sabe achar "mdl" dentro de "modulos",
 * e não devolve nota nenhuma para ordenar. Como precisamos de subsequência e de
 * nota, a normalização é feita à mão com `normalize("NFD")`, que é built-in e
 * não custa dependência.
 */

export type ItemDeBusca = {
  href: string
  titulo: string
  /** A página/seção onde o item vive. */
  secao?: string
  /** Texto para casar e para mostrar como resumo. */
  trecho?: string
  /**
   * Texto que CASA E NÃO APARECE — hoje, o comando de cada passo, exemplo e
   * módulo.
   *
   * Os outros três campos são contrato duplo: eles são o que a busca compara E
   * o que a linha da paleta desenha. Este quebra o par de propósito, e é a
   * única forma de o índice conhecer os 14 comandos que o site manda digitar
   * sem que a linha vire uma tira de terminal — `npx github:Navesz/rebar
   * --json .` tem 32 caracteres e trunca o título e a seção juntos.
   *
   * Quem consome a lista não precisa saber que ele existe: `filtrar` pontua,
   * `paleta-de-busca.tsx` continua desenhando título + seção + trecho.
   */
  texto?: string
}

/**
 * QUANTOS RESULTADOS VOLTAM, e o número não é redondo por acaso.
 *
 * A lista da paleta trava em 24rem e cada linha ocupa ~3.25rem (título +
 * trecho + respiro), então cabem 7 na tela. 12 é pouco menos de duas telas: a
 * segunda rolagem ainda é mais barata que redigitar, a terceira não é — depois
 * dela a pessoa refina a consulta, e voltar 40 itens só custa DOM e memória
 * para uma lista que ninguém percorre até o fim.
 */
const LIMITE = 12

/**
 * PESO POR CAMPO, e é aqui que "título vale mais que trecho" deixa de ser
 * opinião e vira número. A nota de cada campo sai normalizada em [0, 1] (ver
 * `pontuar`), então multiplicar por estes pesos torna os três comparáveis: um
 * casamento PERFEITO no trecho (1 × 0.35) perde para um casamento medíocre no
 * título (0.4 × 1). É exatamente o que se quer — o trecho é contexto, o título
 * é o nome da coisa que a pessoa está procurando.
 */
const PESO_DO_TITULO = 1
const PESO_DA_SECAO = 0.55
const PESO_DO_TRECHO = 0.35

/**
 * O PESO DO CAMPO QUE NÃO APARECE, e ele é o menor da escala DE PROPÓSITO.
 *
 * `texto` carrega o comando do passo/exemplo/módulo, e comando é o campo mais
 * perigoso do índice: os 14 do site começam por "npx github:Navesz/rebar", ou
 * seja, catorze alvos praticamente idênticos com 25 caracteres de vocabulário
 * comum. Com peso de trecho (0.35) eles empatariam entre si e empurrariam
 * páginas inteiras para baixo em qualquer consulta que roçasse "rebar", "git"
 * ou "nov" — a busca passaria a responder o argumento em vez da página.
 *
 * 0.2 saiu de MEDIÇÃO, não de gosto: `filtrar()` rodado contra o índice real
 * dos três idiomas (25 itens cada) em 15 consultas, com o campo a 0.35, 0.2 e
 * 0.1.
 *
 * O GANHO é igual nos três valores, e por isso não é ele que escolhe o número.
 * Nos TRÊS idiomas: `--json` e `--rule=ci-gates` saem de ZERO resultado para o
 * exemplo certo em 1º — as duas bandeiras não existem em texto visível nenhum;
 * `rebar-security` sai de 1 para 2, ganhando o passo de instalação que roda o
 * módulo; `install-hooks` e `npm run verify` passam a achar o passo que os
 * executa (en 1→2 e 0→2; pt-br e es 0→1 e 1→3). E as consultas de navegação —
 * `usage`, `modules`, `docs`, `rebar`, `heuristics`, `installation`, `uso`,
 * `inicio` — saem IDÊNTICAS às de antes nos três idiomas: nenhuma perdeu
 * posição para um comando.
 *
 * O que separa os três valores é o extremo de cada lado, e é ele que fixa o
 * número:
 *
 *   · a 0.35 (peso de trecho) a consulta `npx` — três letras contra catorze
 *     comandos que começam por elas — expulsa a PÁGINA de instalação dos seis
 *     primeiros nos três idiomas, e o topo vira seis seções soltas. A busca
 *     passa a responder o argumento em vez da página;
 *   · a 0.1 o campo deixa de desempatar: em `novo` (medido em en), `rebar-new`
 *     — cujo comando é `... rebar novo my-site` — cai do 2º lugar para fora dos
 *     três primeiros, e volta a perder para prosa com n-o-v-o espalhado.
 *
 * A 0.2 os dois se resolvem: `npx` mantém a página em 2º e ainda promove os
 * passos com comando, e `novo` põe `rebar-new` em 2º. É o menor peso que ainda
 * desempata, abaixo do menor peso que já sequestra.
 */
const PESO_DO_TEXTO = 0.2

/**
 * A TABELA DE PONTOS. Todo o comportamento da ordenação sai daqui, e cada
 * número existe em relação aos outros — o que importa são as razões:
 *
 *   · contíguo vale 3× uma letra solta, então "insta" inteiro dentro de
 *     "Instalação" vence cinco letras espalhadas por um parágrafo;
 *   · começo de palavra vale 2× uma letra, para "guia de módulos" responder a
 *     "gdm" acima de qualquer texto que só tenha essas letras na ordem;
 *   · o prefixo vale 5× uma letra — mais que qualquer outro bônus isolado —
 *     porque casar no PRIMEIRO caractere do título é o sinal mais forte que
 *     existe de que a pessoa está digitando o nome daquela página;
 *   · a lacuna é penalizada por letra pulada, com teto: sem teto, um trecho
 *     longo afunda para menos que qualquer título, e o campo deixaria de
 *     participar da ordenação em vez de participar com peso menor.
 */
const PONTO_POR_LETRA = 4
const BONUS_CONTIGUO = 12
const BONUS_INICIO_DE_PALAVRA = 8
const BONUS_DE_PREFIXO = 20
const PENA_POR_LETRA_PULADA = 2
const LACUNA_MAXIMA_PENALIZADA = 3
const PESO_DA_COBERTURA = 10

// A faixa dos combinantes, escrita com escape e não com os caracteres em si:
// combinante solto num arquivo-fonte gruda no colchete anterior em qualquer
// editor e vira uma classe que ninguém consegue reler nem revisar.
const DIACRITICOS = /[\u0300-\u036f]/g
const ALFANUMERICO = /[a-z0-9]/

/**
 * Texto comparável: sem acento, sem caixa.
 *
 * `normalize("NFD")` separa "ã" em "a" + combinante U+0303, e o `replace`
 * varre a faixa inteira dos combinantes — o mesmo passe resolve "instalação",
 * "instalación" e "español" de uma vez, que é o motivo de o conteúdo em três
 * idiomas caber num filtro só.
 *
 * O "ñ" vira "n" DE PROPÓSITO, e isso é uma decisão, não um efeito colateral:
 * em espanhol ele é letra própria do alfabeto, mas quem digita numa busca
 * digita o que o teclado tem à mão. Tolerar a troca acha "español" para quem
 * escreve "espanol"; não tolerar não acha nada para ninguém.
 */
function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(DIACRITICOS, "").toLowerCase()
}

/**
 * Começo de palavra, para o bônus.
 *
 * Depois de `normalizar` sobra o alfabeto latino sem acento, então "não é
 * letra nem dígito ASCII" é uma fronteira honesta: espaço, hífen, barra,
 * parêntese e pontuação, que é onde as palavras deste conteúdo separam.
 * Deliberadamente SEM `\p{L}` — o escape de propriedade Unicode é ES2018 e o
 * `target` deste projeto é ES2017; a regra existiria só para um alfabeto que
 * este conteúdo não tem.
 */
function ehSeparador(letra: string): boolean {
  return !ALFANUMERICO.test(letra)
}

/**
 * O COMEÇO DA JANELA MAIS APERTADA que ainda contém a consulta, ou `null` se
 * ela não casa de jeito nenhum.
 *
 * Duas varreduras, e a segunda é a que importa. A varredura de IDA é o teste de
 * subsequência clássico: anda para frente pegando a primeira ocorrência de cada
 * letra. Ela responde "casa?" e devolve onde o casamento TERMINA — mas o começo
 * que ela encontra é quase sempre longe demais. Para a consulta "rebar" contra
 * "Rodar o rebar", a ida casa o "r" de "Rodar", o "e" de "rebar", e daí sai um
 * casamento espalhado por treze caracteres.
 *
 * A varredura de VOLTA parte daquele fim e procura cada letra de trás para
 * frente, o que devolve o começo MAIS TARDIO possível: o "rebar" contíguo. É a
 * mesma ideia do algoritmo v1 do fzf, e custa uma segunda passada linear.
 * Sem ela, o bônus de contiguidade quase nunca dispara e a ordenação vira
 * ruído — o casamento existe, mas na pior posição possível.
 *
 * Os `lastIndexOf` da volta não podem devolver -1: a ida já provou que existe
 * um casamento terminando naquele ponto, e ele é uma testemunha válida para
 * cada letra da volta.
 */
function comecoDaJanela(alvo: string, consulta: string): number | null {
  let fim = 0
  for (let k = 0; k < consulta.length; k++) {
    const achado = alvo.indexOf(consulta.charAt(k), fim)
    if (achado === -1) return null
    fim = achado + 1
  }

  let limite = fim - 1
  for (let k = consulta.length - 1; k >= 0; k--) {
    limite = alvo.lastIndexOf(consulta.charAt(k), limite) - 1
  }
  return limite + 1
}

/**
 * A NOTA DE UM CAMPO, em [0, 1], ou 0 quando não casa.
 *
 * Normalizar pelo máximo teórico é o que deixa os pesos de campo terem
 * significado: sem isso, uma consulta de dez letras produziria notas dez vezes
 * maiores que uma de uma letra, e comparar título com trecho dependeria do
 * tamanho do que a pessoa digitou.
 *
 * A COBERTURA é o desempate que ninguém lembra de escrever e todo mundo sente
 * faltando. "uso" casa em "Uso" e em "Usos avançados do rebar" exatamente do
 * mesmo jeito: no prefixo, contíguo, sem lacuna — todos os outros termos dão
 * empate. O que sobra é quanto do alvo ficou de FORA do casamento (3/3 contra
 * 3/23), e é só por isso que a página chamada "Uso" vem na frente. Medido: sem
 * este termo as duas empatam e a ordem passa a ser a de entrada.
 */
function pontuar(alvo: string, consulta: string): number {
  const comeco = comecoDaJanela(alvo, consulta)
  if (comeco === null) return 0

  let pontos = 0
  let posicao = comeco
  let anterior = -2

  for (let k = 0; k < consulta.length; k++) {
    const indice = alvo.indexOf(consulta.charAt(k), posicao)
    pontos += PONTO_POR_LETRA

    if (indice === anterior + 1) {
      pontos += BONUS_CONTIGUO
    } else {
      const lacuna = Math.min(indice - posicao, LACUNA_MAXIMA_PENALIZADA)
      pontos -= lacuna * PENA_POR_LETRA_PULADA
    }

    if (indice === 0) {
      pontos += BONUS_DE_PREFIXO
    } else if (ehSeparador(alvo.charAt(indice - 1))) {
      pontos += BONUS_INICIO_DE_PALAVRA
    }

    anterior = indice
    posicao = indice + 1
  }

  pontos +=
    (consulta.length / Math.max(alvo.length, consulta.length)) *
    PESO_DA_COBERTURA

  // O máximo é o casamento perfeito: prefixo, tudo contíguo, cobertura total.
  // A primeira letra não pode ganhar contiguidade (não há letra antes dela),
  // então são `n - 1` bônus e não `n` — errar isso deixaria o teto inalcançável
  // e comprimiria a escala inteira para baixo.
  const maximo =
    consulta.length * PONTO_POR_LETRA +
    (consulta.length - 1) * BONUS_CONTIGUO +
    BONUS_DE_PREFIXO +
    PESO_DA_COBERTURA

  // O piso 1 é a fronteira dura: casamento ruim é ruim, mas ainda é casamento,
  // e a pena de lacuna sozinha consegue levar a soma a zero ou menos. Zero é
  // reservado para "não casa", e é por ele que `filtrar` corta.
  return Math.max(pontos, 1) / maximo
}

/**
 * Os itens que casam com a consulta, do mais relevante para o menos.
 *
 * A nota do item é a do MELHOR campo, não a soma: somar faria uma página com
 * trecho longo vencer por acumular migalhas em texto que a pessoa nem vê. O que
 * responde à consulta é um campo — e é o peso dele que decide a posição.
 *
 * CONSULTA VAZIA DEVOLVE OS PRIMEIROS ITENS, e não uma lista vazia. Paleta que
 * abre em branco obriga a pessoa a adivinhar o que existe ali dentro; abrir com
 * o começo do índice ensina o vocabulário do site em vez de cobrar por ele. A
 * ordem é a que o conteúdo entregou, que é a ordem editorial das páginas.
 *
 * O `sort` é estável desde a ES2019, então notas empatadas preservam a ordem de
 * entrada — dois títulos com a mesma nota saem na ordem em que o autor os
 * escreveu, e não numa ordem que muda de navegador para navegador.
 */
export function filtrar(itens: ItemDeBusca[], consulta: string): ItemDeBusca[] {
  const alvo = normalizar(consulta).replace(/\s+/g, " ").trim()
  if (alvo === "") return itens.slice(0, LIMITE)

  const pontuados: { item: ItemDeBusca; pontos: number }[] = []

  for (const item of itens) {
    const pontos = Math.max(
      PESO_DO_TITULO * pontuar(normalizar(item.titulo), alvo),
      item.secao ? PESO_DA_SECAO * pontuar(normalizar(item.secao), alvo) : 0,
      item.trecho ? PESO_DO_TRECHO * pontuar(normalizar(item.trecho), alvo) : 0,
      // O campo invisível entra pela MESMA porta que os outros três, e não por
      // um passe especial: é `Math.max` outra vez, então um comando bem casado
      // faz o item aparecer, e nunca soma migalhas por cima de um título que já
      // casou melhor. Se um dia o conteúdo perder a `nota` de um passo, o
      // comando vira também o `trecho` visível e pontua a 0.35 pela linha de
      // cima — o que está certo: ali ele deixou de ser invisível.
      item.texto ? PESO_DO_TEXTO * pontuar(normalizar(item.texto), alvo) : 0
    )
    if (pontos > 0) pontuados.push({ item, pontos })
  }

  return pontuados
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, LIMITE)
    .map(({ item }) => item)
}
