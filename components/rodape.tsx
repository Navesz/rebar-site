import type { ReactNode } from "react"

import { Marca } from "@/components/marca"
import {
  linkWhatsapp,
  site,
  textos,
  type Contato,
  type Idioma,
  type Textos,
} from "@/conteudo/carregar"

/**
 * OS RÓTULOS QUE O RODAPÉ SABE LER, e eles atravessam o mapa como SEGUNDO
 * PARÂMETRO em vez de serem lidos dentro de cada renderizador.
 *
 * O mapa é uma constante de módulo — ele não tem idioma para consultar. E o
 * idioma tem de chegar até ele: sem isso o único link do rodapé saía em
 * português nas 15 rotas (ver `CONTATOS.repositorio`).
 */
type Rotulos = Textos["rotulos"]

/**
 * O RODAPÉ GLOBAL, e ele serve os três idiomas sem uma linha por idioma.
 *
 * Tudo que ele mostra é `identidade`, que mora em `conteudo/site.json` — o
 * arquivo COMPARTILHADO. Telefone, e-mail e endereço são o mesmo fato em
 * qualquer idioma, e traduzi-los seria fabricar três números para um só
 * negócio: o Galegos multiplicado por três, com o agravante de que a correção
 * feita num arquivo e esquecida nos outros não acende nada.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * O MAPA `CONTATOS` É O DENTE, e ele fecha as duas direções do defeito de uma
 * vez, sem regra nova, sem heurística e sem varrer arquivo:
 *
 *   · bloco DECLARADO e não renderizado — alguém escreve o WhatsApp, o rodapé
 *     não tem a linha, e a pessoa acha que publicou o contato. Apagar a entrada
 *     daqui deixa o mapa incompleto perante o `satisfies` abaixo: NÃO COMPILA.
 *   · bloco RENDERIZADO e vazio — o desastre do Galegos, link `wa.me` sem
 *     destinatário. O valor é `T | null` e `linkWhatsapp` recebe o bloco, não o
 *     site: sem estreitar o `null`, NÃO COMPILA.
 *   · bloco NOVO no esquema — um Instagram, um horário — sem lugar no rodapé:
 *     falta a chave no mapa e o `satisfies` reprova. NÃO COMPILA.
 *
 * ELE MORAVA EM `app/page.tsx`, e mudou de casa junto com a árvore de rotas.
 * Preso à home, o mapa só valia para UMA página de UM idioma; num site com dois
 * layouts raiz e quinze rotas, o rodapé é global e o dente tem de morar onde o
 * rodapé mora. A asserção é a mesma — o que mudou foi o endereço.
 *
 * O limite, dito de frente: apagar a seção inteira do JSX abaixo, mapa
 * incluído, não é pego por tipo nenhum. Isso é o dono removendo o rodapé, não
 * uma deriva silenciosa — e o `npm run lint` do projeto acusa o que ficar sem
 * uso.
 * ─────────────────────────────────────────────────────────────────────────
 */
