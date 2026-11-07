import { problem } from '../lib/problem.js'

const parseInteger = value => /^\d+$/.test(String(value))
const categoryMatches = (product, categories, category) => !category || product.categoryId === category || categories.find(item => item.id === product.categoryId)?.slug === category
const filterProducts = (items, categories, query) => items.filter(product => categoryMatches(product, categories, query.category)
  && (!query.q || product.name.toLowerCase().includes(String(query.q).toLowerCase()))
  && (query.priceMin === undefined || product.price.amount >= Number(query.priceMin))
  && (query.priceMax === undefined || product.price.amount <= Number(query.priceMax))
  && (query.available === undefined || product.available === (query.available === 'true')))

const handleRepositoryError = (request, reply, error) => {
  request.log.error(error)
  return problem(reply, 500, 'server-error', 'Internal server error')
}

export default async function catalogRoutes(app) {
  app.get('/api/categories', async (request, reply) => {
    try {
      return await app.repository.categories()
    }
    catch (error) {
      return handleRepositoryError(request, reply, error)
    }
  })

  app.get('/api/promos', async (request, reply) => {
    try {
      return await app.repository.promos()
    }
    catch (error) {
      return handleRepositoryError(request, reply, error)
    }
  })

  app.get('/api/products', async (request, reply) => {
    const query = request.query || {}
    const page = Number(query.page || 1)
    const perPage = Number(query.perPage || 6)
    if (!Number.isInteger(page) || !Number.isInteger(perPage) || page < 1 || perPage < 1 || perPage > 48) return problem(reply, 400, 'validation-error')
    for (const key of ['priceMin', 'priceMax']) {
      if (query[key] !== undefined && (!parseInteger(query[key]) || Number(query[key]) < 0)) return problem(reply, 400, 'validation-error')
    }
    if (query.available !== undefined && !['true', 'false'].includes(String(query.available))) return problem(reply, 400, 'validation-error')
    try {
      const [categories, products] = await Promise.all([app.repository.categories(), app.repository.products()])
      const filtered = filterProducts(products, categories, query)
      const total = filtered.length
      return { items: filtered.slice((page - 1) * perPage, page * perPage), meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) } }
    }
    catch (error) {
      return handleRepositoryError(request, reply, error)
    }
  })

  app.get('/api/products/:id', async (request, reply) => {
    const products = await app.repository.products()
    const product = products.find(item => item.id === request.params.id)
    return product || problem(reply, 404, 'not-found', 'Resource not found')
  })
}
