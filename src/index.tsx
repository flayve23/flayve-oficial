import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Imports
import auth from './server/routes/auth'
import profiles from './server/routes/profiles'
import payment from './server/routes/payment'
import streamer from './server/routes/streamer'
import admin from './server/routes/admin'
import storage from './server/routes/storage'
import stories from './server/routes/stories'
import calls from './server/routes/calls'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
  ASSETS: any // Binding especial da Cloudflare para assets estáticos
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// Rotas da API
app.route('/api/auth', auth)
app.route('/api/profiles', profiles)
app.route('/api/wallet', payment)
app.route('/api/streamer', streamer)
app.route('/api/admin', admin)
app.route('/api/storage', storage)
app.route('/api/stories', stories)
app.route('/api/calls', calls)

app.get('/api/health', (c) => c.json({ status: 'ok', msg: 'V58 Serving HTML' }))

// Rota Curinga (Catch-All) para servir o Frontend
app.get('*', async (c) => {
  // Tenta servir asset estático (JS/CSS) via binding ASSETS (se disponível)
  // ou retorna o index.html padrão para SPA
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
