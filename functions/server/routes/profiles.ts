import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const profiles = new Hono<{ Bindings: Bindings }>()

// Middleware de Autenticação (Opcional para ver feed, obrigatório para editar)
profiles.use('/me/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  
  if (!payload) return c.json({ error: 'Invalid token' }, 401)
  
  c.set('user', payload)
  await next()
})

// GET /api/profiles - Listar Streamers (Feed)
profiles.get('/', async (c) => {
  // Query para buscar usuários streamers e seus perfis
  // Retorna apenas dados públicos
  const query = `
    SELECT 
      u.id, 
      u.username, 
      p.photo_url, 
      p.bio, 
      p.price_per_minute, 
      p.is_online, 
      p.average_rating,
      p.total_ratings
    FROM users u
    JOIN profiles p ON u.id = p.user_id
    WHERE u.role = 'streamer'
    ORDER BY p.is_online DESC, p.average_rating DESC
    LIMIT 50
  `
  
  try {
    const { results } = await c.env.DB.prepare(query).run()
    return c.json(results)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/profiles/me - Meu Perfil (Streamer)
profiles.get('/me', async (c) => {
  const user = c.get('user') as any
  
  const query = `
    SELECT * FROM profiles WHERE user_id = ?
  `
  const profile = await c.env.DB.prepare(query).bind(user.sub).first()
  
  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  
  return c.json(profile)
})

// PUT /api/profiles/me - Atualizar Perfil
profiles.put('/me', async (c) => {
  const user = c.get('user') as any
  const body = await c.req.json()
  
  // Campos permitidos para update
  const { bio, price_per_minute, is_online, tags, photo_url } = body

  // Construção dinâmica da query é complexa com D1 cru, vamos fazer um update fixo por enquanto
  // Idealmente usaríamos um query builder como Kysely ou Drizzle aqui
  
  try {
    await c.env.DB.prepare(`
      UPDATE profiles 
      SET 
        bio = COALESCE(?, bio),
        price_per_minute = COALESCE(?, price_per_minute),
        is_online = COALESCE(?, is_online),
        photo_url = COALESCE(?, photo_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      bio, 
      price_per_minute, 
      is_online, 
      photo_url,
      user.sub
    ).run()

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default profiles
