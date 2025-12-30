import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = { BUCKET: R2Bucket }
const storage = new Hono<{ Bindings: Bindings }>()

storage.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Unauthorized' }, 401)
  const token = authHeader.split(' ')[1]
  const payload = await verifySessionToken(token)
  if (!payload) return c.json({ error: 'Invalid token' }, 403)
  c.set('user', payload)
  await next()
})

// PUT /api/storage/upload-base64 (New Robust Endpoint)
storage.post('/upload-base64', async (c) => {
  const user = c.get('user') as any
  
  try {
    const { image, folder } = await c.req.json() // Expect JSON: { image: "data:image/png;base64,..." }
    
    if (!image || !folder) return c.json({ error: 'Missing image data' }, 400)
    if (!c.env.BUCKET) return c.json({ error: 'R2 Bucket not configured' }, 500)

    // Decode Base64
    const base64Data = image.split(',')[1]
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    
    const extension = image.substring(image.indexOf('/') + 1, image.indexOf(';'))
    const key = `${folder}/${user.sub}_${Date.now()}.${extension}`

    await c.env.BUCKET.put(key, binaryData, {
      httpMetadata: { contentType: `image/${extension}` }
    })

    return c.json({ success: true, url: `/api/storage/file/${key}` })
  } catch (e: any) {
    return c.json({ error: `Upload Error: ${e.message}` }, 500)
  }
})

// Keep GET for serving
storage.get('/file/:folder/:filename', async (c) => {
  if (!c.env.BUCKET) return c.json({ error: 'Storage not configured' }, 500)
  const key = `${c.req.param('folder')}/${c.req.param('filename')}`
  const object = await c.env.BUCKET.get(key)
  if (!object) return c.json({ error: 'Not found' }, 404)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  return new Response(object.body, { headers })
})

export default storage
