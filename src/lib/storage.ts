import type { Lang } from './i18n'
import { ALL_TABLES, type Operation } from './questions'

export type InputMode = 'voice' | 'keypad'

export interface Settings {
  lang: Lang
  operation: Operation
  tables: number[]
  inputMode: InputMode
}

export interface BestScore {
  score: number
  avgMs: number
}

const SETTINGS_KEY = 'base12math:settings'
const BEST_KEY = 'base12math:best'

function guessLang(): Lang {
  const browser = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase()
  if (browser.startsWith('he') || browser.startsWith('iw')) return 'he'
  if (browser.startsWith('nl')) return 'nl'
  return 'en'
}

const DEFAULT_SETTINGS: Settings = {
  lang: guessLang(),
  operation: 'multiply',
  tables: ALL_TABLES,
  inputMode: 'voice',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode or storage full: just don't remember */
  }
}

export function loadSettings(): Settings {
  const settings = read(SETTINGS_KEY, DEFAULT_SETTINGS)
  return settings.tables.length > 0 ? settings : DEFAULT_SETTINGS
}

export const saveSettings = (settings: Settings) => write(SETTINGS_KEY, settings)

/** Best scores are kept per practice set, so "only ×2" doesn't compete with "all tables". */
function practiceKey(operation: Operation, tables: number[]) {
  return `${operation}:${[...tables].sort((a, b) => a - b).join(',')}`
}

export function loadBest(operation: Operation, tables: number[]): BestScore | null {
  return read<Record<string, BestScore>>(BEST_KEY, {})[practiceKey(operation, tables)] ?? null
}

/** Saves the result if it beats the best score; returns true when it did. */
export function recordBest(operation: Operation, tables: number[], result: BestScore): boolean {
  const all = read<Record<string, BestScore>>(BEST_KEY, {})
  const key = practiceKey(operation, tables)
  const best = all[key]
  const better = !best || result.score > best.score || (result.score === best.score && result.avgMs < best.avgMs)
  if (better) write(BEST_KEY, { ...all, [key]: result })
  return better
}
