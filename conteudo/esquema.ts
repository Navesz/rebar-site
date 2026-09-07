/**
 * O contrato do conteúdo, escrito à mão em TypeScript puro.
 *
 * ZERO DEPENDÊNCIA — não é zod, e não é por gosto. A regra da casa vale para
 * tudo que o `npx` executa, e este arquivo executa dentro do `next build`.
 *
 * Ele é N2 e N0 ao mesmo tempo: a mesma declaração VALIDA em tempo de build
 * (lança e reprova o build se o JSON divergir) e PRODUZ o tipo — `Compartilhado`
 * sai de `typeof formaDoSite`, então não existe a segunda declaração que
 * envelhece separada do dado.
 *
 * O que o §12.3 do plano fechou e este arquivo é o dente: identidade do
 * negócio — telefone, endereço, nome — é CONTEÚDO VALIDADO, não variável de
 * ambiente. A prova está no PR `Navesz/Galegos#1`, que o dono estacionou de
 * propósito: mover o número para env var fazia o build passar, o deploy subir e
 * o `wa.me` nascer sem destinatário, com o cardápio parando de entregar pedido
 * EM SILÊNCIO. Aqui o campo faltando não é silêncio: é build vermelho.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O QUE FOI CONSERTADO EM 31/08 (o mesmo desastre, outra mecânica).
 *
 * O gerador entregava `identidade.whatsapp.e164 = "5500000000000"`. O padrão
 * `/^[1-9]\d{9,14}$/` casa, o `next build` saía 0, e o HTML publicado carregava
 * `https://wa.me/5500000000000` em DUAS posições — botão e rodapé. Link que
 * sobe, parece certo e não entrega pedido nenhum: exatamente o `Galegos#1`,
 * cometido pelo próprio gerador. A causa não é regex frouxo; é o PLACEHOLDER
 * SER PLAUSÍVEL. Vazio, o esquema pegava. Plausível, ele aprovava.
 *
 * A DISCIPLINA, que vale para todo campo daqui em diante: placeholder é INERTE
 * E BARULHENTO, nunca plausível e silencioso.
 *   · INERTE     — impossível de confundir com valor real (`TROQUE-PELO-…`),
 *                  e impossível de virar link, e-mail ou endereço por acidente.
 *   · BARULHENTO — REPROVA o build até ser trocado, porque site com telefone
 *                  errado não deveria publicar. Um build vermelho custa cinco
 *                  minutos; um `wa.me` morto custa os pedidos de meses.
 *
 * Duas camadas, de propósito, e a segunda existe porque a primeira não pega
 * digitação à mão:
 *   1. `conferirSentinelas` varre o JSON INTEIRO ANTES da validação campo a
 *      campo e lança UMA mensagem com TODOS os placeholders restantes. Sem
 *      isso o dono conserta um campo, roda o build, descobre o próximo, e paga
 *      nove ciclos de build para preencher nove campos (medido: 9 campos ainda
 *      com sentinela no projeto recém-gerado).
 *   2. Os validadores recusam também o valor PLAUSÍVEL-PORÉM-MORTO que o dono
 *      pode digitar de volta: `5500000000000`, `(00) 00000-0000`,
 *      `contato@exemplo.com.br`, `https://exemplo.com.br`, CEP `00000-000`, UF
 *      que não existe. Mate a camada 1 e a 2 ainda reprova; mate a 2 e a 1
 *      ainda reprova o que sai do gerador.
 * ─────────────────────────────────────────────────────────────────────────
 * O QUE FOI CONSERTADO EM 02/09: A EXIGÊNCIA SEGUE O USO.
 *
 * A §12.3 decidiu ONDE o telefone mora — dentro do projeto, versionado e
 * validado, em vez de numa variável de ambiente que o deploy esquece. Este
 * arquivo tinha lido aquilo como OUTRA COISA: que todo site TEM de ter
 * telefone, e-mail e endereço completo. Eram nove campos obrigatórios de
 * identidade, cinco deles só de endereço, cobrados de qualquer site que o
 * gerador produzisse. "Se você tem telefone, ele mora aqui e é validado" não é
 * "você tem de ter telefone": um site pode ter só e-mail, pode não ter endereço
 * físico, pode ser a landing de uma ferramenta.
 *
 * A REGRA AGORA, e ela é mais simples que a anterior:
 *
 *   · OBRIGATÓRIO é o que TODA página renderiza sem perguntar — nome, título,
 *     descrição, urlBase. Sem eles não há `<title>` nem `og:image`, e o
 *     `og:image` é a razão de este preset existir. Nenhum deles é fato que o
 *     negócio possa não ter, e o gerador preenche todos sozinho.
 *   · CONDICIONAL é o contato: `whatsapp`, `email`, `endereco`. A DECLARAÇÃO É
 *     A PRESENÇA DA CHAVE no JSON. Chave presente ⇒ o bloco inteiro é exigido e
 *     validado. Chave ausente ⇒ o campo vale `null` e ninguém cobra nada.
 *
 * POR QUE A PRESENÇA, e não uma lista `home.blocos: [...]` dizendo o que a home
 * renderiza: lista é uma SEGUNDA fonte da mesma verdade, e duas fontes da mesma
 * verdade divergem. Esse é o defeito do Galegos em outra roupa — o
 * `src/lib/whatsapp.ts` tinha o mesmo número em dois formatos, mantidos à mão,
 * divergindo. Com a presença como declaração existe UMA fonte.
 *
 * E o desastre do Galegos — botão na tela, campo vazio — deixa de ser questão
 * de validação e vira ERRO DE TIPO: o campo opcional é `T | null`, e
 * `linkWhatsapp` recebe o bloco, não o site. Renderizar o botão sem estreitar o
 * `null` NÃO COMPILA. O `next build` reprova antes de qualquer HTML sair.
 *
 * O CASO INVERSO — campo preenchido e nunca renderizado, que é o mais fácil de
 * esquecer — é fechado do lado do molde, em `components/rodape.tsx`: o mapa
 * `CONTATOS` é TOTAL sobre as chaves opcionais de `identidade`, cobrado por
 * `satisfies`. Apagar o botão e deixar o número no JSON não compila;
 * acrescentar um bloco ao esquema sem renderizador no rodapé não compila. As
 * duas direções são o mesmo dente, e quem o crava é o compilador — sem regra
 * nova e sem heurística.
 * ─────────────────────────────────────────────────────────────────────────
 * O QUE MUDOU AGORA: DOIS CONTRATOS, PORQUE SÃO TRÊS IDIOMAS.
 *
 * O arquivo único misturava duas coisas que passaram a ter ciclos de vida
 * diferentes no dia em que o site virou trilíngue:
 *
 *   · o que é IGUAL nos três idiomas — o nome do negócio, o telefone, o
 *     endereço, o domínio, as cores, a imagem de compartilhamento. Copiar isso
 *     três vezes seria fabricar a segunda e a terceira fonte da mesma verdade,
 *     que é o defeito do Galegos multiplicado por três: o telefone corrigido em
 *     `pt-br.json` e esquecido em `en.json` publica dois números, e nenhum dos
 *     dois lados avisa.
 *   · o que MUDA por idioma — todo texto que alguém lê. Aqui a duplicação não é
 *     defeito, é o próprio trabalho.
 *
 * Daí `esquemaSite` (um arquivo, `conteudo/site.json`) e `esquemaTextos` (um
 * arquivo por idioma, `conteudo/textos/<idioma>.json`). O MESMO `esquemaTextos`
 * roda nos três, e é isso que faz idioma com campo faltando REPROVAR O BUILD em
 * vez de publicar uma página com um buraco — que é o silêncio do §12.3 na forma
 * de tradução esquecida.
 *
 * `rotulos` é o bloco que paga a dívida da regra `conteudo-fora-do-codigo` no
 * último lugar em que ela ainda estava aberta: o literal de INTERFACE. "Pular
 * para o conteúdo", "Nesta página", "saída" moravam em `.tsx`, e nesse lugar
 * eles são intraduzíveis — o site sairia em três idiomas com a moldura em um só.
 * ─────────────────────────────────────────────────────────────────────────
 */

