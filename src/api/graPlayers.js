import { api } from './graClient'

export function listPlayers (query) {
  const q = query && String(query).trim()
  const path = q ? `/players?q=${encodeURIComponent(q)}` : '/players'
  return api(path)
}

export function getLeaderboard () {
  return api('/players/leaderboard')
}

export function registerPlayer (displayName) {
  return api('/players', {
    method: 'POST',
    body: { displayName }
  })
}

export function resumePlayerByName (displayName) {
  return api('/players/resume', {
    method: 'POST',
    body: { displayName }
  })
}

export function resumePlayerById (playerId) {
  return api('/players/resume', {
    method: 'POST',
    body: { playerId }
  })
}

export function getMe (playerToken) {
  return api('/players/me', { playerToken })
}

export function renamePlayer (playerToken, displayName) {
  return api('/players/me/rename', {
    method: 'POST',
    body: { displayName },
    playerToken
  })
}
