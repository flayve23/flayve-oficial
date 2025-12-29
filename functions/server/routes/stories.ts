import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const stories = new Hono<{ Bindings: Bindings }>()

// Middleware Auth
stories.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 401)
  c.set('user', payload)
  await next()
})

// GET /api/stories - Listar Stories Ativos
stories.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT s.*, u.username, p.photo_url as user_photo
      FROM stories s
      JOIN users u ON s.user_id = u.id
      JOIN profiles p ON u.id = p.user_id
      WHERE s.expires_at > CURRENT_TIMESTAMP
      ORDER BY s.created_at DESC
    `).run()
    
    // Agrupar por usuário
    // (Lógica simples no backend, mas ideal seria no front ou query complexa)
    return c.json(results)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// POST /api/stories - Criar Story (Streamer Only)
stories.post('/', async (c) => {
  const user = c.get('user') as any
  if (user.role !== 'streamer') return c.json({ error: 'Streamer only' }, 403)

  const { media_url, media_type } = await c.req.json()
  
  // Expira em 24h
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  try {
    await c.env.DB.prepare(`
      INSERT INTO stories (user_id, media_url, media_type, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(user.sub, media_url, media_type || 'image', expiresAt).run()

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default stories
