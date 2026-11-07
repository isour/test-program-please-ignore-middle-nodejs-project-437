import { sessionUser, createSession } from '../routes/sessions.js'

export const auth = app => request => sessionUser(app, request)
export const publicUser = ({ id, email }) => ({ id, email })
export const setSession = async (reply, app, user) => {
  const token = await createSession(app, user.id)
  reply.setCookie('session', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
}