const CONTATOS = {
  // Acrescentado junto com o bloco `identidade.repositorio` do esquema. Sem
  // esta entrada o `satisfies` abaixo reprova com TS1360 — medido em 02/09,
  // antes de escrevê-la, e é o item (c) do cabeçalho funcionando de verdade.
  //
  // O TEXTO SÃO DUAS COISAS DIFERENTES, e essa é a correção de 06/09. Antes
  // saía só `repositorio.rotulo`, que vem de `site.json` — o arquivo
  // COMPARTILHADO — e valia "Navesz/rebar no GitHub". Medido: as 15 rotas, as
  // dez que não são portuguesas incluídas, terminavam nessa frase, e ela é o
  // ÚLTIMO texto da página e o único link do rodapé. Agora:
  //
  //   · `rotulos.repositorio` é a palavra que se lê — "Repository",
  //     "Repositório", "Repositorio" — e ela é INTERFACE, então é traduzida.
  //     É o mesmo rótulo que `components/hero.tsx` e `components/cabecalho.tsx`
  //     já usavam; o rodapé era o único lugar que discordava dos dois.
  //   · `repositorio.rotulo` é a IDENTIDADE do repositório, e por isso continua
  //     vindo do compartilhado: `Navesz/rebar` é dono e nome, do jeito que o
  //     próprio GitHub escreve, e nome próprio não se traduz. Ele passou a ser
  //     escrito assim no JSON — o "no GitHub" que sobrava ali era a metade
  //     portuguesa da frase, e quem diz o destino é o `href`.
  //
  // Os dois juntos, e não um só: com a palavra sozinha o link não diz PARA QUAL
  // repositório vai; com o nome sozinho ele não diz o que é.
  repositorio: ({ repositorio }: Contato, rotulos: Rotulos) =>
    repositorio && (
      <a href={repositorio.url} rel="noopener noreferrer" target="_blank">
        {rotulos.repositorio}
        {" · "}
        {repositorio.rotulo}
      </a>
    ),

  whatsapp: ({ whatsapp }: Contato) =>
    whatsapp && (
      <a
        href={linkWhatsapp(whatsapp)}
        rel="noopener noreferrer"
        target="_blank"
      >
        {whatsapp.exibicao}
      </a>
    ),

  email: ({ email }: Contato) =>
    email && <a href={`mailto:${email}`}>{email}</a>,

  endereco: ({ endereco }: Contato) =>
    endereco && (
      <address className="not-italic">
        {endereco.logradouro}
        {", "}
        {endereco.bairro}
        {" — "}
        {endereco.cidade}
        {"/"}
        {endereco.uf}
        {" · "}
        {endereco.cep}
      </address>
    ),
  // `satisfies`, e não anotação de tipo: anotação aceitaria o mapa a MENOS
  // (o objeto seria só um `Renderizadores` incompleto na hora de escrever) e
  // apagaria os tipos de retorno de cada entrada. `satisfies` cobra a chave que
  // falta E a chave que sobra — bloco apagado do esquema com renderizador
  // esquecido aqui também não compila.
  //
  // Sem `-?` de propósito: as chaves de `Contato` são OBRIGATÓRIAS com valor
  // `T | null`, nunca `?`, porque `objeto()` do esquema sempre escreve todas.
  // O `-?` estava aqui e foi medido em 02/09: com ele fora, apagar um
  // renderizador continua dando TS1360. Modificador que não muda nada é
  // comentário mentindo que é código.
  //
  // A ASSINATURA GANHOU UM SEGUNDO PARÂMETRO em 06/09 — os rótulos do idioma —,
  // e a forma que o `satisfies` cobra é a mesma: as chaves de `Contato`, todas,
  // nenhuma a mais. Renderizador que não precisa do idioma simplesmente não
  // declara o parâmetro; TypeScript aceita a função de menos parâmetros no
  // lugar da de mais, então três das quatro entradas ficaram como estavam.
} satisfies {
  [Bloco in keyof Contato]: (contato: Contato, rotulos: Rotulos) => ReactNode
}

/**
 * A MOLDURA em volta do mapa — e ela larga em `max-w-6xl`, a mesma do
 * cabeçalho: rodapé alinhado numa coluna e cabeçalho noutra é a assimetria que
 * ninguém sabe nomear e todo mundo vê.
 *
 * O `<div>` da linha de contato era um `<p>`, e a troca conserta HTML inválido:
 * o renderizador de `endereco` devolve um `<address>`, que é conteúdo de fluxo
 * e não pode morar dentro de um parágrafo. O navegador fecha o `<p>` sozinho
 * antes do `<address>` — a árvore que ele monta deixa de ser a que o servidor
 * mandou, e o React 19 acusa isso como erro de hidratação. É exatamente o tipo
 * de defeito que só aparece quando o dono preenche o bloco de endereço.
 */
export function Rodape({ idioma }: { idioma: Idioma }) {
  // Só os rótulos, e não o `Textos` inteiro: o rodapé não tem página, não tem
  // título e não tem documentação — o que ele lê de traduzido é moldura.
  const rotulos = textos(idioma).rotulos

  return (
    <footer className="mt-24 border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between md:gap-12">
        <div className="flex shrink-0 items-center gap-2.5 text-foreground">
          <Marca className="size-6 text-brand" />
          <span className="font-heading text-base font-semibold tracking-tight">
            {site.identidade.nome}
          </span>
        </div>

        {/* O sublinhado dos links vem daqui, e não de dentro do mapa: o mapa é
            o dente que o `satisfies` cobra e o teste lê, e enfeitar cada
            renderizador espalharia estilo por um lugar que existe para outra
            coisa. */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end md:text-right [&_a]:underline [&_a]:decoration-border [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-foreground [&_a:hover]:decoration-brand">
          {Object.entries(CONTATOS).map(([bloco, montar]) => {
            const linha = montar(site.identidade, rotulos)
            // Bloco ausente devolve `null` e não vira linha vazia: o rodapé de
            // um site só com e-mail tem uma linha, não três com dois buracos.
            return linha ? <div key={bloco}>{linha}</div> : null
          })}
        </div>
      </div>
    </footer>
  )
}
