import { useEffect } from 'react'

interface Props {
  value: string
  disabled: boolean
  onChange(value: string): void
  onSubmit(): void
}

const MAX_DIGITS = 3
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓']

/** Fallback when voice isn't available. Also works with a physical keyboard. */
export function Keypad({ value, disabled, onChange, onSubmit }: Props) {
  const press = (key: string) => {
    if (disabled) return
    if (key === '⌫') onChange(value.slice(0, -1))
    else if (key === '✓') onSubmit()
    else if (value.length < MAX_DIGITS) onChange(value + key)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('⌫')
      else if (e.key === 'Enter') press('✓')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="keypad" dir="ltr">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className={`key ${key === '✓' ? 'key-ok' : ''} ${key === '⌫' ? 'key-back' : ''}`}
          disabled={disabled}
          onClick={() => press(key)}
        >
          {key}
        </button>
      ))}
    </div>
  )
}
