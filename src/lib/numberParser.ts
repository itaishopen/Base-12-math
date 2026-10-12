import type { Lang } from './i18n'

/**
 * Turns a speech-recognition transcript into the numbers it contains.
 *
 * Recognizers usually return digits ("56"), but depending on device and
 * language they may also return words ("fifty six", "zesenvijftig",
 * "חמישים ושש"). We handle both, for the range this game needs (0–144+).
 */

type Vocabulary = Record<string, number>

const HUNDRED = 100

const EN: Vocabulary = {
  zero: 0, oh: 0,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fourty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90,
  hundred: HUNDRED,
}
const EN_FILLERS = new Set(['and', 'a'])

// Dutch writes numbers as one compound word ("vierenveertig"), so we also
// split words into these parts.
const NL: Vocabulary = {
  nul: 0,
  een: 1, één: 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9,
  tien: 10, elf: 11, twaalf: 12, dertien: 13, veertien: 14, vijftien: 15,
  zestien: 16, zeventien: 17, achttien: 18, negentien: 19,
  twintig: 20, dertig: 30, veertig: 40, vijftig: 50, zestig: 60,
  zeventig: 70, tachtig: 80, negentig: 90,
  honderd: HUNDRED,
}
const NL_FILLERS = new Set(['en'])

// Hebrew: masculine and feminine forms, with and without the "ו" (and) prefix.
const HE: Vocabulary = {
  אפס: 0,
  אחת: 1, אחד: 1,
  שתיים: 2, שתים: 2, שניים: 2, שנים: 2, שתי: 2, שני: 2,
  שלוש: 3, שלושה: 3, שלש: 3, שלשה: 3,
  ארבע: 4, ארבעה: 4,
  חמש: 5, חמישה: 5, חמשה: 5,
  שש: 6, שישה: 6, ששה: 6,
  שבע: 7, שבעה: 7,
  שמונה: 8,
  תשע: 9, תשעה: 9,
  עשר: 10, עשרה: 10,
  עשרים: 20, שלושים: 30, שלשים: 30, ארבעים: 40, חמישים: 50, שישים: 60, ששים: 60,
  שבעים: 70, שמונים: 80, תשעים: 90,
  מאה: HUNDRED,
}

const VOCAB: Record<Lang, Vocabulary> = { en: EN, nl: NL, he: HE }
const FILLERS: Record<Lang, Set<string>> = { en: EN_FILLERS, nl: NL_FILLERS, he: new Set() }

/** Splits a Dutch compound like "honderdvierenveertig" into known parts. */
function splitDutchCompound(word: string): string[] | null {
  const parts = [...Object.keys(NL), 'en'].sort((a, b) => b.length - a.length)
  const result: string[] = []
  let rest = word
  while (rest.length > 0) {
    const part = parts.find((p) => rest.startsWith(p))
    if (!part) return null
    result.push(part)
    rest = rest.slice(part.length)
  }
  return result
}

/** Expands one raw token into vocabulary tokens, or null if it isn't a number word. */
function expandToken(token: string, lang: Lang): string[] | null {
  const vocab = VOCAB[lang]
  if (token in vocab || FILLERS[lang].has(token)) return [token]
  if (lang === 'nl') return splitDutchCompound(token)
  if (lang === 'he' && token.startsWith('ו') && token.slice(1) in vocab) return [token.slice(1)]
  return null
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, '') // Hebrew vowel points (niqqud)
    .replace(/ë/g, 'e')
    .replace(/[-–—,.!?;:"'״׳]/g, ' ')
}

/** Converts a run of number words into a value, e.g. [hundred, forty, four] → 144. */
function wordsToNumber(tokens: string[], lang: Lang): number | null {
  const vocab = VOCAB[lang]
  let total = 0
  let current = 0
  let sawNumber = false
  for (const token of tokens) {
    if (FILLERS[lang].has(token)) continue
    const value = vocab[token]
    sawNumber = true
    if (value === HUNDRED) {
      total += (current || 1) * HUNDRED
      current = 0
    } else {
      current += value
    }
  }
  return sawNumber ? total + current : null
}

/** Returns every number found in the transcript, in spoken order. */
export function parseNumbers(transcript: string, lang: Lang): number[] {
  const text = normalize(transcript)
  const numbers: number[] = []
  let run: string[] = []

  const flush = () => {
    const value = wordsToNumber(run, lang)
    if (value !== null) numbers.push(value)
    run = []
  }

  for (const raw of text.split(/\s+/).filter(Boolean)) {
    if (/^\d+$/.test(raw)) {
      flush()
      numbers.push(Number(raw))
      continue
    }
    // Hebrew can attach "ו" (and) to a number in digits, as in "ו6".
    const prefixedDigit = /^ו(\d+)$/.exec(raw)
    if (lang === 'he' && prefixedDigit) {
      flush()
      numbers.push(Number(prefixedDigit[1]))
      continue
    }
    const expanded = expandToken(raw, lang)
    if (expanded) {
      run.push(...expanded)
    } else {
      flush()
    }
  }
  flush()
  return numbers
}

/** The number the child most likely meant: the last one they said. */
export function lastNumber(transcript: string, lang: Lang): number | null {
  const numbers = parseNumbers(transcript, lang)
  return numbers.length > 0 ? numbers[numbers.length - 1] : null
}
