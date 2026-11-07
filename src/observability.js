import * as Sentry from '@sentry/node'

export function initSentry() {
  if (process.env.SENTRY_DSN) Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'production' })
}

export function captureError(error) {
  if (process.env.SENTRY_DSN) Sentry.captureException(error)
}

export { Sentry }
