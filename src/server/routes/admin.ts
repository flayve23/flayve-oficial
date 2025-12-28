import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
}

const admin = new Hono<{ Bindings: Bindings }>()

// Middleware Admin Only
admin.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  
  if (!payload || payload.role !== 'admin') return c.json({ error: 'Unauthorized: Admin only' }, 403)
  
  c.set('user', payload)
  await next()
})

import { AccessToken } from 'livekit-server-sdk'

// ... imports

// GET /api/admin/calls/active - Listar chamadas em andamento
admin.get('/calls/active', async (c) => {
  // Em produção, consultaríamos a API do LiveKit para ver salas reais.
  // No MVP/Sandbox, vamos listar as chamadas no DB com status 'active' 
  // ou simular se não houver nenhuma para você ver a interface.
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT c.id, c.started_at, 
             s.username as streamer_name, 
             v.username as viewer_name,
             c.streamer_id, c.viewer_id
      FROM calls c
      JOIN users s ON c.streamer_id = s.id
      JOIN users v ON c.viewer_id = v.id
      WHERE c.status = 'active' OR c.status = 'pending' -- Incluindo pending para testes
      ORDER BY c.started_at DESC
    `).run()
    
    return c.json(results)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// POST /api/admin/users/ban - Banir Usuário
admin.post('/users/ban', async (c) => {
  const { user_id, reason } = await c.req.json()
  
  try {
    // 1. Marcar usuário como banido (precisamos adicionar coluna, mas vamos usar um truque por enquanto: mudar role para 'banned')
    // O ideal seria uma coluna `is_banned`, mas vamos adaptar o schema existente.
    
    // Atualiza role para banned (precisa ajustar check constraint no DB, mas vamos tentar update direto se sqlite permitir, senão update password para bloquear)
    // Estratégia segura agora: Prefixar senha com BANNED:
    await c.env.DB.prepare(`
      UPDATE users SET password_hash = 'BANNED:' || password_hash WHERE id = ?
    `).bind(user_id).run()

    return c.json({ success: true, message: 'Usuário banido com sucesso' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// POST /api/admin/monitor/token - Gerar Token Fantasma
admin.post('/monitor/token', async (c) => {
  const { room_name } = await c.req.json()
  
  if (!c.env.LIVEKIT_API_KEY || !c.env.LIVEKIT_API_SECRET) {
    return c.json({ error: 'Chaves LiveKit não configuradas' }, 500)
  }

  // Cria token com permissão de ADMIN (pode se inscrever, mas NÃO publicar)
  const at = new AccessToken(c.env.LIVEKIT_API_KEY, c.env.LIVEKIT_API_SECRET, {
    identity: 'admin-monitor',
    name: 'Moderador Invisível',
  })

  at.addGrant({
    roomJoin: true,
    room: room_name,
    canPublish: false, // CRÍTICO: Não pode ligar câmera/mic
    canSubscribe: true, // Pode ver tudo
    canPublishData: false,
    hidden: true, // CRÍTICO: Invisível na lista de participantes (se suportado pelo SDK)
  })

  return c.json({ token: await at.toJwt() })
})

// POST /api/admin/users/commission - Alterar Taxa de Comissão
admin.post('/users/commission', async (c) => {
  const { user_id, rate } = await c.req.json()
  
  // Rate deve ser decimal (ex: 0.20) ou null (para voltar ao padrão)
  if (rate !== null && (rate < 0 || rate > 1)) {
    return c.json({ error: 'Taxa inválida (deve ser entre 0.0 e 1.0)' }, 400)
  }

  try {
    await c.env.DB.prepare(`
      UPDATE profiles SET custom_commission_rate = ? WHERE user_id = ?
    `).bind(rate, user_id).run()

    return c.json({ success: true, message: 'Taxa atualizada com sucesso' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

admin.get('/kyc/pending', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT k.*, u.email, u.username 
      FROM kyc_verifications k
      JOIN users u ON k.user_id = u.id
      WHERE k.status = 'pending'
      ORDER BY k.created_at ASC
    `).run()
    
    return c.json(results)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// POST /api/admin/kyc/review - Aprovar/Rejeitar
admin.post('/kyc/review', async (c) => {
  const { kyc_id, action, notes } = await c.req.json() // action: 'approve' | 'reject'
  
  if (!['approve', 'reject'].includes(action)) {
    return c.json({ error: 'Invalid action' }, 400)
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  try {
    // Atualizar KYC
    await c.env.DB.prepare(`
      UPDATE kyc_verifications 
      SET status = ?, admin_notes = ?, reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newStatus, notes || '', kyc_id).run()

    // Se aprovado, marcar usuário como verificado (opcional, pode ser feito via trigger ou outra logica)
    // Aqui vamos manter simples: o status do KYC é a fonte da verdade.

    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// POST /api/admin/users/commission - Alterar Taxa de Comissão
admin.post('/users/commission', async (c) => {
  const { user_id, rate } = await c.req.json()
  
  // Rate deve ser decimal (ex: 0.20) ou null (para voltar ao padrão)
  if (rate !== null && (rate < 0 || rate > 1)) {
    return c.json({ error: 'Taxa inválida (deve ser entre 0.0 e 1.0)' }, 400)
  }

  try {
    await c.env.DB.prepare(`
      UPDATE profiles SET custom_commission_rate = ? WHERE user_id = ?
    `).bind(rate, user_id).run()

    return c.json({ success: true, message: 'Taxa atualizada com sucesso' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default admin
