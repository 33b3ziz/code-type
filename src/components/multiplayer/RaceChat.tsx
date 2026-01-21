/**
 * Race Chat Component
 * Full-featured chat component with message history, emoji support, user mentions, and moderation
 */

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Send, Smile, AtSign, MoreVertical, Trash2, Ban, AlertTriangle } from 'lucide-react'

import { Button } from '../ui/button'

import type { ChatMessage, RacePlayer } from '@/lib/pusher/types'
import { cn } from '@/lib/utils'

// Common emojis for quick selection
const EMOJI_LIST = [
  '👍', '👎', '😀', '😂', '😎', '🔥', '💯', '🎉',
  '👏', '🙌', '💪', '🚀', '⚡', '✨', '❤️', '🏆',
  '😱', '😅', '🤔', '👀', '💀', '😤', '🤯', '😈',
]

// Message formatting constants
const MENTION_REGEX = /@(\w+)/g
const MAX_MESSAGE_LENGTH = 500
const MAX_MESSAGES_DISPLAY = 100

interface RaceChatProps {
  messages: ChatMessage[]
  players: RacePlayer[]
  currentPlayerId: string | null
  onSendMessage: (message: string, mentions?: string[]) => void
  onDeleteMessage?: (messageId: string) => void
  onMutePlayer?: (playerId: string) => void
  isHost?: boolean
  className?: string
}

