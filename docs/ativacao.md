# Ativação do site RTG Tattoo

## 1. Confirmar contas e preparar a versão

Estado confirmado em 29/10/2026: domínio ativo na conta Cloudflare do estúdio, novo site respondendo HTTP 200 em `https://www.rtgtattoo.com.br/`, MX públicos mantidos na Umbler. OAuth App GitHub criado pelo proprietário na conta `rtgtattoo`; os segredos `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` e `OAUTH_SESSION_SECRET` constam no Worker. O proprietário confirmou por imagem o login no painel com as coleções carregadas. Ainda falta validar separadamente o acesso da segunda conta e a primeira edição de conteúdo.

Publicação automática habilitada: os repository secrets `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` foram cadastrados pelo proprietário no GitHub; a variável `RTG_PUBLISH_ENABLED=true` foi configurada. O workflow de produção foi disparado e concluiu testes, build e deploy com sucesso em https://github.com/rtgtattoo/site-rtg-tattoo/actions/runs/40944371369. A sincronização Google continua desligada até configurar e testar suas credenciais e aprovação de acesso à API.

- Usar uma conta Cloudflare própria do estúdio, conforme escolha do proprietário. A sessão pessoal do EasyService não deve receber a implantação da RTG. O Gmail informado para o estúdio é `studio.rtgtattoo@gmail.com`.
- Conta do estúdio criada e confirmada pelo proprietário: `3728edb114cfcc55c7131954f95d954f`, fixada em `wrangler.jsonc`, com o domínio `rtgtattoo.com.br` ativo.
- As contas GitHub editoras confirmadas são `alexritzmann` e `rtgtattoo`, já configuradas na lista de acesso. Conferir a permissão de escrita no repositório `rtgtattoo/site-rtg-tattoo`.
- Salvar as alterações em uma branch e revisar a versão antes de integrá-la à `main`. A Vercel atual pode ter implantação automática da `main`.
- Executar `npm ci`, `npm test` e `npm run build`. Testar a prévia no celular, os links de contato, todas as fotos e o formulário.
- Confirmar endereço, telefone, horários e textos do portfólio com o estúdio.

## 2. Publicar uma prévia na Cloudflare

Prévia implantada em 29/10/2026 na conta do estúdio: `https://rtg-tattoo.rtg-tattoo.workers.dev`, com HTTPS e páginas principais verificados. O perfil Wrangler `rtg-tattoo` está vinculado somente ao diretório deste projeto; a autenticação padrão do EasyService não foi substituída. O site também está publicado no domínio definitivo, e a nova versão está salva na `main` do repositório.

Usar a conta confirmada e executar `npx wrangler deploy` após o build. O nome configurado é `rtg-tattoo`; conferir se já existe um Worker com esse nome antes de publicar, para não sobrescrever outro serviço.

Testar o endereço retornado em `workers.dev`. Nesta fase, a página pública funciona, mas o login real do painel é restrito ao domínio definitivo. Não mudar o DNS antes de validar a prévia.

## 3. Ativar o login GitHub

Na conta do estúdio, registrar um OAuth App em GitHub → Settings → Developer settings → OAuth Apps:

- Nome: `RTG Tattoo — Painel`.
- Homepage URL: `https://www.rtgtattoo.com.br`.
- Authorization callback URL: `https://www.rtgtattoo.com.br/api/auth/callback`.
- Não habilitar device flow: esta integração usa o fluxo web.

O Worker usa PKCE, estado criptografado em cookie temporário e restrição por origem, usuário e permissão no repositório. Nunca salvar o client secret no conteúdo, HTML ou Git.

Configurar no Worker os segredos, via painel da Cloudflare ou entrada interativa de `npx wrangler secret put NOME`:

- `GITHUB_CLIENT_ID`: identificador do OAuth App.
- `GITHUB_CLIENT_SECRET`: segredo do OAuth App.
- `OAUTH_SESSION_SECRET`: valor aleatório com pelo menos 32 caracteres.

