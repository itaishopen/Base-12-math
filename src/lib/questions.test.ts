import { describe, expect, it } from 'vitest'
import { ALL_TABLES, ROUND_SIZE, buildPool, buildRound } from './questions'

describe('buildPool', () => {
  it('contains every multiplication fact 1–12 once', () => {
    const pool = buildPool(ALL_TABLES, 'multiply')
    expect(pool).toHaveLength(144)
    expect(pool.every((q) => q.answer === q.a * q.b)).toBe(true)
  })

  it('only makes divisions with whole answers from 1 to 12', () => {
    const pool = buildPool(ALL_TABLES, 'divide')
    expect(pool).toHaveLength(144)
    for (const q of pool) {
      expect(Number.isInteger(q.answer)).toBe(true)
      expect(q.answer).toBeGreaterThanOrEqual(1)
      expect(q.answer).toBeLessThanOrEqual(12)
      expect(q.a).toBe(q.answer * q.b)
    }
  })

  it('keeps every question in the selected tables', () => {
    const pool = buildPool([7], 'both')
    for (const q of pool) {
      if (q.op === '×') expect(q.a === 7 || q.b === 7).toBe(true)
      else expect(q.b).toBe(7)
    }
  })
})

describe('buildRound', () => {
  it('returns ROUND_SIZE different questions', () => {
    const round = buildRound([1], 'multiply')
    expect(round).toHaveLength(ROUND_SIZE)
    expect(new Set(round.map((q) => q.key)).size).toBe(ROUND_SIZE)
  })
})
