import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import staticPlugin from '@fastify/static'
import { problem } from './lib/problem.js'
import { repository } from './repositories.js'
import catalogRoutes from './routes/catalog.js'
import userRoutes from './routes/users.js'
import orderRoutes from './routes/orders.js'
import { captureError } from './observability.js'

export default function buildApp(options = {}) {
  const app = Fastify(options)
  app.store = { users: new Map(), sessions: new Map(), orders: new Map() }
  app.db = options.db || null
  app.repository = app.db ? repository(app.db) : options.repository
  app.register(cookie)
  app.register(staticPlugin, { root: new URL('../public', import.meta.url).pathname, prefix: '/' })
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) return problem(reply, 400, 'validation-error', 'Request validation failed')
    request.log.error(error)
    captureError(error)
    return problem(reply, 500, 'internal-error', 'Internal server error')
  })
  app.get('/api/health', async () => ({ status: 'ok' }))
  app.register(catalogRoutes)
  app.register(userRoutes)
  app.register(orderRoutes)
  app.setNotFoundHandler((request, reply) => request.url.startsWith('/api/') ? problem(reply, 404, 'not-found', 'Resource not found') : reply.sendFile('index.html'))
  return app
}