export class ErroDeConteudo extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = "ErroDeConteudo"
  }
}

// ── de qual arquivo veio o caminho ────────────────────────────────────────

/**
 * A RAIZ DO CAMINHO É O ARQUIVO, e ela existe porque agora há quatro arquivos
 * de conteúdo em vez de um.
 *
 * Toda mensagem de erro deste módulo diz QUAL arquivo abrir. Com um arquivo só,
 * o nome podia ser literal; com quatro, um literal seria mandar o dono corrigir
 * `site.json` quando o campo que falta está em `textos/es.json` — e ele
 * corrigiria o arquivo errado, veria o mesmo erro, e concluiria que a validação
 * está quebrada.
 */
const ARQUIVO_DA_RAIZ: Record<string, string> = { site: "conteudo/site.json" }

const raizDe = (caminho: string): string => caminho.split(".")[0]

function arquivoDe(caminho: string): string {
  const raiz = raizDe(caminho)
  return ARQUIVO_DA_RAIZ[raiz] ?? `conteudo/textos/${raiz}.json`
}

/** O caminho SEM a raiz: é assim que o dono vê o campo dentro do arquivo. */
const semRaiz = (caminho: string): string => caminho.replace(/^[^.[]*\.?/, "")

// ── sentinelas ────────────────────────────────────────────────────────────

/**
 * O que marca um campo como NÃO PREENCHIDO.
 *
 * `TROQUE-` em caixa alta, seguido de mais caixa alta e hífen. O hífen é o que
 * torna o token seguro: prosa brasileira de verdade escreve "Troque seu carro"
 * ou "TROQUE SEU CARRO", com ESPAÇO — e nenhuma das duas casa. Casar por espaço
 * reprovaria a home legítima de uma concessionária, que é o oposto do que esta
 * regra existe para fazer.
 */
export const SENTINELA = /\bTROQUE-[A-Z-]{3,}/

/**
 * A frase que acompanha todo campo de bloco OPCIONAL, e ela é metade da
 * instrução: sem ela o dono que não tem WhatsApp fica preso, porque a mensagem
 * só sabe mandar preencher. "Não tenho" se escreve APAGANDO a chave, nunca
 * deixando em branco — string vazia é indistinguível de campo que alguém tentou
 * preencher e desistiu, e é justamente esse o silêncio que o §12.3 persegue.
 */
const OU_APAGUE = (bloco: string) =>
  `Se o negócio não tem, APAGUE a chave "${bloco}" inteira do arquivo — o molde deixa de renderizar o bloco e ninguém cobra nada. Vazio não é "não tenho".`

/**
 * O que escrever em cada campo. Fica aqui, e não só no `.pages.yml`, porque
 * esta é a mensagem de ERRO que o dono lê às 23h com o build vermelho — o
 * `.pages.yml` é documentação, este mapa é o que aparece na hora do aperto.
 *
 * A chave é o caminho SEM a raiz, e por isso o mesmo mapa serve aos dois
 * contratos: `identidade.*` e `meta.*` só existem em `site.json`, `titulo` e
 * `home.*` só existem nos arquivos de texto. Não há colisão a desfazer.
 *
 * Campo de bloco condicional leva o `OU_APAGUE` junto: a mensagem que só sabe
 * mandar preencher é a que faz quem não tem o campo inventar um valor.
 */
const COMO_PREENCHER: Record<string, string> = {
  "identidade.nome":
    'O nome do negócio como o cliente o chama. Ex.: "Padaria do Zé".',
  "identidade.whatsapp.e164": `Só dígitos, com DDI e DDD, do jeito que o wa.me aceita — sem +, sem espaço, sem parêntese. O molde é 55DD9NNNNNNNN — DDI, DDD e o número, colados. ${OU_APAGUE("identidade.whatsapp")}`,
  "identidade.whatsapp.exibicao": `O MESMO número de cima, formatado para o visitante ler, no molde (DD) 9NNNN-NNNN. ${OU_APAGUE("identidade.whatsapp")}`,
  "identidade.whatsapp.chamadaAcao":
    'O texto do botão que abre a conversa. Ex.: "Falar no WhatsApp".',
  "identidade.whatsapp.mensagem":
    "A frase que já vai escrita na conversa quando o visitante toca o botão.",
  "identidade.email": `O e-mail que alguém abre e responde. Ex.: "contato@padariadoze.com.br". ${OU_APAGUE("identidade.email")}`,
  "identidade.endereco.logradouro": `Rua e número. Ex.: "Rua das Palmeiras, 512". ${OU_APAGUE("identidade.endereco")}`,
  "identidade.endereco.bairro": `O bairro. Ex.: "Vila Mariana". ${OU_APAGUE("identidade.endereco")}`,
  "identidade.endereco.cidade": `A cidade. Ex.: "São Paulo". ${OU_APAGUE("identidade.endereco")}`,
  "identidade.endereco.uf": `A sigla do estado, duas maiúsculas. Ex.: "SP". ${OU_APAGUE("identidade.endereco")}`,
  "identidade.endereco.cep": `O CEP com hífen. Ex.: "04101-300". ${OU_APAGUE("identidade.endereco")}`,
  "meta.urlBase":
    'O endereço onde o site vai ficar, com https:// e SEM barra no fim. Ex.: "https://padariadoze.com.br".',
  // A chave é "og.alt" e não "meta.og.alt" desde 06/09: o alt mudou de arquivo,
  // e a chave deste mapa é o caminho DENTRO do arquivo. Deixá-la como estava
  // mandaria o dono procurar `meta.og.alt` num `textos/es.json` que não tem
  // `meta` nenhum.
  "og.alt":
    "Descrição da imagem de compartilhamento, NO IDIOMA DESTE ARQUIVO — é o que o leitor de tela lê quando o link é compartilhado.",
  tagDeIdioma:
    'A tag BCP 47 deste arquivo, no molde xx-XX. Ex.: "pt-BR", "en-US", "es-ES".',
  nomeDoIdioma:
    'O nome do idioma ESCRITO NO PRÓPRIO IDIOMA — é o que o visitante lê no seletor. Ex.: "Português (Brasil)", "English", "Español".',
  titulo: 'O título da aba e do resultado no Google. Ex.: "Padaria do Zé".',
  gabaritoDeTitulo:
    'O molde do título das páginas filhas, com %s onde entra o nome da página. Ex.: "%s · Padaria do Zé".',
  descricao:
    "De 50 a 160 caracteres dizendo o que o negócio faz. É este texto que aparece no Google e no preview do link no WhatsApp.",
  nomeCurto:
    'Até 12 caracteres — é o nome que fica embaixo do ícone do app instalado. Ex.: "Padaria".',
  "home.titulo":
    "O título grande da primeira tela. Costuma ser o nome do negócio.",
}

/** Todo texto do JSON, com o caminho até ele, para a varredura de sentinela. */
function caminharTextos(
  valor: unknown,
  caminho: string,
  saida: Array<[string, string]>
): void {
  if (typeof valor === "string") {
    saida.push([caminho, valor])
    return
  }
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => caminharTextos(item, `${caminho}[${i}]`, saida))
    return
  }
  if (typeof valor === "object" && valor !== null) {
    for (const [chave, item] of Object.entries(valor)) {
      caminharTextos(item, caminho ? `${caminho}.${chave}` : chave, saida)
    }
  }
}

