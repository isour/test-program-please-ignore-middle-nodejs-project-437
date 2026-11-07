import test from 'node:test'
import assert from 'node:assert/strict'
import buildApp from '../src/app.js'
import { testRepository } from '../src/data/test-repository.js'

const app = () => buildApp({ repository: testRepository })

test('unknown API routes use Problem Details', async () => {
  const server = app()
  const response = await server.inject('/api/missing')
  assert.equal(response.statusCode, 404)
  assert.equal(response.json().type, '/problems/not-found')
  await server.close()
})

test('authentication and validation errors use contract types', async () => {
  const server = app()
  let response = await server.inject({ method: 'GET', url: '/api/me' })
  assert.equal(response.json().type, '/problems/unauthorized')
  response = await server.inject({ method: 'POST', url: '/api/users', payload: { email: 'bad', password: 'x' } })
  assert.equal(response.json().type, '/problems/validation-error')
  await server.close()
})

test('order validates delivery address and invalid quantities', async () => {
  const server = app()
  const registration = await server.inject({ method: 'POST', url: '/api/users', payload: { email: 'delivery@example.com', password: 'secret1' } })
  const cookie = registration.headers['set-cookie'].split(';')[0]
  let response = await server.inject({ method: 'POST', url: '/api/orders', headers: { cookie }, payload: { items: [{ productId: '1', quantity: 1 }], shipping: { method: 'delivery' } } })
  assert.equal(response.json().type, '/problems/address-required')
  response = await server.inject({ method: 'POST', url: '/api/orders', headers: { cookie }, payload: { items: [{ productId: '4', quantity: 0 }], shipping: { method: 'pickup' } } })
  assert.equal(response.json().type, '/problems/unavailable-items')
  await server.close()
})
