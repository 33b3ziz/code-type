import { useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import type { TypingResult } from '@/hooks/useTypingTest'
import { useTypingTestWithSound } from '@/hooks/useTypingTestWithSound'
import { cn } from '@/lib/utils'

interface SoundConfig {
  enabled: boolean
  volume: number
}

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
  sound?: SoundConfig
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
  sound,
}: TypingTestProps) {
  // Always use the sound-enabled hook - it gracefully handles disabled/missing sound config
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
    strictModeFailed,
  } = useTypingTestWithSound({
    code,
    onComplete,
    strictMode,
    allowBackspace,
    tabSize,
    autoIndent,
    sound,
  })

  const containerRef = useRef<HTMLDivElement>(null)

  // Track shake animation state
  const [isShaking, setIsShaking] = useState(false)

  // Trigger shake animation when strict mode fails
  useEffect(() => {
    if (strictModeFailed) {
      setIsShaking(true)
      const timeout = setTimeout(() => setIsShaking(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [strictModeFailed])

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
    <div
      className={cn('relative', className)}
      role="application"
      aria-label={`Typing test${title ? `: ${title}` : ''} in ${language}`}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white" id="typing-test-title">
                {title}
              </h2>
              {/* Strict Mode Badge */}
              {strictMode && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30"
                  title="Strict Mode: Test ends on first error"
                  data-testid="strict-mode-badge"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Strict
                </span>
              )}
            </div>
            <span className="text-sm text-gray-400 capitalize">{language}</span>
          </div>
          <button
            onClick={reset}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            aria-label="Reset typing test"
          >
            Reset
          </button>
        </div>
      )}

      {/* Stats Bar - Live region for screen readers */}
      <div
        className="flex items-center gap-6 mb-4 text-sm"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400" id="wpm-label">WPM:</span>
          <span
            className="text-cyan-400 font-mono font-bold"
            aria-labelledby="wpm-label"
          >
            {currentStats.wpm}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400" id="accuracy-label">Accuracy:</span>
          <span
            className={cn(
              'font-mono font-bold',
              currentStats.accuracy >= 95
                ? 'text-green-400'
                : currentStats.accuracy >= 80
                  ? 'text-yellow-400'
                  : 'text-red-400'
            )}
            aria-labelledby="accuracy-label"
          >
            {currentStats.accuracy}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400" id="progress-label">Progress:</span>
          <div
            className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby="progress-label"
          >
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
          state.isFinished && 'opacity-75',
          strictModeFailed && 'border-red-500/50',
          isShaking && 'animate-shake'
        )}
        style={{ fontSize: `${fontSize}px` }}
        aria-describedby="typing-instructions"
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
          aria-label={`Type the ${language} code shown. ${state.isStarted ? `Progress: ${Math.round(progress)}%` : 'Press any key to start.'}`}
          aria-describedby="typing-test-title"
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
                if (newlineState.state === 'cursor') {
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
        <div
          className={cn(
            'mt-4 p-4 rounded-lg text-center',
            strictModeFailed
              ? 'bg-red-500/10 border border-red-500/30'
              : 'bg-cyan-500/10 border border-cyan-500/30'
          )}
          role="alert"
          aria-live="assertive"
          data-testid="completion-message"
        >
          {strictModeFailed ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 font-semibold">Strict Mode Failed!</p>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Made an error at {Math.round(progress)}% progress. Try again for a perfect run!
              </p>
            </>
          ) : (
            <>
              <p className="text-cyan-400 font-semibold">Test Complete!</p>
              <p className="text-gray-400 text-sm mt-1">
                {currentStats.wpm} WPM with {currentStats.accuracy}% accuracy
              </p>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <p
        id="typing-instructions"
        className={cn(
          'mt-4 text-center text-gray-500 text-sm',
          state.isStarted && 'sr-only'
        )}
      >
        {!state.isStarted
          ? 'Click here and start typing to begin the test'
          : `Typing in progress. ${Math.round(progress)}% complete.`}
      </p>
    </div>
  )
}
