/**
 * Build-time generated manuals (see scripts/build-manuals.mjs).
 * Add an import for each entry in manuals.config.json
 */
import mayhem from './mayhem.json'

const manuals = {
  mayhem
}

/**
 * @param {string} id
 * @returns {import('./types').ManualIr | null}
 */
export function getManual (id) {
  return manuals[id] || null
}

export { manuals }
