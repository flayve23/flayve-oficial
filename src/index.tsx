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
// import livekit from './server/routes/livekit'
// import calls from './server/routes/calls'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
}

// O servidor agora sabe que ele mora em /api
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.use('/*', cors())

app.get('/health', (c) => c.json({ status: 'ok', routing: 'manual_routes_json' }))

app.route('/auth', auth)
app.route('/profiles', profiles)
app.route('/wallet', payment)
app.route('/streamer', streamer)
app.route('/admin', admin)
app.route('/storage', storage)
app.route('/stories', stories)

export default app
