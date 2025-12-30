import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const wallet = new Hono<{ Bindings: Bindings }>()

wallet.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 401)
  c.set('user', payload)
  await next()
})

wallet.get('/balance', async (c) => {
  const user = c.get('user') as any
  const query = `
    SELECT 
      SUM(CASE WHEN type IN ('deposit', 'call_earning', 'tip') THEN amount ELSE 0 END) -
      SUM(CASE WHEN type IN ('withdrawal', 'call_payment') THEN amount ELSE 0 END) as balance
    FROM transactions
    WHERE user_id = ? AND status = 'completed'
  `
  const result = await c.env.DB.prepare(query).bind(user.sub).first()
  return c.json({ balance: result?.balance || 0 })
})

// POST /recharge (FIXED: Simplified)
wallet.post('/recharge', async (c) => {
  const user = c.get('user') as any
  const { amount, method } = await c.req.json()
  
  if (!amount || amount < 1) return c.json({ error: 'Valor inválido' }, 400)

  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO transactions (user_id, type, amount, status, metadata)
      VALUES (?, 'deposit', ?, 'completed', ?)
      RETURNING id
    `).bind(
      user.sub, 
      amount,
      JSON.stringify({ method, provider: 'simulator', timestamp: Date.now() })
    ).first()

    return c.json({ success: true, newBalance: amount })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

wallet.get('/transactions', async (c) => {
  const user = c.get('user') as any
  const results = await c.env.DB.prepare(`
    SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `).bind(user.sub).all()
  return c.json(results.results)
})

export default wallet
