import { useCallback, useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Keyboard, RefreshCw } from 'lucide-react'
import type { TypingResult } from '@/hooks/useTypingTest'
import type { Language } from '@/db/schema'
import type {Difficulty} from '@/components/DifficultySelector';
import type {SnippetResponse} from '@/lib/snippets-api';
import { Button } from '@/components/ui/button'
import { TypingTest } from '@/components/TypingTest'
import {  DifficultySelector } from '@/components/DifficultySelector'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {  getRandomSnippetFn } from '@/lib/snippets-api'

interface TestSearchParams {
  language?: Language
  difficulty?: Difficulty
  duration?: string
}

export const Route = createFileRoute('/test')({
  component: TestPage,
  validateSearch: (search: Record<string, unknown>): TestSearchParams => ({
    language: search.language as Language | undefined,
    difficulty: search.difficulty as Difficulty | undefined,
    duration: search.duration as string | undefined,
  }),
})

function TestPage() {
  const navigate = useNavigate()
  const searchParams = Route.useSearch()

  // Filters
  const [language, setLanguage] = useState<Language | 'all'>(
    searchParams.language || 'all'
  )
  const [difficulty, setDifficulty] = useState<Difficulty>(
    searchParams.difficulty || 'intermediate'
  )

  // Snippet state
  const [snippet, setSnippet] = useState<SnippetResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Result state
  const [result, setResult] = useState<TypingResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Load snippet
  const loadSnippet = async () => {
    setIsLoading(true)
    setError(null)
    setShowResult(false)
    setResult(null)

    try {
      const filters: { language?: Language; difficulty?: Difficulty } = {
        difficulty,
      }
      if (language !== 'all') {
        filters.language = language
      }

      const newSnippet = await getRandomSnippetFn({ data: filters })
      if (!newSnippet) {
        setError('No snippets found matching your criteria')
      } else {
        setSnippet(newSnippet)
      }
    } catch {
      setError('Failed to load snippet')
    } finally {
      setIsLoading(false)
    }
  }

  // Load on mount and when filters change
  useEffect(() => {
    loadSnippet()
  }, [language, difficulty])

  // Handle test completion
  const handleComplete = useCallback((testResult: TypingResult) => {
    setResult(testResult)
    setShowResult(true)
  }, [])

  // Handle new test
  const handleNewTest = () => {
    loadSnippet()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Keyboard className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">Typing Test</h1>
          </div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="space-y-2">
            <Label className="text-gray-400">Language</Label>
            <Select
              value={language}
              onValueChange={(v) => setLanguage(v as Language | 'all')}
            >
              <SelectTrigger className="w-36 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DifficultySelector
            value={difficulty}
            onValueChange={setDifficulty}
            showLabel={true}
          />

          <Button
            variant="outline"
            onClick={handleNewTest}
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            New Snippet
          </Button>
        </div>

        {/* Main content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading snippet...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-400">{error}</p>
            <Button onClick={handleNewTest} variant="outline">
              Try Again
            </Button>
          </div>
        ) : snippet ? (
          <>
            <TypingTest
              code={snippet.code}
              language={snippet.language}
              title={snippet.title}
              onComplete={handleComplete}
              showLineNumbers={true}
              fontSize={16}
            />

            {/* Results */}
            {showResult && result && (
              <div className="mt-8 p-6 bg-slate-800/50 rounded-xl border border-cyan-500/30">
                <h3 className="text-xl font-bold text-white mb-4">
                  Test Complete!
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">
                      {result.wpm}
                    </div>
                    <div className="text-sm text-gray-400">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">
                      {result.rawWpm}
                    </div>
                    <div className="text-sm text-gray-400">Raw WPM</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${
                        result.accuracy >= 95
                          ? 'text-green-400'
                          : result.accuracy >= 80
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }`}
                    >
                      {result.accuracy}%
                    </div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">
                      {result.duration.toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-400">Time</div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    onClick={handleNewTest}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Another
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
