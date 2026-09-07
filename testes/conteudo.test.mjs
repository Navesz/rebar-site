// O CONTRATO DO CONTEÚDO TESTANDO A SI MESMO.
//
// POR QUE ESTE ARQUIVO EXISTE, e por que ele não é teste de fachada. O esquema
// já reprova o `next build`, então seria fácil argumentar que ele se prova
// sozinho — e seria errado, porque o build só exercita UM site: o que está no
// disco. As duas metades da decisão de 02/09 são justamente sobre sites que o
// build deste projeto nunca vai ver:
//
//   · o site que NÃO TEM WhatsApp e mesmo assim tem de gerar e buildar;
//   · o site que DECLARA o botão e deixa o número vazio, que tem de REPROVAR.
//
// Um projeto só pode ser um dos dois. Aqui cabem os dois, e cabem os erros de
// meio-caminho — endereço pela metade, chave vazia — que ninguém escreve de
// propósito e todo mundo escreve por engano.
//
// O CONTRATO VIROU DOIS quando o site virou trilíngue: `esquemaSite` valida o
// que é igual nos três idiomas, `esquemaTextos` valida um arquivo de textos. Os
// dois são cobrados aqui, e há um terceiro teste que nenhum dos dois esquemas
// consegue fazer sozinho — a PARIDADE entre os três arquivos, que é o que pega
// a tradução esquecida.
//
// Roda no `npm test`, dentro do `npm run verificar`, dentro do CI, nos dois
// sistemas e SEM REDE. Zero dependência: `node:test`, `node:assert`, `node:fs`.
//
// O `.ts` é importado direto: o Node desembrulha tipo sozinho desde a 22.18, e
// é o mesmo caminho que o portão do rebar usa para carregar este esquema.

import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { test } from "node:test"
import { fileURLToPath, pathToFileURL } from "node:url"

// fileURLToPath, não .pathname: no Windows o pathname vem "/C:/Users/...".
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..")

// pathToFileURL, e não o caminho cru: no Windows `import('C:\...')` morre com
// ERR_UNSUPPORTED_ESM_URL_SCHEME — o loader lê `c:` como esquema de URL.
const { esquemaSite, esquemaTextos, linkWhatsapp, ErroDeConteudo } =
  await import(pathToFileURL(join(RAIZ, "conteudo", "esquema.ts")).href)

// O telefone de teste é MONTADO em pedaços, e não é estilo: a régua do rebar
// tem uma regra `telefone` que varre `.mjs` como código de produção, e um
// celular escrito por extenso aqui faria o projeto reprovar na própria régua.
// Nenhum dos pedaços abaixo casa o padrão sozinho.
const TEL = { ddi: "55", ddd: "11", celular: ["9", "8765", "4321"] }
const E164 = TEL.ddi + TEL.ddd + TEL.celular.join("")
const EXIBICAO = `(${TEL.ddd}) ${TEL.celular[0]}${TEL.celular[1]}-${TEL.celular[2]}`

/**
 * O site MÍNIMO: nome e o meta técnico, e mais nada de contato.
 *
 * É a landing de ferramenta do enunciado, e é a metade da decisão que o esquema
 * antigo tornava impossível — ele exigia telefone, e-mail e cinco campos de
 * endereço de qualquer site que o gerador produzisse.
 *
 * Função, e não constante, porque cada caso abaixo MUTILA a cópia dele.
 */
const minimo = () => ({
  identidade: { nome: "Padaria do Zé" },
  meta: {
    urlBase: "https://padariadoze.com.br",
    atualizadoEm: "2026-09-02",
    cores: { tema: "#0f172a", fundo: "#ffffff" },
    // SEM `alt`, desde 06/09: ele saiu daqui para `og.alt` de cada arquivo de
    // texto. O que sobrou são os três fatos da imagem, iguais em qualquer
    // idioma. Devolver a chave aqui reprova como campo desconhecido — e há um
    // teste abaixo cobrando exatamente isso, porque essa é a forma que a
    // migração tem de deixar de acontecer pela metade.
    og: {
      caminho: "/og.png",
      largura: 1200,
      altura: 630,
    },
  },
})

