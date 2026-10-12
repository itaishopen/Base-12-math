import { useCallback, useEffect, useRef, useState } from 'react'
import { STRINGS } from '../lib/i18n'
import { lastNumber } from '../lib/numberParser'
import { buildRound, retryOf, type Question } from '../lib/questions'
import { listen, speak, stopSpeaking, type RecognitionFailure } from '../lib/speech'
import type { InputMode, Settings } from '../lib/storage'
import { Keypad } from './Keypad'
import { TimerBar } from './TimerBar'

export const ANSWER_TIME_MS = 10_000
/** How long an interim (not yet final) correct answer must stay unchanged before we accept it. */
const INTERIM_SETTLE_MS = 450

export interface AnswerRecord {
  question: Question
  correct: boolean
  given: number | null
  timeMs: number
}

type Phase = 'asking' | 'answering' | 'feedback'

interface Props {
  settings: Settings
  /** Set when the microphone was refused before the game started. */
  initialNotice: string | null
  onFinish(records: AnswerRecord[]): void
  onQuit(): void
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function Game({ settings, initialNotice, onFinish, onQuit }: Props) {
  const { lang } = settings
  const t = STRINGS[lang]

  const [queue, setQueue] = useState<Question[]>(() => buildRound(settings.tables, settings.operation))
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('asking')
  const [mode, setMode] = useState<InputMode>(initialNotice ? 'keypad' : settings.inputMode)
  const [notice, setNotice] = useState<string | null>(initialNotice)
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIME_MS)
  const [heard, setHeard] = useState('')
  const [typed, setTyped] = useState('')
  const [last, setLast] = useState<AnswerRecord | null>(null)
  const [praise, setPraise] = useState('')
  const [records, setRecords] = useState<AnswerRecord[]>([])

  const answerStartedAt = useRef(0)
  // True only while an answer is accepted; guards against double answers
  // (e.g. the timer and the voice in the same tick).
  const accepting = useRef(false)

  const question = queue[index]
  const questionText = t.sayQuestion(question.a, question.op, question.b)

  useEffect(() => stopSpeaking, [])

  const submit = useCallback(
    (given: number | null) => {
      if (!accepting.current) return
      accepting.current = false
      const record: AnswerRecord = {
        question,
        given,
        correct: given === question.answer,
        timeMs: Math.round(performance.now() - answerStartedAt.current),
      }
      setRecords((r) => [...r, record])
      // Missed facts come back once at the end of the round.
      if (!record.correct && !question.retry) setQueue((q) => [...q, retryOf(question)])
      setLast(record)
      setPraise(pick(t.praise))
      setPhase('feedback')
    },
    [question, t],
  )

  // 1. Ask the question out loud, then start the clock.
  useEffect(() => {
    if (phase !== 'asking') return
    let cancelled = false
    const intro = index === 0 ? `${t.letsGo} ` : ''
    speak(intro + questionText, t.speechLang).then(() => {
      if (cancelled) return
      answerStartedAt.current = performance.now()
      accepting.current = true
      setPhase('answering')
    })
    return () => {
      cancelled = true
    }
  }, [phase, index, questionText, t])

  // 2a. Count down.
  useEffect(() => {
    if (phase !== 'answering') return
    const deadline = Date.now() + ANSWER_TIME_MS
    const timer = setInterval(() => {
      const left = Math.max(0, deadline - Date.now())
      setTimeLeft(left)
      if (left === 0) submit(null)
    }, 100)
    return () => clearInterval(timer)
  }, [phase, submit])

  // 2b. Listen for the spoken answer.
  useEffect(() => {
    if (phase !== 'answering' || mode !== 'voice') return
    let settle: ReturnType<typeof setTimeout> | undefined

    const fail = (reason: RecognitionFailure) => {
      setMode('keypad')
      setNotice(reason === 'blocked' ? t.micBlocked : reason === 'language' ? t.langNotSupported : t.noRecognition)
    }

    const stop = listen(t.speechLang, {
      onResult(alternatives, isFinal) {
        clearTimeout(settle)
        setHeard(alternatives[0].trim())
        const numbers = alternatives.map((text) => lastNumber(text, lang)).filter((n) => n !== null)
        if (numbers.length === 0) return // not a number (yet): keep listening
        if (isFinal) {
          // Kids' speech is hard to recognise: accept it if any guess is right.
          submit(numbers.includes(question.answer) ? question.answer : numbers[0])
        } else if (numbers[0] === question.answer) {
          // Accept a correct interim result quickly, unless the child keeps talking.
          settle = setTimeout(() => submit(question.answer), INTERIM_SETTLE_MS)
        }
      },
      onFailure: fail,
    })
    return () => {
      clearTimeout(settle)
      stop()
    }
  }, [phase, mode, lang, question, submit, t])

