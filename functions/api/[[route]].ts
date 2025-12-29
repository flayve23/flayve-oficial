import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/cloudflare-pages'

// Routes
import auth from '../server/routes/auth'
import profiles from '../server/routes/profiles'
import wallet from '../server/routes/wallet'
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

// FIX V93: Explicitly set basePath to '/api' so Hono matches the full URL correctly
const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
}))

// Mount routes (These become /api/auth, /api/profiles, etc.)
app.route('/auth', auth)
app.route('/profiles', profiles)
app.route('/wallet', wallet)
app.route('/streamer', streamer)
app.route('/admin', admin)
app.route('/storage', storage)
app.route('/stories', stories)
app.route('/calls', calls)
app.route('/interactions', interactions)

// LiveKit Token Endpoint
app.post('/livekit/token', async (c) => {
  try {
     const { room, username } = await c.req.json()
     if (!c.env.LIVEKIT_API_KEY || !c.env.LIVEKIT_API_SECRET) {
        return c.json({ error: 'LiveKit not configured' }, 500)
     }
     
     const { AccessToken } = await import('livekit-server-sdk')
     
     const at = new AccessToken(c.env.LIVEKIT_API_KEY, c.env.LIVEKIT_API_SECRET, {
       identity: username,
     })
     at.addGrant({ roomJoin: true, roomName: room })
     
     return c.json({ token: await at.toJwt() })
  } catch(e: any) {
     return c.json({ error: e.message }, 500)
  }
})

// Debug endpoint to verify routing
app.get('/health', (c) => c.json({ 
  status: 'ok', 
  version: 'V93',
  path: c.req.path,
  msg: 'If you see this, /api routing is working!'
}))

export const onRequest = handle(app)
