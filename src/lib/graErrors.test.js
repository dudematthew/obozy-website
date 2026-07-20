import { describe, expect, it } from 'vitest'
import { isStalePlayerTokenError, polishApiMessage } from './graErrors'

describe('isStalePlayerTokenError', () => {
  it('returns false when no token was sent', () => {
    const err = { error: 'unauthorized', _rawMessage: 'Invalid player token' }
    expect(isStalePlayerTokenError(err, false)).toBe(false)
    expect(isStalePlayerTokenError(err, null)).toBe(false)
  })

  it('matches invalid player token when token was sent', () => {
    const err = {
      error: 'unauthorized',
      _rawMessage: 'Invalid player token',
      message: polishApiMessage('Invalid player token')
    }
    expect(isStalePlayerTokenError(err, 'abc')).toBe(true)
  })

  it('matches missing player token', () => {
    const err = { error: 'unauthorized', _rawMessage: 'Missing player token' }
    expect(isStalePlayerTokenError(err, 'tok')).toBe(true)
  })

  it('ignores other 401 errors', () => {
    const err = { error: 'unauthorized', _rawMessage: 'Invalid host credentials' }
    expect(isStalePlayerTokenError(err, 'tok')).toBe(false)
  })
})
