import type { ReactNode } from "react"

import { linkWhatsapp, site, type Contato } from "@/conteudo/carregar"

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
  repositorio: ({ repositorio }: Contato) =>
    repositorio && (
      <a href={repositorio.url} rel="noopener noreferrer" target="_blank">
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
} satisfies { [Bloco in keyof Contato]: (contato: Contato) => ReactNode }

export function Rodape() {
  return (
    <footer className="mx-auto flex max-w-3xl flex-col gap-1 border-t border-border/60 px-6 py-8 text-sm text-muted-foreground">
      <p>{site.identidade.nome}</p>
      {Object.entries(CONTATOS).map(([bloco, montar]) => {
        const linha = montar(site.identidade)
        // Bloco ausente devolve `null` e não vira parágrafo vazio: o rodapé de
        // um site só com e-mail tem uma linha, não três com dois buracos.
        return linha ? <p key={bloco}>{linha}</p> : null
      })}
    </footer>
  )
}
