# rebar-site

A landing do [rebar](https://github.com/Navesz/rebar), e ela é o primeiro site
de verdade feito pelo gerador do próprio rebar — `rebar novo rebar-site`, com
o portão ligado desde o primeiro arquivo. Publicada em
<https://navesz.github.io/rebar-site>.

O conteúdo inteiro da página mora em [`conteudo/site.json`](conteudo/site.json).
Nenhum texto visível está em `.tsx`.

## O que este repositório mudou do preset, e por quê

O preset `site` do rebar saiu como está descrito abaixo. Três coisas não
serviram para esta landing, e as três estão consertadas AQUI, com caso de teste
e prova por mutação — o conserto ainda precisa subir para `novo/site/blocos/`
no rebar:

| o quê | por quê |
| --- | --- |
| `meta.urlBase` aceita caminho | GitHub Pages de projeto publica em `dono.github.io/repo`; sem o caminho o `og:image` aponta para a raiz de outro site e o preview vem vazio |
| `basePath` derivado do `urlBase` | sem ele todo CSS, JS e imagem sai da raiz do domínio e toma 404 no ar — e não aparece no `next dev` |
| bloco `identidade.repositorio` | não havia onde pôr um link, e landing de ferramenta open-source sem link para o repositório está quebrada |

## A pilha, e por que ela

| peça | escolha | motivo |
| --- | --- | --- |
| framework | Next 16, App Router, `output: "export"` | publica no GitHub Pages sem servidor |
| UI | shadcn no estilo `base-nova`, sobre `@base-ui/react` | zero Radix, decisão da §12.2 |
| estilo | Tailwind 4 | vem com o preset |
| conteúdo | `conteudo/*.json`, validado no build | §12.3 — ver abaixo |

## Conteúdo não mora no código

Telefone, CNPJ, endereço e preço são **conteúdo validado**, em `conteudo/*.json`,
e não literal em `.tsx` nem variável de ambiente. A decisão tem custo medido:
mover o número de WhatsApp para variável de ambiente faz o build passar, o link
de WhatsApp subir sem destinatário e o cardápio parar de entregar pedido **em
silêncio**. A régua do rebar cobra isso pelas regras `telefone` e
`conteudo-fora-do-codigo`.

## Comandos

```sh
npm run dev         # desenvolvimento
npm run verificar   # o portão inteiro: lint, typecheck, teste e build
npm run build       # gera out/ , estático
npx --yes github:Navesz/rebar .   # a régua do rebar, o placar
```

## Hooks

```sh
node .githooks/instalar.mjs
```

Configura `core.hooksPath`, então o hook é versionado e atualiza junto com o
repositório. O `pre-commit` varre segredo no que está em stage; o `commit-msg`
barra trailer de coautoria de IA antes de o commit existir. Pular uma vez:
`git commit --no-verify`.

## Licença

Apache-2.0. Ver `LICENSE` e `NOTICE`.

Copyright 2026 Naves.
