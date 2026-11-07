import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

export const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null
const migrationFiles = () => fs.readdirSync(path.resolve('migrations')).filter(file => file.endsWith('.sql')).sort()

export async function migrate() {
  if (!pool) return
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())')
  for (const name of migrationFiles()) {
    const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name])
    if (applied.rowCount) continue
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(fs.readFileSync(path.resolve('migrations', name), 'utf8'))
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name])
      await client.query('COMMIT')
    }
    catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
    finally {
      client.release()
    }
  }
}