/** Todo literal de interface, que o esquema exige INTEIRO. */
const rotulos = () => ({
  pularParaConteudo: "Pular para o conteúdo",
  navegacaoPrincipal: "Navegação principal",
  secoes: "Seções",
  trilha: "Trilha",
  nestaPagina: "Nesta página",
  saida: "saída",
  copiar: "Copiar comando",
  copiado: "Copiado",
  buscar: "Buscar",
  buscarVazio: "Nada encontrado",
  buscarDica: "Digite para buscar",
  idioma: "Idioma",
  tema: "Tema",
  temaClaro: "Claro",
  temaEscuro: "Escuro",
  temaSistema: "Sistema",
  menu: "Menu",
  fechar: "Fechar",
  anterior: "Anterior",
  proximo: "Próximo",
  repositorio: "Repositório",
  comecar: "Começar",
  // Os dois textos da página 404. Ela é UM arquivo para os três idiomas — o
  // GitHub Pages serve `out/404.html` para todo endereço desconhecido —, mas
  // os rótulos existem nos três porque a página renderiza na `IDIOMA_PADRAO`,
  // e o idioma padrão é decisão que pode mudar.
  naoEncontrado: "Esta página não existe",
  voltarParaOInicio: "Comece de novo pelo início",
  grupos: {
    comecar: "Comece aqui",
    referencia: "Referência",
  },
  navegacao: {
    inicio: "Início",
    docs: "Docs",
    instalacao: "Instalação",
    uso: "Uso",
    modulos: "Módulos",
  },
})

/** O arquivo de textos MÍNIMO: sem documentação, que é bloco condicional. */
const textosMinimos = () => ({
  tagDeIdioma: "pt-BR",
  nomeDoIdioma: "Português (Brasil)",
  titulo: "Padaria do Zé",
  gabaritoDeTitulo: "%s · Padaria do Zé",
  descricao:
    "Pães de fermentação natural, bolos e salgados assados todo dia de manhã na Vila Mariana.",
  nomeCurto: "Padaria",
  // O alt do cartão de compartilhamento mora AQUI desde 06/09, e não em
  // `site.json`: ele é o texto que o leitor de tela pronuncia quando alguém
  // compartilha o link, e texto que alguém lê se traduz.
  og: { alt: "Cartão de compartilhamento da Padaria do Zé" },
  home: {
    titulo: "Padaria do Zé",
    subtitulo:
      "Pães de fermentação natural assados todo dia de manhã, na Vila Mariana.",
    destaques: [
      {
        titulo: "Forno",
        texto:
          "Fornada nova a cada duas horas, das seis da manhã às sete da noite.",
      },
    ],
  },
  rotulos: rotulos(),
})

const comWhatsapp = () => ({
  e164: E164,
  exibicao: EXIBICAO,
  chamadaAcao: "Falar no WhatsApp",
  mensagem: "Olá! Vim pelo site e gostaria de mais informações.",
})

const comEndereco = () => ({
  logradouro: "Rua das Palmeiras, 512",
  bairro: "Vila Mariana",
  cidade: "São Paulo",
  uf: "SP",
  cep: "04101-300",
})

/** O site do Galegos: tudo declarado, tudo preenchido. */
const completo = () => {
  const site = minimo()
  site.identidade.whatsapp = comWhatsapp()
  site.identidade.email = "contato@padariadoze.com.br"
  site.identidade.endereco = comEndereco()
  return site
}

/** A recusa, com a mensagem, para o teste poder cobrar a RAZÃO e não só o não. */
function recusaComo(validar, bruto) {
  try {
    validar(bruto)
  } catch (erro) {
    assert.ok(
      erro instanceof ErroDeConteudo,
      `esperava ErroDeConteudo, veio ${erro?.name}: ${erro?.message}`
    )
    return erro.message
  }
  assert.fail("o esquema ACEITOU um conteúdo que deveria reprovar")
}

