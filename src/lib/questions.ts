export type Operation = 'multiply' | 'divide' | 'both'

export interface Question {
  /** Stable identity of the fact, e.g. "7×8" or "56÷7". */
  key: string
  a: number
  op: '×' | '÷'
  b: number
  answer: number
  /** True when this is a repeat of a question missed earlier in the round. */
  retry: boolean
}

export const ROUND_SIZE = 10
export const ALL_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function makeQuestion(a: number, op: '×' | '÷', b: number): Question {
  const answer = op === '×' ? a * b : a / b
  return { key: `${a}${op}${b}`, a, op, b, answer, retry: false }
}

/** Every fact that belongs to the chosen tables and operation(s). */
export function buildPool(tables: number[], operation: Operation): Question[] {
  const pool = new Map<string, Question>()
  for (const table of tables) {
    for (let n = 1; n <= 12; n++) {
      if (operation !== 'divide') {
        // Ask both orders (7×8 and 8×7), so the table can be on either side.
        for (const q of [makeQuestion(table, '×', n), makeQuestion(n, '×', table)]) pool.set(q.key, q)
      }
      if (operation !== 'multiply') {
        // Every division comes from the same table, so the answer is always a whole number 1–12.
        const q = makeQuestion(table * n, '÷', table)
        pool.set(q.key, q)
      }
    }
  }
  return [...pool.values()]
}

/** Picks ROUND_SIZE different questions at random. */
export function buildRound(
  tables: number[],
  operation: Operation,
  random: () => number = Math.random,
): Question[] {
  return shuffle(buildPool(tables, operation), random).slice(0, ROUND_SIZE)
}

export function retryOf(question: Question): Question {
  return { ...question, retry: true }
}
