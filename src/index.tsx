import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './server/routes/auth'
import profiles from './server/routes/profiles'
import streamer from './server/routes/streamer'
import admin from './server/routes/admin'
import storage from './server/routes/storage'
import stories from './server/routes/stories'
// import payment from './server/routes/payment' // Desativado para teste
// import livekit from './server/routes/livekit' // Desativado para teste (Culpe esse cara)
// import calls from './server/routes/calls'     // Desativado para teste

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// Rotas Seguras (Apenas DB e Auth)
app.route('/api/auth', auth)
app.route('/api/profiles', profiles)
app.route('/api/streamer', streamer)
app.route('/api/admin', admin)
app.route('/api/storage', storage)
app.route('/api/stories', stories)

// Rotas Perigosas (Comentadas para o site subir)
// app.route('/api/wallet', payment)
// app.route('/api/livekit', livekit)
// app.route('/api/calls', calls)

app.get('/api/health', (c) => c.json({ status: 'ok', mode: 'safe_core' }))

export default app