export function RaceChat({
  messages,
  players,
  currentPlayerId,
  onSendMessage,
  onDeleteMessage,
  onMutePlayer,
  isHost = false,
  className = '',
}: RaceChatProps) {
  const [inputValue, setInputValue] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Filter players for mention suggestions
  const mentionSuggestions = useMemo(() => {
    if (!mentionQuery) return players
    const query = mentionQuery.toLowerCase()
    return players.filter(
      (p) =>
        p.username.toLowerCase().includes(query) && p.id !== currentPlayerId
    )
  }, [players, mentionQuery, currentPlayerId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle input changes for mention detection
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value.length <= MAX_MESSAGE_LENGTH) {
        setInputValue(value)

        // Check for @ mentions
        const cursorPosition = e.target.selectionStart || 0
        const textBeforeCursor = value.slice(0, cursorPosition)
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

        if (mentionMatch) {
          setMentionQuery(mentionMatch[1])
          setShowMentionSuggestions(true)
        } else {
          setShowMentionSuggestions(false)
          setMentionQuery('')
        }
      }
    },
    []
  )

  // Insert mention into input
  const insertMention = useCallback(
    (username: string) => {
      const cursorPosition = inputRef.current?.selectionStart || inputValue.length
      const textBeforeCursor = inputValue.slice(0, cursorPosition)
      const textAfterCursor = inputValue.slice(cursorPosition)

      // Replace partial mention with full username
      const newTextBeforeCursor = textBeforeCursor.replace(/@\w*$/, `@${username} `)
      const newValue = newTextBeforeCursor + textAfterCursor

      setInputValue(newValue)
      setShowMentionSuggestions(false)
      setMentionQuery('')

      // Focus input and set cursor position
      setTimeout(() => {
        inputRef.current?.focus()
        const newCursorPosition = newTextBeforeCursor.length
        inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
      }, 0)
    },
    [inputValue]
  )

  // Insert emoji into input
  const insertEmoji = useCallback(
    (emoji: string) => {
      const cursorPosition = inputRef.current?.selectionStart || inputValue.length
      const newValue =
        inputValue.slice(0, cursorPosition) + emoji + inputValue.slice(cursorPosition)

      if (newValue.length <= MAX_MESSAGE_LENGTH) {
        setInputValue(newValue)
        setShowEmojiPicker(false)

        // Focus input and set cursor position
        setTimeout(() => {
          inputRef.current?.focus()
          const newCursorPosition = cursorPosition + emoji.length
          inputRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
        }, 0)
      }
    },
    [inputValue]
  )

  // Extract mentions from message
  const extractMentions = useCallback(
    (message: string): string[] => {
      const mentions: string[] = []
      let match

      while ((match = MENTION_REGEX.exec(message)) !== null) {
        const username = match[1]
        const player = players.find(
          (p) => p.username.toLowerCase() === username.toLowerCase()
        )
        if (player) {
          mentions.push(player.id)
        }
      }

      return mentions
    },
    [players]
  )

  // Handle message submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmedMessage = inputValue.trim()

      if (trimmedMessage) {
        const mentions = extractMentions(trimmedMessage)
        onSendMessage(trimmedMessage, mentions.length > 0 ? mentions : undefined)
        setInputValue('')
        setShowEmojiPicker(false)
        setShowMentionSuggestions(false)
      }
    },
    [inputValue, extractMentions, onSendMessage]
  )

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false)
        setShowMentionSuggestions(false)
      }
    },
    []
  )

  // Render message content with highlighted mentions
  const renderMessageContent = useCallback(
    (message: ChatMessage) => {
      const parts = message.message.split(MENTION_REGEX)

      return parts.map((part, index) => {
        // Every odd index is a captured username
        if (index % 2 === 1) {
          const isMentioningCurrentUser = players.find(
            (p) =>
              p.username.toLowerCase() === part.toLowerCase() &&
              p.id === currentPlayerId
          )

          return (
            <span
              key={index}
              className={cn(
                'font-medium',
                isMentioningCurrentUser
                  ? 'bg-cyan-500/30 text-cyan-300 px-1 rounded'
                  : 'text-cyan-400'
              )}
            >
              @{part}
            </span>
          )
        }
        return <span key={index}>{part}</span>
      })
    },
    [players, currentPlayerId]
  )

  // Format timestamp
  const formatTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, [])

  // Display only the most recent messages
  const displayedMessages = useMemo(
    () => messages.slice(-MAX_MESSAGES_DISPLAY),
    [messages]
  )

  return (
    <div
      className={cn(
        'flex flex-col bg-slate-800/50 rounded-lg border border-slate-700',
        className
      )}
      data-testid="race-chat"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
        <h3 className="text-sm font-medium text-gray-300">Chat</h3>
        <span className="text-xs text-gray-500">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[150px] max-h-[300px]"
        data-testid="chat-messages"
      >
        {displayedMessages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No messages yet. Say hello!
          </p>
        ) : (
          displayedMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'group relative flex items-start gap-2 p-2 rounded-lg transition-colors',
                msg.playerId === currentPlayerId
                  ? 'bg-cyan-500/10'
                  : 'hover:bg-slate-700/50',
                msg.type === 'system' && 'bg-slate-700/30 italic',
                msg.isModerated && 'opacity-50'
              )}
              data-testid="chat-message"
            >
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-300">
                  {msg.username.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'font-medium text-sm',
                      msg.playerId === currentPlayerId
                        ? 'text-cyan-400'
                        : 'text-gray-300'
                    )}
                  >
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.mentions &&
                    msg.mentions.includes(currentPlayerId || '') && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">
                        mentioned you
                      </span>
                    )}
                </div>
                <p className="text-sm text-gray-200 break-words">
                  {msg.isModerated ? (
                    <span className="text-gray-500">
                      [Message removed by moderator]
                    </span>
                  ) : (
                    renderMessageContent(msg)
                  )}
                </p>
              </div>

              {/* Moderation Menu (for hosts) */}
              {isHost && msg.playerId !== currentPlayerId && !msg.isModerated && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setActiveMessageMenu(
                        activeMessageMenu === msg.id ? null : msg.id
                      )
                    }
                    aria-label="Message options"
                    data-testid="message-menu-button"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </Button>

                  {activeMessageMenu === msg.id && (
                    <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                      {onDeleteMessage && (
                        <button
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-slate-700"
                          onClick={() => {
                            onDeleteMessage(msg.id)
                            setActiveMessageMenu(null)
                          }}
                          data-testid="delete-message-button"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                          Delete Message
                        </button>
                      )}
                      {onMutePlayer && (
                        <button
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-slate-700"
                          onClick={() => {
                            onMutePlayer(msg.playerId)
                            setActiveMessageMenu(null)
                          }}
                          data-testid="mute-player-button"
                        >
                          <Ban className="w-4 h-4 text-orange-400" />
                          Mute Player
                        </button>
                      )}
                      <button
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-slate-700"
                        onClick={() => setActiveMessageMenu(null)}
                      >
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        Report
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="relative">
          {/* Mention Suggestions */}
          {showMentionSuggestions && mentionSuggestions.length > 0 && (
            <div
              className="absolute bottom-full left-0 right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 max-h-[150px] overflow-y-auto"
              data-testid="mention-suggestions"
            >
              {mentionSuggestions.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-slate-700"
                  onClick={() => insertMention(player.username)}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {player.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{player.username}</span>
                </button>
              ))}
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-full right-0 mb-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10 p-2"
              data-testid="emoji-picker"
            >
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-700 rounded transition-colors"
                    onClick={() => insertEmoji(emoji)}
                    data-testid="emoji-button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="flex items-center gap-2">
            {/* Mention Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setInputValue((prev) => prev + '@')
                setShowMentionSuggestions(true)
                inputRef.current?.focus()
              }}
              aria-label="Mention a player"
              data-testid="mention-button"
            >
              <AtSign className="w-4 h-4 text-gray-400" />
            </Button>

            {/* Emoji Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              aria-label="Open emoji picker"
              data-testid="emoji-picker-button"
            >
              <Smile className="w-4 h-4 text-gray-400" />
            </Button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
              maxLength={MAX_MESSAGE_LENGTH}
              data-testid="chat-input"
            />

            {/* Send Button */}
            <Button
              type="submit"
              size="icon-sm"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              data-testid="send-message-button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Character Count */}
          {inputValue.length > MAX_MESSAGE_LENGTH * 0.8 && (
            <div className="text-right mt-1">
              <span
                className={cn(
                  'text-xs',
                  inputValue.length >= MAX_MESSAGE_LENGTH
                    ? 'text-red-400'
                    : 'text-gray-500'
                )}
              >
                {inputValue.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default RaceChat
