/**
 * Build-time generated manuals (see scripts/build-manuals.mjs).
 * Add an import for each entry in manuals.config.json
 */
import mayhem from './mayhem.json'
import classic from './classic.json'

const manuals = {
  mayhem,
  classic
}

/**
 * @param {string} id
 * @returns {import('./types').ManualIr | null}
 */
export function getManual (id) {
  return manuals[id] || null
}

export { manuals }
