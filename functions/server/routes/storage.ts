import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  BUCKET: R2Bucket
}

const storage = new Hono<{ Bindings: Bindings }>()

// Middleware Auth
storage.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 403)
  c.set('user', payload)
  await next()
})

// PUT /api/storage/upload/:folder
// Simple Upload Proxy (Client -> Worker -> R2)
// For large files (>10MB), we would use Presigned URLs, but for profile pics/docs this is easier and safer.
storage.put('/upload/:folder', async (c) => {
  const user = c.get('user') as any
  const folder = c.req.param('folder') // 'avatars' or 'kyc'
  
  if (!['avatars', 'kyc', 'stories'].includes(folder)) {
    return c.json({ error: 'Invalid folder' }, 400)
  }

  try {
    const body = await c.req.parseBody()
    const file = body['file']
    
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    // Security: KYC files are private, others public
    const isPrivate = folder === 'kyc'
    
    // Generate unique ID
    const extension = file.name.split('.').pop()
    const key = `${folder}/${user.sub}_${Date.now()}.${extension}`

    // Upload to R2
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        uploader: String(user.sub),
        isPrivate: String(isPrivate)
      }
    })

    // Construct URL
    // If you have a custom domain for R2, use it. Otherwise, we might need a worker to serve it.
    // For now, we assume the worker also SERVES public files via a GET endpoint or public bucket URL.
    // Let's implement a GET proxy for simplicity in MVP.
    const url = `/api/storage/file/${key}`

    return c.json({ success: true, url, key })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/storage/file/* - Serve files (Proxy)
storage.get('/file/:folder/:filename', async (c) => {
  const key = `${c.req.param('folder')}/${c.req.param('filename')}`
  
  // Check auth for KYC
  if (key.startsWith('kyc/')) {
    const user = c.get('user') as any
    // Only admins or the owner can see KYC
    if (user.role !== 'admin' && !key.includes(String(user.sub))) {
        return c.json({ error: 'Unauthorized' }, 403)
    }
  }

  const object = await c.env.BUCKET.get(key)
  if (!object) return c.json({ error: 'Not found' }, 404)

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)

  return new Response(object.body, { headers })
})

export default storage
