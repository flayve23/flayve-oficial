# Guia de Configuração (Setup)

Siga este guia para rodar o projeto FLAYVE localmente.

## Pré-requisitos

- Node.js 18+ instalado.
- Conta na Cloudflare (para deploy).

## Passo 1: Instalação

```bash
cd webapp
npm install
```

## Passo 2: Banco de Dados Local

O projeto usa Cloudflare D1. Para desenvolvimento local, o Wrangler simula o banco usando SQLite.

1. Crie as migrações (já criadas em `migrations/`):
2. Aplique as migrações:

```bash
npm run db:migrate
```

Isso criará o arquivo `.wrangler/state/v3/d1/...` com o banco de dados local.

## Passo 3: Variáveis de Ambiente

Crie um arquivo `.dev.vars` na raiz do projeto para configurar as chaves locais (não comite este arquivo!):

```ini
JWT_SECRET="seu_segredo_super_seguro"
LIVEKIT_API_KEY="sua_chave_livekit"
LIVEKIT_API_SECRET="seu_segredo_livekit"
LIVEKIT_URL="wss://seu-projeto.livekit.cloud"
```

## Passo 4: Rodar o Projeto

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou porta similar) e a API em `http://localhost:5173/api`.

## Deploy para Produção

1. Faça login no Wrangler:
   ```bash
   npx wrangler login
   ```

2. Crie o banco D1 na Cloudflare:
   ```bash
   npm run db:create
   ```

3. Configure as variáveis de ambiente no dashboard da Cloudflare Pages (Settings > Environment variables).

4. Faça o deploy:
   ```bash
   npm run deploy
   ```
