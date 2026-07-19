const SESSION_KEY = 'obozy-gra-host-token'
const MASTER_KEY = 'obozy-gra-host-master-key'
const HELP_KEY = 'obozy-gra-host-help-open'

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
  clearHostMasterKey()
}

export function getHostMasterKey () {
  return sessionStorage.getItem(MASTER_KEY) || null
}

export function setHostMasterKey (key) {
  if (!key) {
    sessionStorage.removeItem(MASTER_KEY)
    return
  }
  sessionStorage.setItem(MASTER_KEY, key)
}

export function clearHostMasterKey () {
  sessionStorage.removeItem(MASTER_KEY)
}

/** CMR help panel open/closed; default open when unset. */
export function getHostHelpOpen () {
  const raw = sessionStorage.getItem(HELP_KEY)
  if (raw === null) return true
  return raw === '1'
}

export function setHostHelpOpen (open) {
  sessionStorage.setItem(HELP_KEY, open ? '1' : '0')
}
