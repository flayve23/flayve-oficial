import { Hono } from 'hono'
import { verifySessionToken } from '../auth-utils'

type Bindings = {
  BUCKET: R2Bucket
}

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

storage.put('/upload/:folder', async (c) => {
  const user = c.get('user') as any
  const folder = c.req.param('folder')
  
  try {
    const body = await c.req.parseBody().catch(() => null);
    if (!body) return c.json({ error: 'Body parsing failed' }, 400);

    const file = body['file']
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded or file too large' }, 400)
    }

    if (!c.env.BUCKET) return c.json({ error: 'Storage not configured (R2 Missing)' }, 500)

    const extension = file.name.split('.').pop()
    const key = `${folder}/${user.sub}_${Date.now()}.${extension}`

    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type }
    })

    return c.json({ success: true, url: `/api/storage/file/${key}`, key })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// GET /api/storage/file/*
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
