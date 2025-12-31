/**
 * Practice Modes Library
 * Defines practice mode configurations and content generators
 */

import type { Language, PracticeMode } from '@/db/schema'

// Practice mode configuration
export interface PracticeModeConfig {
  id: PracticeMode
  name: string
  description: string
  icon: string
  color: string
  defaultDuration: number // in seconds
  requiresLanguage: boolean
  requiresDifficulty: boolean
}

export const PRACTICE_MODES: Record<PracticeMode, PracticeModeConfig> = {
  symbols: {
    id: 'symbols',
    name: 'Symbol Practice',
    description: 'Master brackets, operators, and special characters common in code',
    icon: '{ }',
    color: 'cyan',
    defaultDuration: 60,
    requiresLanguage: true,
    requiresDifficulty: false,
  },
  keywords: {
    id: 'keywords',
    name: 'Keyword Drills',
    description: 'Practice language-specific keywords and reserved words',
    icon: 'fn',
    color: 'purple',
    defaultDuration: 60,
    requiresLanguage: true,
    requiresDifficulty: false,
  },
  'weak-spots': {
    id: 'weak-spots',
    name: 'Weak Spot Training',
    description: 'Focus on characters where you make the most mistakes',
    icon: '!',
    color: 'red',
    defaultDuration: 90,
    requiresLanguage: false,
    requiresDifficulty: false,
  },
  speed: {
    id: 'speed',
    name: 'Speed Challenge',
    description: 'Push your typing speed with familiar patterns',
    icon: '>>',
    color: 'green',
    defaultDuration: 30,
    requiresLanguage: true,
    requiresDifficulty: true,
  },
  accuracy: {
    id: 'accuracy',
    name: 'Accuracy Focus',
    description: 'Prioritize precision over speed with strict error feedback',
    icon: '%',
    color: 'yellow',
    defaultDuration: 120,
    requiresLanguage: true,
    requiresDifficulty: true,
  },
  'warm-up': {
    id: 'warm-up',
    name: 'Warm-Up Routine',
    description: 'Start your session with a quick warm-up sequence',
    icon: '~',
    color: 'orange',
    defaultDuration: 60,
    requiresLanguage: false,
    requiresDifficulty: false,
  },
}

// Symbol sets by language
export const SYMBOL_SETS: Record<Language, Array<string>> = {
  javascript: [
    '{ }', '[ ]', '( )', '=> =>', '=== !==', '&& ||', '... ...', '++ --',
    '${} ${}', '?: ?:', '?. ?.', '?? ??', '! !', '` `', "' '", '" "',
    '; ;', ', ,', '. .', ': :', '+ -', '* /', '% %', '< >', '<= >=',
  ],
  typescript: [
    '{ }', '[ ]', '( )', '=> =>', '=== !==', '&& ||', '... ...', '++ --',
    '<T> <T>', ': type', '| |', '& &', '?: ?:', '! !', 'as as', 'is is',
    '` `', "' '", '" "', '; ;', ', ,', '. .', ': :', '+ -', '* /',
  ],
  python: [
    '{ }', '[ ]', '( )', ': :', '== !=', 'and or', '** **', '// //',
    '# #', "' '", '" "', '""" """', "''' '''", ', ,', '. .', '@ @',
    '-> ->', '+ -', '* /', '% %', '< >', '<= >=', '_ _', '__ __',
  ],
}

// Keywords by language
export const KEYWORDS: Record<Language, Array<string>> = {
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'switch', 'case', 'break', 'continue', 'try', 'catch', 'throw', 'finally',
    'class', 'extends', 'constructor', 'new', 'this', 'super', 'static',
    'import', 'export', 'default', 'from', 'async', 'await', 'yield',
    'typeof', 'instanceof', 'in', 'of', 'delete', 'void', 'null', 'undefined',
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'interface', 'type', 'enum', 'namespace', 'module', 'declare', 'abstract',
    'implements', 'extends', 'readonly', 'private', 'public', 'protected',
    'as', 'is', 'keyof', 'typeof', 'infer', 'never', 'unknown', 'any',
    'async', 'await', 'import', 'export', 'from', 'class', 'constructor',
  ],
  python: [
    'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue',
    'class', 'self', 'init', 'import', 'from', 'as', 'try', 'except', 'finally',
    'raise', 'with', 'yield', 'lambda', 'pass', 'None', 'True', 'False',
    'and', 'or', 'not', 'in', 'is', 'global', 'nonlocal', 'assert', 'del',
    'async', 'await', 'match', 'case', 'type', 'property', 'staticmethod',
  ],
}

// Common warm-up patterns (language agnostic)
export const WARMUP_PATTERNS = [
  // Home row patterns
  'asdf jkl; asdf jkl;',
  'fjfj dkdk slsl a;a;',
  'sad fads flask jaded',
  // Number row
  '1234 5678 90-=',
  '12321 45654 78987',
  // Mixed patterns
  'the quick brown fox',
  'jumps over the lazy dog',
  'pack my box with five dozen liquor jugs',
]

// Generate practice content based on mode
export function generatePracticeContent(
  mode: PracticeMode,
  language?: Language,
  targetCharacters?: Array<string>,
  length: number = 100
): string {
  switch (mode) {
    case 'symbols':
      return generateSymbolPractice(language || 'javascript', length)
    case 'keywords':
      return generateKeywordPractice(language || 'javascript', length)
    case 'weak-spots':
      return generateWeakSpotPractice(targetCharacters || [], length)
    case 'speed':
    case 'accuracy':
      return generateMixedPractice(language || 'javascript', length)
    case 'warm-up':
      return generateWarmUp()
    default:
      return generateMixedPractice(language || 'javascript', length)
  }
}

