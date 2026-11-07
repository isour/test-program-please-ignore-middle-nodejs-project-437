import test from 'node:test'
import assert from 'node:assert/strict'
import buildApp from '../src/app.js'
import { testRepository } from '../src/data/test-repository.js'

test('catalog filters and pagination', async () => {
  const app = buildApp({ repository: testRepository })
  let response = await app.inject('/api/products?category=processory&perPage=2')
  let body = response.json()
  assert.equal(response.statusCode, 200)
  assert.equal(body.items.length, 2)
  assert.equal(body.meta.total, 4)
  assert.equal(body.meta.totalPages, 2)
  response = await app.inject('/api/products?perPage=49')
  assert.equal(response.statusCode, 400)
  await app.close()
})

test('order rejects unavailable products atomically', async () => {
  const app = buildApp({ repository: testRepository })
  const registration = await app.inject({ method: 'POST', url: '/api/users', payload: { email: 'x@example.com', password: 'secret1' } })
  const cookie = registration.headers['set-cookie'].split(';')[0]
  const response = await app.inject({ method: 'POST', url: '/api/orders', headers: { cookie }, payload: { items: [{ productId: '1', quantity: 1 }, { productId: '4', quantity: 1 }], shipping: { method: 'pickup' } } })
  assert.equal(response.statusCode, 400)
  assert.deepEqual(response.json().unavailableProductIds, ['4'])
  assert.equal((await app.inject({ method: 'GET', url: '/api/orders', headers: { cookie } })).json().length, 0)
  await app.close()
})
