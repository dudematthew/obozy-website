/**
 * Client-side CMR activity alerts from quiet host poll diffs.
 * Persists in localStorage; no backend history API.
 */

const ALERTS_KEY = 'obozy-gra-host-alerts'
const SNAPSHOT_KEY = 'obozy-gra-host-alerts-snap'
const MAX_ALERTS = 80

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / private mode */
  }
}

function emptyState() {
  return { alerts: [], lastSeenAt: null, seenTaskAt: {} }
}

/** @returns {{ alerts: object[], lastSeenAt: string|null, seenTaskAt: Record<string,string> }} */
export function loadHostAlertsState() {
  const state = readJson(ALERTS_KEY, null)
  if (!state || typeof state !== 'object') return emptyState()
  return {
    alerts: Array.isArray(state.alerts) ? state.alerts : [],
    lastSeenAt: state.lastSeenAt || null,
    seenTaskAt: state.seenTaskAt && typeof state.seenTaskAt === 'object' ? state.seenTaskAt : {}
  }
}

function saveHostAlertsState(state) {
  writeJson(ALERTS_KEY, {
    alerts: (state.alerts || []).slice(0, MAX_ALERTS),
    lastSeenAt: state.lastSeenAt || null,
    seenTaskAt: state.seenTaskAt || {}
  })
}

function isAlertUnread(alert, state) {
  const t = Date.parse(alert.at)
  if (Number.isNaN(t)) return true
  const globalSeen = state.lastSeenAt ? Date.parse(state.lastSeenAt) : 0
  if (!Number.isNaN(globalSeen) && globalSeen && t <= globalSeen) return false
  const taskKey = String(alert.taskId)
  const taskSeenRaw = state.seenTaskAt && state.seenTaskAt[taskKey]
  const taskSeen = taskSeenRaw ? Date.parse(taskSeenRaw) : 0
  if (!Number.isNaN(taskSeen) && taskSeen && t <= taskSeen) return false
  return true
}

/** Flatten host tasks → assignment snapshot map keyed by assignment id. */
export function flattenAssignmentSnapshot(tasks) {
  const map = {}
  ;(tasks || []).forEach((task) => {
    ;(task.assignments || []).forEach((a) => {
      if (a == null || a.id == null) return
      map[String(a.id)] = {
        id: a.id,
        taskId: task.id,
        taskTitle: task.title || `Zadanie #${task.id}`,
        playerId: a.playerId,
        status: a.status,
        timerStartedAt: a.timerStartedAt || null,
        stake: a.stake != null ? a.stake : null,
        acceptedAt: a.acceptedAt || null,
        completedAt: a.completedAt || null
      }
    })
  })
  return map
}

function playerLabel(playerId, playerMap) {
  if (playerMap && playerMap[playerId]) return playerMap[playerId]
  return `#${playerId}`
}

function makeAlert(partial) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...partial
  }
}

/**
 * Diff previous vs next assignment snapshots.
 * @returns {object[]} new alert events (newest last)
 */