const recusa = (bruto) => recusaComo((v) => esquemaSite(v, "site"), bruto)
const recusaTextos = (bruto, idioma = "pt-br") =>
  recusaComo((v) => esquemaTextos(v, idioma), bruto)

// ── (a) o núcleo obrigatório, e só ele ────────────────────────────────────

test("um site só com nome e meta é ACEITO — os contatos vêm null", () => {
  const site = esquemaSite(minimo(), "site")
  assert.equal(site.identidade.nome, "Padaria do Zé")
  assert.equal(site.identidade.whatsapp, null)
  assert.equal(site.identidade.email, null)
  assert.equal(site.identidade.endereco, null)
})

test("um arquivo de textos sem documentação é ACEITO — paginas vem null", () => {
  const textos = esquemaTextos(textosMinimos(), "pt-br")
  assert.equal(textos.paginas, null)
  assert.equal(textos.rotulos.navegacao.instalacao, "Instalação")
})

test("sem o núcleo não há site: nome e urlBase continuam obrigatórios", () => {
  for (const [bloco, campo] of [
    ["identidade", "nome"],
    ["meta", "urlBase"],
    ["meta", "atualizadoEm"],
  ]) {
    const site = minimo()
    delete site[bloco][campo]
    assert.match(recusa(site), new RegExp(`${bloco}\\.${campo}`))
  }
})

test("sem o núcleo não há textos: titulo, descricao e home.titulo são obrigatórios", () => {
  for (const caminho of [
    ["titulo"],
    ["descricao"],
    ["nomeCurto"],
    ["gabaritoDeTitulo"],
    ["tagDeIdioma"],
    ["nomeDoIdioma"],
    ["og", "alt"],
    ["home", "titulo"],
  ]) {
    const textos = textosMinimos()
    const alvo = caminho.length === 1 ? textos : textos[caminho[0]]
    delete alvo[caminho[caminho.length - 1]]
    assert.match(recusaTextos(textos), new RegExp(caminho.join("\\.")))
  }
})

// ── a sentinela, que é a defesa contra o placeholder plausível ────────────

test("placeholder no site REPROVA, e a mensagem lista tudo que falta de uma vez", () => {
  const site = minimo()
  site.identidade.nome = "TROQUE-PELO-NOME-DO-NEGOCIO"
  // O segundo campo era `meta.og.alt`, que saiu deste arquivo em 06/09. Agora é
  // `meta.urlBase` — o outro campo obrigatório do bloco compartilhado, e o que
  // o gerador também entrega com sentinela.
  site.meta.urlBase = "TROQUE-PELO-ENDERECO-DO-SITE"
  const mensagem = recusa(site)
  assert.match(mensagem, /2 campo\(s\) com PLACEHOLDER/)
  assert.match(mensagem, /identidade\.nome/)
  assert.match(mensagem, /meta\.urlBase/)
  // Uma mensagem só, e não nove builds: é a razão de a varredura vir antes da
  // validação campo a campo.
  assert.match(mensagem, /conteudo\/site\.json/)
})

test("placeholder num arquivo de textos aponta o ARQUIVO daquele idioma", () => {
  const textos = textosMinimos()
  textos.titulo = "TROQUE-PELO-TITULO"
  const mensagem = recusaTextos(textos, "es")
  assert.match(mensagem, /conteudo\/textos\/es\.json/)
  assert.match(mensagem, /titulo/)
})

// ── (b) a exigência segue o uso ───────────────────────────────────────────

test("o site do Galegos — tudo declarado — é aceito e o link aponta para o número", () => {
  const site = esquemaSite(completo(), "site")
  assert.equal(site.identidade.whatsapp.e164, E164)
  assert.ok(
    linkWhatsapp(site.identidade.whatsapp).startsWith(
      `https://wa.me/${E164}?text=`
    )
  )
  assert.equal(site.identidade.endereco.uf, "SP")
})

