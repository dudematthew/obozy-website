import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearAllAccounts,
  getAccounts,
  getActiveToken,
  invalidateActivePlayerSession,
  removeAccount,
  upsertAccount
} from './graAccounts'

beforeEach(() => {
  clearAllAccounts()
})

describe('graAccounts', () => {
  it('invalidateActivePlayerSession removes active token and account entry', () => {
    upsertAccount({ token: 'tok-a', displayName: 'A', id: 1 })
    upsertAccount({ token: 'tok-b', displayName: 'B', id: 2 })
    expect(getActiveToken()).toBe('tok-b')

    invalidateActivePlayerSession()
    expect(getActiveToken()).toBe('tok-a')
    expect(getAccounts().map((a) => a.token)).toEqual(['tok-a'])
  })

  it('invalidateActivePlayerSession is no-op without active token', () => {
    upsertAccount({ token: 'tok-a', displayName: 'A', id: 1 })
    removeAccount('tok-a')
    invalidateActivePlayerSession()
    expect(getActiveToken()).toBeNull()
  })

  it('removeAccount promotes another saved account to active', () => {
    upsertAccount({ token: 'tok-a', displayName: 'A', id: 1 })
    upsertAccount({ token: 'tok-b', displayName: 'B', id: 2 })
    removeAccount('tok-b')
    expect(getActiveToken()).toBe('tok-a')
  })
})
