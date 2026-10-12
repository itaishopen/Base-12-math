interface Props {
  timeLeft: number
  total: number
  unit: string
  paused: boolean
}

/** Vertical countdown that drains from full to empty, green → orange → red. */
export function TimerBar({ timeLeft, total, unit, paused }: Props) {
  const fraction = timeLeft / total
  const seconds = Math.ceil(timeLeft / 1000)
  const level = fraction > 0.5 ? 'high' : fraction > 0.25 ? 'mid' : 'low'

  return (
    <aside
      className={`timer timer-${level} ${paused ? 'is-paused' : ''}`}
      role="timer"
      aria-label={`${seconds}${unit}`}
    >
      <span className="timer-seconds">{seconds}</span>
      <div className="timer-track">
        <div className="timer-fill" style={{ transform: `scaleY(${fraction})` }} />
      </div>
    </aside>
  )
}
