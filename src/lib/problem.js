const types = new Set(['invalid-credentials', 'email-taken', 'validation-error', 'address-required', 'unavailable-items', 'unauthorized', 'not-found', 'internal-error'])

export function problem(reply, status, type, title = 'Request is invalid', extra = {}) {
  const safeType = types.has(type) ? type : 'internal-error'
  return reply.code(status).send({ type: `/problems/${safeType}`, title, status, ...extra })
}
