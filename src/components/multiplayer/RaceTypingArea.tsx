/**
 * Race Typing Area Component
 * A typing test component integrated with real-time race progress broadcasting.
 * Sends progress updates to other players via Pusher as the user types.
 */

import { useEffect, useRef, useCallback } from 'react'

import type { TypingResult } from '@/hooks/useTypingTest'
import { useTypingTestWithSound } from '@/hooks/useTypingTestWithSound'
import { cn } from '@/lib/utils'

export interface RaceTypingAreaProps {
  /** The code snippet to type */
  code: string
  /** Programming language for syntax context */
  language: string
  /** Title of the snippet (optional) */
  title?: string
  /** Called when test is complete */
  onComplete?: (result: TypingResult) => void
  /** Called to update progress to other players */
  onProgressUpdate?: (progress: number, wpm: number, accuracy: number) => void
  /** Whether the race has started */
  isRaceActive?: boolean
  /** Whether to allow backspace */
  allowBackspace?: boolean
  /** Tab size for indentation */
  tabSize?: number
  /** Whether to auto-indent */
  autoIndent?: boolean
  /** Progress update throttle interval in ms */
  progressUpdateInterval?: number
  /** Additional class names */
  className?: string
}

export function RaceTypingArea({
  code,
  language,
  title,
  onComplete,
  onProgressUpdate,
  isRaceActive = true,
  allowBackspace = true,
  tabSize = 2,
  autoIndent = false,
  progressUpdateInterval = 200, // Update every 200ms
  className,
}: RaceTypingAreaProps) {
  const lastUpdateTimeRef = useRef<number>(0)
  const lastProgressRef = useRef<number>(0)

  const {
    state,
    characterStates,
    currentStats,
    inputRef,
    handleKeyDown,
    handleInput,
    focus,
    progress,
  } = useTypingTestWithSound({
    code,
    onComplete,
    allowBackspace,
    tabSize,
    autoIndent,
  })

  // Focus input when race becomes active
  useEffect(() => {
    if (isRaceActive) {
      focus()
    }
  }, [isRaceActive, focus])

  // Send progress updates to other players with throttling
  useEffect(() => {
    if (!isRaceActive || !onProgressUpdate || state.isFinished) return

    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current
    const progressChanged = Math.abs(progress - lastProgressRef.current) > 0.1

    // Only update if enough time has passed and progress has changed
    if (timeSinceLastUpdate >= progressUpdateInterval && progressChanged) {
      onProgressUpdate(progress, currentStats.wpm, currentStats.accuracy)
      lastUpdateTimeRef.current = now
      lastProgressRef.current = progress
    }
  }, [
    progress,
    currentStats.wpm,
    currentStats.accuracy,
    onProgressUpdate,
    isRaceActive,
    state.isFinished,
    progressUpdateInterval,
  ])

  // Send final progress update when finished
  useEffect(() => {
    if (state.isFinished && onProgressUpdate) {
      onProgressUpdate(100, currentStats.wpm, currentStats.accuracy)
    }
  }, [state.isFinished, currentStats.wpm, currentStats.accuracy, onProgressUpdate])

  // Handle click to focus
  const handleContainerClick = useCallback(() => {
    focus()
  }, [focus])

  // Split code into lines for rendering
  const lines = code.split('\n')
  let charIndex = 0

  return (
    <div
      className={cn('relative', className)}
      role="application"
      aria-label={`Race typing test${title ? `: ${title}` : ''} in ${language}`}
    >
      {/* Stats Bar - Shows current user's live stats */}
      <div
        className="flex items-center justify-between mb-4"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">WPM:</span>
            <span className="text-cyan-400 font-mono font-bold text-lg">
              {currentStats.wpm}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Accuracy:</span>
            <span
              className={cn(
                'font-mono font-bold text-lg',
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
            <span className="text-gray-400">Position:</span>
            <span className="text-white font-mono">
              {state.cursorPosition}/{code.length}
            </span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Progress:</span>
          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-cyan-400 font-mono text-sm w-12 text-right">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Title and Language */}
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <span className="text-xs text-gray-500 capitalize px-2 py-0.5 bg-slate-800 rounded">
            {language}
          </span>
        </div>
      )}

      {/* Code Display */}
      <div
        onClick={handleContainerClick}
        className={cn(
          'relative bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-auto cursor-text',
          'focus-within:border-cyan-500/50 transition-colors',
          state.isFinished && 'opacity-75 border-green-500/50',
          !isRaceActive && 'pointer-events-none opacity-50'
        )}
        style={{ fontSize: '14px', maxHeight: '300px' }}
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
          disabled={state.isFinished || !isRaceActive}
          aria-label={`Type the ${language} code shown. Progress: ${Math.round(progress)}%`}
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
                      charState.state === 'incorrect' && 'text-red-400 bg-red-500/20',
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
                  <span className="select-none text-gray-600 text-right w-8 mr-4 flex-shrink-0">
                    {lineIndex + 1}
                  </span>
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
          className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-green-400 font-semibold">Race Finished!</p>
          <p className="text-gray-400 text-sm mt-1">
            Final: {currentStats.wpm} WPM with {currentStats.accuracy}% accuracy
          </p>
        </div>
      )}

      {/* Instructions when not started */}
      {!state.isStarted && isRaceActive && (
        <p className="mt-3 text-center text-gray-500 text-sm">
          Click the code area and start typing to begin!
        </p>
      )}
    </div>
  )
}

export default RaceTypingArea
