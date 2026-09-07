/**
 * A ÂNCORA DE UM TÍTULO — uma função, para os dois lados do link.
 *
 * O índice "nesta página" e os `id` das seções saem do MESMO conteúdo, mas são
 * escritos em lugares diferentes: o `href="#..."` no componente do índice, o
 * `id="..."` na página. Duas funções de slug com a mesma intenção divergem no
 * primeiro caso de borda — um `trim()` a mais aqui, um caractere a menos ali —
 * e o resultado é um link que não navega para lugar nenhum. Não há 404, não há
 * erro no console, não há nada vermelho: o clique simplesmente não faz nada, e
 * o scrollspy nunca marca aquela seção. É a falha calada de sempre, e o único
 * conserto que fecha é não ter a segunda função.
 *
 * O CONTEÚDO É TRILÍNGUE, então o slug tem de aguentar acento. "Códigos de
 * saída", "Instalación" e "What is not proven yet" passam pela mesma função e
 * saem em ASCII — `normalize("NFD")` separa a letra do combinante e a faixa
 * inteira dos combinantes cai fora, que é a mesma mecânica (e o mesmo motivo)
 * de `lib/busca.ts`.
 */

// A faixa dos combinantes por escape, e não pelos caracteres em si: combinante
// solto num arquivo-fonte gruda no colchete anterior em qualquer editor e vira
// uma classe que ninguém consegue reler nem revisar.
const DIACRITICOS = /[\u0300-\u036f]/g
const NAO_ALFANUMERICO = /[^a-z0-9]+/g
const HIFEN_DA_BORDA = /^-+|-+$/g

/**
 * O slug de um título, sozinho. Serve para quem tem UM título na mão; quem tem
 * a lista inteira usa `ancorasDe`, que é o único que resolve repetição.
 */
export function ancoraDe(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(NAO_ALFANUMERICO, "-")
    .replace(HIFEN_DA_BORDA, "")
}

/**
 * As âncoras de uma lista de títulos, JÁ DESEMPATADAS e alinhadas por índice
 * com a lista de entrada.
 *
 * Duas seções com o mesmo título produzem o mesmo slug, e `id` repetido no
 * documento é inválido: `getElementById` devolve só o primeiro, então o segundo
 * item do índice passa a rolar para o primeiro — de novo sem erro nenhum na
 * tela. O conteúdo de hoje não repete título em página nenhuma, mas ele é
 * editado por quem não lê este arquivo, e o desempate custa um `Map`.
 *
 * O recuo `s<n>` é para o título que não sobra nada depois da normalização
 * (só pontuação, ou um alfabeto sem correspondência ASCII). Ele é NEUTRO de
 * propósito: um prefixo em português apareceria na URL das três versões do
 * site, e `id` não é lugar de texto de idioma nenhum.
 */
export function ancorasDe(titulos: readonly string[]): string[] {
  const vistas = new Map<string, number>()

  return titulos.map((titulo, i) => {
    const base = ancoraDe(titulo) || `s${i + 1}`
    const anteriores = vistas.get(base) ?? 0
    vistas.set(base, anteriores + 1)
    return anteriores === 0 ? base : `${base}-${anteriores + 1}`
  })
}
