import { AtalhosDaDocumentacao } from "@/components/atalhos-da-documentacao"
import { Destaques } from "@/components/destaques"
import { EsteiraDoPortao } from "@/components/esteira-do-portao"
import { Hero } from "@/components/hero"
import { textos, type Idioma } from "@/conteudo/carregar"

/**
 * A HOME, UMA VEZ, PARA OS TRÊS IDIOMAS.
 *
 * `page.tsx` é casca: escolhe o idioma e chama isto. A alternativa — uma cópia
 * do JSX por idioma — publicaria três homes que divergem na primeira mudança de
 * layout, e a que ficou para trás continuaria respondendo 200 sem acusar nada.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * A PÁGINA É UMA MONTAGEM, e este arquivo é só a ordem das quatro faixas:
 *
 *   1. `Hero`                   — marca, título, o que é, para onde ir, e o
 *                                 comando. Fundo de nervura com paralaxe.
 *   2. `Destaques`              — os seis destaques, com peso tipográfico
 *                                 diferente por faixa em vez de seis cartões
 *                                 iguais.
 *   3. `EsteiraDoPortao`        — a régua rodando, presa à rolagem: é onde o
 *                                 GSAP se justifica.
 *   4. `AtalhosDaDocumentacao`  — os quatro destinos, cada um com título e
 *                                 resumo lidos de `paginas.<chave>`.
 *
 * O rodapé NÃO entra aqui: ele é global, mora em `components/rodape.tsx` e é
 * montado pela `Casca`. Repeti-lo na home publicaria dois rodapés na mesma
 * página, e o de baixo continuaria respondendo por um conteúdo que ninguém
 * mantém.
 *
 * CADA FAIXA TEM O PRÓPRIO CONTÊINER, e não há um `max-w-5xl` só por fora.
 * Duas delas sangram até a borda da tela — a nervura do hero e o fundo da
 * esteira —, e um contêiner comum as prenderia na largura do texto, que é
 * exatamente o efeito que elas existem para não ter. O que se repete é uma
 * classe de layout, não uma fonte de verdade.
 *
 * A ÁRVORE DE CABEÇALHOS DA HOME, e a regra é uma frase: NÍVEL É PROFUNDIDADE,
 * TAMANHO É PESO — e nenhum tamanho pode valer dois níveis na mesma página.
 *
 *   · `<h1>`, um só, e é o título do hero.
 *   · `<h2>` abre faixa. Na esteira é `uso.titulo`, que a faixa tem em
 *     `conteudo`. Nos destaques a faixa NÃO tem título próprio — o bloco `home`
 *     traz `titulo`, `subtitulo` e `destaques`, e nada mais —, então quem abre
 *     é a abertura, os dois primeiros destaques. Sem isso a home saltaria de
 *     `<h1>` direto para `<h3>`.
 *   · `<h3>` é item dentro de uma faixa já aberta: os quatro destaques
 *     restantes e os cinco exemplos da esteira.
 *   · os quatro atalhos são links num `<nav>`, não títulos, então não entram na
 *     árvore e não abrem buraco nela.
 *
 * O que isso conserta: os SEIS destaques eram `<h2>`, e o resultado é que o
 * mesmo `text-h4` valia `<h2>` nos destaques e `<h3>` na esteira, na mesma
 * rolagem. Quem navega por cabeçalho recebia sete seções de topo numa página
 * que tem quatro faixas — e a árvore dizia "peers" exatamente onde a
 * tipografia dizia "subordinado". Agora a régua fecha nos dois sentidos: na
 * home, `text-h2` e `text-h3` são `<h2>`; `text-h4` é `<h3>`.
 *
 * NENHUM `"use client"` NESTE ARQUIVO, nem nas quatro faixas. Este site é
 * `output: "export"`: o HTML que sai do build é o que o rastreador de busca e
 * quem está sem JS recebem, e é ele que tem de estar completo. O `"use client"`
 * mora só em `components/coreografia-da-home.tsx` e em `components/revelar.tsx`
 * — que recebem o molde já renderizado como `children`, então nem o carregador
 * de conteúdo nem os três arquivos de texto atravessam para o navegador.
 *
 * NENHUM LITERAL DE CONTEÚDO EM LUGAR NENHUM DA ÁRVORE DA HOME. Todo texto
 * visível é `{expressão}` lida de `conteudo/textos/<idioma>.json`; o que sobra
 * em `.tsx` é estrutura e classe do Tailwind. O comando de instalação, em
 * particular, é LIDO de `paginas.instalacao.passos[0]` — escrito no JSX seria a
 * mesma invocação em dois lugares, e no dia em que ela mudar só um dos dois
 * muda.
 * ──────────────────────────────────────────────────────────────────────────
 */
export function Inicio({ idioma }: { idioma: Idioma }) {
  const t = textos(idioma)

  return (
    <>
      <Hero idioma={idioma} />
      {/* Os destaques recebem a LISTA e não o idioma: eles não precisam de
          mais nada do conteúdo, e um componente que só sabe do dado que
          desenha é um que não passa a depender do resto do arquivo depois. */}
      <Destaques destaques={t.home.destaques} />
      <EsteiraDoPortao idioma={idioma} />
      <AtalhosDaDocumentacao idioma={idioma} />
    </>
  )
}
