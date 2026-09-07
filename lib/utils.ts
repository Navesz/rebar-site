import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * O `cn` DO PROJETO — e o ÚNICO, de propósito.
 *
 * O `tailwind-merge` de fábrica não conhece a escala tipográfica que o
 * `app/globals.css` declara no `@theme inline` (`text-h1` a `text-caption`).
 * Sem a extensão abaixo ele classifica esses tokens como `text-<cor>`, e o
 * resultado é que um token da escala NÃO derruba o `text-*` de tamanho que já
 * estava na classe-base: as duas classes sobrevivem e quem decide o tamanho
 * passa a ser a ORDEM DA FOLHA DE ESTILO, não o autor.
 *
 * Medido no build publicado, antes desta correção: `components/trilha.tsx`
 * pedia `text-caption` (13px) ao `BreadcrumbList`, cuja base traz `text-sm`, e
 * o atributo saía com as duas em 12 páginas de `out/`. No CSS compilado
 * `.text-caption` fica no deslocamento 24409 e `.text-sm` no 24616 — mesma
 * especificidade, `text-sm` depois, `text-sm` vence: 14px na tela, escala do
 * projeto descartada. O efeito colateral era pior e passava despercebido:
 * lendo `text-caption` como cor, o merge apagava o `text-muted-foreground` da
 * base, e a trilha ainda perdia a cor esmaecida.
 *
 * `extend` (e não `override`) porque a escala do projeto SOMA à do Tailwind:
 * `text-sm`, `text-xs` e companhia continuam no mesmo grupo e continuam
 * competindo com os tokens novos — que é exatamente o que se quer.
 *
 * ---------------------------------------------------------------------------
 * POR QUE ESTA É A ÚNICA IMPLEMENTAÇÃO
 *
 * Havia duas: esta e o pacote compilado `cn`, que os arquivos de
 * `components/ui/**` importavam com `import { cn } from "cn"` (13 arquivos).
 * A trilha quebrava pela segunda, e por isso o defeito atravessou a revisão —
 * consertar só esta aqui não teria mudado um pixel do breadcrumb.
 *
 * As duas saídas foram avaliadas:
 *
 *   (a) CONFIGURAR TAMBÉM O PACOTE `cn`. Ele exporta `createCn`/
 *       `extendTailwindMerge` em `cn/config` e aceita a mesma extensão — foi
 *       testado e funciona. Mas o pacote só é configurável através de um
 *       módulo do projeto, e `components/ui/**` importa o `cn` CRU do pacote:
 *       para a configuração chegar lá seria preciso mexer nos mesmos 13
 *       arquivos de qualquer jeito, e ainda ficaria uma SEGUNDA lista de
 *       tokens da escala para manter em sincronia com esta. Lista duplicada
 *       que diverge em silêncio é a forma original deste defeito.
 *
 *   (b) PADRONIZAR `components/ui/**` EM `@/lib/utils`. Mesmo custo de edição
 *       (13 imports), uma lista só, e é o que `components.json` já declara em
 *       `aliases.utils`. Escolhida.
 *
 * O CUSTO DE (b), para quem vier depois: todo `shadcn add` futuro emite
 * `import { cn } from "cn"` no arquivo novo, e esse arquivo volta a usar o
 * merge não configurado — sem erro de build, de lint ou de teste, exatamente
 * como aconteceu aqui. Ao adicionar um componente do shadcn, troque o import
 * por `@/lib/utils` antes de usá-lo. O pacote `cn` continua no
 * `package.json`, mas nenhum arquivo de origem o importa mais.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["h1", "h2", "h3", "h4", "lead", "body", "caption"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