function generateSymbolPractice(language: Language, targetLength: number): string {
  const symbols = SYMBOL_SETS[language]
  const result: Array<string> = []
  let currentLength = 0

  while (currentLength < targetLength) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    result.push(symbol)
    currentLength += symbol.length + 1 // +1 for space
  }

  return result.join(' ')
}

function generateKeywordPractice(language: Language, targetLength: number): string {
  const keywords = KEYWORDS[language]
  const result: Array<string> = []
  let currentLength = 0

  while (currentLength < targetLength) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)]
    result.push(keyword)
    currentLength += keyword.length + 1
  }

  return result.join(' ')
}

function generateWeakSpotPractice(targetCharacters: Array<string>, targetLength: number): string {
  if (targetCharacters.length === 0) {
    // Default to common problem characters
    targetCharacters = ['{', '}', '[', ']', '(', ')', ';', ':', "'", '"', '`']
  }

  const result: Array<string> = []
  let currentLength = 0

  // Generate patterns around weak characters
  const patterns = targetCharacters.flatMap(char => [
    `${char}${char}${char}`,
    `a${char}a`,
    `test${char}`,
    `${char}test`,
    `the${char}quick`,
  ])

  while (currentLength < targetLength) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)]
    result.push(pattern)
    currentLength += pattern.length + 1
  }

  return result.join(' ')
}

function generateMixedPractice(language: Language, targetLength: number): string {
  const keywords = KEYWORDS[language]
  const symbols = SYMBOL_SETS[language].map(s => s.split(' ')[0]) // Get single symbols
  const result: Array<string> = []
  let currentLength = 0

  while (currentLength < targetLength) {
    // Alternate between keywords and symbols
    if (Math.random() > 0.3) {
      const keyword = keywords[Math.floor(Math.random() * keywords.length)]
      result.push(keyword)
      currentLength += keyword.length + 1
    } else {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      result.push(symbol)
      currentLength += symbol.length + 1
    }
  }

  return result.join(' ')
}

function generateWarmUp(): string {
  // Shuffle and return a selection of warm-up patterns
  const shuffled = [...WARMUP_PATTERNS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5).join('\n')
}

// Get recommended practice based on user's error history
export function getRecommendedMode(
  errorPatterns: Record<string, number>
): PracticeMode {
  // Check if user has significant symbol errors
  const symbolChars = '{}[]()=><;:\'"`+-*/%&|!?#@'
  let symbolErrors = 0
  let totalErrors = 0

  for (const [char, count] of Object.entries(errorPatterns)) {
    totalErrors += count
    if (symbolChars.includes(char)) {
      symbolErrors += count
    }
  }

  if (totalErrors === 0) {
    return 'warm-up'
  }

  // If more than 40% of errors are on symbols, recommend symbol practice
  if (symbolErrors / totalErrors > 0.4) {
    return 'symbols'
  }

  // If total errors are high, recommend accuracy focus
  if (totalErrors > 50) {
    return 'accuracy'
  }

  // If user has specific problem characters
  const topErrors = Object.entries(errorPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (topErrors.length >= 3 && topErrors[0][1] > 10) {
    return 'weak-spots'
  }

  // Default to speed for users with good accuracy
  return 'speed'
}

// Calculate practice score
export interface PracticeScore {
  accuracy: number
  wpm: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  improvement: boolean
  message: string
}

export function calculatePracticeScore(
  accuracy: number,
  wpm: number,
  mode: PracticeMode,
  previousBest?: { accuracy: number; wpm: number }
): PracticeScore {
  // Calculate weighted score based on mode emphasis
  let score: number

  if (mode === 'accuracy') {
    // Weight accuracy heavily
    score = accuracy * 0.8 + Math.min(wpm / 100, 0.2) * 100
  } else if (mode === 'speed') {
    // Weight speed heavily
    score = Math.min(wpm / 100, 0.7) * 100 + accuracy * 0.3
  } else {
    // Balanced
    score = accuracy * 0.5 + Math.min(wpm / 80, 0.5) * 100
  }

  // Determine grade
  const grade: PracticeScore['grade'] =
    score >= 95 ? 'S' :
    score >= 85 ? 'A' :
    score >= 75 ? 'B' :
    score >= 65 ? 'C' :
    score >= 50 ? 'D' : 'F'

  // Check improvement
  const improvement = previousBest
    ? (mode === 'accuracy' && accuracy > previousBest.accuracy) ||
      (mode === 'speed' && wpm > previousBest.wpm) ||
      (accuracy >= previousBest.accuracy && wpm >= previousBest.wpm)
    : true

  // Generate message
  const messages: Record<PracticeScore['grade'], Array<string>> = {
    S: ['Outstanding!', 'Perfect execution!', 'Masterful performance!'],
    A: ['Excellent work!', 'Great job!', 'Very impressive!'],
    B: ['Good performance!', 'Nice work!', 'Keep it up!'],
    C: ['Decent effort!', 'Room for improvement.', 'Getting there!'],
    D: ['Keep practicing!', 'You can do better!', 'Try again!'],
    F: ['Don\'t give up!', 'Practice makes perfect!', 'Focus and retry!'],
  }

  const messagePool = messages[grade]
  const message = messagePool[Math.floor(Math.random() * messagePool.length)]

  return {
    accuracy,
    wpm,
    grade,
    improvement,
    message,
  }
}
