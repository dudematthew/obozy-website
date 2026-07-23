import { describe, expect, it } from 'vitest'
import { displayTaskCode, isUsableToken, playTaskUrl, verifyTaskUrl } from './graUrls'

describe('graUrls', () => {
  it('isUsableToken rejects empty and placeholder strings', () => {
    expect(isUsableToken(null)).toBe(false)
    expect(isUsableToken('')).toBe(false)
    expect(isUsableToken('undefined')).toBe(false)
    expect(isUsableToken('null')).toBe(false)
    expect(isUsableToken(' abc ')).toBe(true)
  })

  it('builds play and verify paths when token valid', () => {
    expect(playTaskUrl('tok_123')).toContain('/gra/t/tok_123')
    expect(verifyTaskUrl('ver_456')).toContain('/gra/v/ver_456')
    expect(playTaskUrl('')).toBe('')
  })

  it('builds phrase play paths without mangling hyphens', () => {
    const phrase = 'kaczka-kalafior-szop-kotlet-margaryna'
    expect(playTaskUrl(phrase)).toContain(`/gra/t/${encodeURIComponent(phrase)}`)
    expect(displayTaskCode(` ${phrase.toUpperCase()} `)).toBe(phrase)
  })
})
