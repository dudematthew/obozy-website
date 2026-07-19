import { getFestivalSettings } from '@/api/graFestival'

/** @type {null | Promise<object>} */
let inflight = null
/** @type {null | object} */
let cached = null

function emptySettings () {
  return {
    title: '',
    lead: '',
    body: '',
    scannerHint: '',
    organizers: [],
    updatedAt: null
  }
}

/**
 * Load festival settings from the API (source of truth).
 * Cached in memory for the session; no client-side organizers list.
 */
export function loadFestivalSettings ({ force = false } = {}) {
  if (!force && cached) {
    return Promise.resolve(cached)
  }
  if (!force && inflight) {
    return inflight
  }

  inflight = getFestivalSettings()
    .then((data) => {
      cached = {
        title: typeof data.title === 'string' ? data.title : '',
        lead: typeof data.lead === 'string' ? data.lead : '',
        body: typeof data.body === 'string' ? data.body : '',
        scannerHint: typeof data.scannerHint === 'string' ? data.scannerHint : '',
        organizers: Array.isArray(data.organizers)
          ? data.organizers.map((n) => String(n).trim()).filter(Boolean)
          : [],
        updatedAt: data.updatedAt || null
      }
      return cached
    })
    .catch(() => {
      // Same failure class as a missing task: show empty, do not invent hosts.
      if (!cached) cached = emptySettings()
      return cached
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function getCachedFestivalSettings () {
  return cached
}

export function clearFestivalSettingsCache () {
  cached = null
  inflight = null
}

export function organizersLine (settings) {
  const list = (settings && settings.organizers) || []
  return list.length ? list.join(', ') : null
}
