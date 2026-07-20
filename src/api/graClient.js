import { polishApiMessage, isStalePlayerTokenError } from '@/lib/graErrors'
import { invalidateActivePlayerSession } from '@/lib/graAccounts'

// API contract (published by the backend, no auth):
//   https://festiwal.dudematthew.smallhost.pl/docs
//   https://festiwal.dudematthew.smallhost.pl/docs/api.http
const API_BASE = (process.env.VUE_APP_API_BASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '')

/**
 * Low-level fetch wrapper for the festival quest API.
 * Throws `{ error, message }` on non-OK responses.
 */
export async function api (path, {
  method = 'GET',
  body,
  playerToken,
  hostToken,
  masterKey,
  signal
} = {}) {
  const headers = new Headers()
  if (body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (playerToken) {
    headers.set('Authorization', `Bearer ${playerToken}`)
  }
  if (hostToken) {
    headers.set('Authorization', `Bearer ${hostToken}`)
  }
  if (masterKey) {
    headers.set('X-Host-Master-Key', masterKey)
  }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal
    })
  } catch (err) {
    throw {
      error: 'network_error',
      message: 'Brak połączenia z API. Sprawdź adres i CORS.'
    }
  }

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw {
        error: 'internal_error',
        message: 'Serwer zwrócił niepoprawną odpowiedź.'
      }
    }
  }

  if (!res.ok) {
    const payload = data || {
      error: 'internal_error',
      message: `Błąd HTTP ${res.status}`
    }
    const err = {
      ...payload,
      _rawMessage: payload.message,
      message: polishApiMessage(payload.message) || payload.message
    }
    if (isStalePlayerTokenError(err, playerToken)) {
      invalidateActivePlayerSession()
      throw { ...err, playerSessionExpired: true }
    }
    throw err
  }

  return data
}

export function getApiBaseUrl () {
  return API_BASE
}

export async function healthCheck () {
  return api('/health')
}
