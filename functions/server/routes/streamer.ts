import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const streamer = new Hono<{ Bindings: Bindings }>()

// Middleware de Autenticação
streamer.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  
  if (!payload || payload.role !== 'streamer') return c.json({ error: 'Unauthorized: Streamers only' }, 403)
  
  c.set('user', payload)
  await next()
})

// === KYC ===

// GET /api/streamer/kyc - Status do KYC
streamer.get('/kyc', async (c) => {
  const user = c.get('user') as any
  const kyc = await c.env.DB.prepare('SELECT * FROM kyc_verifications WHERE user_id = ?').bind(user.sub).first()
  return c.json(kyc || { status: 'not_submitted' })
})

// POST /api/streamer/kyc - Enviar KYC
streamer.post('/kyc', async (c) => {
  const user = c.get('user') as any
  const { full_name, cpf, birth_date } = await c.req.json()

  if (!full_name || !cpf) {
    return c.json({ error: 'Dados incompletos' }, 400)
  }

  // Verificar se já existe
  const existing = await c.env.DB.prepare('SELECT id FROM kyc_verifications WHERE user_id = ?').bind(user.sub).first()
  
  if (existing) {
    return c.json({ error: 'KYC já enviado' }, 409)
  }

  try {
    await c.env.DB.prepare(`
      INSERT INTO kyc_verifications (user_id, full_name, cpf, status)
      VALUES (?, ?, ?, 'pending')
    `).bind(user.sub, full_name, cpf).run()
    
    return c.json({ success: true, status: 'pending' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// === GANHOS & SAQUES ===

// GET /api/streamer/earnings - Resumo Financeiro
streamer.get('/earnings', async (c) => {
  const user = c.get('user') as any
  
  // Calcular saldo disponível (Ganhos - Saques)
  const balanceQuery = `
    SELECT 
      SUM(CASE WHEN type IN ('call_earning', 'tip') THEN amount ELSE 0 END) -
      SUM(CASE WHEN type IN ('withdrawal') THEN amount ELSE 0 END) as available_balance,
      SUM(CASE WHEN type IN ('call_earning', 'tip') THEN amount ELSE 0 END) as total_lifetime_earnings
    FROM transactions
    WHERE user_id = ? AND status = 'completed'
  `
  const balanceResult = await c.env.DB.prepare(balanceQuery).bind(user.sub).first()
  
  // Buscar histórico de saques
  const withdrawals = await c.env.DB.prepare(`
    SELECT * FROM transactions WHERE user_id = ? AND type = 'withdrawal' ORDER BY created_at DESC LIMIT 10
  `).bind(user.sub).all()

  return c.json({
    available_balance: balanceResult?.available_balance || 0,
    total_lifetime_earnings: balanceResult?.total_lifetime_earnings || 0,
    withdrawals: withdrawals.results
  })
})

// POST /api/streamer/withdraw - Solicitar Saque
streamer.post('/withdraw', async (c) => {
  const user = c.get('user') as any
  const { amount, pix_key } = await c.req.json()
  
  // 1. Verificar KYC Aprovado (Simplificado: só checa se existe)
  // Em produção: verificar se status == 'approved'
  
  // 2. Verificar Saldo
  const balanceQuery = `
    SELECT 
      SUM(CASE WHEN type IN ('call_earning', 'tip') THEN amount ELSE 0 END) -
      SUM(CASE WHEN type IN ('withdrawal') THEN amount ELSE 0 END) as balance
    FROM transactions
    WHERE user_id = ? AND status = 'completed'
  `
  const { balance } = await c.env.DB.prepare(balanceQuery).bind(user.sub).first() as any
  
  if (balance < amount) {
    return c.json({ error: 'Saldo insuficiente' }, 400)
  }

  if (amount < 50) {
    return c.json({ error: 'Saque mínimo R$ 50,00' }, 400)
  }

  // 3. Criar Transação de Saque (Pendente)
  // No MVP/Sandbox, vamos deixar como 'pending' para o Admin aprovar (simulado)
  // Ou 'completed' direto para testes
  const status = 'pending'; 

  try {
    await c.env.DB.prepare(`
      INSERT INTO transactions (user_id, type, amount, status, metadata)
      VALUES (?, 'withdrawal', ?, ?, ?)
    `).bind(
      user.sub, 
      amount, 
      status, 
      JSON.stringify({ pix_key, requested_at: Date.now() })
    ).run()

    return c.json({ success: true, message: 'Saque solicitado com sucesso!' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default streamer
