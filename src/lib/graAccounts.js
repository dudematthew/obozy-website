const STORAGE_KEY = 'obozy-gra-accounts'
const ACTIVE_KEY = 'obozy-gra-active-token'

function readAccounts () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function writeAccounts (list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function getAccounts () {
  return readAccounts().slice().sort((a, b) => {
    const ta = a.lastUsedAt || ''
    const tb = b.lastUsedAt || ''
    return tb.localeCompare(ta)
  })
}

export function getActiveToken () {
  return localStorage.getItem(ACTIVE_KEY) || null
}

export function getActiveAccount () {
  const token = getActiveToken()
  if (!token) return null
  return getAccounts().find((a) => a.token === token) || null
}

/**
 * Save / update a player identity and make it the active account.
 */
export function upsertAccount ({ token, displayName, id }) {
  if (!token || !displayName) {
    throw new Error('token and displayName required')
  }
  const now = new Date().toISOString()
  const list = readAccounts()
  const idx = list.findIndex((a) => a.token === token)
  const entry = {
    token,
    displayName,
    id: id != null ? id : (list[idx] && list[idx].id) || null,
    lastUsedAt: now
  }
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...entry }
  } else {
    list.push(entry)
  }
  writeAccounts(list)
  localStorage.setItem(ACTIVE_KEY, token)
  return entry
}

export function setActiveToken (token) {
  if (!token) {
    localStorage.removeItem(ACTIVE_KEY)
    return
  }
  const list = readAccounts()
  const idx = list.findIndex((a) => a.token === token)
  if (idx >= 0) {
    list[idx] = { ...list[idx], lastUsedAt: new Date().toISOString() }
    writeAccounts(list)
  }
  localStorage.setItem(ACTIVE_KEY, token)
}

export function removeAccount (token) {
  const list = readAccounts().filter((a) => a.token !== token)
  writeAccounts(list)
  if (getActiveToken() === token) {
    const next = getAccounts()[0]
    if (next) setActiveToken(next.token)
    else localStorage.removeItem(ACTIVE_KEY)
  }
}

export function clearAllAccounts () {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(ACTIVE_KEY)
}

/**
 * Remove the active player token and their local entry when the API reports
 * the token is no longer valid (player deleted server-side).
 * Falls back gracefully: if no active token exists this is a no-op.
 */
export function invalidateActivePlayerSession () {
  const token = getActiveToken()
  if (!token) return
  removeAccount(token)
}
