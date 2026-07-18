/** Polish labels for host/player UI (API still uses English keys). */

export const LOGIC_LABELS = {
  instant: 'Otwarte',
  gated: 'Utajnione',
  coop: 'Wspólne',
  versus: 'Versus'
}

export const TASK_STATUS_LABELS = {
  available: 'Dostępne',
  active: 'W trakcie',
  completed: 'Ukończone'
}

export const ASSIGNMENT_STATUS_LABELS = {
  accepted: 'Przyjęte',
  completed: 'Ukończone',
  failed: 'Nieudane',
  lost: 'Przegrana'
}

export function logicLabel (key) {
  return LOGIC_LABELS[key] || key || '—'
}

export function taskStatusLabel (key) {
  return TASK_STATUS_LABELS[key] || key || '—'
}

export function assignmentStatusLabel (key) {
  return ASSIGNMENT_STATUS_LABELS[key] || key || '—'
}

/** Moneta-style: only when task opts into stake via logicConfig. */
export function taskSupportsStake (task) {
  const cfg = task && task.logicConfig
  if (!cfg || typeof cfg !== 'object') return false
  return cfg.stakeMin != null || cfg.stakeMax != null
}
