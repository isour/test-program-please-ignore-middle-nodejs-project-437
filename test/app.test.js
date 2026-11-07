import test from 'node:test'
import assert from 'node:assert/strict'
import buildApp from '../src/app.js'
import { testRepository } from '../src/data/test-repository.js'

const register = async (app, email = 'buyer@example.com') => {
  const response = await app.inject({ method: 'POST', url: '/api/users', payload: { email, password: 'secret1' } })
  return { response, cookie: response.headers['set-cookie'].split(';')[0] }
}

test('health and catalog contract', async () => {
  const app = buildApp({ repository: testRepository })
  const health = await app.inject('/api/health')
  assert.equal(health.statusCode, 200)
  const response = await app.inject('/api/products')
  const body = response.json()
  assert.equal(response.statusCode, 200)
  assert.equal(body.items.length, 6)
  assert.equal(body.meta.total, 12)
  await app.close()
})

test('registration, session and logout', async () => {
  const app = buildApp({ repository: testRepository })
  const { response, cookie } = await register(app, 'Test@example.com')
  assert.equal(response.statusCode, 201)
  let result = await app.inject({ method: 'GET', url: '/api/me', headers: { cookie } })
  assert.equal(result.statusCode, 200)
  result = await app.inject({ method: 'DELETE', url: '/api/session', headers: { cookie } })
  assert.equal(result.statusCode, 204)
  result = await app.inject({ method: 'GET', url: '/api/me', headers: { cookie } })
  assert.equal(result.statusCode, 401)
  await app.close()
})

test('order calculates total and isolates user', async () => {
  const app = buildApp({ repository: testRepository })
  const { cookie } = await register(app)
  const response = await app.inject({ method: 'POST', url: '/api/orders', headers: { cookie }, payload: { items: [{ productId: '1', quantity: 2 }], shipping: { method: 'pickup', recipientName: 'Buyer', phone: '123' } } })
  assert.equal(response.statusCode, 201)
  assert.equal(response.json().total, 179980)
  await app.close()
})
