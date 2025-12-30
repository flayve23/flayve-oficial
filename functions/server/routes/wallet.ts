import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
  MERCADO_PAGO_ACCESS_TOKEN: string
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
  const result = await c.env.DB.prepare(`
    SELECT 
      SUM(CASE WHEN type IN ('deposit', 'call_earning', 'tip') THEN amount ELSE 0 END) -
      SUM(CASE WHEN type IN ('withdrawal', 'call_payment') THEN amount ELSE 0 END) as balance
    FROM transactions WHERE user_id = ? AND status = 'completed'
  `).bind(user.sub).first()
  return c.json({ balance: result?.balance || 0 })
})

wallet.post('/recharge', async (c) => {
  const user = c.get('user') as any
  const { amount, method } = await c.req.json()
  
  if (!amount || amount < 1) return c.json({ error: 'Valor inválido' }, 400)

  // MERCADO PAGO INTEGRATION CHECK
  if (c.env.MERCADO_PAGO_ACCESS_TOKEN && method === 'pix') {
    try {
        // Real PIX Generation
        const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': crypto.randomUUID()
            },
            body: JSON.stringify({
                transaction_amount: Number(amount),
                description: `Recarga Flayve - User ${user.sub}`,
                payment_method_id: 'pix',
                payer: { email: user.email },
                installments: 1
            })
        });
        
        const mpData = await mpRes.json();
        
        if (!mpRes.ok) {
            console.error('MP Error:', mpData);
            return c.json({ error: 'Falha no gateway de pagamento (MP)' }, 500);
        }

        // Save Pending Transaction
        await c.env.DB.prepare(`
            INSERT INTO transactions (user_id, type, amount, status, metadata)
            VALUES (?, 'deposit', ?, 'pending', ?)
        `).bind(user.sub, amount, JSON.stringify({ 
            mp_id: mpData.id, 
            qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64
        })).run();

        return c.json({ 
            success: true, 
            payment_url: mpData.point_of_interaction?.transaction_data?.ticket_url,
            qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
            status: 'pending_payment'
        });

    } catch (e: any) {
        return c.json({ error: `MP Error: ${e.message}` }, 500);
    }
  }

  // SIMULATOR FALLBACK (If no key or explicit sim)
  try {
    await c.env.DB.prepare(`
      INSERT INTO transactions (user_id, type, amount, status, metadata)
      VALUES (?, 'deposit', ?, 'completed', ?)
    `).bind(user.sub, amount, JSON.stringify({ method, provider: 'simulator', timestamp: Date.now() })).run()

    return c.json({ success: true, newBalance: amount, mode: 'simulator' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

wallet.get('/transactions', async (c) => {
  const user = c.get('user') as any
  const results = await c.env.DB.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').bind(user.sub).all()
  return c.json(results.results)
})

export default wallet