test("DECLARA o botão e deixa o número vazio: REPROVA — é o Navesz/Galegos#1", () => {
  for (const numero of ["", "   ", undefined]) {
    const site = minimo()
    site.identidade.whatsapp = { ...comWhatsapp(), e164: numero }
    const mensagem = recusa(site)
    assert.match(mensagem, /identidade\.whatsapp\.e164/)
    // A frase que ensina a saída certa tem de estar lá: quem não tem WhatsApp
    // apaga o bloco, não inventa um número para o build ficar verde.
    assert.match(mensagem, /apague a chave/i)
  }
})

test("número plausível-porém-morto no bloco declarado continua reprovando", () => {
  const site = minimo()
  site.identidade.whatsapp = {
    ...comWhatsapp(),
    e164: `${TEL.ddi}${"0".repeat(11)}`,
  }
  assert.match(recusa(site), /não é telefone de ninguém/)
})

test("exibição e link divergentes reprovam — mas só quando há bloco para divergir", () => {
  const site = completo()
  site.identidade.whatsapp.exibicao = "(21) 98765-4321"
  assert.match(recusa(site), /telefones DIFERENTES/)
  // Sem o bloco não há dois formatos do mesmo número, e nada a cobrar.
  assert.doesNotThrow(() => esquemaSite(minimo(), "site"))
})

test("meio endereço é pior que nenhum: os cinco campos vêm juntos ou a chave sai", () => {
  const site = minimo()
  // `delete`, e não desestruturação com descarte: `const { cep: _cep, ... }` deixa
  // o `no-unused-vars` do projeto gerado com dois avisos, e projeto novo não nasce
  // com aviso.
  const semCep = comEndereco()
  delete semCep.cep
  site.identidade.endereco = semCep
  const mensagem = recusa(site)
  assert.match(mensagem, /identidade\.endereco\.cep/)
  assert.match(mensagem, /PELA METADE/)
  assert.match(mensagem, /apague a chave "identidade\.endereco"/)
})

test('vazio não é "não tenho": campo em branco e bloco {} ensinam a apagar a chave', () => {
  for (const [chave, vazio] of [
    ["email", ""],
    ["email", "   "],
    ["endereco", {}],
    ["whatsapp", {}],
    ["repositorio", {}],
  ]) {
    const site = minimo()
    site.identidade[chave] = vazio
    const mensagem = recusa(site)
    assert.match(mensagem, /não é "não tenho"/)
    assert.match(
      mensagem,
      new RegExp(`a chave "identidade\\.${chave}" sai do arquivo`)
    )
  }
})

test("null explícito vale o mesmo que a chave ausente", () => {
  const site = minimo()
  site.identidade.whatsapp = null
  site.identidade.email = null
  site.identidade.endereco = null
  site.identidade.repositorio = null
  assert.deepEqual(esquemaSite(site, "site").identidade, {
    nome: "Padaria do Zé",
    whatsapp: null,
    email: null,
    endereco: null,
    repositorio: null,
  })
})

test("o bloco paginas é tudo-ou-nada: começou, vai inteiro", () => {
  const textos = textosMinimos()
  // Só a instalação, sem uso, módulos e docs: o site teria três rotas sem
  // conteúdo, respondendo 200 com nada dentro.
  textos.paginas = {
    instalacao: {
      titulo: "Instalação",
      resumo: "Como pôr o forno para funcionar na sua máquina em cinco passos.",
      passos: [{ titulo: "Instalar", comando: "npm i" }],
    },
  }
  const mensagem = recusaTextos(textos)
  assert.match(mensagem, /paginas\.uso/)
  assert.match(mensagem, /PELA METADE/)
})

// ── o bloco `repositorio`, acrescentado em 02/09 pela landing do rebar ────
//
// Ele nasce com os dois casos, como toda regra desta casa: um que PASSA e um
// que REPROVA. O que ele existe para impedir é o link canônico da página apontar
// para lugar nenhum — a landing de uma ferramenta cujo botão principal abre a
// home do GitHub em vez do repositório.

