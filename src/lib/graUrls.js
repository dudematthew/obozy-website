/**
 * QR links must point at the website origin, not the API.
 */

function isUsableToken (token) {
  if (token == null) return false
  const s = String(token).trim()
  return s !== '' && s !== 'undefined' && s !== 'null'
}

export function playTaskUrl (acceptToken) {
  if (!isUsableToken(acceptToken)) return ''
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://obozy.org.pl'
  return `${origin}/gra/t/${encodeURIComponent(String(acceptToken).trim())}`
}

export function verifyTaskUrl (verifyToken) {
  if (!isUsableToken(verifyToken)) return ''
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://obozy.org.pl'
  return `${origin}/gra/v/${encodeURIComponent(String(verifyToken).trim())}`
}

/** Print/readable form: drop scheme so the address fits under a QR. */
export function displayTaskUrl (url) {
  return String(url || '').replace(/^https?:\/\//i, '')
}

export { isUsableToken }
