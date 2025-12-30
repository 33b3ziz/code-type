import { Link, createFileRoute } from '@tanstack/react-router'
import {
  Code,
  Keyboard,
  Play,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const quickStartOptions = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Quick Test',
      description: '60 second random snippet',
      difficulty: 'intermediate',
      href: '/test?duration=60',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'JavaScript',
      description: 'Practice JS syntax',
      language: 'javascript',
      href: '/test?language=javascript',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'TypeScript',
      description: 'Master TS types',
      language: 'typescript',
      href: '/test?language=typescript',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Python',
      description: 'Pythonic typing',
      language: 'python',
      href: '/test?language=python',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  const features = [
    {
      icon: <Target className="w-10 h-10 text-cyan-400" />,
      title: 'Real Code Snippets',
      description:
        'Practice with curated code from real projects. Functions, loops, React components, and more.',
    },
    {
      icon: <Timer className="w-10 h-10 text-cyan-400" />,
      title: 'Timed Challenges',
      description:
        'Test your speed with 30, 60, or 120 second challenges. Track your WPM and accuracy.',
    },
    {
      icon: <Trophy className="w-10 h-10 text-cyan-400" />,
      title: 'Achievements',
      description:
        'Unlock achievements as you improve. From Speed Demon to Code Wizard.',
    },
    {
      icon: <TrendingUp className="w-10 h-10 text-cyan-400" />,
      title: 'Track Progress',
      description:
        'View detailed statistics, identify weak spots, and watch your skills grow.',
    },
  ]

  const stats = [
    { label: 'Snippets', value: '45+', suffix: '' },
    { label: 'Languages', value: '3', suffix: '' },
    { label: 'Achievements', value: '20', suffix: '' },
    { label: 'Difficulty Levels', value: '4', suffix: '' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Keyboard className="w-16 h-16 md:w-20 md:h-20 text-cyan-400" />
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
              <span className="text-gray-300">CODE</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                TYPE
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
            Master coding speed with real code snippets
          </p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto mb-8">
            Improve your typing speed and accuracy with JavaScript, TypeScript,
            and Python. Track your progress and unlock achievements.
          </p>

          {/* Main CTA */}
          <Link to="/test">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Typing Test
            </Button>
          </Link>
        </div>
      </section>

      {/* Quick Start Options */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Quick Start
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickStartOptions.map((option, index) => (
            <Link key={index} to={option.href} className="block group">
              <div
                className={`relative overflow-hidden rounded-xl p-5 bg-gradient-to-br ${option.color} bg-opacity-10 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60" />
                <div className="relative">
                  <div className="text-white mb-3">{option.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-300">{option.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
                  {stat.value}
                  {stat.suffix}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-12">
          Why CodeType?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to improve your coding speed?
          </h2>
          <p className="text-gray-400 mb-8">
            Start your first typing test now. No account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/test">
              <Button
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8"
              >
                Start Free Test
              </Button>
            </Link>
            <Link to="/register">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-slate-800 px-8"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>
            Built with{' '}
            <a
              href="https://tanstack.com/start"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline"
            >
              TanStack Start
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