export function diffAssignmentSnapshots(prev, next, playerMap) {
  const events = []
  const prevMap = prev || {}
  const nextMap = next || {}

  Object.keys(nextMap).forEach((key) => {
    const cur = nextMap[key]
    const old = prevMap[key]
    const who = playerLabel(cur.playerId, playerMap)
    const title = cur.taskTitle

    if (!old) {
      if (cur.status === 'accepted') {
        events.push(makeAlert({
          type: 'accept',
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: `${who} przyjął(a): ${title}`
        }))
      } else if (cur.status === 'completed') {
        events.push(makeAlert({
          type: 'completed',
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: `${who} ukończył(a): ${title}`
        }))
      } else if (cur.status === 'failed' || cur.status === 'lost') {
        events.push(makeAlert({
          type: cur.status,
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: cur.status === 'lost'
            ? `${who} przegrana (versus): ${title}`
            : `${who} niezaliczone: ${title}`
        }))
      }
      return
    }

    if (old.status !== cur.status) {
      if (cur.status === 'accepted') {
        events.push(makeAlert({
          type: 'accept',
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: `${who} przyjął(a) ponownie: ${title}`
        }))
      } else if (cur.status === 'completed') {
        events.push(makeAlert({
          type: 'completed',
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: `${who} ukończył(a): ${title}`
        }))
      } else if (cur.status === 'failed') {
        events.push(makeAlert({
          type: 'failed',
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: `${who} niezaliczone: ${title}`
        }))
      } else if (cur.status === 'lost') {
        events.push(makeAlert({
          type: 'lost',
          taskId: cur.taskId,
          assignmentId: cur.id,
          playerId: cur.playerId,
          text: `${who} przegrana (versus): ${title}`
        }))
      }
    }

    if (!old.timerStartedAt && cur.timerStartedAt) {
      events.push(makeAlert({
        type: 'timer',
        taskId: cur.taskId,
        assignmentId: cur.id,
        playerId: cur.playerId,
        text: `Zegar start: ${who} · ${title}`
      }))
    }

    if (old.stake == null && cur.stake != null) {
      events.push(makeAlert({
        type: 'stake',
        taskId: cur.taskId,
        assignmentId: cur.id,
        playerId: cur.playerId,
        text: `Stawka ${cur.stake}: ${who} · ${title}`
      }))
    }
  })

  return events
}

/**
 * After a successful host task list load: seed or append alerts.
 * First poll with no snapshot only seeds (no flood).
 */
export function ingestHostPoll(tasks, playerMap) {
  const next = flattenAssignmentSnapshot(tasks)
  const prev = readJson(SNAPSHOT_KEY, null)
  const state = loadHostAlertsState()

  if (!prev || typeof prev !== 'object') {
    writeJson(SNAPSHOT_KEY, next)
    return state
  }

  const fresh = diffAssignmentSnapshots(prev, next, playerMap)
  writeJson(SNAPSHOT_KEY, next)

  if (!fresh.length) return state

  const alerts = [...fresh].reverse().concat(state.alerts || []).slice(0, MAX_ALERTS)
  const nextState = {
    alerts,
    lastSeenAt: state.lastSeenAt,
    seenTaskAt: state.seenTaskAt || {}
  }
  saveHostAlertsState(nextState)
  return nextState
}

/** Advance snapshot without creating alerts (manual refresh / host's own actions). */
export function advanceHostSnapshot(tasks) {
  writeJson(SNAPSHOT_KEY, flattenAssignmentSnapshot(tasks))
  return loadHostAlertsState()
}

export function unreadHostAlertCount(state) {
  const s = state || emptyState()
  return (s.alerts || []).filter((a) => isAlertUnread(a, s)).length
}

export function markHostAlertsSeen(at = new Date().toISOString()) {
  const state = loadHostAlertsState()
  state.lastSeenAt = at
  saveHostAlertsState(state)
  return state
}

export function markTaskAlertsSeen(taskId, at = new Date().toISOString()) {
  const state = loadHostAlertsState()
  state.seenTaskAt = { ...(state.seenTaskAt || {}), [String(taskId)]: at }
  saveHostAlertsState(state)
  return state
}

export function taskIdsWithUnreadAlerts(state) {
  const s = state || emptyState()
  const ids = new Set()
  ;(s.alerts || []).forEach((a) => {
    if (isAlertUnread(a, s)) ids.add(Number(a.taskId))
  })
  return ids
}

export function latestUnreadAtForTask(state, taskId) {
  const s = state || emptyState()
  const tid = Number(taskId)
  let latest = 0
  ;(s.alerts || []).forEach((a) => {
    if (Number(a.taskId) !== tid || !isAlertUnread(a, s)) return
    const t = Date.parse(a.at)
    if (!Number.isNaN(t) && t > latest) latest = t
  })
  return latest
}
