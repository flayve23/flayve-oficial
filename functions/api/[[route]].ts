import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import auth from '../server/routes/auth'
import profiles from '../server/routes/profiles'
import payment from '../server/routes/payment'
import streamer from '../server/routes/streamer'
import admin from '../server/routes/admin'
import storage from '../server/routes/storage'
import stories from '../server/routes/stories'
import calls from '../server/routes/calls'
import interactions from '../server/routes/interactions'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  JWT_SECRET: string
  LIVEKIT_API_KEY: string
  LIVEKIT_API_SECRET: string
  LIVEKIT_URL: string
  SENDGRID_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')
app.use('/*', cors())
app.get('/health', (c) => c.json({ status: 'ok', architecture: 'native_v79' }))

app.route('/auth', auth)
app.route('/profiles', profiles)
app.route('/wallet', payment)
app.route('/streamer', streamer)
app.route('/admin', admin)
app.route('/storage', storage)
app.route('/stories', stories)
app.route('/calls', calls)
app.route('/interactions', interactions) // Nova rota

app.post('/livekit/token', async (c) => {
  try {
    const { AccessToken } = await import('livekit-server-sdk')
    const { roomName } = await c.req.json()
    const at = new AccessToken(c.env.LIVEKIT_API_KEY, c.env.LIVEKIT_API_SECRET, { identity: 'user' })
    at.addGrant({ roomJoin: true, room: roomName })
    return c.json({ token: await at.toJwt() })
  } catch(e: any) { return c.json({ error: e.message }, 500) }
})

export const onRequest = handle(app)
