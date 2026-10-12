# Say the Answer! 🎤✖️

A voice-driven times-tables game for kids, in **English**, **Nederlands** and **עברית**.

The computer reads a question out loud, such as "7 times 8". The child has **10 seconds** to **say** the answer. A countdown bar at the side shows the time left.

**Play:** https://itaishopen.github.io/Base-12-math/

## How it works

- **Questions:** multiplication and division for tables 1–12. Every division has a whole-number answer, e.g. 84 ÷ 7 = 12.
- **Setup:** choose ×, ÷ or both, and which tables to practise.
- **Rounds:** each round has 10 questions. If the child gets one wrong or runs out of time, the game says the correct answer ("7 times 8 is 56") and moves on. Each missed question comes back once at the end of the round.
- **Score:** 0–3 stars, based on answers that were right the first time. The best score is saved on the device, separately for each practice set.
- **Voice:** uses the browser's Web Speech API, both for speaking (speech synthesis) and for listening (speech recognition). The parser in `src/lib/numberParser.ts` understands digits as well as number words in all three languages, e.g. "fifty-six", "zesenvijftig" or "חמישים ושש".
- **Keypad fallback:** when speech recognition isn't available (for example in Firefox) or the microphone is blocked, a big on-screen keypad appears. A physical keyboard works too. The keypad can also be chosen in the setup screen.

### Browser support

| | Speaks | Listens |
|---|---|---|
| Chrome / Edge (desktop & Android) | ✅ | ✅ (needs internet: Chrome sends audio to Google's recogniser) |
| Safari (macOS & iPhone/iPad) | ✅ | ✅ (allow Microphone **and** Speech Recognition) |
| Firefox | ✅ | ❌ → keypad |

Some devices have no voice installed for one of the languages. Hebrew is the one most often missing on Windows. In that case the setup screen shows a note, and the question still appears on screen.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (number parser, question generator)
npm run lint
npm run build    # production build in dist/
```

Speech recognition only works on `localhost` or over HTTPS.

## Deployment

`.github/workflows/deploy.yml` builds the site and publishes it to GitHub Pages on every push to `main`. It can also be started by hand from the Actions tab.

One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Project layout

```
src/
  App.tsx                 screens: setup → game → results
  components/
    Setup.tsx             language, operation, tables, input mode
    Game.tsx              ask → listen (10 s) → feedback loop
    TimerBar.tsx          vertical countdown at the side
    Keypad.tsx            fallback input
    Results.tsx           stars, score, facts to practise
  lib/
    i18n.ts               all texts + spoken phrases (en / nl / he, RTL)
    numberParser.ts       transcript → number (digits & words, 3 languages)
    questions.ts          question pool & round builder
    speech.ts             speech synthesis / recognition wrappers
    storage.ts            settings & best scores (localStorage)
```
