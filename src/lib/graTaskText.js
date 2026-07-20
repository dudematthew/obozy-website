/**
 * True when body adds nothing beyond the short summary (same text / empty).
 * Strips the player catchphrase from summary so play + host views share one check.
 */
export const TASK_CATCHPHRASE = 'Powołano cię, graczu.'

function normalizeTaskText (text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
}

export function stripTaskCatchphrase (summary) {
  const s = String(summary || '').trim()
  if (s.startsWith(TASK_CATCHPHRASE)) {
    return s.slice(TASK_CATCHPHRASE.length).trim()
  }
  return s
}

export function isTaskBodyRedundant (summary, bodyMarkdown) {
  const body = normalizeTaskText(bodyMarkdown)
  if (!body) return true
  const plain = normalizeTaskText(stripTaskCatchphrase(summary))
  return body === plain
}
