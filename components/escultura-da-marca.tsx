import type { CSSProperties } from 'react'

import { InteracaoDaEscultura } from '@/components/interacao-da-escultura'
import type { Textos } from '@/conteudo/esquema'
import { FORMAS, LADO, type Barra } from '@/lib/marca'

const CAMADAS = 24
const PERFIL = 'escultura-perfil'
const RECORTE = 'escultura-recorte'

function barraDaMarca(barra: Barra, indice: number) {
  return (
    <rect
      key={indice}
      x={barra.x}
      y={barra.y}
      width={barra.largura}
      height={barra.altura}
      rx={barra.raio}
      transform={
        barra.giro
          ? `rotate(${barra.giro} ${barra.x + barra.largura / 2} ${barra.y + barra.altura / 2})`
          : undefined
      }
    />
  )
}

export function EsculturaDaMarca({ textos }: { textos: Textos['home']['escultura'] }) {
  return (
    <InteracaoDaEscultura textos={textos}>
      {/* Uma geometria compartilhada: cada fatia referencia o mesmo perfil.
          O volume já vem no HTML, mesmo sem hidratação ou acesso à GPU 3D. */}
      <svg className="escultura-definicoes" aria-hidden="true" focusable="false">
        <defs>
          <mask id={RECORTE} maskUnits="userSpaceOnUse" x="0" y="0" width={LADO} height={LADO}>
            <rect width={LADO} height={LADO} fill="white" />
            <g fill="black">
              {FORMAS.filter((forma) => forma.operacao === 'corte').map((forma, indice) =>
                barraDaMarca(forma.barra, indice),
              )}
            </g>
          </mask>
          <g id={PERFIL} mask={`url(#${RECORTE})`}>
            {FORMAS.filter((forma) => forma.operacao === 'tinta').map((forma, indice) =>
              barraDaMarca(forma.barra, indice),
            )}
          </g>
          <linearGradient id="escultura-aco" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--escultura-aco-luz)" />
            <stop offset=".32" stopColor="var(--escultura-aco-meio)" />
            <stop offset=".52" stopColor="var(--escultura-aco-luz)" />
            <stop offset="1" stopColor="var(--escultura-aco-sombra)" />
          </linearGradient>
          <linearGradient id="escultura-oxido" x1="0" y1="0" x2=".85" y2="1">
            <stop offset="0" stopColor="var(--escultura-oxido-luz)" />
            <stop offset=".45" stopColor="var(--escultura-oxido-meio)" />
            <stop offset=".7" stopColor="var(--escultura-oxido-luz)" />
            <stop offset="1" stopColor="var(--escultura-oxido-sombra)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="escultura-cenario" aria-hidden="true">
        <div className="escultura-halo" />
        <div className="escultura-orbita" />
        <div className="escultura-orbita escultura-orbita-interna" />
        <div className="escultura-sombra" />
        <div className="escultura-volume">
          {Array.from({ length: CAMADAS }, (_, indice) => (
            <svg
              key={indice}
              viewBox={`0 0 ${LADO} ${LADO}`}
              focusable="false"
              className="escultura-fatia"
              data-superficie={
                indice === CAMADAS - 1 ? 'oxido' : indice % 8 === 7 ? 'aco' : 'borda'
              }
              style={
                {
                  '--profundidade': `${(indice - (CAMADAS - 1) / 2) * 1.25}px`,
                  '--grupo': Math.floor(indice / 8) - 1,
                } as CSSProperties
              }
            >
              <use href={`#${PERFIL}`} />
            </svg>
          ))}
        </div>
        <span className="escultura-mira escultura-mira-superior" />
        <span className="escultura-mira escultura-mira-inferior" />
      </div>
    </InteracaoDaEscultura>
  )
}
