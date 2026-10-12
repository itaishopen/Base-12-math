/**
 * Thin wrappers around the browser Web Speech API:
 *  - speak(): text-to-speech, as a Promise that resolves when speech ends
 *  - listen(): speech recognition with automatic restarts
 */

// ---------- Text to speech ----------

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

let voices: SpeechSynthesisVoice[] = []
const voiceListeners = new Set<() => void>()

if (canSpeak) {
  const load = () => {
    voices = window.speechSynthesis.getVoices()
    voiceListeners.forEach((cb) => cb())
  }
  load()
  window.speechSynthesis.addEventListener('voiceschanged', load)
}

/** Calls `cb` whenever the device's voice list changes (voices load asynchronously). */
export function onVoicesChanged(cb: () => void): () => void {
  voiceListeners.add(cb)
  return () => voiceListeners.delete(cb)
}

// Android reports Hebrew with the legacy code "iw".
const normalizeLang = (tag: string) => tag.toLowerCase().replace('_', '-').replace(/^iw\b/, 'he')

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const wanted = normalizeLang(lang)
  const prefix = wanted.split('-')[0]
  return (
    voices.find((v) => normalizeLang(v.lang) === wanted) ??
    voices.find((v) => normalizeLang(v.lang).split('-')[0] === prefix)
  )
}

/** Null while the voice list is still unknown (some browsers load it late). */
export function hasVoiceFor(lang: string): boolean | null {
  if (!canSpeak) return false
  if (voices.length === 0) return null
  return pickVoice(lang) !== undefined
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}

/**
 * iOS only lets a page speak after speech starts inside a user gesture.
 * Call this from a click handler before the game starts.
 */
export function unlockSpeech() {
  if (!canSpeak) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  window.speechSynthesis.speak(u)
}

export function speak(text: string, lang: string, rate = 0.95): Promise<void> {
  if (!canSpeak) return Promise.resolve()
  const synth = window.speechSynthesis
  synth.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  const voice = pickVoice(lang)
  if (voice) utterance.voice = voice

  return new Promise((resolve) => {
    let finished = false
    // Some browsers occasionally never fire `end`, so don't wait forever.
    const fallback = setTimeout(() => finish(), 2000 + text.length * 120)
    function finish() {
      if (finished) return
      finished = true
      clearTimeout(fallback)
      resolve()
    }
    utterance.onend = finish
    utterance.onerror = finish
    synth.speak(utterance)
  })
}

// ---------- Speech recognition ----------

interface RecognitionAlternative {
  transcript: string
}
interface RecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  [index: number]: RecognitionAlternative
}
interface RecognitionEvent {
  readonly resultIndex: number
  readonly results: { readonly length: number; [index: number]: RecognitionResult }
}
interface Recognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
type RecognitionCtor = new () => Recognition

const RecognitionImpl: RecognitionCtor | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as Record<string, RecognitionCtor | undefined>).SpeechRecognition ??
      (window as unknown as Record<string, RecognitionCtor | undefined>).webkitSpeechRecognition)

export const canRecognize = RecognitionImpl !== undefined

export type RecognitionFailure = 'blocked' | 'language' | 'other'

export interface ListenHandlers {
  /** Alternatives for the current phrase, best guess first. */
  onResult(alternatives: string[], isFinal: boolean): void
  /** Recognition can't work here; the caller should fall back to the keypad. */
  onFailure(reason: RecognitionFailure): void
}

/** Starts listening; returns a function that stops listening. */
export function listen(lang: string, handlers: ListenHandlers): () => void {
  if (!RecognitionImpl) {
    handlers.onFailure('other')
    return () => {}
  }
  const rec = new RecognitionImpl()
  rec.lang = lang
  rec.continuous = true
  rec.interimResults = true
  rec.maxAlternatives = 3

  let active = true
  let restarts = 0

  rec.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const alternatives: string[] = []
      for (let j = 0; j < result.length; j++) alternatives.push(result[j].transcript)
      handlers.onResult(alternatives, result.isFinal)
    }
  }

  rec.onerror = (event) => {
    // "no-speech" and "aborted" are normal; recognition simply restarts.
    if (event.error === 'no-speech' || event.error === 'aborted') return
    active = false
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
      handlers.onFailure('blocked')
    } else if (event.error === 'language-not-supported') {
      handlers.onFailure('language')
    } else {
      handlers.onFailure('other')
    }
  }

  // Browsers stop listening after a pause; keep going while the question is open.
  rec.onend = () => {
    if (!active) return
    if (++restarts > 20) {
      active = false
      handlers.onFailure('other')
      return
    }
    try {
      rec.start()
    } catch {
      /* already starting */
    }
  }

  try {
    rec.start()
  } catch {
    active = false
    handlers.onFailure('other')
  }

  return () => {
    active = false
    rec.onresult = null
    rec.onerror = null
    rec.onend = null
    try {
      rec.abort()
    } catch {
      /* already stopped */
    }
  }
}

/**
 * Asks for microphone access up front (from the Play click), so the permission
 * prompt doesn't eat into the first question's 10 seconds.
 */
export async function requestMicrophone(): Promise<boolean> {
  if (!navigator.mediaDevices?.getUserMedia) return true // let recognition ask for itself
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch {
    return false
  }
}
