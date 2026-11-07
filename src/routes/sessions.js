import crypto from 'node:crypto'

function tokenFromRequest(request) {
  return request.cookies?.session || request.headers.cookie?.match(/(?:^|;\s*)session=([^;]+)/)?.[1]
}

export async function createSession(app, userId) {
  const token = crypto.randomUUID()
  if (app.db) await app.db.query('INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, now() + interval \'30 days\')', [token, userId])
  else app.store.sessions.set(token, userId)
  return token
}

export async function deleteSession(app, token) {
  if (app.db) await app.db.query('DELETE FROM sessions WHERE token = $1', [token])
  else app.store.sessions.delete(token)
}

export async function sessionUser(app, request) {
  const token = tokenFromRequest(request)
  if (!token || request.headers['x-session-revoked'] === '1') return null
  if (app.db) {
    const result = await app.db.query('SELECT u.id::text, u.email FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.expires_at > now()', [token])
    return result.rows[0] || null
  }
  return [...app.store.users.values()].find(user => user.id === app.store.sessions.get(token))
}
