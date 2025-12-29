import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const calls = new Hono<{ Bindings: Bindings }>()

// Middleware Auth
calls.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 401)
  c.set('user', payload)
  await next()
})

// POST /api/calls/end - Finalizar Chamada e Processar Pagamento
calls.post('/end', async (c) => {
  const user = c.get('user') as any
  const { streamer_id, duration_seconds, room_name } = await c.req.json()

  // 1. Validar dados
  if (!streamer_id || !duration_seconds) {
    return c.json({ error: 'Dados inválidos' }, 400)
  }

  // 2. Buscar preço e TAXA do streamer
  const streamer = await c.env.DB.prepare('SELECT price_per_minute, id, custom_commission_rate FROM profiles WHERE user_id = ?').bind(streamer_id).first()
  if (!streamer) return c.json({ error: 'Streamer não encontrado' }, 404)

  // 3. Calcular Custo Total
  const pricePerSecond = (streamer.price_per_minute as number) / 60
  const totalCost = pricePerSecond * duration_seconds
  
  // 4. Calcular Comissão Dinâmica
  // Se tiver taxa customizada no banco, usa ela. Senão, usa 30% (0.30)
  const commissionRate = streamer.custom_commission_rate !== null ? Number(streamer.custom_commission_rate) : 0.30
  
  const platformFee = totalCost * commissionRate
  const streamerEarnings = totalCost - platformFee // O resto vai para o streamer

  try {
    // Iniciar Transação (Batch)
    const batch = await c.env.DB.batch([
      // a. Debitar do Viewer (Total)
      c.env.DB.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, metadata)
        VALUES (?, 'call_payment', ?, 'completed', ?)
      `).bind(user.sub, totalCost, JSON.stringify({ room_name, duration: duration_seconds })),

      // b. Creditar ao Streamer (70%)
      c.env.DB.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, metadata)
        VALUES (?, 'call_earning', ?, 'completed', ?)
      `).bind(streamer_id, streamerEarnings, JSON.stringify({ from_user: user.sub, fee_deducted: platformFee }))
    ])

    return c.json({ 
      success: true, 
      cost: totalCost, 
      streamer_received: streamerEarnings,
      platform_fee: platformFee 
    })

  } catch (e: any) {
    return c.json({ error: 'Erro ao processar pagamento: ' + e.message }, 500)
  }
})

export default calls
