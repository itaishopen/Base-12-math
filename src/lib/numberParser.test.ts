import { describe, expect, it } from 'vitest'
import { lastNumber, parseNumbers } from './numberParser'

describe('parseNumbers', () => {
  it('reads digits in any language', () => {
    expect(parseNumbers('56', 'en')).toEqual([56])
    expect(parseNumbers('7 keer 8 is 56', 'nl')).toEqual([7, 8, 56])
    expect(parseNumbers('7 כפול 8 זה 56', 'he')).toEqual([7, 8, 56])
  })

  it('reads English words', () => {
    expect(lastNumber('fifty-six', 'en')).toBe(56)
    expect(lastNumber('one hundred and forty four', 'en')).toBe(144)
    expect(lastNumber('a hundred twenty', 'en')).toBe(120)
    expect(lastNumber('twelve', 'en')).toBe(12)
    expect(lastNumber('Seven.', 'en')).toBe(7)
  })

  it('reads Dutch compound words', () => {
    expect(lastNumber('zesenvijftig', 'nl')).toBe(56)
    expect(lastNumber('honderdvierenveertig', 'nl')).toBe(144)
    expect(lastNumber('honderd vierenveertig', 'nl')).toBe(144)
    expect(lastNumber('tweeëntwintig', 'nl')).toBe(22)
    expect(lastNumber('achttien', 'nl')).toBe(18)
    expect(lastNumber('honderdtwintig', 'nl')).toBe(120)
    expect(lastNumber('negenennegentig', 'nl')).toBe(99)
    expect(lastNumber('Elf!', 'nl')).toBe(11)
  })

  it('reads Hebrew words in both genders', () => {
    expect(lastNumber('חמישים ושש', 'he')).toBe(56)
    expect(lastNumber('חמישים ושישה', 'he')).toBe(56)
    expect(lastNumber('מאה ארבעים וארבע', 'he')).toBe(144)
    expect(lastNumber('שתים עשרה', 'he')).toBe(12)
    expect(lastNumber('שנים עשר', 'he')).toBe(12)
    expect(lastNumber('מאה ועשרים', 'he')).toBe(120)
    expect(lastNumber('שבע', 'he')).toBe(7)
  })

  it('returns null when no number was said', () => {
    expect(lastNumber('I do not know', 'en')).toBeNull()
    expect(lastNumber('ik weet het niet', 'nl')).toBeNull()
    expect(lastNumber('אני לא יודע', 'he')).toBeNull()
  })
})
