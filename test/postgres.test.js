import test from 'node:test'
import assert from 'node:assert/strict'
import { pool, migrate } from '../src/db.js'

test('PostgreSQL integration is available when DATABASE_URL is configured', { skip: !pool }, async () => {
  await migrate()
  const result = await pool.query('SELECT 1 AS value')
  assert.equal(result.rows[0].value, 1)
  await pool.end()
})
