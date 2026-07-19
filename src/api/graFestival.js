import { api } from './graClient'

/** @returns {Promise<{ title: string, lead: string, body: string, scannerHint: string, organizers: string[], updatedAt: string|null }>} */
export function getFestivalSettings () {
  return api('/festival/settings')
}
