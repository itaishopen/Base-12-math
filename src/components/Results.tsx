import { useEffect } from 'react'
import { STRINGS, type Lang } from '../lib/i18n'
import { ROUND_SIZE } from '../lib/questions'
import { speak } from '../lib/speech'
import type { AnswerRecord } from './Game'

export interface RoundSummary {
  records: AnswerRecord[]
  /** Correct on the first try, out of ROUND_SIZE. Retries don't count. */
  score: number
  avgMs: number
  isNewBest: boolean
}

interface Props {
  lang: Lang
  summary: RoundSummary
  onPlayAgain(): void
  onMenu(): void
}

function starsFor(score: number): number {
  if (score >= ROUND_SIZE) return 3
  if (score >= 8) return 2
  if (score >= 5) return 1
  return 0
}

export function Results({ lang, summary, onPlayAgain, onMenu }: Props) {
  const t = STRINGS[lang]
  const stars = starsFor(summary.score)
  const missed = summary.records.filter((r) => !r.correct && !r.question.retry).map((r) => r.question)

  useEffect(() => {
    speak(t.roundDone, t.speechLang)
  }, [summary, t])

  return (
    <div className="results">
      <section className="card results-card">
        <h1>{t.roundDone}</h1>
        <div className="stars" aria-label={`${stars} / 3`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={`star ${n <= stars ? 'is-on' : ''}`} style={{ animationDelay: `${n * 150}ms` }}>
              ★
            </span>
          ))}
        </div>
        {summary.isNewBest && <p className="new-best">🏆 {t.newBest}</p>}

        <dl className="stats">
          <div>
            <dt>{t.score}</dt>
            <dd dir="ltr">
              {summary.score}/{ROUND_SIZE}
            </dd>
          </div>
          <div>
            <dt>{t.avgTime}</dt>
            <dd>
              {summary.avgMs > 0 ? (
                <>
                  <bdi>{(summary.avgMs / 1000).toFixed(1)}</bdi> {t.seconds}
                </>
              ) : (
                '–'
              )}
            </dd>
          </div>
        </dl>

        {missed.length > 0 ? (
          <>
            <h2>{t.practiseThese}</h2>
            <ul className="missed" dir="ltr">
              {missed.map((q) => (
                <li key={q.key}>
                  {q.a} {q.op} {q.b} = <strong>{q.answer}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>🎉 {t.allCorrect}</p>
        )}
      </section>

      <div className="play-row">
        <button type="button" className="btn btn-play" onClick={onPlayAgain}>
          ↻ {t.playAgain}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onMenu}>
          {t.menu}
        </button>
      </div>
    </div>
  )
}