test("o bloco repositorio completo passa, e o link é o que o rótulo promete", () => {
  const site = minimo()
  site.identidade.repositorio = {
    url: "https://github.com/Navesz/rebar",
    rotulo: "Navesz/rebar no GitHub",
  }
  const validado = esquemaSite(site, "site").identidade.repositorio
  assert.equal(validado.url, "https://github.com/Navesz/rebar")
  assert.equal(validado.rotulo, "Navesz/rebar no GitHub")
})

test("repositorio pela metade REPROVA, e a mensagem ensina a apagar a chave", () => {
  const site = minimo()
  site.identidade.repositorio = { url: "https://github.com/Navesz/rebar" }
  const mensagem = recusa(site)
  assert.match(mensagem, /identidade\.repositorio\.rotulo/)
  assert.match(mensagem, /apague a chave "identidade\.repositorio" inteira/)
})

test("barra no fim da url do repositorio REPROVA — dois textos, um destino", () => {
  const site = minimo()
  site.identidade.repositorio = {
    url: "https://github.com/Navesz/rebar/",
    rotulo: "Navesz/rebar no GitHub",
  }
  assert.match(recusa(site), /identidade\.repositorio\.url/)
})

// ── `meta.urlBase` com CAMINHO, que é o GitHub Pages de projeto ────────────
//
// A recusa do caminho era a linha que impedia esta landing de existir: o site
// mora em `navesz.github.io/rebar-site`, e a única saída que o esquema deixava
// era escrever `navesz.github.io` — com o `og:image` apontando para a raiz de
// outro site, 404, preview vazio e nenhum erro em lugar nenhum.

test("urlBase aceita o caminho do GitHub Pages de projeto", () => {
  const site = minimo()
  site.meta.urlBase = "https://navesz.github.io/rebar-site"
  assert.equal(
    esquemaSite(site, "site").meta.urlBase,
    "https://navesz.github.io/rebar-site"
  )
})

test("urlBase com caminho E barra no fim continua REPROVANDO", () => {
  const site = minimo()
  site.meta.urlBase = "https://navesz.github.io/rebar-site/"
  assert.match(recusa(site), /meta\.urlBase/)
})

test("urlBase com caminho num host de exemplo continua REPROVANDO", () => {
  const site = minimo()
  site.meta.urlBase = "https://exemplo.com.br/projeto"
  assert.match(recusa(site), /domínio de exemplo/)
})

// ── o idioma do arquivo e a tag declarada dentro dele ─────────────────────
//
// A mutação que este teste planta é a que acontece de verdade: `es.json` nasce
// como cópia de `en.json`, o texto é traduzido, e a primeira linha fica. O
// resultado publica uma página espanhola declarando-se inglesa — o leitor de
// tela pronuncia com os fonemas errados e o buscador indexa no idioma errado,
// e as duas coisas "funcionam".

test("a tag de idioma tem de combinar com o arquivo em que ela mora", () => {
  const textos = textosMinimos()
  textos.tagDeIdioma = "en-US"
  const mensagem = recusaTextos(textos, "es")
  assert.match(mensagem, /não é o idioma do arquivo/)
  assert.match(mensagem, /conteudo\/textos\/es\.json/)
})

test("a mesma tag no arquivo certo passa", () => {
  const textos = textosMinimos()
  textos.tagDeIdioma = "es-ES"
  textos.nomeDoIdioma = "Español"
  assert.equal(esquemaTextos(textos, "es").tagDeIdioma, "es-ES")
})

// ── o alt do cartão, que mudou de arquivo em 06/09 ────────────────────────
//
// O DEFEITO QUE ISTO FECHA estava publicado nas 15 rotas: `meta.og.alt` morava
// no bloco COMPARTILHADO, então os HTMLs inglês e espanhol carregavam
// `og:image:alt` em português — no mesmo `<head>` em que `og:title` e
// `og:description` já saíam traduzidos. Toda vez que alguém compartilhava uma
// rota no WhatsApp, no Slack ou no X, o texto alternativo ia no idioma errado.
//
// Caminho, largura e altura CONTINUAM no compartilhado: são fatos da imagem, e
// o mesmo arquivo em qualquer idioma. O corte é entre o que a imagem É e o que
// alguém LÊ sobre ela.

