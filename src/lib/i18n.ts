export type Lang = 'en' | 'nl' | 'he'

export interface Strings {
  /** BCP-47 tag used for speech synthesis and recognition. */
  speechLang: string
  dir: 'ltr' | 'rtl'
  languageName: string
  title: string
  subtitle: string
  language: string
  practise: string
  multiply: string
  divide: string
  both: string
  tables: string
  all: string
  answerWith: string
  voice: string
  keypad: string
  play: string
  best: string
  questionOf: (n: number, total: number) => string
  again: string
  listening: string
  getReady: string
  heard: string
  timeUp: string
  /** Shown after a wrong answer, e.g. "Your answer: 10". */
  yourAnswer: (n: number) => string
  praise: string[]
  roundDone: string
  score: string
  avgTime: string
  newBest: string
  practiseThese: string
  allCorrect: string
  playAgain: string
  menu: string
  quit: string
  seconds: string
  micBlocked: string
  noRecognition: string
  langNotSupported: string
  noVoiceWarning: string
  letsGo: string
  /** Spoken question, e.g. "7 times 8". */
  sayQuestion: (a: number, op: '×' | '÷', b: number) => string
  /** Spoken reveal after a miss, e.g. "7 times 8 is 56". */
  sayAnswer: (question: string, answer: number) => string
}