  // 3. Feedback, then the next question (or the results).
  useEffect(() => {
    if (phase !== 'feedback' || !last) return
    let cancelled = false
    const text = last.correct ? praise : t.sayAnswer(questionText, question.answer)
    speak(text, t.speechLang)
      .then(() => new Promise((r) => setTimeout(r, last.correct ? 250 : 700)))
      .then(() => {
        if (cancelled) return
        if (index + 1 < queue.length) {
          setHeard('')
          setTyped('')
          setLast(null)
          setTimeLeft(ANSWER_TIME_MS)
          setIndex(index + 1)
          setPhase('asking')
        } else {
          onFinish(records)
        }
      })
    return () => {
      cancelled = true
    }
  }, [phase, last, praise, records, index, queue.length, question, questionText, onFinish, t])

  const onKeypadChange = (value: string) => {
    if (phase !== 'answering') return
    setTyped(value)
    // Accept the right answer as soon as it's typed; a wrong one needs OK.
    if (Number(value) === question.answer) submit(question.answer)
  }

  const onKeypadSubmit = () => {
    if (phase === 'answering' && typed !== '') submit(Number(typed))
  }

  const shown =
    phase === 'feedback' ? String(question.answer) : mode === 'keypad' && typed !== '' ? typed : '?'

  const feedbackClass = phase === 'feedback' && last ? (last.correct ? 'is-correct' : 'is-wrong') : ''

  return (
    <div className="game">
      <header className="game-header">
        <div className="progress">
          <span className="progress-label">{t.questionOf(index + 1, queue.length)}</span>
          <ol className="progress-dots" aria-hidden="true">
            {queue.map((q, i) => {
              const r = records[i]
              const state = r ? (r.correct ? 'ok' : 'miss') : i === index ? 'now' : ''
              return <li key={i} className={`dot ${state} ${q.retry ? 'retry' : ''}`} />
            })}
          </ol>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onQuit}>
          {t.quit}
        </button>
      </header>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <main className="stage">
        <section className={`card question-card ${feedbackClass}`}>
          {question.retry && <span className="badge">↻ {t.again}</span>}
          <div className="question" dir="ltr" aria-live="polite">
            <span>{question.a}</span>
            <span className="op">{question.op}</span>
            <span>{question.b}</span>
            <span className="op">=</span>
            <span className={`answer ${phase === 'feedback' ? 'revealed' : ''}`}>{shown}</span>
          </div>

          <div className="status" aria-live="polite">
            {phase === 'asking' && <span className="muted">🔊 {t.getReady}</span>}
            {phase === 'answering' && mode === 'voice' && (
              <span className="listening">
                <span className="mic" aria-hidden="true">
                  🎤
                </span>
                {heard ? (
                  <>
                    {t.heard} <bdi className="heard">“{heard}”</bdi>
                  </>
                ) : (
                  t.listening
                )}
              </span>
            )}
            {phase === 'feedback' && last && (
              <span className="feedback">
                {last.correct ? `✅ ${praise}` : last.given === null ? `⏰ ${t.timeUp}` : `❌ ${t.yourAnswer(last.given)}`}
              </span>
            )}
          </div>

          {mode === 'keypad' && (
            <Keypad value={typed} disabled={phase !== 'answering'} onChange={onKeypadChange} onSubmit={onKeypadSubmit} />
          )}
        </section>

        <TimerBar timeLeft={timeLeft} total={ANSWER_TIME_MS} unit={t.seconds} paused={phase !== 'answering'} />
      </main>
    </div>
  )
}
