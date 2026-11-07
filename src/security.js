import crypto from 'node:crypto'

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = await new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key.toString('hex')))))
  return `scrypt$${salt}$${hash}`
}

export async function verifyPassword(password, stored) {
  const [, salt, expected] = String(stored).split('$')
  if (!salt || !expected) return false
  const actual = await new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => (error ? reject(error) : resolve(key))))
  const expectedBuffer = Buffer.from(expected, 'hex')
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer)
}
