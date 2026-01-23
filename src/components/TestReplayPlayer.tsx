/**
 * TestReplayPlayer Component
 * Allows users to step through past typing tests character-by-character,
 * showing typing speed, errors, and timing information at each keystroke.
 */

import {
  ChevronLeft,
  ChevronRight,
  FastForward,
  Pause,
  Play,
  Rewind,
  SkipBack,
  SkipForward,
} from 'lucide-react'

import type { KeystrokeEvent } from '@/db/schema'
import { useTestReplayPlayer } from '@/hooks/useTestReplayPlayer'
import { cn } from '@/lib/utils'

export interface TestReplayPlayerProps {
  /** The original code that was typed */
  code: string
  /** Array of keystroke events from the completed test */
  keystrokeEvents: KeystrokeEvent[]
  /** Language of the code (for display purposes) */
  language: string
  /** Title of the snippet (optional) */
  title?: string
  /** Show line numbers (default: true) */
  showLineNumbers?: boolean
  /** Font size in pixels (default: 16) */
  fontSize?: number
  /** Additional CSS classes */
  className?: string
  /** Callback when close is requested */
  onClose?: () => void
}

export function TestReplayPlayer({
  code,
  keystrokeEvents,
  language,
  title,
  showLineNumbers = true,
  fontSize = 16,
  className,
  onClose,
}: TestReplayPlayerProps) {
  const {
    state,
    currentStats,
    characterStates,
    currentKeystroke,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToIndex,
    setPlaybackSpeed,
    reset,
    goToEnd,
  } = useTestReplayPlayer({
    code,
    keystrokeEvents,
    autoPlay: false,
    initialSpeed: 1,
  })

  // Split code into lines for rendering
  const lines = code.split('\n')
  let charIndex = 0

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
    }
    return `${secs}.${ms.toString().padStart(2, '0')}s`
  }

  // Get display character for special characters
  const getDisplayChar = (char: string) => {
    if (char === ' ') return 'Space'
    if (char === '\n') return 'Enter'
    if (char === '\t') return 'Tab'
    return `"${char}"`
  }

  return (
    <div
      className={cn('relative', className)}
      role="application"
      aria-label={`Typing test replay${title ? `: ${title}` : ''} in ${language}`}
      data-testid="test-replay-player"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white" id="replay-title">
              {title || 'Test Replay'}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Replay Mode
            </span>
          </div>
          <span className="text-sm text-gray-400 capitalize">{language}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            aria-label="Close replay"
          >
            Close
          </button>
        )}
      </div>

      {/* Stats Bar */}
      <div
        className="flex items-center gap-6 mb-4 text-sm flex-wrap"
        role="status"
        aria-live="polite"
        data-testid="replay-stats"
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">WPM:</span>
          <span className="text-cyan-400 font-mono font-bold" data-testid="replay-wpm">
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
            data-testid="replay-accuracy"
          >
            {currentStats.accuracy}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Time:</span>
          <span className="text-gray-300 font-mono" data-testid="replay-time">
            {formatTime(currentStats.elapsed)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Correct:</span>
          <span className="text-green-400 font-mono">{currentStats.correctChars}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Errors:</span>
          <span className="text-red-400 font-mono">{currentStats.incorrectChars}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-sm">Progress:</span>
          <span className="text-gray-300 text-sm font-mono">
            {state.currentIndex + 1} / {keystrokeEvents.length} keystrokes
          </span>
        </div>
        <div
          className="relative w-full h-3 bg-slate-700 rounded-full overflow-hidden cursor-pointer"
          role="slider"
          aria-valuenow={Math.round(currentStats.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Replay progress"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percentage = (e.clientX - rect.left) / rect.width
            const targetIndex = Math.floor(percentage * keystrokeEvents.length) - 1
            jumpToIndex(targetIndex)
          }}
        >
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-100"
            style={{ width: `${currentStats.progress}%` }}
          />
          {/* Tick marks for errors */}
          {keystrokeEvents.map((event, index) => {
            if (event.type === 'char' && !event.isCorrect) {
              const position = (index / keystrokeEvents.length) * 100
              return (
                <div
                  key={index}
                  className="absolute top-0 w-1 h-full bg-red-500/80"
                  style={{ left: `${position}%` }}
                  title={`Error at keystroke ${index + 1}`}
                />
              )
            }
            return null
          })}
        </div>
      </div>

      {/* Current Keystroke Info */}
      {currentKeystroke && (
        <div
          className="mb-4 p-3 bg-slate-800 rounded-lg border border-slate-700"
          data-testid="current-keystroke-info"
        >
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Typed:</span>
              <span
                className={cn(
                  'font-mono px-2 py-0.5 rounded',
                  currentKeystroke.type === 'backspace'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : currentKeystroke.isCorrect
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                )}
              >
                {currentKeystroke.type === 'backspace'
                  ? 'Backspace'
                  : getDisplayChar(currentKeystroke.char)}
              </span>
            </div>
            {currentKeystroke.type === 'char' && !currentKeystroke.isCorrect && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Expected:</span>
                <span className="font-mono px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                  {getDisplayChar(currentKeystroke.expected)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Position:</span>
              <span className="font-mono text-gray-300">{currentKeystroke.position}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Time:</span>
              <span className="font-mono text-gray-300">
                {formatTime(currentKeystroke.timestamp / 1000)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Code Display */}
      <div
        className={cn(
          'relative bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-auto',
          'transition-colors'
        )}
        style={{ fontSize: `${fontSize}px` }}
      >
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
                      charState?.state === 'correct' && 'text-green-400',
                      charState?.state === 'incorrect' && 'text-red-400 bg-red-500/20',
                      charState?.state === 'pending' && 'text-gray-500',
                      charState?.state === 'cursor' && 'text-gray-300'
                    )}
                  >
                    {/* Cursor */}
                    {charState?.state === 'cursor' && (
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-cyan-400 animate-pulse" />
                    )}
                    {/* Render space as visible character */}
                    {charState?.char === ' ' ? '\u00A0' : charState?.char}
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
      </div>

      {/* Playback Controls */}
      <div
        className="mt-4 flex flex-col items-center gap-4"
        data-testid="replay-controls"
      >
        {/* Main Controls */}
        <div className="flex items-center gap-2">
          {/* Reset to start */}
          <button
            onClick={reset}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Go to start"
            title="Go to start"
            data-testid="replay-reset-btn"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Step backward */}
          <button
            onClick={stepBackward}
            disabled={state.currentIndex <= -1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous keystroke"
            title="Previous keystroke"
            data-testid="replay-prev-btn"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white transition-colors"
            aria-label={state.isPlaying ? 'Pause' : 'Play'}
            title={state.isPlaying ? 'Pause' : 'Play'}
            data-testid="replay-play-btn"
          >
            {state.isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          {/* Step forward */}
          <button
            onClick={stepForward}
            disabled={state.currentIndex >= keystrokeEvents.length - 1}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next keystroke"
            title="Next keystroke"
            data-testid="replay-next-btn"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Go to end */}
          <button
            onClick={goToEnd}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
            aria-label="Go to end"
            title="Go to end"
            data-testid="replay-end-btn"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Speed:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaybackSpeed(0.5)}
              className={cn(
                'px-2 py-1 rounded text-sm transition-colors',
                state.playbackSpeed === 0.5
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              )}
              aria-label="0.5x speed"
              data-testid="speed-0.5"
            >
              <Rewind className="w-4 h-4 inline mr-1" />
              0.5x
            </button>
            <button
              onClick={() => setPlaybackSpeed(1)}
              className={cn(
                'px-2 py-1 rounded text-sm transition-colors',
                state.playbackSpeed === 1
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              )}
              aria-label="1x speed"
              data-testid="speed-1"
            >
              1x
            </button>
            <button
              onClick={() => setPlaybackSpeed(2)}
              className={cn(
                'px-2 py-1 rounded text-sm transition-colors',
                state.playbackSpeed === 2
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              )}
              aria-label="2x speed"
              data-testid="speed-2"
            >
              2x
              <FastForward className="w-4 h-4 inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="mt-4 text-center text-gray-500 text-xs">
        <p>
          Use <kbd className="px-1 py-0.5 bg-slate-700 rounded">Space</kbd> to play/pause,{' '}
          <kbd className="px-1 py-0.5 bg-slate-700 rounded">Left/Right</kbd> arrows to step through
        </p>
      </div>
    </div>
  )
}

export default TestReplayPlayer
