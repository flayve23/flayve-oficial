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
  ASSETS: { fetch: (req: Request) => Promise<Response> }
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware CORS
app.use('/api/*', cors())

// === API ===
app.route('/api/auth', auth)
app.route('/api/profiles', profiles)
app.route('/api/wallet', payment)
app.route('/api/streamer', streamer)
app.route('/api/admin', admin)
app.route('/api/storage', storage)
app.route('/api/stories', stories)
app.route('/api/calls', calls)

app.get('/api/health', (c) => c.json({ status: 'ok', mode: 'porteiro_v63' }))

// === O PORTEIRO (Static Assets & SPA) ===
// Captura qualquer coisa que não foi tratada acima
app.get('*', async (c) => {
  try {
    // 1. Tenta buscar o arquivo exato (ex: style.css, logo.png)
    const response = await c.env.ASSETS.fetch(c.req.raw)
    
    // Se achou (Status 200-299), retorna ele
    if (response.ok) {
      return response
    }

    // 2. Se deu 404 (não achou arquivo), deve ser uma rota do React (ex: /login)
    // Então buscamos o index.html
    const indexUrl = new URL(c.req.url)
    indexUrl.pathname = '/index.html'
    const indexResponse = await c.env.ASSETS.fetch(indexUrl.toString())
    
    return indexResponse
  } catch (e) {
    return c.text('Erro fatal no porteiro: ' + e.message, 500)
  }
})

export default app
