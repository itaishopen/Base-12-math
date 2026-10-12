import { useSyncExternalStore } from 'react'
import { LANGS, STRINGS } from '../lib/i18n'
import { ALL_TABLES, type Operation } from '../lib/questions'
import { canRecognize, hasVoiceFor, onVoicesChanged } from '../lib/speech'
import { loadBest, type Settings } from '../lib/storage'

interface Props {
  settings: Settings
  onChange(settings: Settings): void
  onPlay(): void
}

const OPERATIONS: Operation[] = ['multiply', 'divide', 'both']

export function Setup({ settings, onChange, onPlay }: Props) {
  const t = STRINGS[settings.lang]
  const voiceAvailable = useSyncExternalStore(onVoicesChanged, () => hasVoiceFor(t.speechLang))

  const update = (patch: Partial<Settings>) => onChange({ ...settings, ...patch })

  const toggleTable = (n: number) => {
    const tables = settings.tables.includes(n)
      ? settings.tables.filter((x) => x !== n)
      : [...settings.tables, n].sort((a, b) => a - b)
    update({ tables })
  }

  const allSelected = settings.tables.length === ALL_TABLES.length
  const best = loadBest(settings.operation, settings.tables)
  const operationLabel = { multiply: t.multiply, divide: t.divide, both: t.both }

  return (
    <div className="setup">
      <header className="hero">
        <div className="hero-mark" aria-hidden="true">
          <span>7×8</span>
          <span>🎤</span>
        </div>
        <h1>{t.title}</h1>
        <p className="muted">{t.subtitle}</p>
      </header>

      <section className="card">
        <h2>{t.language}</h2>
        <div className="choices">
          {LANGS.map((lang) => (
            <button
              key={lang}
              type="button"
              className={`chip ${settings.lang === lang ? 'is-on' : ''}`}
              aria-pressed={settings.lang === lang}
              onClick={() => update({ lang })}
              lang={lang}
              dir={STRINGS[lang].dir}
            >
              {STRINGS[lang].languageName}
            </button>
          ))}
        </div>
        {voiceAvailable === false && <p className="notice">{t.noVoiceWarning}</p>}
      </section>

      <section className="card">
        <h2>{t.practise}</h2>
        <div className="choices">
          {OPERATIONS.map((operation) => (
            <button
              key={operation}
              type="button"
              className={`chip ${settings.operation === operation ? 'is-on' : ''}`}
              aria-pressed={settings.operation === operation}
              onClick={() => update({ operation })}
            >
              {operationLabel[operation]}
            </button>
          ))}
        </div>

        <h2>{t.tables}</h2>
        <div className="tables" dir="ltr">
          {ALL_TABLES.map((n) => (
            <button
              key={n}
              type="button"
              className={`chip chip-round ${settings.tables.includes(n) ? 'is-on' : ''}`}
              aria-pressed={settings.tables.includes(n)}
              onClick={() => toggleTable(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={`chip chip-all ${allSelected ? 'is-on' : ''}`}
            aria-pressed={allSelected}
            onClick={() => update({ tables: allSelected ? [] : ALL_TABLES })}
          >
            {t.all}
          </button>
        </div>
      </section>

      <section className="card">
        <h2>{t.answerWith}</h2>
        <div className="choices">
          <button
            type="button"
            className={`chip ${settings.inputMode === 'voice' ? 'is-on' : ''}`}
            aria-pressed={settings.inputMode === 'voice'}
            onClick={() => update({ inputMode: 'voice' })}
          >
            {t.voice}
          </button>
          <button
            type="button"
            className={`chip ${settings.inputMode === 'keypad' ? 'is-on' : ''}`}
            aria-pressed={settings.inputMode === 'keypad'}
            onClick={() => update({ inputMode: 'keypad' })}
          >
            {t.keypad}
          </button>
        </div>
        {settings.inputMode === 'voice' && !canRecognize && <p className="notice">{t.noRecognition}</p>}
      </section>

      <div className="play-row">
        <button type="button" className="btn btn-play" disabled={settings.tables.length === 0} onClick={onPlay}>
          ▶ {t.play}
        </button>
        {best && (
          <p className="muted">
            🏆 {t.best}: {best.score}/10
          </p>
        )}
      </div>
    </div>
  )
}
