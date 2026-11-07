const mapProduct = row => ({
  id: String(row.id),
  slug: row.slug,
  name: row.name,
  description: row.description,
  price: { amount: Number(row.price), currency: 'RUB' },
  categoryId: String(row.categoryId),
  ...(row.image ? { imageUrl: row.image } : {}),
  available: row.available,
})

export function repository(pool) {
  return {
    async categories() {
      const { rows } = await pool.query('SELECT id::text, slug, name FROM categories ORDER BY id')
      return rows
    },
    async products() {
      const query = 'SELECT id, slug, name, description, price, category_id AS "categoryId", image, available FROM products ORDER BY id'
      const { rows } = await pool.query(query)
      return rows.map(mapProduct)
    },
    async promos() {
      const query = `SELECT p.id::text, p.title, p.text,
        json_build_object('id', x.id::text, 'slug', x.slug, 'name', x.name,
        'description', x.description, 'price', json_build_object('amount', x.price,
        'currency', 'RUB'), 'categoryId', x.category_id::text,
        'imageUrl', NULLIF(x.image, ''), 'available', x.available) AS product
        FROM promos p JOIN products x ON x.id = p.product_id ORDER BY p.id`
      const { rows } = await pool.query(query)
      return rows
    },
  }
}
