import { useEffect, useRef } from 'react'
import { useTypingTest, type TypingResult } from '@/hooks/useTypingTest'
import { cn } from '@/lib/utils'

export interface TypingTestProps {
  code: string
  language: string
  title?: string
  onComplete?: (result: TypingResult) => void
  strictMode?: boolean
  allowBackspace?: boolean
  showLineNumbers?: boolean
  fontSize?: number
  className?: string
  tabSize?: number
  autoIndent?: boolean
}

export function TypingTest({
  code,
  language,
  title,
  onComplete,
  strictMode = false,
  allowBackspace = true,
  showLineNumbers = true,
  fontSize = 16,
  className,
  tabSize = 2,
  autoIndent = false,
}: TypingTestProps) {
  const {
    state,
    characterStates,
    currentStats,
    inputRef,
    handleKeyDown,
    handleInput,
    reset,
    focus,
    progress,
  } = useTypingTest({
    code,
    onComplete,
    strictMode,
    allowBackspace,
    tabSize,
    autoIndent,
  })

  const containerRef = useRef<HTMLDivElement>(null)

  // Focus on mount
  useEffect(() => {
    focus()
  }, [focus])

  // Handle click to focus
  const handleContainerClick = () => {
    focus()
  }

  // Split code into lines for rendering
  const lines = code.split('\n')
  let charIndex = 0

  return (
    <div className={cn('relative', className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <span className="text-sm text-gray-400 capitalize">{language}</span>
          </div>
          <button
            onClick={reset}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Reset
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">WPM:</span>
          <span className="text-cyan-400 font-mono font-bold">
            {currentStats.wpm}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Accuracy:</span>
          <span
            className={cn(
              'font-mono font-bold',
              currentStats.accuracy >= 95
                ? 'text-green-400'
                : currentStats.accuracy >= 80
                  ? 'text-yellow-400'
                  : 'text-red-400'
            )}
          >
            {currentStats.accuracy}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Progress:</span>
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={cn(
          'relative bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-auto cursor-text',
          'focus-within:border-cyan-500/50 transition-colors',
          state.isFinished && 'opacity-75'
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
        {/* Hidden input for capturing keystrokes */}
        <input
          ref={inputRef}
          type="text"
          className="absolute opacity-0 w-0 h-0"
          onKeyDown={handleKeyDown}
          onChange={handleInput}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={state.isFinished}
        />

        {/* Code lines */}
        <pre className="font-mono leading-relaxed">
          <code>
            {lines.map((line, lineIndex) => {
              const lineStartIndex = charIndex
              const lineChars = line.split('')

              // Build line content
              const lineContent = lineChars.map((_, i) => {
                const globalIndex = lineStartIndex + i
                const charState = characterStates[globalIndex]
                charIndex++

                if (!charState) return null

                return (
                  <span
                    key={globalIndex}
                    className={cn(
                      'relative',
                      charState.state === 'correct' && 'text-green-400',
                      charState.state === 'incorrect' &&
                        'text-red-400 bg-red-500/20',
                      charState.state === 'pending' && 'text-gray-500',
                      charState.state === 'extra' && 'text-red-400 bg-red-500/30',
                      charState.state === 'cursor' && 'text-gray-300'
                    )}
                  >
                    {/* Cursor */}
                    {charState.state === 'cursor' && (
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-cyan-400 animate-pulse" />
                    )}
                    {/* Render space as visible character */}
                    {charState.char === ' ' ? '\u00A0' : charState.char}
                  </span>
                )
              })

              // Account for newline character
              if (lineIndex < lines.length - 1) {
                const newlineIndex = charIndex
                const newlineState = characterStates[newlineIndex]
                charIndex++

                // Add cursor at end of line if needed
                if (newlineState?.state === 'cursor') {
                  lineContent.push(
                    <span key={`newline-${lineIndex}`} className="relative">
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-cyan-400 animate-pulse" />
                    </span>
                  )
                }
              }

              return (
                <div key={lineIndex} className="flex">
                  {/* Line number */}
                  {showLineNumbers && (
                    <span className="select-none text-gray-600 text-right w-8 mr-4 flex-shrink-0">
                      {lineIndex + 1}
                    </span>
                  )}
                  {/* Line content */}
                  <span className="flex-1 whitespace-pre">{lineContent}</span>
                </div>
              )
            })}
          </code>
        </pre>

        {/* Cursor at end if finished typing */}
        {state.cursorPosition >= code.length && !state.isFinished && (
          <span className="inline-block w-[2px] h-[1.2em] bg-cyan-400 animate-pulse align-middle" />
        )}
      </div>

      {/* Completion message */}
      {state.isFinished && (
        <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
          <p className="text-cyan-400 font-semibold">Test Complete!</p>
          <p className="text-gray-400 text-sm mt-1">
            {currentStats.wpm} WPM with {currentStats.accuracy}% accuracy
          </p>
        </div>
      )}

      {/* Instructions */}
      {!state.isStarted && (
        <p className="mt-4 text-center text-gray-500 text-sm">
          Click here and start typing to begin the test
        </p>
      )}
    </div>
  )
}
