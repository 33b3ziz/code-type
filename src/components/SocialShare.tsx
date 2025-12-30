/**
 * Social Sharing Component
 * Enables users to share their test achievements and scores on social media
 */

import { useCallback, useState } from 'react'

export interface ShareableResult {
  wpm: number
  accuracy: number
  language: string
  difficulty: string
  isPersonalBest?: boolean
  isStreak?: boolean
  streakCount?: number
}

export interface SocialShareProps {
  result: ShareableResult
  appName?: string
  appUrl?: string
  className?: string
}

export function SocialShare({
  result,
  appName = 'CodeType',
  appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://codetype.app',
  className = '',
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const generateShareText = useCallback((): string => {
    const lines: Array<string> = []

    if (result.isPersonalBest) {
      lines.push(`New Personal Best on ${appName}!`)
    } else if (result.isStreak && result.streakCount) {
      lines.push(`${result.streakCount} Day Streak on ${appName}!`)
    } else {
      lines.push(`Just typed on ${appName}!`)
    }

    lines.push('')
    lines.push(`WPM: ${result.wpm}`)
    lines.push(`Accuracy: ${result.accuracy}%`)
    lines.push(`Language: ${result.language}`)
    lines.push(`Difficulty: ${result.difficulty}`)
    lines.push('')
    lines.push(`Practice coding speed at ${appUrl}`)

    return lines.join('\n')
  }, [result, appName, appUrl])

  const generateShareUrl = useCallback((platform: 'twitter' | 'linkedin' | 'reddit'): string => {
    const text = generateShareText()
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(appUrl)

    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedText}`
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&summary=${encodedText}`
      case 'reddit':
        return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(`I just scored ${result.wpm} WPM on ${appName}!`)}`
      default:
        return '#'
    }
  }, [generateShareText, appUrl, appName, result.wpm])

  const handleCopyToClipboard = useCallback(async () => {
    const text = generateShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [generateShareText])

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('share' in navigator)) return

    try {
      await navigator.share({
        title: result.isPersonalBest ? `New Personal Best on ${appName}!` : `My ${appName} Score`,
        text: generateShareText(),
        url: appUrl,
      })
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error)
      }
    }
  }, [result.isPersonalBest, appName, generateShareText, appUrl])

  const openShareWindow = useCallback((platform: 'twitter' | 'linkedin' | 'reddit') => {
    const url = generateShareUrl(platform)
    const width = 600
    const height = 400
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    window.open(url, 'share', `width=${width},height=${height},left=${left},top=${top}`)
  }, [generateShareUrl])

  return (
    <div className={`social-share ${className}`} data-testid="social-share">
      <h3 className="share-title">Share Your Score</h3>

      {/* Share Preview */}
      <div className="share-preview" data-testid="share-preview">
        <div className="preview-card">
          <div className="preview-header">
            {result.isPersonalBest && <span className="badge personal-best">Personal Best!</span>}
            {result.isStreak && <span className="badge streak">{result.streakCount} Day Streak</span>}
          </div>
          <div className="preview-stats">
            <div className="preview-stat main">
              <span className="stat-value">{result.wpm}</span>
              <span className="stat-label">WPM</span>
            </div>
            <div className="preview-stat">
              <span className="stat-value">{result.accuracy}%</span>
              <span className="stat-label">Accuracy</span>
            </div>
          </div>
          <div className="preview-meta">
            <span className="language-tag">{result.language}</span>
            <span className="difficulty-tag">{result.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="share-buttons" data-testid="share-buttons">
        {/* Native Share (if available) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="share-btn share-native"
            aria-label="Share using device sharing"
            data-testid="share-native"
          >
            <span className="share-icon">&#8618;</span>
            Share
          </button>
        )}

        {/* Twitter/X */}
        <button
          onClick={() => openShareWindow('twitter')}
          className="share-btn share-twitter"
          aria-label="Share on Twitter"
          data-testid="share-twitter"
        >
          <span className="share-icon">&#120143;</span>
          Twitter
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => openShareWindow('linkedin')}
          className="share-btn share-linkedin"
          aria-label="Share on LinkedIn"
          data-testid="share-linkedin"
        >
          <span className="share-icon">in</span>
          LinkedIn
        </button>

        {/* Reddit */}
        <button
          onClick={() => openShareWindow('reddit')}
          className="share-btn share-reddit"
          aria-label="Share on Reddit"
          data-testid="share-reddit"
        >
          <span className="share-icon">r/</span>
          Reddit
        </button>

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          className={`share-btn share-copy ${copied ? 'copied' : ''}`}
          aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
          data-testid="share-copy"
        >
          <span className="share-icon">{copied ? '✓' : '📋'}</span>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Raw Text Preview */}
      <details className="share-raw">
        <summary>View shareable text</summary>
        <pre className="share-text">{generateShareText()}</pre>
      </details>
    </div>
  )
}

/**
 * Generate a shareable image URL (placeholder for future implementation)
 */
export function generateShareImage(result: ShareableResult): string {
  // In a real implementation, this would call an API to generate an image
  // For now, return a placeholder URL
  const params = new URLSearchParams({
    wpm: result.wpm.toString(),
    accuracy: result.accuracy.toString(),
    language: result.language,
    difficulty: result.difficulty,
    pb: result.isPersonalBest ? '1' : '0',
  })
  return `/api/share-image?${params.toString()}`
}

/**
 * Compact share button for inline use
 */
export interface ShareButtonProps {
  result: ShareableResult
  variant?: 'icon' | 'text' | 'full'
  className?: string
}

export function ShareButton({ result, variant = 'icon', className = '' }: ShareButtonProps) {
  const [showPopup, setShowPopup] = useState(false)

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `My CodeType Score`,
          text: `I just scored ${result.wpm} WPM with ${result.accuracy}% accuracy on CodeType!`,
          url: window.location.origin,
        })
      } catch {
        setShowPopup(true)
      }
    } else {
      setShowPopup(true)
    }
  }

  return (
    <div className={`share-button-container ${className}`}>
      <button
        onClick={handleNativeShare}
        className={`share-button share-button-${variant}`}
        aria-label="Share result"
        data-testid="share-button"
      >
        {variant === 'icon' && <span aria-hidden="true">&#8618;</span>}
        {variant === 'text' && 'Share'}
        {variant === 'full' && (
          <>
            <span aria-hidden="true">&#8618;</span> Share Result
          </>
        )}
      </button>

      {showPopup && (
        <div className="share-popup" data-testid="share-popup">
          <div className="share-popup-backdrop" onClick={() => setShowPopup(false)} />
          <div className="share-popup-content">
            <button
              className="share-popup-close"
              onClick={() => setShowPopup(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <SocialShare result={result} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SocialShare
