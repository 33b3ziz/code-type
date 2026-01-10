import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  Code,
  Flame,
  Keyboard,
  Play,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Users,
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
      href: '/test?duration=60',
      gradient: 'from-brand-blue to-blue-600',
      iconBg: 'bg-brand-blue/20',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'JavaScript',
      description: 'Practice JS syntax',
      href: '/test?language=javascript',
      gradient: 'from-yellow-500 to-brand-orange',
      iconBg: 'bg-yellow-500/20',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'TypeScript',
      description: 'Master TS types',
      href: '/test?language=typescript',
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-500/20',
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Python',
      description: 'Pythonic typing',
      href: '/test?language=python',
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-500/20',
    },
  ]

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Real Code Snippets',
      description:
        'Practice with curated code from real projects. Functions, loops, React components, and more.',
      color: 'text-brand-blue',
    },
    {
      icon: <Timer className="w-8 h-8" />,
      title: 'Timed Challenges',
      description:
        'Test your speed with 30, 60, or 120 second challenges. Track your WPM and accuracy.',
      color: 'text-brand-orange',
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'Achievements',
      description:
        'Unlock achievements as you improve. From Speed Demon to Code Wizard.',
      color: 'text-brand-blue',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Track Progress',
      description:
        'View detailed statistics, identify weak spots, and watch your skills grow.',
      color: 'text-brand-orange',
    },
  ]

  const stats = [
    {
      label: 'Code Snippets',
      value: '45+',
      icon: <Code className="w-5 h-5" />,
    },
    { label: 'Languages', value: '3', icon: <Keyboard className="w-5 h-5" /> },
    {
      label: 'Achievements',
      value: '20',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      label: 'Difficulty Levels',
      value: '4',
      icon: <Flame className="w-5 h-5" />,
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background effects */}
      <div className="fixed inset-0 electric-bg pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-4 h-4 text-brand-orange" />
            <span className="text-sm font-medium text-muted-foreground">
              Improve your coding speed today
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <span className="text-foreground">Type </span>
            <span className="bg-gradient-to-r from-brand-blue to-brand-blue-light bg-clip-text text-transparent text-glow-blue">
              Code
            </span>
            <br />
            <span className="bg-gradient-to-r from-brand-orange to-brand-orange-light bg-clip-text text-transparent text-glow-orange">
              Faster
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Master coding speed with real code snippets. Practice JavaScript,
            TypeScript, and Python. Track your progress and unlock achievements.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/test">
              <Button
                size="lg"
                className="btn-electric px-8 py-6 text-lg rounded-xl glow-blue-sm group"
              >
                <Play className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Start Typing Test</span>
                <ArrowRight className="w-5 h-5 ml-2 relative z-10 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/race">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-xl border-2 border-brand-orange/50 hover:bg-brand-orange/10 hover:border-brand-orange transition-all"
              >
                <Users className="w-5 h-5 mr-2" />
                Multiplayer Race
              </Button>
            </Link>
          </div>

          {/* Keyboard hint */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
            <span>Press</span>
            <kbd className="keyboard-key">Space</kbd>
            <span>to start typing</span>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Quick Start</h2>
            <p className="text-muted-foreground">
              Jump right in with your preferred language
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickStartOptions.map((option, index) => (
              <Link key={index} to={option.href} className="block group">
                <div className="relative h-full rounded-2xl bg-card border border-border p-5 md:p-6 card-hover overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${option.iconBg} flex items-center justify-center mb-4 relative`}
                  >
                    <div className="text-foreground">{option.icon}</div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-1 relative">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground relative">
                    {option.description}
                  </p>

                  {/* Arrow indicator */}
                  <ArrowRight className="absolute bottom-5 right-5 w-5 h-5 text-muted-foreground/50 group-hover:text-brand-blue group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card p-6 text-center">
                <div className="flex items-center justify-center mb-3 text-muted-foreground">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Why CodeType?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to improve your code typing skills
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl border border-border p-6 md:p-8 card-hover overflow-hidden"
              >
                {/* Decorative gradient corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-blue/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`${feature.color} mb-4`}>{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-card to-secondary/50 border border-border p-8 md:p-12 text-center overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 electric-bg opacity-30" />

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Ready to improve your{' '}
                <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
                  coding speed
                </span>
                ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Start your first typing test now. No account required. Track
                your progress and compete with others.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/test">
                  <Button
                    size="lg"
                    className="btn-electric px-8 rounded-xl w-full sm:w-auto"
                  >
                    <span className="relative z-10">Start Free Test</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 rounded-xl border-2 hover:bg-secondary/80 w-full sm:w-auto"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.webp"
              alt="CodeType"
              className="h-6 w-auto opacity-70"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Built By{' '}
            <a
              href="https://github.com/33b3ziz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline"
            >
              33b3ziz
            </a>{' '}
            &bull;{' '}
            <a
              href="https://github.com/33b3ziz/code-type"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
