import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'
import { validateCPF } from '../utils/cpf-validator'

type Bindings = {
  DB: D1Database
  MERCADO_PAGO_ACCESS_TOKEN: string
}

const payment = new Hono<{ Bindings: Bindings }>()

// Middleware de Autenticação
payment.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  
  if (!payload) return c.json({ error: 'Invalid token' }, 401)
  
  c.set('user', payload)
  await next()
})

// GET /api/wallet/balance - Consultar Saldo
payment.get('/balance', async (c) => {
  const user = c.get('user') as any
  
  // Buscar a soma de todas as transações 'completed'
  // No SQLite/D1:
  const query = `
    SELECT 
      SUM(CASE WHEN type IN ('deposit', 'call_earning', 'tip') THEN amount ELSE 0 END) -
      SUM(CASE WHEN type IN ('withdrawal', 'call_payment') THEN amount ELSE 0 END) as balance
    FROM transactions
    WHERE user_id = ? AND status = 'completed'
  `
  
  const result = await c.env.DB.prepare(query).bind(user.sub).first()
  const balance = result?.balance || 0
  
  return c.json({ balance })
})

// POST /api/wallet/recharge - Criar Recarga
payment.post('/recharge', async (c) => {
  const user = c.get('user') as any
  const { amount, method, cpf } = await c.req.json()
  
  if (!amount || amount < 5) return c.json({ error: 'Valor mínimo R$ 5,00' }, 400)

  // PROTEÇÃO ANTI-FRAUDE: Exigir CPF válido
  if (!cpf || !validateCPF(cpf)) {
    return c.json({ error: 'CPF inválido. Por segurança, informe um CPF real.' }, 400)
  }

  // EM PRODUÇÃO: Enviaríamos este CPF para o Mercado Pago validar o titular
  
  // PARA TESTES (SANDBOX):
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO transactions (user_id, type, amount, status, metadata)
      VALUES (?, 'deposit', ?, 'completed', ?)
      RETURNING id
    `).bind(
      user.sub, 
      amount,
      JSON.stringify({ method, provider: 'simulator', payer_cpf: cpf, timestamp: Date.now() })
    ).first()

    return c.json({ 
      success: true, 
      message: 'Recarga simulada realizada com sucesso!',
      transactionId: result?.id,
      newBalance: amount
    })

  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/wallet/transactions - Histórico
payment.get('/transactions', async (c) => {
  const user = c.get('user') as any
  
  const results = await c.env.DB.prepare(`
    SELECT * FROM transactions 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 20
  `).bind(user.sub).all()
  
  return c.json(results.results)
})

// POST /api/wallet/tip - Enviar Presente
payment.post('/tip', async (c) => {
  const user = c.get('user') as any
  const { streamer_id, amount, gift_name } = await c.req.json()
  
  if (!amount || amount <= 0) return c.json({ error: 'Valor inválido' }, 400)

  // 1. Verificar Saldo
  const balanceQuery = `
    SELECT 
      SUM(CASE WHEN type IN ('deposit', 'call_earning', 'tip') THEN amount ELSE 0 END) -
      SUM(CASE WHEN type IN ('withdrawal', 'call_payment', 'tip_sent') THEN amount ELSE 0 END) as balance
    FROM transactions
    WHERE user_id = ? AND status = 'completed'
  `
  const { balance } = await c.env.DB.prepare(balanceQuery).bind(user.sub).first() as any
  
  if (balance < amount) {
    return c.json({ error: 'Saldo insuficiente', code: 'insufficient_funds' }, 402)
  }

  // 2. Calcular Comissão (Mesma lógica da chamada)
  const streamer = await c.env.DB.prepare('SELECT custom_commission_rate FROM profiles WHERE user_id = ?').bind(streamer_id).first()
  const commissionRate = streamer?.custom_commission_rate !== null ? Number(streamer?.custom_commission_rate) : 0.30
  
  const platformFee = amount * commissionRate
  const streamerEarnings = amount - platformFee

  try {
    const batch = await c.env.DB.batch([
      // Debitar Viewer (Tip Sent)
      c.env.DB.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, metadata)
        VALUES (?, 'call_payment', ?, 'completed', ?)
      `).bind(user.sub, amount, JSON.stringify({ gift: gift_name, to: streamer_id })),

      // Creditar Streamer (Tip Received)
      c.env.DB.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, metadata)
        VALUES (?, 'call_earning', ?, 'completed', ?)
      `).bind(streamer_id, streamerEarnings, JSON.stringify({ gift: gift_name, from: user.sub, fee: platformFee }))
    ])

    return c.json({ success: true, newBalance: balance - amount })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default payment
