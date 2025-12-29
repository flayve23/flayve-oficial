import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
}

const storage = new Hono<{ Bindings: Bindings }>()

storage.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 401)
  c.set('user', payload)
  await next()
})

// POST /api/storage/presigned - Gerar URL de Upload
storage.post('/presigned', async (c) => {
  const user = c.get('user') as any
  const { filename, contentType, type } = await c.req.json()
  
  // type: 'profile' | 'story' | 'kyc'
  const key = `${type}/${user.sub}/${Date.now()}-${filename}`

  // Em ambiente local (Sandbox/Miniflare), o R2 é simulado.
  // A URL PUT direta não funciona igual AWS S3. 
  // Vamos usar um truque: Upload via API Proxy no Backend para o MVP Local.
  // Em produção (Cloudflare), usaríamos o método `put` direto ou presigned.

  // Como estamos no Sandbox, não podemos gerar URL pública do R2 local facilmente.
  // Vamos retornar uma URL de API nossa que aceita o upload.
  
  return c.json({
    uploadUrl: `/api/storage/upload?key=${key}`,
    publicUrl: `/api/storage/file/${key}`, // URL para visualizar depois
    key: key
  })
})

// POST /api/storage/upload - Upload Proxy (Para MVP Local)
storage.put('/upload', async (c) => {
  const key = c.req.query('key')
  if (!key) return c.json({ error: 'Key required' }, 400)
  
  const body = await c.req.arrayBuffer()
  
  // Salvar no R2 Local
  await c.env.BUCKET.put(key, body)
  
  return c.json({ success: true, key })
})

// GET /api/storage/file/:key - Servir Arquivo (Proxy de Leitura)
storage.get('/file/*', async (c) => {
  const key = c.req.path.replace('/api/storage/file/', '')
  const object = await c.env.BUCKET.get(key)
  
  if (!object) return c.json({ error: 'File not found' }, 404)
  
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  
  return new Response(object.body, { headers })
})

export default storage