export type Pendencia = { caminho: string; valor: string; instrucao: string }

/** Os campos que ainda estão com placeholder, na ordem em que aparecem no JSON. */
export function acharSentinelas(bruto: unknown): Pendencia[] {
  const textos: Array<[string, string]> = []
  caminharTextos(bruto, "", textos)
  return textos
    .filter(([, valor]) => SENTINELA.test(valor))
    .map(([caminho, valor]) => ({
      caminho,
      valor,
      instrucao: COMO_PREENCHER[caminho] ?? "Escreva o valor real deste campo.",
    }))
}

const PORQUE_REPROVA =
  'POR QUE O BUILD PARA AQUI EM VEZ DE PUBLICAR: um placeholder plausível — "5500000000000",\n' +
  '"contato@exemplo.com.br" — sobe, parece certo e não entrega pedido nenhum. É o mesmo defeito\n' +
  "do PR Navesz/Galegos#1 (§12.3), estacionado justamente porque o link subia sem destinatário e\n" +
  "o cardápio parava de entregar EM SILÊNCIO. Placeholder aqui é inerte e barulhento: impossível\n" +
  "de confundir com valor real, e reprova até ser trocado."

/** Uma mensagem com TODOS os campos por preencher, para caber num build só. */
function conferirSentinelas(bruto: unknown, arquivo: string): void {
  const pendentes = acharSentinelas(bruto)
  if (!pendentes.length) return
  const lista = pendentes
    .map(
      (p) =>
        `  ${p.caminho} = ${JSON.stringify(p.valor)}\n      → ${p.instrucao}`
    )
    .join("\n")
  throw new ErroDeConteudo(
    `${arquivo} ainda tem ${pendentes.length} campo(s) com PLACEHOLDER. ` +
      `Troque, em ${arquivo}:\n\n${lista}\n\n${PORQUE_REPROVA}\n`
  )
}

/**
 * A recusa campo a campo, para quando a sentinela é digitada de volta à mão ou
 * a varredura de cima é removida. Roda ANTES da checagem de tamanho: sem isso
 * `uf: "TROQUE-PELA-UF"` morreria com "no máximo 2 caracteres", que manda o
 * dono ENCURTAR o placeholder em vez de trocá-lo.
 */
function recusarSentinela(limpo: string, caminho: string): void {
  if (!SENTINELA.test(limpo)) return
  const curto = semRaiz(caminho)
  throw new ErroDeConteudo(
    `${arquivoDe(caminho)} em "${curto}": ainda está com o placeholder ${JSON.stringify(limpo)}. ` +
      `${COMO_PREENCHER[curto] ?? "Escreva o valor real deste campo."} ` +
      "O build reprova de propósito — placeholder que publica é pedido perdido em silêncio (§12.3)."
  )
}

// ── primitivos ────────────────────────────────────────────────────────────

/** Descrição curta do que VEIO, para a mensagem dizer o que consertar. */
function descrever(valor: unknown): string {
  if (valor === undefined) return "nada (campo ausente)"
  if (valor === null) return "null"
  if (typeof valor === "string") {
    return valor.length <= 60
      ? JSON.stringify(valor)
      : `texto de ${valor.length} caracteres`
  }
  if (Array.isArray(valor)) return `lista de ${valor.length} item(ns)`
  if (typeof valor === "object")
    return `objeto com ${Object.keys(valor).length} campo(s)`
  return JSON.stringify(valor)
}

/**
 * O caminho do campo entra na mensagem SEMPRE. Sem ele, "esperava texto, veio
 * nada" manda o dono procurar em 60 linhas de JSON qual dos campos sumiu.
 */
function falhar(caminho: string, esperado: string, recebido: unknown): never {
  throw new ErroDeConteudo(
    `${arquivoDe(caminho)} inválido em "${semRaiz(caminho)}": esperava ${esperado}, veio ${descrever(recebido)}.`
  )
}

/** Recusa que não é de FORMATO e sim de VALOR MORTO: diz o porquê, não só o quê. */
function falharMorto(caminho: string, recebido: string, porque: string): never {
  throw new ErroDeConteudo(
    `${arquivoDe(caminho)} em "${semRaiz(caminho)}": ${JSON.stringify(recebido)} ${porque}`
  )
}

export type Validador<T> = (valor: unknown, caminho: string) => T
type Inferir<V> = V extends Validador<infer T> ? T : never

export const texto =
  (min = 1, max = 300): Validador<string> =>
  (valor, caminho) => {
    if (typeof valor !== "string") falhar(caminho, "texto", valor)
    const limpo = valor.trim()
    recusarSentinela(limpo, caminho)
    if (limpo.length < min)
      falhar(caminho, `texto com ao menos ${min} caractere(s)`, valor)
    if (limpo.length > max)
      falhar(caminho, `texto com no máximo ${max} caracteres`, valor)
    return limpo
  }

export const inteiro =
  (min: number, max: number): Validador<number> =>
  (valor, caminho) => {
    if (typeof valor !== "number" || !Number.isInteger(valor))
      falhar(caminho, "número inteiro", valor)
    if (valor < min || valor > max)
      falhar(caminho, `inteiro entre ${min} e ${max}`, valor)
    return valor
  }

export const padrao =
  (re: RegExp, formato: string, max = 300): Validador<string> =>
  (valor, caminho) => {
    const limpo = texto(1, max)(valor, caminho)
    if (!re.test(limpo)) falhar(caminho, `texto no formato ${formato}`, valor)
    return limpo
  }

export const objeto =
  <F extends Record<string, Validador<unknown>>>(
    campos: F
  ): Validador<{ [K in keyof F]: Inferir<F[K]> }> =>
  (valor, caminho) => {
    if (typeof valor !== "object" || valor === null || Array.isArray(valor)) {
      falhar(caminho, "objeto", valor)
    }
    const bruto = valor as Record<string, unknown>
    const saida: Record<string, unknown> = {}
    for (const chave of Object.keys(campos)) {
      saida[chave] = campos[chave](
        bruto[chave],
        caminho ? `${caminho}.${chave}` : chave
      )
    }
    // Campo desconhecido REPROVA, e essa é a escolha cara de propósito. Campo a
    // mais é quase sempre campo renomeado no esquema e esquecido no JSON — ou o
    // contrário. Tolerar a sobra é deixar o dono editar um campo que ninguém lê,
    // que é a falha silenciosa que o §12.3 existe para não repetir.
    const sobra = Object.keys(bruto).filter((chave) => !(chave in campos))
    if (sobra.length) {
      throw new ErroDeConteudo(
        `${arquivoDe(caminho)} inválido em "${semRaiz(caminho) || "(raiz)"}": campo(s) que o esquema não conhece — ${sobra
          .map((chave) => JSON.stringify(chave))
          .join(", ")}. Conhecidos: ${Object.keys(campos).join(", ")}.`
      )
    }
    return saida as { [K in keyof F]: Inferir<F[K]> }
  }

