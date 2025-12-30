import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { useAppSession } from './session'
import { db } from '@/db'
import { userSettings } from '@/db/schema'

// Setting types
export type Theme = 'light' | 'dark' | 'system'
export type CaretStyle = 'line' | 'block' | 'underline'

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  autoIndent: true,
  tabSize: 2,
  soundEnabled: false,
  soundVolume: 50,
  theme: 'dark',
  showLineNumbers: true,
  smoothCaret: true,
  caretStyle: 'line',
  fontSize: 16,
  strictMode: false,
  showWpm: true,
  showAccuracy: true,
  showTimer: true,
}

export interface UserSettings {
  autoIndent: boolean
  tabSize: number
  soundEnabled: boolean
  soundVolume: number
  theme: Theme
  showLineNumbers: boolean
  smoothCaret: boolean
  caretStyle: CaretStyle
  fontSize: number
  strictMode: boolean
  showWpm: boolean
  showAccuracy: boolean
  showTimer: boolean
}

export type SettingsUpdate = Partial<UserSettings>

/**
 * Get current user's settings
 */
export const getSettingsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<UserSettings> => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return DEFAULT_SETTINGS
    }

    const results = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)

    const settings = results[0] as typeof results[number] | undefined
    if (!settings) {
      return DEFAULT_SETTINGS
    }

    return {
      autoIndent: settings.autoIndent ?? DEFAULT_SETTINGS.autoIndent,
      tabSize: settings.tabSize ?? DEFAULT_SETTINGS.tabSize,
      soundEnabled: settings.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
      soundVolume: settings.soundVolume ?? DEFAULT_SETTINGS.soundVolume,
      theme: (settings.theme as Theme | null) ?? DEFAULT_SETTINGS.theme,
      showLineNumbers: settings.showLineNumbers ?? DEFAULT_SETTINGS.showLineNumbers,
      smoothCaret: settings.smoothCaret ?? DEFAULT_SETTINGS.smoothCaret,
      caretStyle: (settings.caretStyle as CaretStyle | null) ?? DEFAULT_SETTINGS.caretStyle,
      fontSize: settings.fontSize ?? DEFAULT_SETTINGS.fontSize,
      strictMode: settings.strictMode ?? DEFAULT_SETTINGS.strictMode,
      showWpm: settings.showWpm ?? DEFAULT_SETTINGS.showWpm,
      showAccuracy: settings.showAccuracy ?? DEFAULT_SETTINGS.showAccuracy,
      showTimer: settings.showTimer ?? DEFAULT_SETTINGS.showTimer,
    }
  }
)

/**
 * Update current user's settings
 */
export const updateSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: SettingsUpdate) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if settings exist
    const existingResults = await db
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)

    const existing = existingResults[0] as { id: number } | undefined
    if (existing) {
      // Update existing settings
      await db
        .update(userSettings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))
    } else {
      // Create new settings
      await db.insert(userSettings).values({
        userId,
        ...DEFAULT_SETTINGS,
        ...data,
      })
    }

    return { success: true }
  })

/**
 * Reset settings to defaults
 */
export const resetSettingsFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ success: boolean; error?: string }> => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return { success: false, error: 'Not authenticated' }
    }

    await db
      .update(userSettings)
      .set({
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))

    return { success: true }
  }
)
