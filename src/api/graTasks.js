import { api } from './graClient'
import { isUsableToken } from '@/lib/graUrls'

export function getTask (acceptToken, playerToken) {
  if (!isUsableToken(acceptToken)) {
    return Promise.reject(new Error('Brak tokenu zadania w adresie.'))
  }
  return api(`/tasks/accept/${encodeURIComponent(String(acceptToken).trim())}`, {
    playerToken: playerToken || undefined
  })
}

export function acceptTask (acceptToken, playerToken) {
  if (!isUsableToken(acceptToken)) {
    return Promise.reject(new Error('Brak tokenu zadania w adresie.'))
  }
  return api(`/tasks/accept/${encodeURIComponent(String(acceptToken).trim())}/accept`, {
    method: 'POST',
    body: {},
    playerToken
  })
}

export function verifyTask (verifyToken) {
  if (!isUsableToken(verifyToken)) {
    return Promise.reject(new Error('Brak tokenu potwierdzenia w adresie.'))
  }
  return api(`/tasks/verify/${encodeURIComponent(String(verifyToken).trim())}`)
}
