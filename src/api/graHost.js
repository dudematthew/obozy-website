import { api } from './graClient'

export function hostListTasks (hostToken) {
  return api('/host/tasks', { hostToken })
}

export function hostCreateTask (hostToken, payload) {
  return api('/host/tasks', {
    method: 'POST',
    body: payload,
    hostToken
  })
}

export function hostUpdateTask (hostToken, id, payload) {
  return api(`/host/tasks/${id}`, {
    method: 'PUT',
    body: payload,
    hostToken
  })
}

export function hostComplete (hostToken, assignmentId) {
  return api(`/host/assignments/${assignmentId}/complete`, {
    method: 'POST',
    body: {},
    hostToken
  })
}

export function hostRevokeCompletion (hostToken, assignmentId) {
  return api(`/host/assignments/${assignmentId}/revoke-completion`, {
    method: 'POST',
    body: {},
    hostToken
  })
}

export function hostFail (hostToken, assignmentId) {
  return api(`/host/assignments/${assignmentId}/fail`, {
    method: 'POST',
    body: {},
    hostToken
  })
}

export function hostSetStake (hostToken, assignmentId, stake) {
  return api(`/host/assignments/${assignmentId}/set-stake`, {
    method: 'POST',
    body: { stake },
    hostToken
  })
}

export function hostResolveStake (hostToken, assignmentId, won) {
  return api(`/host/assignments/${assignmentId}/resolve-stake`, {
    method: 'POST',
    body: { won },
    hostToken
  })
}

export function hostResolveVersus (hostToken, taskId, winnerPlayerId) {
  return api(`/host/tasks/${taskId}/resolve-versus`, {
    method: 'POST',
    body: { winnerPlayerId },
    hostToken
  })
}

export function hostRelease (hostToken, taskId) {
  return api(`/host/tasks/${taskId}/release`, {
    method: 'POST',
    body: {},
    hostToken
  })
}

export function hostPlayerAssignments (hostToken, playerId) {
  return api(`/host/players/${playerId}/assignments`, { hostToken })
}
