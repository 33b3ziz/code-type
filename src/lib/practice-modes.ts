/**
 * Practice Modes Library
 * Defines practice mode configurations and content generators
 */

import type { Language, PracticeMode } from '@/db/schema'

// Difficulty level for practice modes
export type ModeDifficulty = 'beginner' | 'intermediate' | 'advanced'

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
  // New fields for enhanced selector
  difficulty: ModeDifficulty
  estimatedDuration: string // Human-readable duration
  shortDescription: string // Brief tagline
}

export const PRACTICE_MODES: Record<PracticeMode, PracticeModeConfig> = {
  symbols: {
    id: 'symbols',
    name: 'Symbol Practice',
    description: 'Master brackets, operators, and special characters common in code',
    shortDescription: 'Master code symbols',
    icon: '{ }',
    color: 'cyan',
    defaultDuration: 60,
    requiresLanguage: true,
    requiresDifficulty: false,
    difficulty: 'intermediate',
    estimatedDuration: '1-2 min',
  },
  keywords: {
    id: 'keywords',
    name: 'Keyword Drills',
    description: 'Practice language-specific keywords and reserved words',
    shortDescription: 'Learn language keywords',
    icon: 'fn',
    color: 'purple',
    defaultDuration: 60,
    requiresLanguage: true,
    requiresDifficulty: false,
    difficulty: 'beginner',
    estimatedDuration: '1-2 min',
  },
  'weak-spots': {
    id: 'weak-spots',
    name: 'Weak Spot Training',
    description: 'Focus on characters where you make the most mistakes',
    shortDescription: 'Target your weaknesses',
    icon: '!',
    color: 'red',
    defaultDuration: 90,
    requiresLanguage: false,
    requiresDifficulty: false,
    difficulty: 'advanced',
    estimatedDuration: '1-3 min',
  },
  speed: {
    id: 'speed',
    name: 'Speed Challenge',
    description: 'Push your typing speed with familiar patterns',
    shortDescription: 'Race against time',
    icon: '>>',
    color: 'green',
    defaultDuration: 30,
    requiresLanguage: true,
    requiresDifficulty: true,
    difficulty: 'advanced',
    estimatedDuration: '30s-1 min',
  },
  accuracy: {
    id: 'accuracy',
    name: 'Accuracy Focus',
    description: 'Prioritize precision over speed with strict error feedback',
    shortDescription: 'Perfect your precision',
    icon: '%',
    color: 'yellow',
    defaultDuration: 120,
    requiresLanguage: true,
    requiresDifficulty: true,
    difficulty: 'intermediate',
    estimatedDuration: '2-3 min',
  },
  'warm-up': {
    id: 'warm-up',
    name: 'Warm-Up Routine',
    description: 'Start your session with a quick warm-up sequence',
    shortDescription: 'Get your fingers ready',
    icon: '~',
    color: 'orange',
    defaultDuration: 60,
    requiresLanguage: false,
    requiresDifficulty: false,
    difficulty: 'beginner',
    estimatedDuration: '1 min',
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

// Symbol categories for tracking accuracy
export const SYMBOL_CATEGORIES = {
  brackets: ['{', '}', '[', ']', '(', ')', '<', '>'],
  operators: ['=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~'],
  comparison: ['<', '>', '=', '!'],
  punctuation: [';', ':', ',', '.', "'", '"', '`'],
  special: ['@', '#', '$', '_', '\\', '?'],
} as const

export type SymbolCategory = keyof typeof SYMBOL_CATEGORIES

// Symbol-heavy code snippets by language
// These are real code patterns that emphasize special characters
export const SYMBOL_CODE_SNIPPETS: Record<Language, Array<{ code: string; description: string }>> = {
  javascript: [
    {
      code: `const fn = (a, b) => ({ ...a, ...b });`,
      description: 'Arrow function with spread',
    },
    {
      code: `const [x, y] = [1, 2]; const { a, b } = obj;`,
      description: 'Destructuring',
    },
    {
      code: `arr.filter(x => x > 0).map(x => x * 2);`,
      description: 'Array chaining',
    },
    {
      code: `const val = obj?.prop ?? 'default';`,
      description: 'Optional chaining and nullish',
    },
    {
      code: `\`Hello \${name}! You have \${count} items.\``,
      description: 'Template literal',
    },
    {
      code: `if (a === b && c !== d || e >= f) {}`,
      description: 'Conditionals',
    },
    {
      code: `const obj = { key: 'value', fn: () => {} };`,
      description: 'Object literal',
    },
    {
      code: `arr.reduce((acc, val) => acc + val, 0);`,
      description: 'Reduce pattern',
    },
    {
      code: `async () => { try { await fn(); } catch (e) {} }`,
      description: 'Async try-catch',
    },
    {
      code: `const [a, ...rest] = [1, 2, 3, 4, 5];`,
      description: 'Rest spread',
    },
    {
      code: `export { foo as bar } from './module';`,
      description: 'Re-export',
    },
    {
      code: `obj['key'] = obj['key'] ?? [];`,
      description: 'Bracket notation',
    },
    {
      code: `const fn = ({ a = 1, b = 2 } = {}) => a + b;`,
      description: 'Default params',
    },
    {
      code: `items?.length ? items[0] : null;`,
      description: 'Ternary with optional',
    },
    {
      code: `[...arr1, ...arr2].filter(Boolean);`,
      description: 'Spread and filter',
    },
  ],
  typescript: [
    {
      code: `type Fn<T, R> = (arg: T) => R;`,
      description: 'Generic type',
    },
    {
      code: `const fn: <T>(x: T) => T = (x) => x;`,
      description: 'Generic function',
    },
    {
      code: `interface Props { data?: Array<{ id: number }> }`,
      description: 'Interface with generics',
    },
    {
      code: `type Result = { ok: true; data: T } | { ok: false };`,
      description: 'Discriminated union',
    },
    {
      code: `const obj = { a: 1, b: 2 } as const;`,
      description: 'Const assertion',
    },
    {
      code: `type Keys = keyof typeof obj;`,
      description: 'Keyof typeof',
    },
    {
      code: `function fn<T extends { id: number }>(x: T): T {}`,
      description: 'Constrained generic',
    },
    {
      code: `type Pick<T, K> = { [P in K]: T[P] };`,
      description: 'Mapped type',
    },
    {
      code: `const [state, setState] = useState<T | null>(null);`,
      description: 'Generic state',
    },
    {
      code: `type Awaited<T> = T extends Promise<infer R> ? R : T;`,
      description: 'Conditional type',
    },
    {
      code: `const fn = <T,>(arr: T[]): T | undefined => arr[0];`,
      description: 'Array generic',
    },
    {
      code: `interface Map<K, V> { get(key: K): V | undefined; }`,
      description: 'Generic interface',
    },
    {
      code: `type NonNull<T> = T extends null | undefined ? never : T;`,
      description: 'Exclude nulls',
    },
    {
      code: `const assert: <T>(x: T) => asserts x is NonNullable<T>;`,
      description: 'Type assertion',
    },
    {
      code: `Record<string, { [key: string]: unknown }>;`,
      description: 'Nested record',
    },
  ],
  python: [
    {
      code: `result = [x**2 for x in range(10) if x % 2 == 0]`,
      description: 'List comprehension',
    },
    {
      code: `data = {k: v for k, v in items.items()}`,
      description: 'Dict comprehension',
    },
    {
      code: `fn = lambda x, y: x + y if x > 0 else y`,
      description: 'Lambda with conditional',
    },
    {
      code: `@decorator(arg="value")`,
      description: 'Decorator with args',
    },
    {
      code: `def fn(*args, **kwargs) -> None: pass`,
      description: 'Variadic function',
    },
    {
      code: `result = obj["key"] if "key" in obj else None`,
      description: 'Dict access',
    },
    {
      code: `f"Hello {name}! Count: {len(items)}"`,
      description: 'F-string',
    },
    {
      code: `data = {"a": 1, "b": 2, **extra}`,
      description: 'Dict spread',
    },
    {
      code: `[*list1, *list2, item]`,
      description: 'List unpacking',
    },
    {
      code: `a, *rest, b = [1, 2, 3, 4, 5]`,
      description: 'Extended unpacking',
    },
    {
      code: `result = (x := expensive_fn())`,
      description: 'Walrus operator',
    },
    {
      code: `class Cls(Base): __slots__ = ["a", "b"]`,
      description: 'Class with slots',
    },
    {
      code: `assert len(items) > 0, "Empty list!"`,
      description: 'Assert statement',
    },
    {
      code: `with open("f.txt", "r") as f: data = f.read()`,
      description: 'Context manager',
    },
    {
      code: `items = [(k, v) for k, v in d.items() if v > 0]`,
      description: 'Tuple comprehension',
    },
  ],
}

// Helper to categorize a character
export function getSymbolCategory(char: string): SymbolCategory | null {
  for (const [category, chars] of Object.entries(SYMBOL_CATEGORIES)) {
    if (chars.includes(char as (typeof chars)[number])) {
      return category as SymbolCategory
    }
  }
  return null
}

// Interface for tracking symbol accuracy by category
export interface SymbolAccuracyStats {
  brackets: { correct: number; total: number }
  operators: { correct: number; total: number }
  comparison: { correct: number; total: number }
  punctuation: { correct: number; total: number }
  special: { correct: number; total: number }
  other: { correct: number; total: number }
}

export function createEmptySymbolStats(): SymbolAccuracyStats {
  return {
    brackets: { correct: 0, total: 0 },
    operators: { correct: 0, total: 0 },
    comparison: { correct: 0, total: 0 },
    punctuation: { correct: 0, total: 0 },
    special: { correct: 0, total: 0 },
    other: { correct: 0, total: 0 },
  }
}

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

function generateSymbolPractice(language: Language, targetLength: number, useCodeSnippets: boolean = true): string {
  // Use code snippets for more realistic practice
  if (useCodeSnippets && SYMBOL_CODE_SNIPPETS[language]) {
    const snippets = SYMBOL_CODE_SNIPPETS[language]
    const result: Array<string> = []
    let currentLength = 0
    const usedIndices = new Set<number>()

    while (currentLength < targetLength) {
      // Get a random snippet we haven't used recently
      let index: number
      if (usedIndices.size >= snippets.length) {
        usedIndices.clear()
      }
      do {
        index = Math.floor(Math.random() * snippets.length)
      } while (usedIndices.has(index) && usedIndices.size < snippets.length)
      
      usedIndices.add(index)
      const snippet = snippets[index].code
      result.push(snippet)
      currentLength += snippet.length + 1
    }

    return result.join('\n')
  }

  // Fallback to symbol pairs (original behavior)
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
