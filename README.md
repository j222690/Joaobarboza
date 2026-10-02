# Landing page – João Barboza (Programa de Aceleração)

Landing page de aplicação + painel administrativo oculto, feitos em **Next.js 16 (App Router, TypeScript)**, prontos para deploy na **Vercel**.

- `/` – landing page (formulário de aplicação no topo; todos os botões rolam até o formulário)
- `/paineljbadmin` – painel oculto (não tem link na página, `noindex`), protegido por senha e instalável como app (PWA)
- Armazenamento: **Upstash Redis** (integração do Vercel Marketplace). Sem as variáveis do Upstash, o projeto salva em um arquivo local `.data/applications.json` (apenas para desenvolvimento).

---

## 1. Rodar localmente

Requisitos: Node.js 20.9+ e npm.

```bash
npm install
cp .env.example .env.local      # edite ADMIN_PASSWORD e ADMIN_SECRET
npm run dev                     # http://localhost:3000
```

Build de produção local:

```bash
npm run build
npm start
```

Sem `KV_REST_API_URL`/`KV_REST_API_TOKEN` as aplicações ficam em `.data/applications.json` (esse arquivo não vai para o Git).

---

## 2. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub (ou GitLab/Bitbucket).
2. Na Vercel: **Add New… → Project → Import** o repositório. O framework **Next.js** é detectado automaticamente (não altere os comandos de build).
3. Antes (ou logo depois) do primeiro deploy, configure o banco e as variáveis (itens 3 e 4 abaixo).
4. Clique em **Deploy**.

> Alternativa pela linha de comando: `npm i -g vercel` → `vercel` (preview) → `vercel --prod`.

---

## 3. Conectar o Upstash Redis (Vercel Storage)

1. No projeto da Vercel, abra a aba **Storage**.
2. Clique em **Create Database** (ou **Browse Marketplace**) e escolha **Upstash → Redis** (Serverless DB).
3. Escolha a região mais próxima do público (ex.: `São Paulo, Brazil (gru1)` se disponível, ou `Washington, D.C. (iad1)`) e o plano (o **Free** atende bem uma landing page).
4. Em **Connect Project**, selecione este projeto e marque os ambientes **Production**, **Preview** e **Development**.
5. A Vercel cria automaticamente as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN` (em algumas contas aparecem como `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` – o código aceita os dois formatos). Se você definir um **prefixo personalizado** ao conectar (ex.: `STORAGE` → `STORAGE_KV_REST_API_URL` / `STORAGE_KV_REST_API_TOKEN`), o código também encontra sozinho.
6. Faça um **Redeploy** (Deployments → ⋯ → Redeploy) para que as variáveis passem a valer.

No painel `/paineljbadmin` aparece “armazenamento: upstash” quando a conexão está ativa. Se aparecer “arquivo-local” em produção, as variáveis do Upstash não foram carregadas – **nesse caso os dados não ficam salvos de forma permanente**.

Estrutura dos dados no Redis: hash `jb:applications:data` (id → JSON) + sorted set `jb:applications:index` (ordenado pela data). A chave `jb:keepalive` guarda só a data/hora da última execução do cron (item 4.1).

---

## 4. Variáveis de ambiente

Configure em **Project → Settings → Environment Variables** (marque Production e Preview):

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ADMIN_PASSWORD` | Sim | Senha de acesso ao `/paineljbadmin`. Use uma senha forte. Se tiver caracteres especiais (ex.: `&`), no `.env.local` coloque entre aspas simples: `ADMIN_PASSWORD='minha&senha'`. Na Vercel, cole o valor sem aspas. |
| `ADMIN_SECRET` | Sim (produção) | Segredo usado para assinar o cookie de sessão. Mínimo 16 caracteres; recomendado 32+ aleatórios. Gere com `openssl rand -base64 32`. |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Automática | Criadas pela integração do Upstash (item 3). |
| `NEXT_PUBLIC_SITE_URL` | Opcional | URL final (ex.: `https://www.dominio.com.br`) usada nas meta tags de compartilhamento. |
| `CRON_SECRET` | Opcional (recomendada) | Protege a rota do cron (item 4.1). Gere com `openssl rand -hex 32`. |

Depois de criar/alterar variáveis, faça **Redeploy**.

Trocar a `ADMIN_PASSWORD` ou o `ADMIN_SECRET` desconecta todas as sessões abertas do painel.

### 4.1. Cron diário (mantém o Upstash gratuito ativo)

