import { categories, products, promos } from './catalog.js'

export const testRepository = {
  async categories() { return categories },
  async products() { return products },
  async promos() { return promos },
}
