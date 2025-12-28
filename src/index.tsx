import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Vamos importar apenas as rotas que sabemos que são leves
import auth from './server/routes/auth'
import profiles from './server/routes/profiles'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok', msg: 'Renascido das cinzas!' }))

// Rotas Básicas (Login e Perfis)
app.route('/api/auth', auth)
app.route('/api/profiles', profiles)

// Rotas Pesadas (Desativadas para o primeiro deploy dar certo)
// Depois a gente descomenta e sobe
// app.route('/api/livekit', livekit) 

export default app
