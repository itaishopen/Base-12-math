import { useCallback, useEffect, useState } from 'react'
import { Game, type AnswerRecord } from './components/Game'
import { Results, type RoundSummary } from './components/Results'
import { Setup } from './components/Setup'
import { STRINGS } from './lib/i18n'
import { canRecognize, requestMicrophone, stopSpeaking, unlockSpeech } from './lib/speech'
import { loadSettings, recordBest, saveSettings, type Settings } from './lib/storage'

type Screen =
  | { name: 'setup' }
  | { name: 'game'; round: number; notice: string | null }
  | { name: 'results'; summary: RoundSummary }

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [screen, setScreen] = useState<Screen>({ name: 'setup' })
  const [round, setRound] = useState(0)
  const t = STRINGS[settings.lang]

  useEffect(() => {
    document.documentElement.lang = settings.lang
    document.documentElement.dir = t.dir
    document.title = t.title
  }, [settings.lang, t])

  const changeSettings = (next: Settings) => {
    setSettings(next)
    saveSettings(next)
  }

  const play = async () => {
    // Both must happen inside the tap, or mobile browsers block them.
    unlockSpeech()
    let notice: string | null = null
    if (settings.inputMode === 'voice') {
      if (!canRecognize) notice = t.noRecognition
      else if (!(await requestMicrophone())) notice = t.micBlocked
    }
    setRound((r) => r + 1)
    setScreen({ name: 'game', round: round + 1, notice })
  }

  const finish = useCallback(
    (records: AnswerRecord[]) => {
      const firstTries = records.filter((r) => !r.question.retry)
      const correct = firstTries.filter((r) => r.correct)
      const score = correct.length
      const avgMs = correct.length ? correct.reduce((sum, r) => sum + r.timeMs, 0) / correct.length : 0
      const isNewBest = recordBest(settings.operation, settings.tables, { score, avgMs: avgMs || Number.MAX_SAFE_INTEGER })
      setScreen({ name: 'results', summary: { records, score, avgMs, isNewBest } })
    },
    [settings.operation, settings.tables],
  )

  const toMenu = () => {
    stopSpeaking()
    setScreen({ name: 'setup' })
  }

  return (
    <div className="app">
      {screen.name === 'setup' && <Setup settings={settings} onChange={changeSettings} onPlay={play} />}
      {screen.name === 'game' && (
        <Game
          key={screen.round}
          settings={settings}
          initialNotice={screen.notice}
          onFinish={finish}
          onQuit={toMenu}
        />
      )}
      {screen.name === 'results' && (
        <Results lang={settings.lang} summary={screen.summary} onPlayAgain={play} onMenu={toMenu} />
      )}
    </div>
  )
}