O plano gratuito do Upstash **arquiva o banco depois de 30 dias sem uso**. Para isso nunca acontecer (por exemplo, numa fase sem nenhuma aplicação nova), o projeto tem um **Vercel Cron** que roda **1 vez por dia**:

- Configuração: `vercel.json` → `"crons": [{ "path": "/api/cron/keepalive", "schedule": "17 9 * * *" }]` (09:17 UTC ≈ 06:17 no horário de Brasília). No plano **Hobby** a Vercel permite 1 execução por dia e pode atrasar até ~1 hora; tudo bem.
- Rota: `app/api/cron/keepalive/route.ts` grava a data/hora atual na chave `jb:keepalive` e lê de volta (custa 2 comandos por dia). Resposta: `{"ok":true,"storage":"upstash","at":"2026-10-01T09:17:03.123Z"}`.
- **`CRON_SECRET` (opcional, recomendado):** crie a variável em *Settings → Environment Variables* (Production) com um valor aleatório e faça Redeploy. A Vercel envia automaticamente `Authorization: Bearer <CRON_SECRET>` nas chamadas do cron e a rota recusa (401) qualquer outra chamada. Sem a variável, a rota fica aberta (ela só faz esse SET/GET inofensivo).
- **Como conferir:** *Project → Settings → Cron Jobs* mostra o job `/api/cron/keepalive` e o horário; ali há o botão **Run** para executar na hora e o link **View Logs**. Nos logs (*Project → Logs*, filtrando por `/api/cron/keepalive`) aparece `[keepalive] ok …`. Se aparecer `storage: "arquivo-local"`, as variáveis do Upstash não estão chegando ao projeto (veja o item 3).
- O cron só roda no deploy de **Production** (não em Preview).
- Teste manual: `curl -H "Authorization: Bearer SEU_CRON_SECRET" https://SEU-DOMINIO/api/cron/keepalive`.

---

## 5. Domínio próprio do cliente

1. Na Vercel: **Project → Settings → Domains → Add** e digite o domínio (ex.: `joaobarboza.com.br` e também `www.joaobarboza.com.br`).
2. A Vercel mostra os registros DNS a criar no provedor do domínio (Registro.br, GoDaddy, Hostinger, Cloudflare…):
   - domínio raiz (`@`): registro **A** → `76.76.21.21`
   - `www`: registro **CNAME** → `cname.vercel-dns.com`
   (use exatamente os valores que a Vercel exibir, eles podem variar)
3. Aguarde a propagação (minutos a algumas horas). O certificado HTTPS é emitido automaticamente.
4. Defina qual versão é a principal (com ou sem `www`) e deixe a outra redirecionando.
5. (Opcional) Configure `NEXT_PUBLIC_SITE_URL` com o domínio final e faça Redeploy.

---

## 6. Painel administrativo

- **Endereço:** `https://SEU-DOMINIO/paineljbadmin` (não há nenhum link para ele na página). O antigo `/admin` não existe (dá 404).
- **Login:** informe a senha definida em `ADMIN_PASSWORD`. A sessão fica num cookie `jb_painel_session` `httpOnly`, `Secure` (em produção), `SameSite=Lax`, restrito ao caminho `/paineljbadmin` e assinado com HMAC-SHA256 usando `ADMIN_SECRET`.
- **Lembrar login:** a sessão dura **180 dias** e é renovada automaticamente a cada visita ao painel (quem usa com frequência praticamente nunca precisa digitar a senha de novo). O botão **Sair** encerra a sessão. Trocar `ADMIN_PASSWORD` ou `ADMIN_SECRET` na Vercel (e fazer redeploy) derruba todas as sessões abertas.
- **Recursos:** tabela com todas as aplicações (mais recentes primeiro), data/hora no fuso **America/Sao_Paulo**, todos os campos + UTM de origem, busca (nome, email, whatsapp, faturamento), link direto para o WhatsApp do lead, **Exportar CSV** (separador `;`, UTF-8 – abre direto no Excel em português) e **Excluir** por linha.
- **Privacidade/SEO:** `/paineljbadmin` tem `<meta name="robots" content="noindex, nofollow">` e cabeçalho `X-Robots-Tag: noindex`. Propositalmente o painel **não** é listado no `robots.txt` (listar revelaria o endereço). As rotas `/paineljbadmin/api/*` exigem a sessão válida.

### Instalar o painel como app (PWA)

Só o painel é instalável; a landing page não referencia o manifesto nem registra service worker.

