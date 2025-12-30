import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const profiles = new Hono<{ Bindings: Bindings }>()

// Public Profile
profiles.get('/public/:id', async (c) => {
  const id = c.req.param('id')
  const profile = await c.env.DB.prepare(`
    SELECT p.*, u.username, u.id as user_id
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    WHERE u.id = ?
  `).bind(id).first()
  if (!profile) return c.json({ error: 'Not found' }, 404)
  return c.json(profile)
})

// Middleware
profiles.use('*', async (c, next) => {
  if (c.req.path.includes('/public/')) return next()
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 403)
  c.set('user', payload)
  await next()
})

// GET /me
profiles.get('/me', async (c) => {
  const user = c.get('user') as any
  // Ensure profile exists logic
  let profile = await c.env.DB.prepare(`
    SELECT p.*, u.username, u.email, u.role, u.id as user_id
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(user.sub).first()
  
  return c.json(profile)
})

// PUT /me (FIXED: Better Upsert Logic)
profiles.put('/me', async (c) => {
  const user = c.get('user') as any
  const body = await c.req.json()
  
  try {
    // Check if exists
    const existing = await c.env.DB.prepare('SELECT id FROM profiles WHERE user_id = ?').bind(user.sub).first()
    
    if (existing) {
      await c.env.DB.prepare(`
        UPDATE profiles 
        SET bio_name = ?, bio_description = ?, price_per_minute = ?, is_public = ?, photo_url = ?
        WHERE user_id = ?
      `).bind(
        body.bio_name || '', 
        body.bio_description || '', 
        body.price_per_minute || 10, 
        body.is_public ? 1 : 0, 
        body.photo_url || null, 
        user.sub
      ).run()
    } else {
      await c.env.DB.prepare(`
        INSERT INTO profiles (user_id, bio_name, bio_description, price_per_minute, is_public, photo_url, is_online)
        VALUES (?, ?, ?, ?, ?, ?, 0)
      `).bind(
        user.sub, 
        body.bio_name || '', 
        body.bio_description || '', 
        body.price_per_minute || 10, 
        body.is_public ? 1 : 0, 
        body.photo_url || null
      ).run()
    }
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET / (Explorer) - FIXED: Filter OFFLINE users
profiles.get('/', async (c) => {
  // Only return Streamers who are PUBLIC AND ONLINE
  const list = await c.env.DB.prepare(`
    SELECT p.*, u.username, u.id as user_id 
    FROM profiles p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.role = 'streamer' 
    AND p.is_public = 1
    AND p.is_online = 1 
  `).all()
  return c.json(list.results)
})

export default profiles
