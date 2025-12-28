# FLAYVE - Plataforma de Vídeo Chamadas 1-para-1

Flayve é um marketplace de vídeo chamadas premium focado no mercado brasileiro, conectando streamers e viewers em tempo real com monetização integrada.

## 🚀 Stack Tecnológico (Otimizado para Custo e Performance)

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Hono Framework (Cloudflare Pages Functions)
- **Database:** Cloudflare D1 (SQLite Distribuído)
- **Vídeo:** LiveKit (WebRTC)
- **Auth:** JWT + Web Crypto API (PBKDF2)
- **Deploy:** Cloudflare Pages (Hosting Gratuito/Low Cost)

## ✅ Funcionalidades Implementadas (Fase 1 & 2)

- [x] **Setup do Projeto:** Estrutura Monorepo (Client + Server)
- [x] **Banco de Dados:** Schema SQL completo (Users, Profiles, Calls, Transactions)
- [x] **Autenticação:** Signup/Login com hash seguro de senha (PBKDF2) e JWT
- [x] **API Base:** Hono configurado com CORS e rotas modulares
- [x] **LiveKit:** Rota de geração de token preparada (`/api/livekit/token`)

## 🚧 Próximos Passos

1. **Frontend Auth:** Integrar formulários de Login/Signup com a API.
2. **Dashboard:** Criar telas de Dashboard para Streamer e Viewer.
3. **Vídeo:** Integrar componente de vídeo do LiveKit no React.
4. **Pagamentos:** Integrar Webhook do Mercado Pago.

## 📂 Estrutura de Pastas

```
webapp/
├── migrations/         # Scripts SQL para o D1 Database
├── public/             # Arquivos estáticos
├── src/
│   ├── client/         # Frontend React
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.tsx
│   ├── server/         # Backend Hono
│   │   ├── routes/     # Rotas da API (auth, livekit)
│   │   ├── auth-utils.ts
│   │   └── db/
│   └── index.tsx       # Entrypoint do Backend
├── wrangler.jsonc      # Configuração Cloudflare
└── vite.config.ts      # Configuração Vite (React + Hono)
```

## 🛠️ Comandos Úteis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run db:create`: Cria o banco de dados D1.
- `npm run db:migrate`: Aplica migrações no banco local.
- `npm run deploy`: Faz o build e deploy para Cloudflare Pages.
