import { Revelar } from "@/components/revelar"
import type { Textos } from "@/conteudo/carregar"

type Destaque = Textos["home"]["destaques"][number]

/**
 * OS DESTAQUES DA HOME, e o que muda entre eles é PESO, não cor.
 *
 * Seis cartões iguais numa grade de três é a forma que não decide nada: quem
 * olha recebe seis blocos com a mesma promessa de importância e lê o primeiro,
 * ou nenhum. Aqui os seis estão todos na tela, e a hierarquia sai da
 * tipografia — corpo maior e coluna larga em cima, título menor e coluna
 * estreita no meio, uma faixa de outra cor embaixo.
 *
 * O PESO SAI DA POSIÇÃO, e a posição é a ordem editorial do JSON. É a mesma
 * divisão do mapa `ATALHOS`: a ESTRUTURA (quantos blocos, com que ênfase) é
 * decisão de layout e mora no código; o TEXTO mora em `conteudo`. Amarrar a
 * ênfase a uma palavra-chave dentro do texto — "se o título começa com tal
 * coisa, destaque" — seria fazer o layout depender de copy, e copy muda sem
 * ninguém avisar o layout.
 *
 * OS CORTES SÃO POR FATIA E NÃO POR ÍNDICE FIXO. O esquema aceita de 1 a 6
 * destaques (`conteudo/esquema.ts`), então um site gerado com três não pode
 * cair num buraco: cada faixa só existe se a fatia dela tiver item, e o que
 * sobrar do sexto em diante entra na última. Nenhum `destaques[5]` escrito à
 * mão, que é o acesso que devolve `undefined` e derruba a página.
 *
 * O NÍVEL DO CABEÇALHO SEGUE A FAIXA, E NÃO O ITEM — e a regra da home inteira
 * está escrita em `components/paginas/inicio.tsx`. Aqui ela cai assim: esta
 * faixa NÃO tem título próprio em `conteudo` (o bloco `home` só traz `titulo`,
 * `subtitulo` e `destaques`), então quem abre a faixa é a ABERTURA, em `<h2>`;
 * o meio e o fecho são itens dentro dela e são `<h3>`. Eram os três `<h2>`, e
 * o efeito era o mesmo `text-h4` valendo `<h2>` aqui e `<h3>` na esteira, na
 * MESMA página: quem navega por cabeçalho recebia seis seções de topo onde a
 * home tem quatro faixas. Nível é profundidade, não tamanho — mas duas
 * profundidades para um tamanho só é a versão pior das duas.
 */
const ABERTURA = 2
const MEIO = 5

/** "01", "02" … O zero à esquerda alinha a coluna e é numeral, não texto. */
const ordinal = (i: number) => String(i + 1).padStart(2, "0")

export function Destaques({ destaques }: { destaques: readonly Destaque[] }) {
  const abertura = destaques.slice(0, ABERTURA)
  const meio = destaques.slice(ABERTURA, MEIO)
  const fecho = destaques.slice(MEIO)

  return (
    // `px-4 sm:px-6` é a coluna do resto do site — `cabecalho.tsx:90`,
    // `rodape.tsx:106` e `moldura-de-documentacao.tsx:57`. Com o `px-6` fixo
    // que estava aqui, um telefone de 390px lia o cabeçalho a 16px da borda,
    // esta faixa a 24px e o rodapé de volta a 16px: 8px de degrau numa
    // rolagem só, na única largura em que 8px de margem ainda pesam.
    <div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
      {/* A ABERTURA: duas colunas largas, corpo em `text-body`. São o problema
          e a tese, e é onde a pessoa decide se continua lendo — e é ela que
          abre a faixa, então é dela o `<h2>`. */}
      {abertura.length ? (
        <ul className="grid gap-x-14 gap-y-12 md:grid-cols-2">
          {abertura.map((destaque, i) => (
            <li key={destaque.titulo}>
              <Revelar atraso={i * 0.06}>
                <div className="flex items-baseline gap-4">
                  <span
                    aria-hidden
                    className="font-mono text-caption text-brand tabular-nums"
                  >
                    {ordinal(i)}
                  </span>
                  <h2 className="text-h3">{destaque.titulo}</h2>
                </div>
                <p className="mt-3 text-body text-muted-foreground">
                  {destaque.texto}
                </p>
              </Revelar>
            </li>
          ))}
        </ul>
      ) : null}

      {/* O MEIO: três colunas, título um degrau abaixo e corpo em
          `text-caption`. A régua tipográfica de `globals.css` existe para
          isto — a diferença de peso vem de tokens medidos, não de um
          `text-[13px]` escolhido no olho. */}
      {meio.length ? (
        <ul className="mt-16 grid gap-x-10 gap-y-10 border-t border-border/60 pt-14 sm:grid-cols-2 lg:grid-cols-3">
          {meio.map((destaque, i) => (
            <li key={destaque.titulo}>
              <Revelar atraso={Math.min(i, 2) * 0.06}>
                <div className="flex items-baseline gap-3">
                  <span
                    aria-hidden
                    className="font-mono text-caption text-brand-subtle-foreground tabular-nums"
                  >
                    {ordinal(ABERTURA + i)}
                  </span>
                  {/* `<h3>` e não `<h2>`: item dentro da faixa que a abertura
                      já abriu. O `text-h4` é o mesmo tamanho que a esteira usa
                      nos exemplos dela, e lá também é `<h3>`. */}
                  <h3 className="text-h4">{destaque.titulo}</h3>
                </div>
                <p className="mt-2 text-caption text-muted-foreground">
                  {destaque.texto}
                </p>
              </Revelar>
            </li>
          ))}
        </ul>
      ) : null}

      {/*
       * O FECHO: faixa inteira, em óxido lavado. É o último destaque do JSON e
       * ele fecha o argumento em vez de acrescentar mais um item — dar a ele a
       * mesma caixa dos outros o esconderia no fim de uma grade.
       *
       * A TINTA É `accent-foreground` SOBRE `brand-subtle`, e o par não é
       * chutado: `accent-foreground` é o par MEDIDO de `accent` (11,87:1 no
       * claro, 11,75:1 no escuro, anotados em `globals.css`), e `brand-subtle`
       * é praticamente a mesma luminância do `accent` com mais croma — 0.955
       * contra 0.948 no claro, 0.315 contra 0.298 no escuro. Um
       * `text-foreground/80` aqui seria contraste que ninguém mediu.
       */}
      {fecho.length ? (
        <ul className="mt-16 grid gap-6">
          {fecho.map((destaque, i) => (
            <li key={destaque.titulo}>
              <Revelar>
                <div className="rounded-xl border border-brand-border bg-brand-subtle p-6 text-accent-foreground sm:p-8">
                  <div className="flex items-baseline gap-4">
                    {/* `brand-subtle-foreground` e não um `opacity-70` sobre a
                        tinta herdada: opacidade produz uma cor que ninguém
                        mediu, e o numeral tem de continuar legível sobre o
                        óxido lavado. */}
                    <span
                      aria-hidden
                      className="font-mono text-caption text-brand-subtle-foreground tabular-nums"
                    >
                      {ordinal(MEIO + i)}
                    </span>
                    {/* `<h3>` pelo mesmo motivo do meio: a faixa de óxido
                        muda a superfície e o peso do argumento, não a
                        profundidade na árvore de cabeçalhos. */}
                    <h3 className="text-h4">{destaque.titulo}</h3>
                  </div>
                  <p className="mt-3 max-w-3xl text-body">{destaque.texto}</p>
                </div>
              </Revelar>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
