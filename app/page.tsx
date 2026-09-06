import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Boxes, Download, Terminal } from "lucide-react"

import { Comando } from "@/components/comando"
import { Revelar } from "@/components/revelar"
import { Card, CardContent } from "@/components/ui/card"
import { linkWhatsapp, site, type Contato } from "@/conteudo/carregar"

/**
 * OS ATALHOS DA HOME saem daqui e nao do conteudo, e a divisao e a mesma do
 * link do WhatsApp: o DESTINO e estrutura do site (existe porque a rota
 * existe), o TEXTO que descreve cada pagina ja mora em `conteudo` como
 * `paginas.<x>.titulo`. Duplicar o titulo aqui criaria a segunda fonte que
 * diverge no dia em que alguem renomear a pagina.
 */
const ATALHOS = [
  { href: "/instalacao", chave: "instalacao", Icone: Download },
  { href: "/uso", chave: "uso", Icone: Terminal },
  { href: "/modulos", chave: "modulos", Icone: Boxes },
  { href: "/docs", chave: "docs", Icone: BookOpen },
] as const

/**
 * NENHUM LITERAL DE CONTEÚDO DENTRO. Todo texto visível é `{expressão}` lida de
 * `conteudo/site.json`; o que sobra em `.tsx` é estrutura e classe do Tailwind.
 *
 * O link do WhatsApp é o caso que dá nome à §12.3: o FORMATO do link é código
 * (não muda de negócio para negócio), o DESTINATÁRIO é conteúdo validado. O PR
 * `Navesz/Galegos#1` errou o corte ao mandar o destinatário para env var — o
 * build passava e o link subia sem ninguém do outro lado.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ESTE ARQUIVO RENDERIZA O QUE FOI DECLARADO, E NÃO QUEBRA COM O QUE FALTOU.
 *
 * Até 02/09 ele assumia que telefone, e-mail e endereço existiam sempre, e o
 * esquema os exigia de todo site para que a suposição fosse verdade. Era a
 * §12.3 lida errado: ela decidiu que o telefone MORA aqui e é validado, não que
 * todo negócio TENHA telefone. Agora os três são blocos condicionais, e a
 * declaração é a presença da chave em `conteudo/site.json`.
 *
 * O MAPA `CONTATOS` É O DENTE, e ele fecha as duas direções do defeito de uma
 * vez, sem regra nova, sem heurística e sem varrer arquivo:
 *
 *   · bloco DECLARADO e não renderizado — alguém escreve o WhatsApp, a home não
 *     tem o botão, e a pessoa acha que publicou o contato. Apagar a entrada
 *     daqui deixa o mapa incompleto perante o `satisfies` abaixo: NÃO COMPILA.
 *   · bloco RENDERIZADO e vazio — o desastre do Galegos, link `wa.me` sem
 *     destinatário. O valor é `T | null` e `linkWhatsapp` recebe o bloco, não o
 *     site: sem estreitar o `null`, NÃO COMPILA.
 *   · bloco NOVO no esquema — um Instagram, um horário — sem lugar na home:
 *     falta a chave no mapa e o `satisfies` reprova. NÃO COMPILA.
 *
 * O limite, dito de frente: apagar a seção inteira do JSX abaixo, mapa
 * incluído, não é pego por tipo nenhum. Isso é o dono removendo a home, não uma
 * deriva silenciosa — e o `npm run lint` do projeto acusa o que ficar sem uso.
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

export default function Pagina() {
  // Apelido de um nível só, que é o que o passo `blocos` do rebar sabe
  // resolver ao conferir todo `site.<campo>` contra a forma validada.
  const zap = site.identidade.whatsapp
  const repo = site.identidade.repositorio

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-14 px-6 py-16">
      <Revelar>
        <header className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            {site.home.titulo}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {site.home.subtitulo}
          </p>
          {/* A chamada principal É o botão de WhatsApp, então ela existe exatamente
            quando o bloco existe. Sem o bloco a home fica sem botão de propósito:
            inventar uma chamada para o e-mail seria o gerador escrevendo copy que
            ninguém aprovou, e copy que ninguém aprovou é o que vira link morto. */}
          {zap ? (
            <a
              className="inline-flex w-fit items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              href={linkWhatsapp(zap)}
              rel="noopener noreferrer"
              target="_blank"
            >
              {zap.chamadaAcao}
            </a>
          ) : (
            repo && (
              <a
                className="inline-flex w-fit items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                href={repo.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {repo.rotulo}
              </a>
            )
          )}
        </header>
      </Revelar>

      {/* O PRIMEIRO COMANDO VEM ANTES DE QUALQUER EXPLICACAO. Quem chega
          numa landing de ferramenta de linha de comando quer saber o que
          digitar; o resto da pagina existe para quem ficou. */}
      <Revelar atraso={0.05}>
        <Comando>npx github:Navesz/rebar .</Comando>
      </Revelar>

      <ul className="grid gap-6 sm:grid-cols-3">
        {site.home.destaques.map((destaque, i) => (
          <li key={destaque.titulo}>
            <Revelar atraso={Math.min(i, 5) * 0.05} className="h-full">
              <Card className="h-full">
                <CardContent className="flex flex-col gap-2">
                  <h2 className="font-medium">{destaque.titulo}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {destaque.texto}
                  </p>
                </CardContent>
              </Card>
            </Revelar>
          </li>
        ))}
      </ul>

      {/* Os atalhos so aparecem se as paginas existirem: site gerado sem
          documentacao nao ganha quatro links para lugar nenhum. */}
      {site.paginas ? (
        <nav aria-label="Seções" className="grid gap-3 sm:grid-cols-2">
          {ATALHOS.map(({ href, chave, Icone }, i) => {
            const pagina = site.paginas?.[chave]
            if (!pagina) return null
            return (
              <Revelar key={href} atraso={Math.min(i, 3) * 0.05}>
                <Link
                  href={href}
                  className="group flex items-start gap-3 rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Icone
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <span className="flex-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      {pagina.titulo}
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {pagina.resumo}
                    </span>
                  </span>
                </Link>
              </Revelar>
            )
          })}
        </nav>
      ) : null}

      <footer className="flex flex-col gap-1 border-t border-border/60 pt-8 text-sm text-muted-foreground">
        <p>{site.identidade.nome}</p>
        {Object.entries(CONTATOS).map(([bloco, montar]) => {
          const linha = montar(site.identidade)
          // Bloco ausente devolve `null` e não vira parágrafo vazio: o rodapé de
          // um site só com e-mail tem uma linha, não três com dois buracos.
          return linha ? <p key={bloco}>{linha}</p> : null
        })}
      </footer>
    </div>
  )
}
