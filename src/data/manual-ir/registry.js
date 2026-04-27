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

// authoring.json is only built in dev mode (devOnly: true in manuals.config.json).
// webpack/vue-cli bakes NODE_ENV at bundle time, so the require() below is
// dead-code-eliminated in production builds.
if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    manuals.authoring = require('./authoring.json')
  } catch (e) {
    // authoring.json not built yet — run `npm run build:manuals` locally
  }
}

/**
 * @param {string} id
 * @returns {import('./types').ManualIr | null}
 */
export function getManual (id) {
  return manuals[id] || null
}

export { manuals }
