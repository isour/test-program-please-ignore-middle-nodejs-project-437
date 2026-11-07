import { initSentry } from './observability.js'
initSentry()
import buildApp from './app.js'
import { migrate, pool } from './db.js'

await migrate()
const app = buildApp({ db: pool })
const port = Number(process.env.PORT || 8080)
await app.listen({ port, host: '0.0.0.0' })