test("alt em site.json REPROVA: o campo mudou de arquivo, não foi duplicado", () => {
  const site = minimo()
  site.meta.og.alt = "Cartão de compartilhamento da Padaria do Zé"
  const mensagem = recusa(site)
  // A recusa é a de campo desconhecido, e ela é o que impede a migração pela
  // metade: com o alt aceito nos DOIS arquivos, `lib/metadados.ts` leria um e o
  // dono editaria o outro — e a página continuaria publicando o texto antigo
  // sem nada acender.
  assert.match(mensagem, /não conhece/)
  assert.match(mensagem, /"alt"/)
})

// ── os rótulos de interface, que são a dívida de `conteudo-fora-do-codigo` ─

test("rótulo faltando REPROVA: a moldura não sai em branco nem no idioma errado", () => {
  // `naoEncontrado` e `voltarParaOInicio` entram nesta lista porque são os
  // únicos rótulos de uma página que NENHUMA rota do site renderiza: o 404 é
  // servido pelo GitHub Pages fora da árvore de rotas. Sem eles cobrados aqui,
  // um idioma podia perdê-los e só a página de erro ficaria em branco — a
  // página que, por definição, ninguém revisa.
  for (const chave of [
    "pularParaConteudo",
    "nestaPagina",
    "saida",
    "naoEncontrado",
    "voltarParaOInicio",
  ]) {
    const textos = textosMinimos()
    delete textos.rotulos[chave]
    assert.match(recusaTextos(textos), new RegExp(`rotulos\\.${chave}`))
  }
  const semRota = textosMinimos()
  delete semRota.rotulos.navegacao.modulos
  assert.match(recusaTextos(semRota), /rotulos\.navegacao\.modulos/)
})

// ── a paridade entre os três arquivos de texto ────────────────────────────
//
// POR QUE NENHUM ESQUEMA PEGA ISTO SOZINHO. `esquemaTextos` roda igual nos três
// arquivos e cobra os campos OBRIGATÓRIOS — mas `paginas`, `nota` e `saida` são
// opcionais, e o esquema aceita, com razão, um site sem documentação. O que ele
// não vê é a assimetria: `pt-br.json` com seis destaques e `en.json` com cinco
// passa nos dois validadores e publica uma home a menos em inglês.
//
// A paridade inclui o ÍNDICE das listas de propósito. Item de lista faltando é
// tradução esquecida, e a diferença aparece como `home.destaques[5]` num
// arquivo e não no outro.

const lerTextos = (idioma) =>
  JSON.parse(
    readFileSync(join(RAIZ, "conteudo", "textos", `${idioma}.json`), "utf8")
  )

/** Todo caminho de campo do arquivo, com índice de lista incluído. */
function caminhos(valor, prefixo = "", saida = new Set()) {
  if (Array.isArray(valor)) {
    valor.forEach((item, i) => caminhos(item, `${prefixo}[${i}]`, saida))
    return saida
  }
  if (valor && typeof valor === "object") {
    for (const [chave, dentro] of Object.entries(valor)) {
      const caminho = prefixo ? `${prefixo}.${chave}` : chave
      saida.add(caminho)
      caminhos(dentro, caminho, saida)
    }
  }
  return saida
}

test("os três arquivos de texto têm exatamente o mesmo conjunto de chaves", () => {
  const referencia = [...caminhos(lerTextos("en"))].sort()
  for (const idioma of ["pt-br", "es"]) {
    assert.deepEqual(
      [...caminhos(lerTextos(idioma))].sort(),
      referencia,
      `conteudo/textos/${idioma}.json divergiu de en.json: um campo traduzido a ` +
        "mais ou a menos publica uma página com um buraco naquele idioma, e nem o " +
        "esquema nem o build acusam — os dois validam cada arquivo em separado."
    )
  }
})

test("os três arquivos de texto passam pelo MESMO esquema", () => {
  for (const idioma of ["en", "pt-br", "es"]) {
    assert.doesNotThrow(() => esquemaTextos(lerTextos(idioma), idioma))
  }
})

