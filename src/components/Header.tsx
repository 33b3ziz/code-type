import { Link } from '@tanstack/react-router'

import { useEffect, useState } from 'react'
import {
  Dumbbell,
  Home,
  Keyboard,
  Menu,
  Settings,
  Trophy,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { ThemeToggle } from './ThemeToggle'

interface NavLink {
  to: string
  icon: typeof Home
  label: string
  search?: Record<string, string>
}

const navLinks: Array<NavLink> = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/test', icon: Keyboard, label: 'Typing Test' },
  { to: '/practice', icon: Dumbbell, label: 'Practice' },
  { to: '/race', icon: Users, label: 'Multiplayer' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', search: { timeFrame: 'alltime' } },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <>
      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-strong shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Left section: Menu button + Logo */}
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-secondary/80 transition-all duration-200 md:hidden"
                aria-label="Open navigation menu"
                aria-expanded={isOpen}
              >
                <Menu size={22} className="text-foreground" />
              </button>

              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2 group"
                aria-label="CodeType - Home"
              >
                <img
                  src="/logo.webp"
                  alt="CodeType"
                  className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Center section: Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1" role="navigation">
              {navLinks.slice(0, 5).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  search={link.search}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors electric-underline"
                  activeProps={{
                    className:
                      'relative px-4 py-2 text-sm font-medium text-brand-blue transition-colors electric-underline',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right section: Actions */}
            <div className="flex items-center gap-2">
              {/* Quick start button - desktop only */}
              <Link
                to="/test"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg btn-electric"
              >
                <Zap size={16} />
                <span>Start Test</span>
              </Link>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Desktop: Profile & Settings */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/profile"
                  className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                  aria-label="Profile"
                >
                  <User size={20} className="text-muted-foreground" />
                </Link>
                <Link
                  to="/settings"
                  className="p-2 rounded-lg hover:bg-secondary/80 transition-colors"
                  aria-label="Settings"
                >
                  <Settings size={20} className="text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient border at bottom */}
        <div
          className={`h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-card z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2"
          >
            <img
              src="/logo.webp"
              alt="CodeType"
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close navigation menu"
          >
            <X size={22} className="text-muted-foreground" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 overflow-y-auto" role="navigation">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    search={link.search}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all duration-200"
                    activeProps={{
                      className:
                        'flex items-center gap-3 px-4 py-3 rounded-xl font-medium nav-link-active',
                    }}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-border">
          <Link
            to="/test"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-semibold btn-electric"
          >
            <Zap size={18} />
            <span>Start Typing Test</span>
          </Link>
        </div>

        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-brand-blue via-brand-orange to-brand-blue opacity-50" />
      </aside>
    </>
  )
}
