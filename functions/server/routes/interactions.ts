import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.use('*', async (c, next) => {
  const token = c.req.header('Authorization')?.split(' ')[1]
  const payload = await verifySessionToken(token || '')
  if (!payload) return c.json({ error: 'Unauthorized' }, 401)
  c.set('user', payload)
  await next()
})

// Toggle Favorito
app.post('/favorite', async (c) => {
  const user = c.get('user') as any
  const { streamer_id } = await c.req.json()
  
  const existing = await c.env.DB.prepare('SELECT id FROM favorites WHERE viewer_id = ? AND streamer_id = ?')
    .bind(user.sub, streamer_id).first()

  if (existing) {
    await c.env.DB.prepare('DELETE FROM favorites WHERE id = ?').bind(existing.id).run()
    return c.json({ favorited: false })
  } else {
    await c.env.DB.prepare('INSERT INTO favorites (viewer_id, streamer_id) VALUES (?, ?)').bind(user.sub, streamer_id).run()
    return c.json({ favorited: true })
  }
})

// Listar Favoritos
app.get('/favorites', async (c) => {
  const user = c.get('user') as any
  const { results } = await c.env.DB.prepare(`
    SELECT p.*, u.username 
    FROM favorites f
    JOIN profiles p ON f.streamer_id = p.user_id
    JOIN users u ON p.user_id = u.id
    WHERE f.viewer_id = ?
  `).bind(user.sub).run()
  return c.json(results)
})

// Toggle Online (Streamer Rápido)
app.post('/toggle-status', async (c) => {
  const user = c.get('user') as any
  if (user.role !== 'streamer') return c.json({ error: 'Streamer only' }, 403)
  
  const { is_online } = await c.req.json()
  await c.env.DB.prepare('UPDATE profiles SET is_online = ? WHERE user_id = ?').bind(is_online, user.sub).run()
  return c.json({ success: true, is_online })
})

export default app