As variáveis não secretas já estão em `wrangler.jsonc`: `SITE_ORIGIN`, `GITHUB_REPO`, `GITHUB_SCOPE` e `ALLOWED_GITHUB_USERS` (`alexritzmann,rtgtattoo`). Não cadastrar a mesma variável também como segredo no Worker. O escopo `public_repo` é para repositório público. Se o repositório for privado, revisar o escopo e as permissões antes de mudar para `repo`.

Validar login de ambas as contas, rejeição de contas não autorizadas, salvamento de rascunho, upload e publicação. Se a sessão GitHub expirar, sair do painel e entrar novamente.

## 4. Conectar o domínio e automatizar a publicação

O DNS público consultado em 29/10/2026 já usa servidores Cloudflare. Isso não prova em qual conta está a zona. Confirmar no painel se a conta escolhida tem acesso ao domínio.

Zona ativa na conta do estúdio: `a84f14664ebdbe054f19879219501ce3`. Nameservers em uso: `bart.ns.cloudflare.com` e `rafe.ns.cloudflare.com`. Os nameservers anteriores eram `hattie.ns.cloudflare.com` e `kianchau.ns.cloudflare.com`. A troca foi salva pelo proprietário na HostGator e confirmada na Cloudflare e na consulta DNS pública.

A varredura importou endereços públicos da rede Cloudflare para `@`, `www`, `ftp` e `webmail`, em vez de revelar os destinos originais. Não tratar esses A/AAAA como configuração validada. Os MX apontam para a Umbler; o SPF público é `v=spf1 include:spf.umbler.com ~all`, e o SRV `_autodiscover._tcp` aponta para `autodiscover224.umbler.com`, porta 443, prioridade/peso 0. A consulta pública de `_dmarc` retornou NXDOMAIN. A autorização OAuth do Wrangler consegue consultar a zona, mas não listar seus registros DNS; não houve alteração desses registros por API.

O proprietário apresentou a lista completa de sete registros no Editor DNS da Umbler: quatro MX e SPF iguais aos públicos, `webmail` como CNAME para `webmail.umbler.com` e um SRV com destino `autodiscover217.umbler.com`. A zona da Umbler não é a autoridade atual: preservar o SRV público funcional `autodiscover224` até esclarecer a diferença. Não havia DKIM na lista apresentada; isso não comprova sua ausência na zona autoritativa anterior. O proprietário substituiu os A/AAAA de `webmail` na conta nova por CNAME `webmail.umbler.com`, DNS only, confirmado por imagem.

Foram criadas duas rotas Workers para o serviço `rtg-tattoo`: `www.rtgtattoo.com.br/*` e `rtgtattoo.com.br/*`. Ambas foram aceitas pela API e estão persistidas em `wrangler.jsonc`. O proprietário substituiu os A/AAAA importados de `@` e `www` por um AAAA `100::` em cada nome, com proxy ativo, confirmado por imagem. Esse endereço reservado é o placeholder documentado pela Cloudflare para rotas sem servidor de origem; o Worker entrega o site e não consulta esse endereço. Não usar DNS only nesses dois registros. Pode-se migrar essas rotas para Custom Domains futuramente, atualizando a configuração versionada no mesmo passo. Não misturar os dois métodos sem revisar DNS e rotas.

Antes de alterar registros, registrar os destinos atuais de `@` e `www` para permitir reversão e conferir os registros de email. Os MX públicos consultados apontam para Umbler: preservar MX, SPF, DKIM, DMARC e os demais registros de email existentes.

Adicionar `www.rtgtattoo.com.br` como Custom Domain do Worker. A Cloudflare exige uma zona ativa na conta. Conferir e resolver o registro anterior de `www` na etapa de associação ao Worker. Configurar o domínio sem `www` para redirecionar permanentemente para `https://www.rtgtattoo.com.br`, preservando caminho e parâmetros. Não transferir o registro do domínio para fazer apenas essa troca de hospedagem.

Persistir o domínio em `routes` no `wrangler.jsonc` ou verificar como a configuração do painel será preservada nos próximos deploys:

