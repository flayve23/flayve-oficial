import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
  LIVEKIT_API_KEY: string
  LIVEKIT_API_SECRET: string
  LIVEKIT_URL: string
}

const calls = new Hono<{ Bindings: Bindings }>()

calls.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 403)
  c.set('user', payload)
  await next()
})

// 1. Viewer REQUESTS a call (Rings the phone)
calls.post('/request', async (c) => {
  const user = c.get('user') as any
  const { streamer_id } = await c.req.json()

  // Verify Balance
  // ... (Simplified check)

  // Create Ringing Request
  const result = await c.env.DB.prepare(`
    INSERT INTO call_requests (viewer_id, streamer_id, status)
    VALUES (?, ?, 'ringing')
    RETURNING id
  `).bind(user.sub, streamer_id).first()

  return c.json({ call_id: result.id, status: 'ringing' })
})

// 2. Streamer CHECKS for incoming calls (Polling)
calls.get('/incoming', async (c) => {
  const user = c.get('user') as any
  
  // Find active ringing calls older than 30s (timeout)
  const incoming = await c.env.DB.prepare(`
    SELECT cr.id, cr.viewer_id, u.username as viewer_name
    FROM call_requests cr
    JOIN users u ON cr.viewer_id = u.id
    WHERE cr.streamer_id = ? 
    AND cr.status = 'ringing'
    AND cr.created_at > datetime('now', '-30 seconds')
    ORDER BY cr.created_at DESC
    LIMIT 1
  `).bind(user.sub).first()

  return c.json(incoming || { active: false })
})

// 3. Streamer ACCEPTS/REJECTS
calls.post('/answer', async (c) => {
  const user = c.get('user') as any
  const { call_id, action } = await c.req.json() // action: 'accept' | 'reject'

  if (action === 'reject') {
      await c.env.DB.prepare("UPDATE call_requests SET status = 'rejected' WHERE id = ?").bind(call_id).run()
      return c.json({ status: 'rejected' })
  }

  // If Accepted, Generate Tokens for BOTH
  // Logic: Streamer calls this, gets token. Viewer polls status, gets token.
  
  // Update status
  await c.env.DB.prepare("UPDATE call_requests SET status = 'accepted' WHERE id = ?").bind(call_id).run()

  // Generate Streamer Token
  const { AccessToken } = await import('livekit-server-sdk')
  const roomName = `call_${call_id}`
  
  const at = new AccessToken(c.env.LIVEKIT_API_KEY, c.env.LIVEKIT_API_SECRET, {
    identity: String(user.sub),
    name: user.username
  })
  at.addGrant({ roomJoin: true, roomName: roomName, canPublish: true, canSubscribe: true })

  return c.json({ 
    status: 'accepted',
    token: await at.toJwt(),
    room: roomName,
    url: c.env.LIVEKIT_URL
  })
})

// 4. Viewer POLLS status of request
calls.get('/status/:id', async (c) => {
  const user = c.get('user') as any
  const callId = c.req.param('id')
  
  const request = await c.env.DB.prepare('SELECT * FROM call_requests WHERE id = ?').bind(callId).first()
  
  if (!request) return c.json({ status: 'ended' })
  
  if (request.status === 'accepted') {
      // Generate Viewer Token
      const { AccessToken } = await import('livekit-server-sdk')
      const roomName = `call_${callId}`
      const at = new AccessToken(c.env.LIVEKIT_API_KEY, c.env.LIVEKIT_API_SECRET, {
        identity: String(user.sub),
        name: user.username
      })
      at.addGrant({ roomJoin: true, roomName: roomName, canPublish: true, canSubscribe: true })
      
      return c.json({ 
          status: 'accepted',
          token: await at.toJwt(),
          room: roomName,
          url: c.env.LIVEKIT_URL
      })
  }

  return c.json({ status: request.status })
})

export default calls
