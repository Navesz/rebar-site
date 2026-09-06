import Link from "next/link"
import { ArrowRight, BookOpen, Boxes, Download, Terminal } from "lucide-react"

import { Comando } from "@/components/comando"
import { Revelar } from "@/components/revelar"
import { Card, CardContent } from "@/components/ui/card"
import {
  caminhoDe,
  linkWhatsapp,
  site,
  textos,
  type Idioma,
} from "@/conteudo/carregar"
import { rotaDe } from "@/lib/rotas"

/**
 * OS ATALHOS DA HOME saem daqui e nao do conteudo, e a divisao e a mesma do
 * link do WhatsApp: o DESTINO e estrutura do site (existe porque a rota
 * existe), o TEXTO que descreve cada pagina ja mora em `conteudo` como
 * `paginas.<x>.titulo`. Duplicar o titulo aqui criaria a segunda fonte que
 * diverge no dia em que alguem renomear a pagina.
 */
const ATALHOS = [
  { chave: "instalacao", Icone: Download },
  { chave: "uso", Icone: Terminal },
  { chave: "modulos", Icone: Boxes },
  { chave: "docs", Icone: BookOpen },
] as const

/**
 * A HOME, UMA VEZ, PARA OS TRÊS IDIOMAS.
 *
 * `page.tsx` é casca: escolhe o idioma e chama isto. A alternativa — uma cópia
 * do JSX por idioma — publicaria três homes que divergem na primeira mudança de
 * layout, e a que ficou para trás continuaria respondendo 200 sem acusar nada.
 *
 * NENHUM LITERAL DE CONTEÚDO DENTRO. Todo texto visível é `{expressão}` lida de
 * `conteudo/textos/<idioma>.json`; o que sobra em `.tsx` é estrutura e classe
 * do Tailwind.
 *
 * O link do WhatsApp é o caso que dá nome à §12.3: o FORMATO do link é código
 * (não muda de negócio para negócio), o DESTINATÁRIO é conteúdo validado. O PR
 * `Navesz/Galegos#1` errou o corte ao mandar o destinatário para env var — o
 * build passava e o link subia sem ninguém do outro lado.
 */
export function Inicio({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)
  // Apelido de um nível só, que é o que o passo `blocos` do rebar sabe
  // resolver ao conferir todo `site.<campo>` contra a forma validada.
  const zap = site.identidade.whatsapp
  const repo = site.identidade.repositorio

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-14 px-6 py-16">
      <Revelar>
        <header className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            {t.home.titulo}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {t.home.subtitulo}
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
          digitar; o resto da pagina existe para quem ficou.
          Ele e LIDO do primeiro passo da instalacao, e nao digitado aqui:
          escrito no JSX, seria o mesmo comando em dois lugares, e o dia em
          que a invocacao mudar so um dos dois muda. */}
      {t.paginas ? (
        <Revelar atraso={0.05}>
          <Comando>{t.paginas.instalacao.passos[0].comando}</Comando>
        </Revelar>
      ) : null}

      <ul className="grid gap-6 sm:grid-cols-3">
        {t.home.destaques.map((destaque, i) => (
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
      {t.paginas ? (
        <nav
          aria-label={t.rotulos.secoes}
          className="grid gap-3 sm:grid-cols-2"
        >
          {ATALHOS.map(({ chave, Icone }, i) => {
            const pagina = t.paginas?.[chave]
            if (!pagina) return null
            const href = caminhoDe(idioma, rotaDe(chave))
            return (
              <Revelar key={chave} atraso={Math.min(i, 3) * 0.05}>
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
    </div>
  )
}
