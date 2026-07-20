import { beforeEach, describe, expect, it, vi } from 'vitest'
import { upsertAccount, getActiveToken, clearAllAccounts } from '@/lib/graAccounts'
import { api } from './graClient'

beforeEach(() => {
  clearAllAccounts()
  vi.unstubAllGlobals()
})

describe('graClient api()', () => {
  it('clears player session and throws playerSessionExpired on stale token 401', async () => {
    upsertAccount({ token: 'dead-token', displayName: 'X', id: 1 })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({
        error: 'unauthorized',
        message: 'Invalid player token'
      })
    }))

    await expect(api('/players/me', { playerToken: 'dead-token' })).rejects.toMatchObject({
      playerSessionExpired: true
    })
    expect(getActiveToken()).toBeNull()
  })

  it('does not clear session on 401 when no player token was sent', async () => {
    upsertAccount({ token: 'keep-me', displayName: 'X', id: 1 })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({
        error: 'unauthorized',
        message: 'Invalid player token'
      })
    }))

    try {
      await api('/tasks/accept/foo')
    } catch (err) {
      expect(err.playerSessionExpired).toBeUndefined()
    }
    expect(getActiveToken()).toBe('keep-me')
  })
})
