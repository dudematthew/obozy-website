/**
 * @typedef {object} Meta
 * @property {string} title
 * @property {string} [description]
 * @property {string | null} [logo]
 * @property {string | null} [logoUrl]
 * @property {Record<string, string>} [glossary]
 */

/**
 * @typedef {object} Subsection
 * @property {string} id
 * @property {string} title
 * @property {string} html
 */

/**
 * @typedef {object} Tile
 * @property {string} id
 * @property {string} title
 * @property {string | null} [introHtml]
 * @property {Subsection[] | null} [subsections]
 * @property {string | null} [contentHtml]
 */

/**
 * @typedef {object} Part
 * @property {string} id
 * @property {string} title
 * @property {string} coverHtml
 * @property {Tile[]} tiles
 */

/**
 * @typedef {object} ManualIr
 * @property {number} schemaVersion
 * @property {string} id
 * @property {Meta} meta
 * @property {Part[]} parts
 * @property {Record<string, { part: number, tile: number, subsection?: number }>} linkIndex
 */

export {}