// O QUE A PARIDADE NÃO VÊ: o campo presente nos três arquivos com o MESMO texto
// em um idioma só. É o defeito que o alt do cartão tinha antes de mudar de
// arquivo, e mover o campo não o mata sozinho — copiar `pt-br.json` para
// `en.json` e traduzir tudo menos esta linha passa no esquema e passa na
// paridade, e publica de novo `og:image:alt` em português nas rotas inglesas.
//
// A checagem vale para ESTE campo e não para os outros de propósito:
// `nomeCurto` é "rebar" nos três e `gabaritoDeTitulo` é "%s · rebar" nos três,
// com razão — são nome próprio e pontuação. O alt é frase, e frase igual em
// três idiomas é tradução que não aconteceu.
test("o alt do cartão é escrito em cada idioma, e não copiado entre eles", () => {
  const alts = ["en", "pt-br", "es"].map((idioma) => lerTextos(idioma).og.alt)
  assert.equal(
    new Set(alts).size,
    alts.length,
    "dois arquivos de texto têm o MESMO og.alt: " +
      JSON.stringify(alts) +
      " — o texto alternativo do cartão de compartilhamento é o que o leitor de " +
      "tela pronuncia quando alguém compartilha o link, e ele viaja em todas as " +
      "cinco rotas daquele idioma."
  )
})

// ── (c) o caso inverso: campo preenchido e nunca renderizado ──────────────
//
// QUEM CRAVA ESTE DENTE É O COMPILADOR, não este arquivo: o mapa `CONTATOS` de
// `components/rodape.tsx` é cobrado como TOTAL sobre as chaves de `Contato` por
// um `satisfies`, então bloco sem renderizador — e renderizador sem bloco — não
// compila. O teste abaixo é a MESMA pergunta feita sem TypeScript, e existe por
// um motivo prático: ele roda no `npm test`, que vem ANTES do `npm run build`
// na cadeia do `verificar`, e nomeia o bloco órfão em uma linha em vez de num
// erro de tipo mapeado. Se ele e o `satisfies` discordarem algum dia, o
// compilador ganha — este aqui é o alarme, não a fechadura.
//
// O CAMINHO MUDOU DE `app/page.tsx` PARA `components/rodape.tsx`, e a asserção
// não: com dois layouts raiz e três idiomas, o rodapé deixou de ser um pedaço
// da home e virou global. O mapa tinha de acompanhar — preso à home, ele só
// cobriria uma das quinze rotas.

/** As chaves de contato que o ESQUEMA conhece, derivadas dele, nunca digitadas. */
function blocosDoEsquema() {
  const contatos = { ...esquemaSite(minimo(), "site").identidade }
  delete contatos.nome
  return Object.keys(contatos).sort()
}

/** As chaves que o RODAPÉ sabe renderizar, lidas do mapa `CONTATOS`. */
function blocosDoRodape() {
  const fonte = readFileSync(join(RAIZ, "components", "rodape.tsx"), "utf8")
  const abre = fonte.indexOf("const CONTATOS = {")
  assert.notEqual(
    abre,
    -1,
    "components/rodape.tsx não tem mais o mapa `CONTATOS` — o rodapé parou de seguir"
  )
  const fecha = fonte.indexOf("} satisfies", abre)
  assert.notEqual(
    fecha,
    -1,
    "o mapa `CONTATOS` perdeu o `satisfies` — a totalidade deixou de ser cobrada"
  )
  return [...fonte.slice(abre, fecha).matchAll(/^ {2}([A-Za-z_$][\w$]*):/gm)]
    .map((m) => m[1])
    .sort()
}

test("todo bloco declarável tem renderizador no rodapé, e todo renderizador tem bloco", () => {
  assert.deepEqual(
    blocosDoRodape(),
    blocosDoEsquema(),
    "esquema e rodapé derivaram: um bloco que o dono preenche e a página nunca mostra é contato " +
      "que ele acha que publicou e não publicou — o inverso do Galegos, e igualmente mudo."
  )
})
