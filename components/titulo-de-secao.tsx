/**
 * O `<h2 id>` DE UMA SEÇÃO DE DOCUMENTAÇÃO, COM O LINK DE ÂNCORA JUNTO.
 *
 * POR QUE ISTO VIROU COMPONENTE. O par `id` + `#` é o que transforma um título
 * em ENDEREÇO: é assim que a pessoa apanha o link de uma seção para mandar a
 * alguém. Escrito à mão, ele nasceu em `/docs` e nunca chegou às outras três
 * páginas — os `<h2>` de instalação, uso e módulos tinham o `id` (o índice da
 * direita e o scrollspy funcionavam) e NÃO tinham a âncora, então a mesma
 * tarefa era impossível em três das quatro páginas de documentação. Marcação
 * copiada não se propaga; componente, sim — a próxima página de docs nasce com
 * o link porque não tem como escrever o título sem ele.
 *
 * O `group` MORA AQUI DENTRO, no próprio `<h2>`, e não em quem chama: a área de
 * hover é o título inteiro, e uma classe que a página precisa lembrar de pôr é
 * exatamente a metade que alguém esquece — foi assim que as três páginas
 * ficaram sem âncora da primeira vez.
 *
 * O NOME ACESSÍVEL NÃO É TEXTO INVENTADO. Não há `aria-label` em lugar nenhum:
 * ele sai de `aria-labelledby` apontando para o PRÓPRIO `<h2>`, e o leitor de
 * tela anuncia "link, Códigos de saída". Um rótulo escrito neste arquivo sairia
 * em português nas três versões do site, e não existe chave para ele em
 * `rotulos` — o esquema reprova chave nova.
 *
 * `hidden lg:inline-flex` E NÃO `opacity-0` SOZINHO: um alvo invisível mas
 * tocável ao lado do título é armadilha em tela de toque, onde `hover` nunca
 * acontece. No desktop ele aparece no hover do título e no próprio foco, que é
 * o que faz o teclado alcançá-lo.
 */

import type { ReactNode } from "react"
import { Hash } from "lucide-react"

import { cn } from "@/lib/utils"

export function TituloDeSecao({
  id,
  className,
  children,
}: {
  /**
   * O mesmo `id` que o índice e o scrollspy perseguem — vem de
   * `lib/ancoras.ts`, e não de uma segunda função de slug.
   */
  id: string
  /**
   * Só a TIPOGRAFIA do título, que muda com o lugar: `text-h2` nas seções de
   * `/docs`, `text-h4` no passo numerado da instalação, onde o título divide a
   * linha com o número do passo.
   */
  className?: string
  children: ReactNode
}) {
  return (
    <h2 id={id} className={cn("group", className)}>
      {children}
      <a
        href={`#${id}`}
        aria-labelledby={id}
        className="ml-2 hidden translate-y-px align-middle text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 lg:inline-flex"
      >
        <Hash aria-hidden className="size-4" />
      </a>
    </h2>
  )
}
