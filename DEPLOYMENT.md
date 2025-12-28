# Guia de Deploy - FLAYVE (Cloudflare Pages)

Este guia cobre o processo de deploy da aplicação fullstack Flayve no Cloudflare Pages.

## 1. Pré-requisitos

- Conta na Cloudflare (Plano Gratuito funciona).
- Projeto hospedado no GitHub.
- Cloudflare Wrangler CLI instalado (`npm i -g wrangler`).

## 2. Configuração do Projeto no Cloudflare

1. Acesse o Dashboard da Cloudflare > **Pages**.
2. Clique em **Connect to Git** e selecione o repositório do Flayve.
3. Configurações de Build:
   - **Framework Preset**: None (Vite já configura tudo)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Variáveis de Ambiente (Environment Variables):
   - Adicione suas chaves de produção aqui (LiveKit, JWT, etc).

## 3. Banco de Dados (D1)

Como estamos usando D1, precisamos criar o banco na Cloudflare e vincular ao projeto.

1. No terminal local:
   ```bash
   npx wrangler d1 create webapp-production
   ```
2. Copie o `database_id` gerado.
3. Atualize o arquivo `wrangler.jsonc` no seu repositório com o novo ID.
4. Aplique o schema de produção:
   ```bash
   npm run db:migrate:prod
   ```

## 4. LiveKit (Vídeo)

1. Crie um projeto em [livekit.io](https://livekit.io).
2. Vá em **Settings > Keys** e gere uma API Key e Secret.
3. Adicione no Cloudflare Pages (Settings > Environment variables):
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`
   - `LIVEKIT_URL`

## 5. Deploy Manual (Opcional)

Se não quiser usar a integração com Git, você pode fazer deploy direto do terminal:

```bash
npm run deploy
```

Isso fará o build local e subirá a pasta `dist` para a Cloudflare.
