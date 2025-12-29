import { Hono } from 'hono'
import { hashPassword, verifyPassword, createSessionToken } from '../auth-utils'
import { sendEmail } from '../utils/email'

type Bindings = {
  DB: D1Database
  SENDGRID_API_KEY: string
  FROM_EMAIL: string
}

const auth = new Hono<{ Bindings: Bindings }>()

auth.post('/signup', async (c) => {
  const { email, password, username, role } = await c.req.json()

  if (!email || !password || !username) return c.json({ error: 'Missing fields' }, 400)

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
    .bind(email, username).first()

  if (existing) return c.json({ error: 'User already exists' }, 409)

  const { hash, salt } = await hashPassword(password)
  const userRole = ['streamer', 'viewer', 'admin'].includes(role) ? role : 'viewer'

  try {
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, username, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id, email, role'
    ).bind(email, username, `${hash}:${salt}`, userRole).first()

    if (userRole === 'streamer' && result) {
      await c.env.DB.prepare('INSERT INTO profiles (user_id) VALUES (?)').bind(result.id).run()
    }

    const token = await createSessionToken(result as any)
    return c.json({ user: result, token }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()

  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const [storedHash, storedSalt] = (user.password_hash as string).split(':')
  if (!storedSalt) return c.json({ error: 'Legacy data error' }, 500)

  const isValid = await verifyPassword(password, storedHash, storedSalt)
  if (!isValid) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await createSessionToken(user as any)
  return c.json({ 
    user: { id: user.id, email: user.email, username: user.username, role: user.role }, 
    token 
  })
})

// === RECUPERAÇÃO DE SENHA ===

// 1. Solicitar Reset
auth.post('/forgot-password', async (c) => {
  const { email } = await c.req.json()
  
  // Buscar usuário (silencioso se não existir para segurança)
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (!user) return c.json({ success: true }) // Fake success para não vazar emails

  // Gerar Token
  const resetToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 3600000).toISOString() // 1 hora

  await c.env.DB.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?')
    .bind(resetToken, expiresAt, user.id).run()

  // Enviar Email
  try {
    const link = `${c.req.header('origin')}/reset-password?token=${resetToken}`
    await sendEmail(
      c.env.SENDGRID_API_KEY,
      email,
      c.env.FROM_EMAIL || 'noreply@flayve.com',
      'Recuperação de Senha - FLAYVE',
      `Você solicitou a recuperação de senha. Clique aqui para alterar: ${link}`
    )
  } catch (e) {
    console.error(e)
    // Não retornar erro para o cliente
  }

  return c.json({ success: true })
})

// 2. Definir Nova Senha
auth.post('/reset-password', async (c) => {
  const { token, newPassword } = await c.req.json()

  // Validar Token
  const user = await c.env.DB.prepare(`
    SELECT id FROM users 
    WHERE reset_token = ? AND reset_expires > CURRENT_TIMESTAMP
  `).bind(token).first()

  if (!user) return c.json({ error: 'Token inválido ou expirado' }, 400)

  // Atualizar Senha e Limpar Token
  const { hash, salt } = await hashPassword(newPassword)
  
  await c.env.DB.prepare(`
    UPDATE users 
    SET password_hash = ?, reset_token = NULL, reset_expires = NULL 
    WHERE id = ?
  `).bind(`${hash}:${salt}`, user.id).run()

  return c.json({ success: true })
})

export default auth
