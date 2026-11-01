# RTG Tattoo

Site do estúdio RTG Tattoo, em Joinville, com portfólio, orçamento por WhatsApp e painel Decap CMS. O conteúdo é versionado no repositório `rtgtattoo/site-rtg-tattoo`.

## Identidade visual

As letras **RTG** da logo devem sempre usar a fonte **Mestizo**, disponível em `public/assets/fonts/Mestizo_Font.woff2` e `.woff`. Essa regra se aplica à marca no cabeçalho e no rodapé, aos selos e às marcas d'água, inclusive em futuras alterações. O complemento “Tattoo” e os textos corridos mantêm suas fontes próprias. Não substituir a Mestizo por The Seasons nas letras da logo.

## Desenvolvimento

Requer Node.js 22 ou superior.

```sh
npm ci
npm run dev
```

Abra http://127.0.0.1:4173. O comando gera `dist/` antes de iniciar o servidor. Depois de alterar conteúdo ou templates, execute `npm run build` para atualizar a prévia. O servidor local entrega os arquivos de `dist/`.

```sh
npm test
npm run build
```

## Arquivos principais

- `content/site.json`: textos, fotos de banners, equipe, contato e dúvidas frequentes.
- `content/portfolio/*.json`: trabalhos individuais, categorias, ordem e opção de postagem no Google.
- `scripts/render.mjs`: templates da página inicial e dos trabalhos.
- `scripts/build.mjs`: geração de páginas, imagens WebP responsivas, sitemap e dados para integração.
- `scripts/admin-config.mjs`: campos do painel e repositório conectado.
- `public/admin/`: painel e demonstração em memória.
- `worker/index.mjs`: autenticação GitHub para o Decap CMS na Cloudflare.
- `scripts/sync-google.mjs`: integração com postagens do Perfil da Empresa, ativada separadamente.

`dist/` é gerado e não deve ser editado nem versionado. O `public/index.html` e os arquivos `main.css`, `main.js` e `menu-footer.js` são da versão anterior; não são usados pela nova página inicial, gerada pelo build. O build mantém as fotos originais para compatibilidade; a nova interface utiliza versões WebP em `/media/`.

## Edição pelo painel

Após configurar o acesso, abra https://www.rtgtattoo.com.br/admin/ e entre com uma das contas GitHub permitidas. Cada pessoa precisa de permissão de escrita no repositório. A lista de contas autorizadas no servidor restringe ainda mais esse acesso.

O painel usa o fluxo editorial do Decap: salvar rascunho, revisar e publicar. Para um novo trabalho aparecer, marque também **Exibir no site**. Após publicar, aguarde o fluxo de implantação terminar no GitHub Actions. Não altere o endereço de uma tatuagem já publicada sem criar um redirecionamento para o endereço anterior.

Marque **Destaque na página inicial** para selecionar os trabalhos da home: aparecem até 12, seguindo **Ordem na galeria** (menores números primeiro). Novos trabalhos começam sem destaque. Todos os trabalhos publicados ficam em `/portfolio/`, com filtros por categoria e botão **Carregar mais** em lotes de 12. Trocar a categoria reinicia o lote. Sem JavaScript, o portfólio completo continua acessível no HTML, com todos os trabalhos e links individuais. A opção de destaque é independente da postagem no Google.

Imagens enviadas são arquivos públicos do site. Não envie documentos pessoais ou imagens confidenciais. A marcação de rascunho controla a presença do trabalho nas páginas e no sitemap; não torna os arquivos de mídia privados.

A demonstração em `/admin/demo.html` usa o backend oficial em memória do Decap: não escreve no GitHub e perde as alterações ao recarregar. O painel real não faz login em origens de prévia para evitar alterações acidentais na produção.

## Publicação e integrações

Siga [o guia de ativação](docs/ativacao.md). Nenhuma conta nova, domínio ou integração é ativada automaticamente pelo build.

O fluxo de produção fica desativado até configurar `RTG_PUBLISH_ENABLED=true` no GitHub. A postagem no Google depende também de `RTG_GOOGLE_ENABLED=true`, das credenciais próprias e da aprovação da API. Os trabalhos importados estão com a postagem no Google desligada.

Com a integração ativa, a opção **Publicar foto e postagem no Google após publicar o site** envia a foto JPG à galeria do Perfil da Empresa (categoria adicional) e cria ou atualiza uma postagem com texto e link. Galeria e postagens são destinos distintos. A galeria é consultada por completo e comparada pela URL de origem da foto antes de novos envios, evitando reenviar o mesmo arquivo a cada publicação do site. Uma foto substituída tem outra URL e entra como nova imagem; não apagamos fotos anteriores nem fotos enviadas manualmente. Desmarcar a opção também não exclui conteúdo do Google. O log registra o estado e o link da postagem retornados pela API; sucesso do envio não garante destaque ou exibição imediata em todas as buscas.

O arquivo `vercel.json` permite gerar a parte estática na Vercel durante a transição, mas a autenticação em `worker/index.mjs` requer Cloudflare Workers. A publicação completa usa `wrangler.jsonc`.

## Busca e privacidade

O build produz HTML estático, metadados por página, URLs canônicas, dados estruturados do estúdio, sitemap de páginas e imagens e `robots.txt`. Nenhuma dessas medidas garante indexação ou posição específica no Google.

Esta versão não carrega os scripts antigos de Google Analytics, Clarity ou o widget de avaliações. O formulário prepara uma mensagem localmente e abre o WhatsApp; o visitante confirma o envio no próprio WhatsApp. Antes de reativar ferramentas de medição, revisar as informações de privacidade e a configuração de consentimento aplicável.
