import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Keyboard, LogIn, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginFn, type AuthResult } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<'email' | 'password' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldError(null)

    try {
      const result: AuthResult = await loginFn({ data: { emailOrUsername, password } })

      if ('error' in result) {
        setError(result.error)
        setFieldError(result.field || null)
      } else {
        // Login successful, redirect to home
        navigate({ to: '/' })
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <Keyboard className="w-10 h-10 text-cyan-400" />
            <span className="text-3xl font-black">
              <span className="text-gray-300">CODE</span>
              <span className="text-cyan-400">TYPE</span>
            </span>
          </Link>
          <p className="text-gray-400 mt-2">Welcome back!</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <Label htmlFor="emailOrUsername" className="text-gray-300">
                Email or Username
              </Label>
              <Input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter your email or username"
                className={`bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 ${
                  fieldError === 'email' ? 'border-red-500' : ''
                }`}
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`bg-slate-700 border-slate-600 text-white placeholder:text-gray-500 pr-10 ${
                    fieldError === 'password' ? 'border-red-500' : ''
                  }`}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-5"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Continue Without Account */}
        <p className="mt-6 text-center text-gray-500 text-sm">
          Or{' '}
          <Link to="/test" className="text-gray-400 hover:text-gray-300">
            continue without an account
          </Link>
        </p>
      </div>
    </div>
  )
}
