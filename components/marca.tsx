import { cn } from "@/lib/utils"

import { FORMAS, LADO, type Barra } from "@/lib/marca"

// O SÍMBOLO DA MARCA. A geometria vem de `lib/marca.ts` — a mesma lista de
// barras que `ferramental/gerar-icones.mjs` rasteriza para o favicon e para o
// cartão de compartilhamento. Aqui ela vira `<rect>`; lá vira pixel.
//
// A tinta é `currentColor`: o símbolo herda a cor de quem o coloca, então o
// mesmo componente serve o cabeçalho, o rodapé e o hero sem variante de cor.

// As nervuras são recortes, e recorte em SVG pede máscara — que pede um id.
// O id é fixo, e não gerado: as máscaras de todas as instâncias teriam
// exatamente o mesmo conteúdo, então uma só resolve a página inteira. Gerar um
// id por instância custaria transformar isto em componente de cliente.
const MASCARA = "marca-nervuras"

function retangulo(barra: Barra, chave: number, preenchimento: string) {
  const giro = barra.giro
    ? `rotate(${barra.giro} ${barra.x + barra.largura / 2} ${
        barra.y + barra.altura / 2
      })`
    : undefined

  return (
    <rect
      key={chave}
      x={barra.x}
      y={barra.y}
      width={barra.largura}
      height={barra.altura}
      rx={barra.raio}
      fill={preenchimento}
      transform={giro}
    />
  )
}

export function Marca({ className, ...resto }: React.ComponentProps<"svg">) {
  const tinta = FORMAS.filter((f) => f.operacao === "tinta")
  const corte = FORMAS.filter((f) => f.operacao === "corte")

  return (
    <svg
      viewBox={`0 0 ${LADO} ${LADO}`}
      aria-hidden="true"
      focusable="false"
      className={cn("size-6 shrink-0", className)}
      {...resto}
    >
      <mask id={MASCARA} maskUnits="userSpaceOnUse">
        <rect width={LADO} height={LADO} fill="white" />
        {corte.map((f, i) => retangulo(f.barra, i, "black"))}
      </mask>
      <g mask={`url(#${MASCARA})`} fill="currentColor">
        {tinta.map((f, i) => retangulo(f.barra, i, "currentColor"))}
      </g>
    </svg>
  )
}