- **Android / Chrome no computador:** abra `https://SEU-DOMINIO/paineljbadmin` e toque em **Instalar app** (na tela de login ou no painel). O app abre em tela cheia, com o ícone do escudo JB.
- **iPhone / iPad (Safari):** toque em **Instalar app** para ver a instrução: *Toque em Compartilhar e depois em Adicionar à Tela de Início*.
- O botão some quando o painel já está rodando como app instalado.
- Arquivos: manifesto em `app/paineljbadmin/manifest.webmanifest/route.ts` (`start_url` `/paineljbadmin`, `display: standalone`, tema azul-marinho, ícones normais e *maskable*), service worker em `app/paineljbadmin/sw.js/route.ts` (escopo `/paineljbadmin`). O service worker **não guarda nada em cache** (nem páginas, nem API, nem dados de leads); ele só mostra uma tela “Sem conexão” quando o aparelho está offline.
- O escopo é `/paineljbadmin` (sem barra no final) porque o Next.js serve a rota sem barra; com `/paineljbadmin/` a própria página inicial do app ficaria fora do escopo.

---

## 7. Formulário e anti-spam

Campos (idênticos à página de referência): **Nome**, **Email**, **Whatsapp com DDD**, **Faturamento mensal atual** + botão “Aplicar para o programa ➔”.

- Validação no servidor (`lib/validation.ts`): nome ≥ 2 caracteres, email válido, WhatsApp com 10–13 dígitos, faturamento obrigatório (até 500 caracteres).
- Honeypot: campo invisível `website`; se vier preenchido, a requisição é descartada silenciosamente. Envios feitos menos de 2 segundos após carregar a página também são descartados.
- Parâmetros `utm_*` da URL são salvos junto com a aplicação.

---

## 8. Onde editar

| O quê | Arquivo |
|---|---|
| Textos da página | `app/page.tsx` |
| Legendas dos depoimentos | array `depoimentos` em `app/page.tsx` |
| Cores, espaçamentos, responsivo | `app/globals.css` (variáveis no topo: `--bg`, `--gold`…) |
| Imagens (fotos, depoimentos, logo) | `public/img/` (AVIF/WebP já redimensionados; ver “Performance”) |
| Link do Instagram (rodapé) | `lib/site.ts` (atual: https://www.instagram.com/joaobarboza.oficial/) |
| Painel (páginas, API, PWA) | `app/paineljbadmin/` |
| Armazenamento | `lib/storage.ts` |
| Cron keep-alive | `app/api/cron/keepalive/route.ts` + `vercel.json` |

---

## Performance

- Só o formulário, o carrossel e o painel usam JavaScript no navegador; o resto é renderizado no servidor (os botões “Saber Mais”/“Quero ser o próximo” são âncoras puras com rolagem suave via CSS).
- A página `/` é 100% estática (aparece como `○ /` no `npm run build`): o HTML sai pronto da CDN da Vercel, sem servidor/cold start.
- Imagens **estáticas e pré-dimensionadas** em `public/img/` (AVIF com WebP de reserva via `<picture>`, várias larguras + `srcset`/`sizes`). Não há otimização sob demanda da Vercel (`images.unoptimized`), então não existe latência de “primeira otimização” nem consumo da cota de Image Optimization do plano Hobby.
- Só a foto do topo tem prioridade (`preload` + `fetchPriority="high"`); o resto é *lazy*. Os depoimentos usam o mesmo `srcset`/`sizes` nas cópias do carrossel, então cada print baixa uma única vez.
- `/img/*` é servido com `Cache-Control: public, max-age=31536000, immutable` (next.config.ts). **Ao trocar uma imagem, salve com um nome novo** (ex.: `hero-v4-1080.avif`) e atualize a referência; se sobrescrever o mesmo nome, quem já visitou pode continuar vendo a antiga.
- Fontes: 2 famílias via `next/font` (auto-hospedadas, subset latin, `display: swap`): Manrope variável (texto, pré-carregada) e Playfair Display 500 (títulos/números, sem preload).
- Marca-d'água do brasão: 1 arquivo pequeno (`jb-mark-v3.webp`, 13 KB) reutilizado como `background` em CSS em várias seções.
- Seções abaixo da dobra usam `content-visibility: auto` (o navegador só desenha quando chegam perto da tela).
- Carrossel de depoimentos: animação contínua 100% CSS (`transform`, GPU), pausa ao passar o mouse/tocar, aceita arrastar/swipe e respeita `prefers-reduced-motion`.
