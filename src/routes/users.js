import { problem } from '../lib/problem.js'
import { publicUser, setSession, auth } from '../lib/auth.js'
import { deleteSession } from './sessions.js'
import { hashPassword, verifyPassword } from '../security.js'

const credentials = request => ({ email: String(request.body?.email || '').trim().toLowerCase(), password: request.body?.password })
const validCredentials = ({ email, password }) => /^\S+@\S+\.\S+$/.test(email) && typeof password === 'string' && password.length >= 6

export default async function userRoutes(app) {
  app.post('/api/users', async (request, reply) => {
    const { email, password } = credentials(request)
    if (!validCredentials({ email, password })) return problem(reply, 400, 'validation-error')
    if (app.db) {
      try {
        const result = await app.db.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id::text, email', [email, await hashPassword(password)])
        const user = result.rows[0]
        await setSession(reply, app, user)
        return reply.code(201).send(user)
      }
      catch (error) {
        if (error.code === '23505') return problem(reply, 409, 'email-taken', 'Email already taken')
        throw error
      }
    }
    if (app.store.users.has(email)) return problem(reply, 409, 'email-taken', 'Email already taken')
    const user = { id: String(app.store.users.size + 1), email, password: await hashPassword(password) }
    app.store.users.set(email, user)
    await setSession(reply, app, user)
    return reply.code(201).send(publicUser(user))
  })

  app.post('/api/session', async (request, reply) => {
    const { email, password } = credentials(request)
    let user
    if (app.db) {
      const result = await app.db.query('SELECT id::text, email, password_hash AS password FROM users WHERE email = $1', [email])
      user = result.rows[0]
    }
    else {
      user = app.store.users.get(email)
    }
    if (!user || !(await verifyPassword(password || '', user.password))) return problem(reply, 401, 'invalid-credentials', 'Invalid credentials')
    await setSession(reply, app, user)
    return publicUser(user)
  })

  app.delete('/api/session', async (request, reply) => {
    const token = request.cookies.session || request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
    await deleteSession(app, token)
    reply.header('x-session-revoked', '1')
    reply.clearCookie('session', { path: '/' })
    return reply.code(204).send()
  })

  app.get('/api/me', async (request, reply) => {
    const user = await auth(app)(request)
    return user ? publicUser(user) : problem(reply, 401, 'unauthorized', 'Unauthorized')
  })
}