export const lista =
  <T>(item: Validador<T>, min = 1, max = 24): Validador<T[]> =>
  (valor, caminho) => {
    if (!Array.isArray(valor)) falhar(caminho, "lista", valor)
    if (valor.length < min || valor.length > max) {
      falhar(caminho, `lista com ${min} a ${max} item(ns)`, valor)
    }
    return valor.map((item_, i) => item(item_, `${caminho}[${i}]`))
  }

/**
 * A EXIGÊNCIA CONDICIONAL, e ela cabe num combinador porque a decisão é uma só:
 * **a presença da chave no JSON é a declaração de que a página usa aquilo.**
 *
 * Chave ausente (ou `null`) ⇒ o valor é `null`, ninguém cobra nada, e o tipo
 * que sai é `T | null` — é esse `| null` que faz o molde ter de estreitar antes
 * de renderizar, e é por isso que "botão na tela e campo vazio" não compila.
 *
 * Chave presente ⇒ `dentro` roda INTEIRO. Para um bloco, isso significa que os
 * campos dele viram obrigatórios JUNTOS: meio endereço — rua e cidade, sem CEP
 * — é pior que nenhum, porque o visitante lê um endereço que não leva a lugar
 * nenhum e ninguém do lado do dono fica sabendo.
 *
 * TRÊS RECUSAS QUE PARECEM UMA SÓ E NÃO SÃO:
 *
 *   · `"identidade.email": ""`  — string vazia
 *   · `"identidade.endereco": {}` — bloco sem campo nenhum
 *   · `"identidade.endereco": { "cidade": "São Paulo" }` — bloco pela metade
 *
 * As duas primeiras são a MESMA intenção mal escrita — "eu não tenho isto" — e
 * merecem a mensagem que ensina a escrever "não tenho": apague a chave. Sem
 * essa interceptação a mensagem sairia do validador de dentro ("esperava texto
 * com ao menos 1 caractere"), que manda o dono INVENTAR um valor, que é como o
 * `contato@exemplo.com.br` nasce. A terceira é outra coisa — alguém começou e
 * parou — e leva a frase do bloco incompleto anexada ao erro de dentro, que já
 * diz qual campo falta.
 */
const ehObjetoSimples = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)

function falharVazio(caminho: string, oque: string): never {
  const curto = semRaiz(caminho)
  throw new ErroDeConteudo(
    `${arquivoDe(caminho)} em "${curto}": ${oque} vazio não é "não tenho". ` +
      `${COMO_PREENCHER[curto] ?? ""} ` +
      `Este bloco é OPCIONAL: ou ele tem valor de verdade, ou a chave "${curto}" sai do arquivo. ` +
      "Deixar vazio é a terceira opção que não existe — ela publica um contato em branco, que é " +
      "o mesmo silêncio do §12.3 com outra cara."
  )
}

export const opcional =
  <T>(dentro: Validador<T>): Validador<T | null> =>
  (valor, caminho) => {
    if (valor === undefined || valor === null) return null
    if (typeof valor === "string" && valor.trim() === "")
      falharVazio(caminho, "campo")
    if (ehObjetoSimples(valor) && Object.keys(valor).length === 0)
      falharVazio(caminho, "bloco")
    try {
      return dentro(valor, caminho)
    } catch (erro) {
      if (!(erro instanceof ErroDeConteudo)) throw erro
      const curto = semRaiz(caminho)
      throw new ErroDeConteudo(
        `${erro.message}\n\n` +
          `"${curto}" é um bloco OPCIONAL e ele está PELA METADE. Ou complete o campo acima, ` +
          `ou apague a chave "${curto}" inteira — o molde deixa de renderizar o bloco e ninguém ` +
          "cobra nada. Meio bloco é pior que nenhum: a página mostra um contato que não leva a " +
          "lugar nenhum, e do lado do dono não chega erro nenhum."
      )
    }
  }

// ── o que é plausível e mesmo assim está morto ────────────────────────────

/**
 * Seis zeros seguidos. `5500000000000` traz onze; `(00) 00000-0000` traz nove.
 * Nenhum plano de numeração entrega assinante com essa corrida — o corte em
 * seis dá folga para o número real mais zerado que existe e ainda mata todo
 * placeholder de teclado.
 */
const ZEROS_DEMAIS = /0{6,}/

/** `1111111111`, `0000000000`: passa em qualquer regex de formato e não existe. */
const UM_DIGITO_SO = /^(\d)\1+$/

/**
 * Host que existe para ser exemplo, e por isso nunca é destino.
 *
 * `exemplo.com.br` é o pior deles: está REGISTRADO, resolve, e o e-mail mandado
 * para lá some sem bounce — a mesma falha silenciosa do telefone, só que na
 * caixa de entrada. `.invalid`, `.test`, `.example` e `.localhost` são
 * reservados pela RFC 2606 e não resolvem nunca; recusá-los aqui é o que
 * transforma o padrão inerte do gerador (`<nome>.exemplo.invalid`) de barulho
 * em dente — o aviso do gerador pedia para trocar, agora o build cobra.
 */
function hostDeMentira(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, "")

  // POR RÓTULO, NÃO POR PREFIXO. A versão anterior ancorava no INÍCIO do host,
  // e a auditoria de 31/08 derrubou a defesa inteira com um subdomínio:
  //
  //   recusava  https://exemplo.com.br        · contato@exemplo.com.br
  //   PASSAVA   https://www.exemplo.com.br    · contato@mail.exemplo.com.br
  //   PASSAVA   https://seu-dominio.com.br    · seu@email.com
  //
  // Um `www.` na frente é o que qualquer pessoa escreve primeiro, então a
  // defesa caía no caso mais comum. Agora o rótulo proibido conta em QUALQUER
  // posição: `www.exemplo.com.br` tem "exemplo" entre os rótulos e é recusado.
  const PROIBIDOS = new Set([
    "exemplo",
    "example",
    "exemple",
    "ejemplo",
    "dominio",
    "domain",
    "seudominio",
    "meudominio",
    "seu-dominio",
    "meu-dominio",
    "seusite",
    "meusite",
    "seu-site",
    "meu-site",
    "email",
    "e-mail",
    "seuemail",
    "seu-email",
    "empresa",
    "suaempresa",
    "sua-empresa",
    "teste",
    "test",
    "exemplo1",
    "localhost",
  ])
  if (h.split(".").some((rotulo) => PROIBIDOS.has(rotulo))) return true

  // Reservados pela RFC 2606: não resolvem nunca, em nenhum registrador.
  if (/\.(invalid|test|example|localhost)$/.test(h)) return true

  return false
}

// ── validadores de formato ────────────────────────────────────────────────

/**
 * URL de origem, SEM barra no fim, e COM caminho quando houver.
 *
 * O caminho passou a ser aceito em 02/09, ao gerar a landing do próprio rebar.
 * O motivo é o GitHub Pages DE PROJETO: ele publica em
 * `https://dono.github.io/repositorio`, e o preset manda ligar o Pages no
 * último passo do gerador. Recusando o caminho, as duas saídas eram escrever
 * `https://dono.github.io` — e aí o `og:image` aponta para a raiz do usuário,
 * dá 404 e o preview do link vem VAZIO, sem erro nenhum de nenhum lado — ou não
 * publicar. É o §12.3 na forma de URL, e a recusa estava do lado errado.
 *
 * Quem lê este caminho de volta é o `basePath` do `next.config.ts`: uma fonte
 * só para onde o site mora, sem segunda fonte para divergir.
 *
 * A barra no fim continua cobrada porque `robots.ts` e
 * `sitemap.ts` concatenam `${urlBase}/sitemap.xml`; com a barra sobrando o
 * arquivo sai anunciado como `https://dominio.com.br//sitemap.xml`, que é 404
 * e ninguém percebe — o build passa e o Search Console é que reclama, semanas
 * depois.
 */
