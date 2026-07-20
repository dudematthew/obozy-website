/**
 * Shared helpers for Gra Playwright tests (real festival API).
 */

const API_BASE = (process.env.GRA_API_BASE_URL || 'http://127.0.0.1:8090').replace(/\/$/, '')
const HOST_KEY = process.env.HOST_API_KEY || 'obozy-2026'
const MASTER_KEY = process.env.HOST_MASTER_KEY || 'master-obozy-2026'

function hostHeaders () {
  return {
    Authorization: `Bearer ${HOST_KEY}`,
    'X-Host-Master-Key': MASTER_KEY
  }
}

async function isApiUp (request) {
  try {
    const res = await request.get(`${API_BASE}/health`)
    return res.ok()
  } catch {
    return false
  }
}

async function createInstantTask (request, title) {
  const res = await request.post(`${API_BASE}/host/tasks`, {
    headers: hostHeaders(),
    data: {
      title,
      summary: 'E2E smoke',
      bodyMarkdown: 'E2E body',
      logicType: 'instant',
      points: 1,
      maxAssignees: 1
    }
  })
  if (!res.ok()) {
    throw new Error(`createInstantTask failed: ${res.status()} ${await res.text()}`)
  }
  return res.json()
}

async function deleteTask (request, taskId) {
  await request.delete(`${API_BASE}/host/tasks/${taskId}`, { headers: hostHeaders() })
}

async function registerPlayer (request, displayName) {
  const res = await request.post(`${API_BASE}/players`, {
    data: { displayName }
  })
  if (!res.ok()) {
    throw new Error(`registerPlayer failed: ${res.status()} ${await res.text()}`)
  }
  return res.json()
}

async function deletePlayer (request, playerId) {
  await request.delete(`${API_BASE}/host/players/${playerId}`, { headers: hostHeaders() })
}

async function clearPlayerStorage (page) {
  await page.evaluate(() => {
    localStorage.removeItem('obozy-gra-accounts')
    localStorage.removeItem('obozy-gra-active-token')
  })
}

async function findPlayerByName (request, displayName) {
  const res = await request.get(`${API_BASE}/players`, {
    params: { q: displayName }
  })
  if (!res.ok()) return null
  const body = await res.json()
  const players = body.players || []
  return players.find((p) => p.displayName === displayName) || null
}

/** Delete leftover E2E players/tasks (title or name starts with "E2E"). */
async function cleanupE2eFixtures (request) {
  const host = hostHeaders()
  const playersRes = await request.get(`${API_BASE}/players`)
  if (playersRes.ok()) {
    const { players = [] } = await playersRes.json()
    for (const p of players) {
      if (typeof p.displayName === 'string' && p.displayName.startsWith('E2E')) {
        await request.delete(`${API_BASE}/host/players/${p.id}`, { headers: host })
      }
    }
  }

  const tasksRes = await request.get(`${API_BASE}/host/tasks`, { headers: host })
  if (tasksRes.ok()) {
    const body = await tasksRes.json()
    const tasks = body.tasks || body || []
    for (const t of Array.isArray(tasks) ? tasks : []) {
      const title = t.title || ''
      const summary = t.summary || ''
      if (title.startsWith('E2E') || summary === 'E2E smoke') {
        await request.delete(`${API_BASE}/host/tasks/${t.id}`, { headers: host })
      }
    }
  }
}

module.exports = {
  API_BASE,
  isApiUp,
  createInstantTask,
  deleteTask,
  registerPlayer,
  deletePlayer,
  clearPlayerStorage,
  findPlayerByName,
  cleanupE2eFixtures
}
