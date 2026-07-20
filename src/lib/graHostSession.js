const TOKEN_KEY = 'obozy-gra-host-token'
const MASTER_KEY = 'obozy-gra-host-master-key'
const HELP_KEY = 'obozy-gra-host-help-open'

function readPersisted (key) {
  try {
    const fromLocal = localStorage.getItem(key)
    if (fromLocal != null && fromLocal !== '') return fromLocal
    const fromSession = sessionStorage.getItem(key)
    if (fromSession != null && fromSession !== '') {
      localStorage.setItem(key, fromSession)
      sessionStorage.removeItem(key)
      return fromSession
    }
  } catch {
    // private mode / blocked storage
  }
  return null
}

function writePersisted (key, value) {
  try {
    if (value == null || value === '') {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
      return
    }
    localStorage.setItem(key, value)
    sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

function removePersisted (key) {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function getHostToken () {
  return readPersisted(TOKEN_KEY)
}

export function setHostToken (token) {
  writePersisted(TOKEN_KEY, token || null)
}

export function clearHostToken () {
  removePersisted(TOKEN_KEY)
  clearHostMasterKey()
}

export function getHostMasterKey () {
  return readPersisted(MASTER_KEY)
}

export function setHostMasterKey (key) {
  writePersisted(MASTER_KEY, key || null)
}

export function clearHostMasterKey () {
  removePersisted(MASTER_KEY)
}

/** CMR help panel open/closed; default open when unset. */
export function getHostHelpOpen () {
  const raw = readPersisted(HELP_KEY)
  if (raw === null) return true
  return raw === '1'
}

export function setHostHelpOpen (open) {
  writePersisted(HELP_KEY, open ? '1' : '0')
}
