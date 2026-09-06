/**
 * PASSAGEM SIMPLES, por enquanto — o gêmeo de `app/(ingles)/docs/layout.tsx`.
 *
 * Ele existe agora, vazio de moldura, porque a barra lateral de `/docs` é da
 * próxima onda e vai entrar AQUI. Um layout que só devolve os filhos não custa
 * render nenhum.
 */
export default function LayoutDeDocs({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
