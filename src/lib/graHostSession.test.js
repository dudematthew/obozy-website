import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearHostMasterKey,
  clearHostToken,
  getHostHelpOpen,
  getHostMasterKey,
  getHostToken,
  setHostHelpOpen,
  setHostMasterKey,
  setHostToken
} from './graHostSession'

const TOKEN_KEY = 'obozy-gra-host-token'
const MASTER_KEY = 'obozy-gra-host-master-key'
const HELP_KEY = 'obozy-gra-host-help-open'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('graHostSession', () => {
  it('persists host token in localStorage', () => {
    setHostToken('secret-host-key')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('secret-host-key')
    expect(getHostToken()).toBe('secret-host-key')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('migrates token from sessionStorage once', () => {
    sessionStorage.setItem(TOKEN_KEY, 'legacy')
    expect(getHostToken()).toBe('legacy')
    expect(localStorage.getItem(TOKEN_KEY)).toBe('legacy')
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('clearHostToken removes master too', () => {
    setHostToken('h')
    setHostMasterKey('m')
    clearHostToken()
    expect(getHostToken()).toBeNull()
    expect(getHostMasterKey()).toBeNull()
  })

  it('help panel preference persists', () => {
    expect(getHostHelpOpen()).toBe(true)
    setHostHelpOpen(false)
    expect(getHostHelpOpen()).toBe(false)
    expect(localStorage.getItem(HELP_KEY)).toBe('0')
  })

  it('does not touch player account keys', () => {
    localStorage.setItem('obozy-gra-active-token', 'player-tok')
    localStorage.setItem('obozy-gra-accounts', '[]')
    setHostToken('host-tok')
    expect(localStorage.getItem('obozy-gra-active-token')).toBe('player-tok')
    clearHostToken()
    expect(localStorage.getItem('obozy-gra-active-token')).toBe('player-tok')
  })
})
