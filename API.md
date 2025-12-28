# Documentação da API - FLAYVE

Base URL: `/api`

## Autenticação

### `POST /auth/signup`
Cria uma nova conta.
- **Body**: `{ "email": "...", "password": "...", "username": "...", "role": "viewer|streamer" }`

### `POST /auth/login`
Autentica usuário e retorna token JWT.
- **Body**: `{ "email": "...", "password": "..." }`

---

## Perfis (Feed)

### `GET /profiles`
Lista streamers públicos ordenados por status e avaliação.
- **Auth**: Opcional

### `GET /profiles/me`
Retorna perfil do streamer logado.
- **Auth**: Bearer Token (Streamer)

### `PUT /profiles/me`
Atualiza perfil do streamer.
- **Auth**: Bearer Token (Streamer)
- **Body**: `{ "bio": "...", "price_per_minute": 1.99, "is_online": true }`

---

## Vídeo (LiveKit)

### `POST /livekit/token`
Gera token de acesso para sala de vídeo.
- **Auth**: Bearer Token
- **Body**: `{ "roomName": "room-1-2" }`

---

## Carteira (Wallet)

### `GET /wallet/balance`
Retorna saldo atual do usuário.
- **Auth**: Bearer Token

### `POST /wallet/recharge`
Simula uma recarga de saldo.
- **Auth**: Bearer Token
- **Body**: `{ "amount": 50.00, "method": "pix" }`

---

## Streamer (Financeiro & KYC)

### `GET /streamer/earnings`
Resumo financeiro e histórico de saques.
- **Auth**: Bearer Token (Streamer)

### `POST /streamer/withdraw`
Solicita saque.
- **Auth**: Bearer Token (Streamer)
- **Body**: `{ "amount": 100.00, "pix_key": "..." }`

### `POST /streamer/kyc`
Envia dados para verificação.
- **Auth**: Bearer Token (Streamer)
- **Body**: `{ "full_name": "...", "cpf": "...", "birth_date": "..." }`

---

## Admin

### `GET /admin/kyc/pending`
Lista verificações pendentes.
- **Auth**: Bearer Token (Admin)

### `POST /admin/kyc/review`
Aprova ou rejeita KYC.
- **Auth**: Bearer Token (Admin)
- **Body**: `{ "kyc_id": 1, "action": "approve|reject" }`