export const STRINGS: Record<Lang, Strings> = {
  en: {
    speechLang: 'en-US',
    dir: 'ltr',
    languageName: 'English',
    title: 'Say the Answer!',
    subtitle: 'Times tables up to 12',
    language: 'Language',
    practise: 'What do we practise?',
    multiply: 'Times ×',
    divide: 'Divide ÷',
    both: 'Both',
    tables: 'Which tables?',
    all: 'All',
    answerWith: 'Answer with',
    voice: 'Voice 🎤',
    keypad: 'Keypad ⌨️',
    play: 'Play!',
    best: 'Best',
    questionOf: (n, total) => `Question ${n} of ${total}`,
    again: 'again',
    listening: 'Listening… say the answer!',
    getReady: 'Listen…',
    heard: 'I heard:',
    timeUp: "Time's up!",
    yourAnswer: (n) => `Your answer: ${n}`,
    praise: ['Great!', 'Awesome!', 'Well done!', 'Super!', 'Yes!'],
    roundDone: 'Round complete!',
    score: 'Score',
    avgTime: 'Average time',
    newBest: 'New best score!',
    practiseThese: 'Practise these:',
    allCorrect: 'Every answer correct. Amazing!',
    playAgain: 'Play again',
    menu: 'Menu',
    quit: 'Stop',
    seconds: 's',
    micBlocked: 'No microphone access. You can answer with the keypad.',
    noRecognition:
      'This browser cannot recognise speech. Use the keypad, or open the game in Chrome, Edge or Safari.',
    langNotSupported: 'Speech recognition in English is not available here. Switching to the keypad.',
    noVoiceWarning: 'No English voice on this device. The question is still shown on screen.',
    letsGo: "Let's go!",
    sayQuestion: (a, op, b) => `${a} ${op === '×' ? 'times' : 'divided by'} ${b}`,
    sayAnswer: (q, ans) => `${q} is ${ans}`,
  },
  nl: {
    speechLang: 'nl-NL',
    dir: 'ltr',
    languageName: 'Nederlands',
    title: 'Zeg het antwoord!',
    subtitle: 'Tafels tot en met 12',
    language: 'Taal',
    practise: 'Wat gaan we oefenen?',
    multiply: 'Keer ×',
    divide: 'Delen ÷',
    both: 'Allebei',
    tables: 'Welke tafels?',
    all: 'Alle',
    answerWith: 'Antwoorden met',
    voice: 'Stem 🎤',
    keypad: 'Toetsen ⌨️',
    play: 'Spelen!',
    best: 'Record',
    questionOf: (n, total) => `Vraag ${n} van ${total}`,
    again: 'nog eens',
    listening: 'Ik luister… zeg het antwoord!',
    getReady: 'Luister…',
    heard: 'Ik hoorde:',
    timeUp: 'De tijd is om!',
    yourAnswer: (n) => `Jouw antwoord: ${n}`,
    praise: ['Goed zo!', 'Super!', 'Top!', 'Knap hoor!', 'Ja!'],
    roundDone: 'Ronde klaar!',
    score: 'Score',
    avgTime: 'Gemiddelde tijd',
    newBest: 'Nieuw record!',
    practiseThese: 'Deze nog even oefenen:',
    allCorrect: 'Alles goed. Geweldig!',
    playAgain: 'Nog een keer',
    menu: 'Menu',
    quit: 'Stoppen',
    seconds: 's',
    micBlocked: 'Geen toegang tot de microfoon. Je kunt antwoorden met de toetsen.',
    noRecognition:
      'Deze browser herkent geen spraak. Gebruik de toetsen, of open het spel in Chrome, Edge of Safari.',
    langNotSupported: 'Spraakherkenning in het Nederlands is hier niet beschikbaar. We gebruiken de toetsen.',
    noVoiceWarning: 'Geen Nederlandse stem op dit apparaat. De vraag staat wel op het scherm.',
    letsGo: 'Daar gaan we!',
    sayQuestion: (a, op, b) => `${a} ${op === '×' ? 'keer' : 'gedeeld door'} ${b}`,
    sayAnswer: (q, ans) => `${q} is ${ans}`,
  },
  he: {
    speechLang: 'he-IL',
    dir: 'rtl',
    languageName: 'עברית',
    title: 'תגיד את התשובה!',
    subtitle: 'לוח הכפל עד 12',
    language: 'שפה',
    practise: 'מה מתרגלים?',
    multiply: 'כפל ×',
    divide: 'חילוק ÷',
    both: 'שניהם',
    tables: 'אילו לוחות?',
    all: 'הכול',
    answerWith: 'עונים עם',
    voice: 'קול 🎤',
    keypad: 'מקשים ⌨️',
    play: 'שחק!',
    best: 'שיא',
    questionOf: (n, total) => `שאלה ${n} מתוך ${total}`,
    again: 'שוב',
    listening: 'מקשיב… תגיד את התשובה!',
    getReady: 'תקשיב…',
    heard: 'שמעתי:',
    timeUp: 'נגמר הזמן!',
    yourAnswer: (n) => `התשובה שלך: ${n}`,
    praise: ['כל הכבוד!', 'מצוין!', 'יופי!', 'אלוף!', 'נכון!'],
    roundDone: 'סיימת את הסיבוב!',
    score: 'ניקוד',
    avgTime: 'זמן ממוצע',
    newBest: 'שיא חדש!',
    practiseThese: 'כדאי לתרגל:',
    allCorrect: 'הכול נכון. מדהים!',
    playAgain: 'עוד סיבוב',
    menu: 'תפריט',
    quit: 'יציאה',
    seconds: 'ש׳',
    micBlocked: 'אין גישה למיקרופון. אפשר לענות עם המקשים.',
    noRecognition: 'הדפדפן הזה לא מזהה דיבור. אפשר לענות עם המקשים, או לפתוח את המשחק ב-Chrome, Edge או Safari.',
    langNotSupported: 'זיהוי דיבור בעברית לא זמין כאן. עוברים למקשים.',
    noVoiceWarning: 'אין קול בעברית במכשיר הזה. השאלה מופיעה על המסך.',
    letsGo: 'יאללה!',
    sayQuestion: (a, op, b) => `${a} ${op === '×' ? 'כפול' : 'חלקי'} ${b}`,
    sayAnswer: (q, ans) => `${q} זה ${ans}`,
  },
}

export const LANGS: Lang[] = ['en', 'nl', 'he']
