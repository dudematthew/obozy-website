const SESSION_KEY = 'obozy-gra-host-token'

export function getHostToken () {
  return sessionStorage.getItem(SESSION_KEY) || null
}

export function setHostToken (token) {
  if (!token) {
    sessionStorage.removeItem(SESSION_KEY)
    return
  }
  sessionStorage.setItem(SESSION_KEY, token)
}

export function clearHostToken () {
  sessionStorage.removeItem(SESSION_KEY)
}
