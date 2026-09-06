import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * Se a viewport é de celular, lido de uma media query.
 *
 * `useSyncExternalStore` e não `useState` + `useEffect`, e o motivo não é
 * estilo: a versão do shadcn chama `setIsMobile` dentro do efeito, e o lint
 * (`react-hooks/set-state-in-effect`) reprova — com razão. Media query é um
 * store EXTERNO ao React, e ler store externo com estado espelhado é o padrão
 * que produz um primeiro quadro errado e um re-render logo depois.
 *
 * O terceiro argumento é o instantâneo do servidor. Este site é `output:
 * "export"`, então tudo passa por pré-renderização, onde `window` não existe:
 * sem ele, o build quebra. `false` é a escolha certa porque o HTML estático é
 * um só para todo mundo — assumir desktop e corrigir na hidratação erra menos
 * que o contrário.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    (mudou) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      mql.addEventListener('change', mudou)
      return () => mql.removeEventListener('change', mudou)
    },
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false,
  )
}