export const urlBase: Validador<string> = (valor, caminho) => {
  const limpo = padrao(
    /^https:\/\/[^\s/?#]+(?:\/[^\s?#]*[^\s/?#])?$/,
    "https://dominio.com.br, ou https://dono.github.io/projeto (sem barra no fim)",
    200
  )(valor, caminho)
  if (hostDeMentira(limpo.slice("https://".length).split("/")[0])) {
    falharMorto(
      caminho,
      limpo,
      "é domínio de exemplo, não o endereço do site. Ele vira o og:url, o sitemap e o robots.txt: " +
        "publicado assim, o cartão de compartilhamento aponta para um lugar que não existe e ninguém " +
        "percebe. Escreva o domínio de verdade (ex.: https://padariadoze.com.br), ou gere o projeto de " +
        "novo passando o domínio como segundo argumento."
    )
  }
  return limpo
}

/** Caminho servido de `public/`. Absoluto, porque vira URL absoluta no og. */
export const caminhoPublico = padrao(/^\/[^\s?#]*$/, "/arquivo.ext", 200)

/**
 * URL de uma PÁGINA, e a diferença para `urlBase` é o caminho.
 *
 * `urlBase` recusa a barra de propósito, porque `robots.ts` e `sitemap.ts`
 * concatenam `${urlBase}/sitemap.xml` nela. Aqui a barra é o normal e recusá-la
 * quebraria o caso: `github.com/Navesz/rebar` é dono + repositório, e o mesmo
 * link sem o caminho é a home do GitHub — um link que abre, parece certo e leva
 * a lugar nenhum, que é o desastre do §12.3 na forma de URL.
 *
 * Barra no FIM continua recusada, pelo mesmo motivo de sempre: o mesmo destino
 * escrito de duas formas é a segunda fonte que diverge.
 */
export const urlDePagina: Validador<string> = (valor, caminho) => {
  const limpo = padrao(
    /^https:\/\/[^\s/?#]+(?:\/[^\s?#]*[^\s/?#])?$/,
    "https://host/caminho (sem barra no fim)",
    300
  )(valor, caminho)
  const host = limpo.slice("https://".length).split("/")[0]
  if (hostDeMentira(host)) {
    falharMorto(
      caminho,
      limpo,
      "é host de exemplo, não o endereço do repositório. Escreva o link que abre de verdade " +
        "(ex.: https://github.com/dono/projeto)."
    )
  }
  return limpo
}

export const corHex = padrao(/^#[0-9a-fA-F]{6}$/, "#rrggbb", 7)

/**
 * Só dígitos, com DDI. É o que o `wa.me` aceita — ele rejeita pontuação.
 *
 * E não basta casar o formato: `5500000000000` casava, e era o defeito. O
 * `wa.me` com número que não existe NÃO dá erro visível do lado de cá — abre o
 * WhatsApp, diz ao cliente que o número é inválido, e o cliente vai embora. Do
 * lado do dono não chega nada, nem um log. Por isso a recusa é aqui, no build.
 */
export const telefoneE164: Validador<string> = (valor, caminho) => {
  const limpo = padrao(
    /^[1-9]\d{9,14}$/,
    "só dígitos, com DDI (ex.: 55 + DDD + número)",
    15
  )(valor, caminho)
  if (ZEROS_DEMAIS.test(limpo) || UM_DIGITO_SO.test(limpo)) {
    falharMorto(
      caminho,
      limpo,
      "casa o formato e não é telefone de ninguém. O wa.me com número inexistente abre e morre do " +
        "lado do cliente, sem erro nenhum do lado do dono — o site fica no ar entregando zero pedido. " +
        "Escreva o número real, só dígitos, no molde 55DD9NNNNNNNN."
    )
  }
  return limpo
}

/**
 * O número como o visitante LÊ. Separado do `e164` de propósito — o Galegos
 * tinha o mesmo número em dois formatos dentro de `src/lib/whatsapp.ts` e a
 * causa era não existir campo para cada uso. Tendo dois campos, aparece o risco
 * novo: os dois divergirem. Quem cobra a igualdade é `conferirCoerencia`.
 */
export const telefoneExibicao: Validador<string> = (valor, caminho) => {
  const limpo = texto(8, 30)(valor, caminho)
  const digitos = limpo.replace(/\D/g, "")
  if (digitos.length < 10 || digitos.length > 11) {
    falhar(
      caminho,
      "telefone com DDD, como o visitante lê, no molde (DD) 9NNNN-NNNN",
      valor
    )
  }
  if (ZEROS_DEMAIS.test(digitos) || UM_DIGITO_SO.test(digitos)) {
    falharMorto(
      caminho,
      limpo,
      "é máscara de formulário, não telefone. É o número que o visitante vê no rodapé e digita no " +
        "celular dele. Escreva o real, no molde (DD) 9NNNN-NNNN."
    )
  }
  return limpo
}

export const email: Validador<string> = (valor, caminho) => {
  const limpo = padrao(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "nome@dominio",
    120
  )(valor, caminho)
  if (hostDeMentira(limpo.slice(limpo.indexOf("@") + 1))) {
    falharMorto(
      caminho,
      limpo,
      "é e-mail de exemplo. `exemplo.com.br` está registrado de verdade: a mensagem do cliente sai, " +
        "não volta bounce nenhum, e some — o mesmo silêncio do telefone, na caixa de entrada. " +
        "Escreva o e-mail que alguém abre e responde."
    )
  }
  return limpo
}

/**
 * As 27 unidades federativas, fechadas em lista. Um `/^[A-Z]{2}$/` aceita `XX`,
 * `AA` e `ZZ` — e endereço com UF que não existe some do mapa sem avisar.
 */
const UFS = [
  "AC",
  "AL",
  "AM",
  "AP",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MG",
  "MS",
  "MT",
  "PA",
  "PB",
  "PE",
  "PI",
  "PR",
  "RJ",
  "RN",
  "RO",
  "RR",
  "RS",
  "SC",
  "SE",
  "SP",
  "TO",
]

export const uf: Validador<string> = (valor, caminho) => {
  const limpo = padrao(/^[A-Z]{2}$/, "UF em duas maiúsculas", 2)(valor, caminho)
  if (!UFS.includes(limpo)) {
    falharMorto(
      caminho,
      limpo,
      `não é uma UF brasileira. As que existem: ${UFS.join(", ")}.`
    )
  }
  return limpo
}

export const cep: Validador<string> = (valor, caminho) => {
  const limpo = padrao(/^\d{5}-\d{3}$/, "00000-000", 9)(valor, caminho)
  if (UM_DIGITO_SO.test(limpo.replace("-", ""))) {
    falharMorto(
      caminho,
      limpo,
      'casa o formato e não é CEP de lugar nenhum. Escreva o do endereço (ex.: "04101-300").'
    )
  }
  return limpo
}

export const dataIso = padrao(/^\d{4}-\d{2}-\d{2}$/, "AAAA-MM-DD", 10)

/** O `%s` é o buraco onde o Next encaixa o título da página filha. */
export const gabaritoDeTitulo: Validador<string> = (valor, caminho) => {
  const limpo = texto(4, 120)(valor, caminho)
  if (!limpo.includes("%s"))
    falhar(
      caminho,
      "gabarito contendo %s (onde entra o título da página)",
      valor
    )
  return limpo
}

/** A tag BCP 47 do arquivo de textos. Mesmo padrão que `meta.idioma` cobrava. */
export const tagDeIdioma = padrao(/^[a-z]{2}-[A-Z]{2}$/, "pt-BR", 5)

// ── o contrato COMPARTILHADO: conteudo/site.json ──────────────────────────

const formaDoSite = objeto({
  // Identidade do negócio. §12.3: isto é CONTEÚDO VALIDADO, não env var.
  //
  // `nome` é o único obrigatório aqui, e é obrigatório porque TODA página o
  // renderiza sem perguntar: ele é o `applicationName`, o `og:siteName` e o
  // `name` do manifesto. Os três blocos abaixo dele são CONDICIONAIS — a
  // presença da chave é a declaração de uso. Ver o cabeçalho, 02/09.
  identidade: objeto({
    nome: texto(2, 80),

    // O BLOCO DO LINK CANÔNICO — acrescentado em 02/09 por esta landing, e ele
    // é o item (c) do cabeçalho exercitado do lado do dono: bloco novo aqui
    // REPROVA o `next build` enquanto `components/rodape.tsx` não souber
    // renderizá-lo, porque `Contato` é `Omit<identidade, 'nome'>` e o mapa
    // `CONTATOS` é cobrado como total por `satisfies`. Medido: sem o
    // renderizador, TS1360.
    //
    // Por que ele precisa existir: a landing de uma ferramenta open-source SEM
    // link para o repositório é uma landing quebrada, e o esquema não tinha
    // onde pôr um link. `meta.urlBase` é o endereço DESTE site, não o do
    // código — os dois são coisas diferentes e confundi-los publica o cartão de
    // compartilhamento apontando para o lugar errado.
    repositorio: opcional(
      objeto({
        url: urlDePagina,
        // O que o visitante lê. Separado da URL pelo mesmo motivo que
        // `exibicao` é separado de `e164`: o que se lê e para onde se vai são
        // dois usos, e um campo só para os dois vira o Galegos de novo.
        rotulo: texto(4, 60),
      })
    ),

    // O BLOCO DO BOTÃO DE WHATSAPP, e ele carrega a própria cópia de propósito.
    // `chamadaAcao` e `mensagem` moravam em `home`, e ali eram exatamente o
    // caso inverso que o item (c) descreve: sem botão, dois campos que o dono
    // escreve, revisa e publica, e que nada renderiza. Dentro do bloco eles só
    // existem quando o botão existe, e somem junto com ele.
    whatsapp: opcional(
      objeto({
        // O que entra no link. Sem pontuação, porque o `wa.me` a rejeita.
        e164: telefoneE164,
        // O que o visitante lê.
        exibicao: telefoneExibicao,
        // O rótulo do botão.
        chamadaAcao: texto(4, 40),
        // O texto que já vai escrito na conversa do WhatsApp. Está aqui, e não
        // dentro do `.tsx`, porque é frase que o dono reescreve — e a regra
        // `conteudo-fora-do-codigo` acusaria a frase se ela morasse no
        // componente.
        mensagem: texto(10, 200),
      })
    ),

    // Um site pode ter só e-mail — é o caso da landing de ferramenta.
    email: opcional(email),

    // Endereço é tudo-ou-nada: os cinco campos juntos, ou a chave fora.
    endereco: opcional(
      objeto({
        logradouro: texto(4, 120),
        bairro: texto(2, 60),
        cidade: texto(2, 60),
        uf,
        cep,
      })
    ),
  }),

  // O `meta` daqui guarda SÓ o que é igual nos três idiomas. Título, descrição,
  // nome curto e gabarito saíram para `conteudo/textos/<idioma>.json`: eles são
  // o que o visitante lê, e o que o visitante lê é o que se traduz.
  meta: objeto({
    urlBase,
    // Data do sitemap. É CONTEÚDO e não `new Date()` porque `new Date()` no
    // build faz o mesmo commit gerar bytes diferentes a cada rodada, e build
    // que não é reprodutível não dá para comparar.
    atualizadoEm: dataIso,
    cores: objeto({ tema: corHex, fundo: corHex }),
    // SÓ OS FATOS DA IMAGEM MORAM AQUI, e o `alt` saiu em 06/09.
    //
    // Caminho, largura e altura são o mesmo arquivo em qualquer idioma; o
    // `alt` é TEXTO QUE ALGUÉM LÊ, e texto que alguém lê se traduz. Medido no
    // build anterior: as 15 rotas — as cinco inglesas e as cinco espanholas
    // incluídas — publicavam
    // `og:image:alt="Cartão de compartilhamento de rebar — faz código errado
    // não passar"`, em português, no MESMO `<head>` em que `og:title` e
    // `og:description` já saíam traduzidos. O alt agora é `og.alt` de
    // `conteudo/textos/<idioma>.json`.
    og: objeto({
      caminho: caminhoPublico,
      // 1200×630 não é decoração: é a proporção que WhatsApp, LinkedIn e
      // Twitter recortam sem cortar. Fixo no esquema para o campo não virar
      // um número qualquer que ninguém confere.
      largura: inteiro(1200, 1200),
      altura: inteiro(630, 630),
    }),
  }),
})

type FormaDoSite = Inferir<typeof formaDoSite>

// ── o contrato POR IDIOMA: conteudo/textos/<idioma>.json ──────────────────

/**
 * O MESMO validador roda nos três arquivos, e é essa igualdade que é a defesa.
 *
 * Um esquema por idioma seria a permissão para o espanhol nascer sem a página
 * de módulos e o build continuar verde — o visitante em espanhol chegaria numa
 * rota que existe e não tem conteúdo. Com um esquema só, campo faltando em
 * QUALQUER idioma reprova o `next build` antes de sair HTML.
 */
const formaDosTextos = objeto({
  // A tag do `<html lang>` e do `og:locale`. Vive AQUI e não em `site.json`
  // porque agora há três, uma por arquivo, e `conferirIdioma` cobra que ela
  // combine com o nome do arquivo — copiar `en.json` para `es.json` e esquecer
  // esta linha publicaria a página espanhola declarando-se inglesa, que é o que
  // o leitor de tela e o Google leem primeiro.
  tagDeIdioma,
  // O nome do idioma ESCRITO NO PRÓPRIO IDIOMA. Quem procura "Español" no
  // seletor não está lendo português; um rótulo traduzido para o idioma da
  // página atual é o seletor que só serve para quem já não precisa dele.
  nomeDoIdioma: texto(2, 40),

  titulo: texto(4, 70),
  gabaritoDeTitulo,
  descricao: texto(50, 160),
  nomeCurto: texto(2, 12),

  /**
   * O TEXTO ALTERNATIVO DO CARTÃO DE COMPARTILHAMENTO, que morava em
   * `site.json` e era o último texto do `<head>` a sair em português nas 15
   * rotas.
   *
   * O bloco `meta.og` do compartilhado continua com caminho, largura e altura
   * — os três são FATOS DA IMAGEM, iguais em qualquer idioma. O `alt` não é
   * fato da imagem: é a frase que o leitor de tela pronuncia quando alguém
   * compartilha o link, e ela pertence a quem lê.
   *
   * A forma é um bloco de um campo só, e é de propósito: o nome `og` é o mesmo
   * dos dois lados, então quem abre os dois arquivos vê o corte — o que é fato
   * ficou lá, o que é texto veio para cá.
   */
  og: objeto({ alt: texto(10, 140) }),

  home: objeto({
    titulo: texto(4, 90),
    // Subtítulo e destaques NÃO levam sentinela, e a linha está escrita aqui de
    // propósito: o corte é entre FATO VERIFICÁVEL do negócio (contato,
    // endereço, domínio, e a descrição que viaja no preview do link) e TEXTO DE
    // MARKETING. Fato errado desvia pedido e visita em silêncio; "Primeiro
    // destaque" não engana ninguém — o dono vê no primeiro `npm run dev` e o
    // texto já se anuncia como exemplo. Reprovar o build por causa de copy é o
    // caminho rápido para o dono apagar a validação inteira.
    subtitulo: texto(20, 220),
    destaques: lista(
      objeto({ titulo: texto(3, 60), texto: texto(20, 240) }),
      1,
      6
    ),
  }),

  // ─────────────────────────────────────────────── as paginas de documentacao
  //
  // POR QUE ISTO E CONTEUDO E NAO JSX. A regra `content-outside-code` do rebar
  // acusa no de texto de JSX com quatro palavras ou mais. Uma pagina de
  // documentacao escrita dentro do componente faria ESTE site reprovar na regua
  // do projeto que ele documenta -- o mesmo `menu.ts` de 623 linhas que a
  // forense catalogou no Galegos, cometido pela landing do proprio checker.
  //
  // Cada bloco e OPCIONAL e tudo-ou-nada. Site gerado sem documentacao nao tem
  // a chave e nao tem a rota; com a chave, os campos vem juntos ou o build
  // reprova. E a mesma disciplina do bloco de WhatsApp, um andar acima.
  paginas: opcional(
    objeto({
      instalacao: objeto({
        titulo: texto(4, 80),
        resumo: texto(20, 300),
        // `comando` e texto livre e nao um padrao: prender a forma aqui faria
        // o esquema recusar `pnpm dlx` no dia em que alguem preferir pnpm.
        passos: lista(
          objeto({
            titulo: texto(3, 80),
            comando: texto(3, 200),
            nota: opcional(texto(10, 300)),
          }),
          1,
          8
        ),
      }),

      uso: objeto({
        titulo: texto(4, 80),
        resumo: texto(20, 300),
        exemplos: lista(
          objeto({
            titulo: texto(3, 80),
            comando: texto(3, 200),
            // A saida e opcional porque nem todo exemplo tem uma curta o
            // bastante para caber na tela sem virar captura de tela mentirosa.
            //
            // E ela NAO SE TRADUZ, nos tres arquivos: e o que o programa
            // imprime de verdade, e o programa imprime em portugues. Traduzir
            // seria publicar uma captura de uma execucao que nunca existiu --
            // a mesma mentira do `ui-falso`, so que na documentacao.
            saida: opcional(texto(3, 900)),
            nota: opcional(texto(10, 300)),
          }),
          1,
          10
        ),
      }),

      modulos: objeto({
        titulo: texto(4, 80),
        resumo: texto(20, 300),
        // O rotulo do bloco de limite. Esta AQUI e nao no `.tsx` porque a
        // regra `content-outside-code` do rebar o acusou -- e estava certa: a
        // pagina declara no proprio cabecalho que nao carrega literal de
        // conteudo, e "O que nao faz." e conteudo.
        rotuloLimite: texto(3, 40),
        itens: lista(
          objeto({
            nome: texto(3, 40),
            comando: texto(3, 120),
            resumo: texto(20, 400),
            // O que ele NAO faz. Campo obrigatorio de proposito: modulo
            // descrito so pelo que faz e propaganda, e a doutrina desta arvore
            // e que o limite declarado vale mais que a capacidade declarada.
            limite: texto(15, 400),
            numeros: lista(
              objeto({ rotulo: texto(2, 40), valor: texto(1, 24) }),
              0,
              6
            ),
          }),
          1,
          8
        ),
      }),

      docs: objeto({
        titulo: texto(4, 80),
        resumo: texto(20, 300),
        secoes: lista(
          objeto({
            titulo: texto(3, 90),
            corpo: texto(30, 1200),
            itens: lista(texto(3, 300), 0, 12),
          }),
          1,
          12
        ),
      }),
    })
  ),

  /**
   * TODO LITERAL DE INTERFACE, e ele é obrigatório inteiro.
   *
   * Estas palavras moravam em `.tsx` — "Pular para o conteúdo" no layout,
   * "Nesta página" na documentação, "saída" na página de uso, os cinco rótulos
   * da navegação. Enquanto o site tinha um idioma isso parecia dívida barata:
   * a régua `conteudo-fora-do-codigo` não acusa corrida de menos de quatro
   * palavras, então nada ficava vermelho.
   *
   * Com três idiomas o custo apareceu inteiro: a moldura sairia em português
   * nas três versões, e o visitante em espanhol leria um site espanhol com a
   * navegação em outro idioma. Não há defesa automática contra isso — é
   * exatamente o tipo de coisa que ninguém vê no próprio idioma.
   *
   * Nada aqui é opcional, de propósito: rótulo faltando não vira texto vazio na
   * tela, vira build vermelho.
   */
  rotulos: objeto({
    pularParaConteudo: texto(4, 60),
    navegacaoPrincipal: texto(3, 60),
    secoes: texto(3, 40),
    trilha: texto(3, 40),
    nestaPagina: texto(3, 60),
    saida: texto(3, 40),
    copiar: texto(3, 40),
    copiado: texto(3, 40),
    buscar: texto(3, 40),
    buscarVazio: texto(3, 80),
    buscarDica: texto(3, 80),
    idioma: texto(3, 40),
    tema: texto(3, 40),
    temaClaro: texto(3, 40),
    temaEscuro: texto(3, 40),
    temaSistema: texto(3, 40),
    menu: texto(3, 40),
    // O nome acessível do botão que fecha a gaveta. Só quem usa leitor de tela
    // o ouve — e é justamente por isso que ele precisa estar aqui: literal
    // cravado no componente passa em todo teste e publica "Close" nas três
    // versões sem ninguém enxergar.
    fechar: texto(3, 40),
    anterior: texto(3, 40),
    proximo: texto(3, 40),
    repositorio: texto(3, 40),
    // A chamada para ação da home e o primeiro link da documentação. É um
    // rótulo, e não conteúdo da home, porque aparece nos dois lugares: repetir
    // o texto em `home` e em `paginas` criaria duas versões da mesma palavra,
    // e elas divergem na primeira revisão de copy.
    comecar: texto(3, 40),
    /**
     * OS DOIS RÓTULOS DA PÁGINA 404, e eles existem porque o GitHub Pages
     * serve UM arquivo — `out/404.html` — para todo endereço desconhecido, nos
     * TRÊS idiomas.
     *
     * Medido no build anterior: aquele arquivo era o 404 de fábrica do Next —
     * `<html>` sem `lang`, sem o CSS do site, com "404 | This page could not
     * be found." e ZERO links. Quem seguisse um link antigo (o slug das rotas
     * passou a ser inglês, então `/docs/instalacao` não existe mais) chegava
     * numa página sem saída, em inglês, mesmo vindo de `/pt-br` ou `/es`.
     *
     * Os dois rótulos existem nos três arquivos mesmo que a página renderize
     * na `IDIOMA_PADRAO`: é `app/not-found.tsx` que oferece as TRÊS home como
     * saída, e o dia em que o site trocar de idioma padrão não pode ser o dia
     * em que dois textos somem.
     */
    naoEncontrado: texto(3, 60),
    voltarParaOInicio: texto(3, 60),
    // Os grupos da barra lateral da documentação. Não saem de `paginas` porque
    // não são página nenhuma: são a divisão editorial entre o que se lê para
    // começar e o que se consulta depois.
    grupos: objeto({
      comecar: texto(3, 40),
      referencia: texto(3, 40),
    }),
    // Um rótulo por rota, com a MESMA chave que `lib/rotas.ts` usa. Rota nova
    // sem rótulo reprova aqui, e rótulo sem rota reprova pelo campo
    // desconhecido de `objeto()` — as duas direções, como sempre.
    navegacao: objeto({
      inicio: texto(2, 40),
      docs: texto(2, 40),
      instalacao: texto(2, 40),
      uso: texto(2, 40),
      modulos: texto(2, 40),
    }),
  }),
})

type FormaDosTextos = Inferir<typeof formaDosTextos>

// ── as coerências entre campos ────────────────────────────────────────────

/**
 * O número que o visitante LÊ tem de ser o número para onde o link VAI.
 *
 * Este é o defeito do Galegos na forma original: dois formatos do mesmo
 * telefone, mantidos à mão, divergindo. Quando divergem, o rodapé mostra um
 * número e o botão abre outro — e ninguém percebe, porque as duas coisas
 * "funcionam".
 */
function conferirCoerencia(site: FormaDoSite): void {
  // Só há coerência a cobrar se houver botão. Sem o bloco não há dois formatos
  // do mesmo número para divergir — é a exigência seguindo o uso, aqui também.
  const zap = site.identidade.whatsapp
  if (zap === null) return
  const visivel = zap.exibicao.replace(/\D/g, "")
  if (!zap.e164.endsWith(visivel)) {
    throw new ErroDeConteudo(
      "conteudo/site.json: identidade.whatsapp.exibicao e identidade.whatsapp.e164 são telefones " +
        `DIFERENTES — o rodapé mostra ${JSON.stringify(zap.exibicao)} ` +
        `(dígitos ${visivel}) e o link abre ${zap.e164}. ` +
        "Os dois campos são o MESMO número em formatos diferentes: o e164 tem de terminar nos " +
        "dígitos do exibicao — e164 no molde 55DD9NNNNNNNN, exibicao no molde (DD) 9NNNN-NNNN."
    )
  }
}

/**
 * O ARQUIVO E A TAG TÊM DE FALAR O MESMO IDIOMA.
 *
 * É a mesma classe de defeito do telefone em dois formatos, e nasce do mesmo
 * gesto: `es.json` começa como cópia de `en.json`, e quem traduz o texto não
 * repara na primeira linha. O resultado publica `<html lang="en-US">` numa
 * página inteira em espanhol — o leitor de tela pronuncia espanhol com fonemas
 * ingleses, e o Google indexa a página no idioma errado. As duas coisas
 * "funcionam" e nenhuma acusa.
 */
function conferirIdioma(textos: FormaDosTextos, idioma: string): void {
  const daTag = textos.tagDeIdioma.slice(0, 2).toLowerCase()
  const doArquivo = idioma.slice(0, 2).toLowerCase()
  if (daTag !== doArquivo) {
    throw new ErroDeConteudo(
      `conteudo/textos/${idioma}.json: tagDeIdioma é ${JSON.stringify(textos.tagDeIdioma)}, ` +
        `que não é o idioma do arquivo (${idioma}). O arquivo vira <html lang="…"> e og:locale ` +
        "da página inteira: publicado assim, o leitor de tela pronuncia o texto com os fonemas do " +
        "idioma errado e o buscador indexa a página como se fosse de outro idioma. " +
        `Escreva a tag deste arquivo (ex.: ${doArquivo}-XX).`
    )
  }
}

// ── as portas ─────────────────────────────────────────────────────────────

/**
 * A porta do compartilhado. Sentinela primeiro (uma mensagem com tudo que
 * falta), depois o formato campo a campo, depois a coerência entre campos —
 * nessa ordem porque é a ordem em que o dono resolve: preencher, corrigir,
 * conferir.
 */
export const esquemaSite: Validador<FormaDoSite> = (valor, caminho) => {
  conferirSentinelas(valor, "conteudo/site.json")
  const site = formaDoSite(valor, caminho)
  conferirCoerencia(site)
  return site
}

/**
 * A porta de UM arquivo de textos. O `caminho` é o idioma — é ele que vira o
 * nome do arquivo em toda mensagem de erro, e é ele que `conferirIdioma`
 * compara com a tag declarada lá dentro.
 */
export function esquemaTextos(valor: unknown, idioma: string): FormaDosTextos {
  conferirSentinelas(valor, `conteudo/textos/${idioma}.json`)
  const textos = formaDosTextos(valor, idioma)
  conferirIdioma(textos, idioma)
  return textos
}

/** O que é igual nos três idiomas: identidade do negócio e meta técnico. */
export type Compartilhado = FormaDoSite

/** O que muda por idioma: tudo que alguém lê. */
export type Textos = FormaDosTextos

/**
 * OS BLOCOS CONDICIONAIS, num tipo só — é `identidade` menos o `nome`.
 *
 * Ele não é conveniência: é o que torna a totalidade do mapa `CONTATOS` do
 * rodapé cobrável por `satisfies`. Acrescentar um quarto bloco condicional aqui
 * embaixo (um Instagram, um horário de funcionamento) passa a REPROVAR o
 * `next build` enquanto o rodapé não souber renderizá-lo — que é o item (c)
 * fechado na direção mais fácil de esquecer, e fechado pelo compilador, sem
 * regra nova.
 */
export type Contato = Omit<Compartilhado["identidade"], "nome">

/** O bloco do botão, já estreitado. É o que `linkWhatsapp` exige receber. */
export type Whatsapp = NonNullable<Contato["whatsapp"]>

/**
 * O link do WhatsApp é MONTADO em código a partir do número que é conteúdo.
 * Essa divisão é o conserto do `Navesz/Galegos#1` feito do lado certo: o
 * formato do link é código (não muda por negócio), o destinatário é conteúdo
 * validado (muda, e falta dele reprova o build em vez de sumir em produção).
 *
 * O PARÂMETRO É O BLOCO, E NÃO O SITE, e essa troca é o dente do 02/09. Com
 * `site` na assinatura, um site sem WhatsApp ainda COMPILAVA a chamada e o
 * `wa.me` nascia sem destinatário em tempo de execução — o Galegos, de novo.
 * Com `Whatsapp` na assinatura, `linkWhatsapp(site.identidade.whatsapp)` é erro
 * de tipo enquanto ninguém estreitar o `null`: o desastre deixa de depender de
 * validação e passa a depender de compilar.
 */
export function linkWhatsapp(whatsapp: Whatsapp): string {
  return `https://wa.me/${whatsapp.e164}?text=${encodeURIComponent(whatsapp.mensagem)}`
}
