# 🚀 GUIA DE IMPLANTAÇÃO - FLAYVE (Passo a Passo para Iniciantes)

Este guia foi feito para quem não entende de programação. Siga exatamente a ordem abaixo. Não pule etapas.

---

## 🛠️ PARTE 1: Preparando seu Computador

Antes de mexer no site, você precisa de duas ferramentas básicas instaladas no seu PC (Windows ou Mac).

1.  **Baixar e Instalar o Node.js (Versão LTS):**
    *   Acesse: [https://nodejs.org/](https://nodejs.org/)
    *   Baixe a versão que diz **"LTS (Recommended for most users)"**.
    *   Instale clicando em "Next" até o fim.

2.  **Baixar e Instalar o Git:**
    *   Acesse: [https://git-scm.com/downloads](https://git-scm.com/downloads)
    *   Baixe para Windows ou Mac.
    *   Instale clicando em "Next" até o fim (pode manter todas as opções padrão).

3.  **Criar Conta na Cloudflare:**
    *   Acesse: [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
    *   Crie uma conta gratuita (Free Tier). É lá que seu site vai morar.

---

## 📂 PARTE 2: Preparando os Arquivos

1.  **Baixe o arquivo ZIP** que o desenvolvedor te enviou.
2.  **Extraia (Descompacte)** o arquivo em uma pasta fácil, por exemplo: `Meus Documentos > Flayve`.
    *   *Atenção:* Não deixe dentro do zip. Tire a pasta de dentro.

---

## 💻 PARTE 3: O "Terminal" (A Sala de Comando)

Agora vamos usar a "tela preta" para enviar o site. Não tenha medo, é só copiar e colar.

1.  Abra a pasta do projeto (onde você descompactou).
2.  **No Windows:**
    *   Clique com o botão direito em um espaço vazio da pasta.
    *   Escolha **"Abrir no Terminal"** ou **"Open in Terminal"** (ou Git Bash Here).
    *   Se não achar, na barra de endereço da pasta (lá em cima onde diz o caminho), apague tudo, digite `cmd` e dê ENTER.
3.  Uma tela preta vai abrir.

### 3.1 Instalar as "Peças" do Site
No terminal, digite (ou cole) este comando e aperte ENTER:

```bash
npm install
```

*O que vai acontecer:* Ele vai baixar todas as ferramentas necessárias. Vai aparecer uma barrinha carregando. Espere terminar (pode demorar uns 2-3 minutos).

### 3.2 Conectar com a Cloudflare
Agora vamos conectar seu PC à sua conta da Cloudflare. Digite:

```bash
npx wrangler login
```

*O que vai acontecer:* O navegador vai abrir pedindo para você autorizar. Clique em "Allow" (Permitir). Depois volte para a tela preta.

---

## ☁️ PARTE 4: Banco de Dados (Onde ficam os usuários)

Vamos criar a memória do site na Cloudflare.

1.  No terminal, digite:

```bash
npm run db:create
```

*O que vai acontecer:* Ele vai criar o banco. No final, ele vai mostrar um código estranho, parecido com: `database_id = "xxxxxxxx-xxxx-xxxx..."`.
⚠️ **IMPORTANTE:** Copie esse ID.

2.  Abra o arquivo `wrangler.jsonc` na pasta do projeto (pode abrir com Bloco de Notas).
3.  Procure onde diz `database_id`.
4.  Apague o ID que está lá e cole o SEU ID novo que você copiou.
5.  Salve o arquivo e feche.

6.  Agora, vamos criar as tabelas (gavetas) do banco. No terminal, digite:

```bash
npm run db:migrate:prod
```

Se aparecer uma pergunta `Yes/No`, digite `y` e aperte ENTER.

---

## 🚀 PARTE 5: Colocar o Site no Ar (Deploy)

Agora é a hora da verdade. Vamos enviar tudo para a internet.

No terminal, digite:

```bash
npm run deploy
```

*O que vai acontecer:*
1.  Ele vai "construir" o site (Build).
2.  Vai pedir para criar um projeto novo. Aceite.
3.  Vai perguntar o nome do projeto (digite: `flayve` ou o nome que quiser).
4.  No final, ele vai te dar um link: `https://flayve.pages.dev`.

**SEU SITE ESTÁ NO AR!** 🎉

---

## 🌐 PARTE 6: Configurar seu Domínio (Hostinger)

Agora vamos fazer o `flayve.pages.dev` virar `seusite.com.br`.

1.  Entre no Painel da **Cloudflare**.
2.  Vá em **Workers & Pages** > Clique no projeto **flayve**.
3.  Vá na aba **Custom Domains**.
4.  Clique em **Set up a Custom Domain**.
5.  Digite o domínio que você comprou na Hostinger (ex: `meusite.com`).
6.  A Cloudflare vai te dar instruções de DNS (geralmente dois `Nameservers`).

**Lá na Hostinger:**
1.  Entre no painel do seu domínio.
2.  Procure por **Nameservers** (Servidores de Nome).
3.  Troque os da Hostinger pelos da Cloudflare que apareceram na tela.
4.  Salve. (Isso pode levar até 24h para propagar, mas geralmente é rápido).

---

## ⚙️ PARTE 7: Configurações Finais (Segurança e Email)

Para o envio de emails (SendGrid) e Vídeo (LiveKit) funcionarem, precisamos cadastrar as senhas no site.

1.  No Painel da Cloudflare > Projeto Flayve.
2.  Vá em **Settings** > **Environment Variables**.
3.  Clique em **Add Variable**. Adicione estas:

| Variable Name | Value (Onde pegar) |
| :--- | :--- |
| `JWT_SECRET` | Crie uma senha longa e aleatória (ex: flayve_segredo_123) |
| `LIVEKIT_API_KEY` | Painel do LiveKit.io |
| `LIVEKIT_API_SECRET` | Painel do LiveKit.io |
| `LIVEKIT_URL` | Painel do LiveKit.io (wss://...) |
| `SENDGRID_API_KEY` | Painel do SendGrid |

4.  Salve.
5.  **Importante:** Sempre que mudar essas variáveis, você precisa rodar `npm run deploy` no seu computador novamente para atualizar o site.

---

## 🆘 AJUDA

Se der erro em alguma etapa, tire um print da tela preta e envie para o suporte técnico.
