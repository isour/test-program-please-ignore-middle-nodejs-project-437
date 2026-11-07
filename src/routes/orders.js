import { problem } from '../lib/problem.js'
import { products } from '../data/catalog.js'
import { auth } from '../lib/auth.js'

const getProducts = async (db, ids) => {
  const validIds = ids.filter(id => /^\d+$/.test(id)).map(Number)
  const result = await db.query('SELECT id::text, name, price, available FROM products WHERE id = ANY($1::int[])', [validIds])
  return result.rows
}

const validateItems = (items, availableProducts) => {
  const unavailable = []
  const lines = []
  for (const item of items) {
    const product = availableProducts.find(entry => entry.id === String(item.productId))
    if (!product || !product.available || !Number.isInteger(item.quantity) || item.quantity < 1) {
      unavailable.push(String(item.productId))
    }
    else {
      lines.push({ productId: product.id, productName: product.name, priceAtPurchase: product.price.amount ? product.price.amount : Number(product.price), quantity: item.quantity })
    }
  }
  return { unavailable, lines }
}

const calculateTotal = items => items.reduce((total, item) => total + item.priceAtPurchase.amount ? item.priceAtPurchase.amount * item.quantity : item.priceAtPurchase * item.quantity, 0)

const createDatabaseOrder = async (db, userId, shipping, lines) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const total = calculateTotal(lines)
    const result = await client.query('INSERT INTO orders (user_id, shipping, total, status) VALUES ($1,$2,$3,$4) RETURNING id::text, total, status, created_at AS "createdAt"', [userId, shipping, total, 'paid'])
    const order = result.rows[0]
    for (const item of lines) {
      await client.query('INSERT INTO order_items (order_id, product_id, product_name, price_at_purchase, quantity) VALUES ($1,$2,$3,$4,$5)', [order.id, item.productId, item.productName, item.priceAtPurchase, item.quantity])
    }
    await client.query('COMMIT')
    return { ...order, items: lines, shipping }
  }
  catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
  finally {
    client.release()
  }
}

export default async function orderRoutes(app) {
  app.post('/api/orders', async (request, reply) => {
    const user = await auth(app)(request)
    const body = request.body || {}
    const shipping = body.shipping || {}
    if (!user) return problem(reply, 401, 'unauthorized', 'Unauthorized')
    if (!Array.isArray(body.items) || !body.items.length) return problem(reply, 400, 'validation-error')
    if (shipping.method === 'delivery' && !String(shipping.address || '').trim()) return problem(reply, 400, 'address-required')
    const ids = body.items.map(item => String(item.productId))
    const source = app.db ? await getProducts(app.db, ids) : products
    const { unavailable, lines } = validateItems(body.items, source)
    if (unavailable.length) return problem(reply, 400, 'unavailable-items', 'Unavailable items', { unavailableProductIds: unavailable })
    if (app.db) return reply.code(201).send(await createDatabaseOrder(app.db, user.id, shipping, lines))
    const order = { id: String(app.store.orders.size + 1), userId: user.id, items: lines, shipping, total: calculateTotal(lines), status: 'paid', createdAt: new Date().toISOString() }
    app.store.orders.set(order.id, order)
    return reply.code(201).send(order)
  })

  app.get('/api/orders', async (request, reply) => {
    const user = await auth(app)(request)
    if (!user) return problem(reply, 401, 'unauthorized', 'Unauthorized')
    if (app.db) {
      const result = await app.db.query('SELECT id::text, shipping, total, status, created_at AS "createdAt" FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [user.id])
      return result.rows
    }
    return [...app.store.orders.values()].filter(order => order.userId === user.id).reverse()
  })

  app.get('/api/orders/:id', async (request, reply) => {
    const user = await auth(app)(request)
    if (!user) return problem(reply, 401, 'unauthorized', 'Unauthorized')
    if (app.db) {
      const order = await app.db.query('SELECT id::text, shipping, total, status, created_at AS "createdAt" FROM orders WHERE id=$1 AND user_id=$2', [request.params.id, user.id])
      if (!order.rowCount) return problem(reply, 404, 'not-found', 'Resource not found')
      const items = await app.db.query('SELECT product_id::text AS "productId", product_name AS "productName", price_at_purchase AS "priceAtPurchase", quantity FROM order_items WHERE order_id=$1', [request.params.id])
      return { ...order.rows[0], items: items.rows }
    }
    const order = app.store.orders.get(request.params.id)
    return order && order.userId === user.id ? order : problem(reply, 404, 'not-found', 'Resource not found')
  })
}
