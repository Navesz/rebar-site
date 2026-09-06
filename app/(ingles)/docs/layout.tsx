/**
 * PASSAGEM SIMPLES, por enquanto.
 *
 * Ele existe agora, vazio de moldura, porque a barra lateral de `/docs` é da
 * próxima onda e vai entrar AQUI — criar o arquivo depois significaria mexer em
 * cinco `page.tsx` para reindentar o que já estava certo. Um layout que só
 * devolve os filhos não custa render nenhum.
 */
export default function LayoutDeDocs({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
