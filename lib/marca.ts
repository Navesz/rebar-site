// A GEOMETRIA DA MARCA, em um lugar só.
//
// O "R" do rebar é um vergalhão: haste vertical, arco fechado e perna
// diagonal, com nervuras cortadas nas bordas — as deformações que fazem o
// aço morder o concreto. Nada aqui é caminho SVG escrito à mão: a marca é
// uma lista de barras de canto arredondado, somadas ou subtraídas.
//
// O motivo de ser dado assim, e não como um `<path d="…">`: o mesmo desenho
// precisa sair em três formatos — SVG no componente React, SVG no ícone que
// o Next serve, e PNG rasterizado por `ferramental/gerar-icones.mjs`. Caminho
// escrito à mão viraria três cópias que divergem na primeira correção. Com a
// forma declarada, o rasterizador calcula a distância até cada barra e o
// componente emite `<rect>` — mesma fonte, três saídas.
//
// O sistema de coordenadas é uma caixa 100×100. O desenho ocupa x 18..82 e
// y 8..92, deixando margem para o ícone não encostar na borda do quadrado.

export type Barra = {
  // Canto superior esquerdo e tamanho, ANTES do giro.
  x: number
  y: number
  largura: number
  altura: number
  raio: number
  // Giro em graus, no sentido horário, em torno do centro da própria barra.
  giro?: number
}

export type Forma = {
  barra: Barra
  // "tinta" soma a barra ao desenho; "corte" a remove.
  operacao: "tinta" | "corte"
}

export const LADO = 100

// A espessura do vergalhão. Todas as barras da marca usam a mesma, porque é
// uma barra só, dobrada — bitola que varia no meio do desenho vira letra, não
// vergalhão.
const BITOLA = 16
const RAIO = 3

// A perna diagonal: declarada pelos dois pontos que ela liga, e não por
// largura e giro, porque é assim que se pensa nela ao desenhar.
function barraEntre(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  espessura: number,
  raio: number
): Barra {
  const comprimento = Math.hypot(x2 - x1, y2 - y1) + espessura
  const giro = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI
  return {
    x: (x1 + x2) / 2 - comprimento / 2,
    y: (y1 + y2) / 2 - espessura / 2,
    largura: comprimento,
    altura: espessura,
    raio,
    giro,
  }
}

// As nervuras — os sulcos que fazem o aço morder o concreto. Cada uma
// ATRAVESSA a haste de lado a lado, que é como a peça real é: entalhe só na
// borda lê como avaria, não como nervura.
//
// A folga é de 3 unidades numa caixa de 100. A 16 px isso dá 0,48 px: os
// pedaços voltam a encostar e a haste vira barra sólida, que é o que se quer
// no favicon. A 512 px o sulco aparece inteiro.
const FOLGA = 3

function nervura(y: number): Forma {
  return {
    barra: {
      x: MEIO_DA_HASTE - 20,
      y: y - FOLGA / 2,
      largura: 40,
      altura: FOLGA,
      raio: FOLGA / 2,
      giro: -35,
    },
    operacao: "corte",
  }
}

const MEIO_DA_HASTE = 16 + BITOLA / 2

export const FORMAS: readonly Forma[] = [
  // Haste — a perna esquerda do R, de cima a baixo.
  {
    barra: { x: 16, y: 8, largura: BITOLA, altura: 84, raio: RAIO },
    operacao: "tinta",
  },
  // Braço de cima e braço do meio fecham o arco; a lateral direita liga os
  // dois. O vazio que sobra entre eles (x 32..68, y 24..44) é o olho do R.
  {
    barra: { x: 16, y: 8, largura: 68, altura: BITOLA, raio: RAIO },
    operacao: "tinta",
  },
  {
    barra: { x: 68, y: 8, largura: BITOLA, altura: 52, raio: RAIO },
    operacao: "tinta",
  },
  {
    barra: { x: 16, y: 44, largura: 68, altura: BITOLA, raio: RAIO },
    operacao: "tinta",
  },
  // Perna diagonal, saindo de baixo do arco.
  { barra: barraEntre(50, 60, 77, 85, BITOLA, RAIO), operacao: "tinta" },

  // Nervuras só no trecho da haste que sobra abaixo do arco: é o único lugar
  // onde o vergalhão aparece como vergalhão, e não como letra.
  nervura(67),
  nervura(75),
  nervura(83),
]

// O caminho de recorte do ícone quadrado: um quadrado de canto arredondado do
// tamanho da caixa. Fica aqui para o PNG e o SVG concordarem sobre o raio.
export const RAIO_DO_LADRILHO = 22