```json
"routes": [
  { "pattern": "www.rtgtattoo.com.br", "custom_domain": true }
]
```

Depois de validar domínio e HTTPS, configurar no GitHub → Settings → Secrets and variables → Actions:

Segredos:

- `CLOUDFLARE_API_TOKEN`: token com permissão para implantar o Worker na conta e configurar os domínios necessários, limitado à conta/zona utilizada.
- `CLOUDFLARE_ACCOUNT_ID`: identificador da conta escolhida.

Variável:

- `RTG_PUBLISH_ENABLED`: `true`.

O workflow `.github/workflows/publish.yml` executa testes, gera o site e publica a cada push na `main`. Não habilitar também uma segunda implantação automática via Workers Builds: escolher um único fluxo. O projeto usa GitHub Actions para ordenar site e postagens do Google.

Retirar a implantação automática da Vercel após validar a migração. Manter o deploy anterior disponível durante a transição facilita uma reversão. Verificar login do painel no domínio definitivo e publicar um trabalho de teste acordado com o estúdio.

## 5. Configurar busca e presença local

- Adicionar/verificar o domínio no Google Search Console, usando a conta do estúdio.
- Enviar `https://www.rtgtattoo.com.br/sitemap.xml` e inspecionar a página inicial e uma página do portfólio.
- Validar os dados estruturados no Rich Results Test do Google.
- Confirmar o Perfil da Empresa e manter nome, endereço, telefone, categoria, horários e site consistentes com os dados reais.
- Acrescentar textos úteis e fotos autorizadas de trabalhos reais; acompanhar termos de busca, impressões e contatos ao longo do tempo.

Não usar avaliações inventadas nem prometer posições ou prazos de indexação.

## 6. Conectar postagens do Google

A publicação do site pode acontecer antes da integração. Postagens no Perfil da Empresa e indexação na busca são processos diferentes.

Na conta Google administradora do estúdio, criar/selecionar um projeto no Google Cloud, solicitar acesso às Business Profile APIs e aguardar aprovação. Configurar OAuth com autorização para `https://www.googleapis.com/auth/business.manage`. Usar uma configuração OAuth adequada à operação contínua; configurações em modo de teste podem gerar tokens de curta duração e exigir nova autorização.

Após a autorização, guardar somente em GitHub Actions Secrets:

- `GOOGLE_CLIENT_ID`.
- `GOOGLE_CLIENT_SECRET`.
- `GOOGLE_REFRESH_TOKEN`.

Configurar GitHub Actions Variables:

- `GOOGLE_LOCATION`: `accounts/ID_DA_CONTA/locations/ID_DO_LOCAL`. Esse identificador vem da API, não do link de busca enviado pelo usuário.
- `RTG_GOOGLE_ENABLED`: `true`, somente após o teste real da integração.

No painel, selecionar um trabalho autorizado e marcar a publicação no Google. A sincronização é executada depois do deploy e confere se o manifesto, a página e a imagem já estão disponíveis no domínio. Consulta postagens existentes pelo link do trabalho para evitar criar uma postagem nova em cada execução. Não faz novas tentativas automáticas de criação em caso de erro de rede; investigar o resultado na API antes de repetir.

```sh
node scripts/sync-google.mjs --dry-run
```

O comando acima apenas mostra os dados preparados, sem acessar a API. Um teste automatizado com respostas simuladas não substitui a validação de um post real na conta do estúdio. A aceitação e exibição de postagens continuam sujeitas às regras e à moderação do Google.

Desmarcar a opção, ocultar ou apagar um trabalho no site não remove postagens antigas no Google. Remoções precisam ser revisadas separadamente no Perfil da Empresa. Não mudar o slug de um trabalho já sincronizado sem revisar o link da postagem existente.

## Referências

- [Custom Domains no Cloudflare Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cadastro de OAuth App no GitHub](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
- [Pré-requisitos das Business Profile APIs](https://developers.google.com/my-business/content/prereqs)
- [Sitemaps no Google Search](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
