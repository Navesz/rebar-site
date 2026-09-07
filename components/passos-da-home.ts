/**
 * OS NOMES DOS PASSOS DA COREOGRAFIA DA HOME — o contrato entre o molde, que é
 * de servidor, e a partitura, que é de cliente.
 *
 * POR QUE ELE MORA NUM ARQUIVO SÓ DELE, e não junto da partitura em
 * `components/coreografia-da-home.tsx`. Aquele arquivo abre com `"use client"`,
 * e módulo de cliente importado por componente de SERVIDOR não devolve os
 * valores: o empacotador troca cada exportação por uma referência opaca. Um
 * `PASSO_DO_HERO.titulo` lido do lado do servidor sairia `undefined`, o
 * `data-entrada` nem seria emitido no HTML, o seletor não casaria com nada — e
 * a animação sumiria EM SILÊNCIO, sem erro de build, sem erro de tipo e sem
 * erro no console. É a mesma classe de defeito que o §12.3 persegue, com outra
 * mecânica.
 *
 * Este arquivo não tem diretiva nenhuma de propósito: é módulo comum, os dois
 * lados o importam de verdade, e o valor que chega é o valor que está escrito
 * aqui.
 *
 * POR QUE UM OBJETO E NÃO A STRING DIGITADA NOS DOIS LADOS. Um seletor que não
 * casa com elemento nenhum não quebra build, não quebra tipo e não imprime
 * nada: ele só apaga a animação. Com o nome saindo daqui, renomear um passo é
 * erro de compilação nos dois arquivos ao mesmo tempo.
 *
 * O CONTRATO É UM ATRIBUTO, e não um componente de cliente por passo, porque
 * um componente por passo empurraria o texto do hero — e com ele o carregador
 * de conteúdo e os três arquivos de idioma — para dentro do bundle do
 * navegador. É a armadilha já anotada em `components/navegacao.tsx`.
 */

/** Os cinco tempos da chegada do hero, na ordem em que entram. */
export const PASSO_DO_HERO = {
  marca: "marca",
  titulo: "titulo",
  subtitulo: "subtitulo",
  acao: "acao",
  painel: "painel",
} as const

export type PassoDoHero = (typeof PASSO_DO_HERO)[keyof typeof PASSO_DO_HERO]

/** Os alvos da esteira presa à rolagem. */
export const PASSO_DA_ESTEIRA = {
  /** Cada linha do placar impresso pelo checker. */
  linha: "linha",
  /** O trilho de progresso que acompanha a lista. */
  fita: "fita",
  /** Cada exemplo de invocação. */
  item: "item",
} as const

export type PassoDaEsteira =
  (typeof PASSO_DA_ESTEIRA)[keyof typeof PASSO_DA_ESTEIRA]

/** O atributo que o molde escreve e a partitura procura. Um lugar só. */
export const noHero = (passo: PassoDoHero) => `[data-entrada="${passo}"]`
export const naEsteira = (passo: PassoDaEsteira) => `[data-esteira="${passo}"]`
