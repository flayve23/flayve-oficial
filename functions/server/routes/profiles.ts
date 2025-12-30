import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const profiles = new Hono<{ Bindings: Bindings }>()

// Public Profile (No Auth needed)
profiles.get('/public/:id', async (c) => {
  const id = c.req.param('id')
  const profile = await c.env.DB.prepare(`
    SELECT p.*, u.username, u.id as user_id
    FROM profiles p
    JOIN users u ON p.user_id = u.id
    WHERE u.id = ?
  `).bind(id).first()
  
  if (!profile) return c.json({ error: 'Perfil não encontrado' }, 404)
  return c.json(profile)
})

// Protected Routes Middleware
profiles.use('*', async (c, next) => {
  // Skip middleware for the public route above if Hono routing logic requires it (usually handled by order)
  // But since we mount it, let's just do auth check inside handlers or ensure order is correct.
  // Actually, Hono middleware matches *all* requests to this router if used at top.
  // To fix, we move the middleware below public routes, or check path.
  // Better: separate public and private logic or check path in middleware.
  
  if (c.req.path.includes('/public/')) {
      await next();
      return;
  }

  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 403)
  c.set('user', payload)
  await next()
})

profiles.get('/me', async (c) => {
  const user = c.get('user') as any
  const profile = await c.env.DB.prepare(`
    SELECT p.*, u.username, u.email, u.role, u.id as user_id
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `).bind(user.sub).first()
  return c.json(profile)
})

profiles.put('/me', async (c) => {
  const user = c.get('user') as any
  const body = await c.req.json()
  
  // Upsert profile
  const existing = await c.env.DB.prepare('SELECT id FROM profiles WHERE user_id = ?').bind(user.sub).first()
  
  if (existing) {
    await c.env.DB.prepare(`
      UPDATE profiles 
      SET bio_name = ?, bio_description = ?, price_per_minute = ?, is_public = ?, photo_url = ?
      WHERE user_id = ?
    `).bind(
      body.bio_name, 
      body.bio_description, 
      body.price_per_minute, 
      body.is_public ? 1 : 0, 
      body.photo_url, 
      user.sub
    ).run()
  } else {
    await c.env.DB.prepare(`
      INSERT INTO profiles (user_id, bio_name, bio_description, price_per_minute, is_public, photo_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      user.sub, 
      body.bio_name, 
      body.bio_description, 
      body.price_per_minute, 
      body.is_public ? 1 : 0, 
      body.photo_url
    ).run()
  }
  
  return c.json({ success: true })
})

// List for Explorer
profiles.get('/', async (c) => {
  const list = await c.env.DB.prepare(`
    SELECT p.*, u.username, u.id as user_id 
    FROM profiles p 
    JOIN users u ON p.user_id = u.id 
    WHERE u.role = 'streamer' AND p.is_public = 1
  `).all()
  return c.json(list.results)
})

export default profiles
