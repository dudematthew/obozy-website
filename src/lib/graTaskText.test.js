import { describe, expect, it } from 'vitest'
import { isTaskBodyRedundant, stripTaskCatchphrase, TASK_CATCHPHRASE } from './graTaskText'

describe('graTaskText', () => {
  it('treats empty body as redundant', () => {
    expect(isTaskBodyRedundant('Short', '')).toBe(true)
    expect(isTaskBodyRedundant('Short', null)).toBe(true)
  })

  it('treats identical summary and body as redundant', () => {
    const text = 'Zdobądź jajko od organizatorów.'
    expect(isTaskBodyRedundant(text, text)).toBe(true)
  })

  it('ignores catchphrase when comparing', () => {
    const text = 'Zdobądź jajko od organizatorów.'
    expect(isTaskBodyRedundant(`${TASK_CATCHPHRASE} ${text}`, text)).toBe(true)
  })

  it('keeps distinct body', () => {
    expect(isTaskBodyRedundant('Krótki opis.', '## Pełne reguły\n\nWięcej szczegółów.')).toBe(false)
  })

  it('stripTaskCatchphrase leaves plain text', () => {
    expect(stripTaskCatchphrase(`${TASK_CATCHPHRASE} Hello`)).toBe('Hello')
    expect(stripTaskCatchphrase('Hello')).toBe('Hello')
  })
})
