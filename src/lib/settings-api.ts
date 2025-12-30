import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { userSettings } from '@/db/schema'
import { useAppSession } from './session'

// Default settings
export const DEFAULT_SETTINGS = {
  autoIndent: true,
  tabSize: 2,
  soundEnabled: false,
  soundVolume: 50,
  theme: 'dark' as const,
  showLineNumbers: true,
  smoothCaret: true,
  caretStyle: 'line' as const,
  fontSize: 16,
  strictMode: false,
  showWpm: true,
  showAccuracy: true,
  showTimer: true,
}

export type UserSettings = typeof DEFAULT_SETTINGS

export interface SettingsUpdate {
  autoIndent?: boolean
  tabSize?: number
  soundEnabled?: boolean
  soundVolume?: number
  theme?: 'light' | 'dark' | 'system'
  showLineNumbers?: boolean
  smoothCaret?: boolean
  caretStyle?: 'line' | 'block' | 'underline'
  fontSize?: number
  strictMode?: boolean
  showWpm?: boolean
  showAccuracy?: boolean
  showTimer?: boolean
}

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

    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)

    if (!settings) {
      return DEFAULT_SETTINGS
    }

    return {
      autoIndent: settings.autoIndent,
      tabSize: settings.tabSize,
      soundEnabled: settings.soundEnabled,
      soundVolume: settings.soundVolume,
      theme: settings.theme,
      showLineNumbers: settings.showLineNumbers,
      smoothCaret: settings.smoothCaret,
      caretStyle: settings.caretStyle,
      fontSize: settings.fontSize,
      strictMode: settings.strictMode,
      showWpm: settings.showWpm,
      showAccuracy: settings.showAccuracy,
      showTimer: settings.showTimer,
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
    const [existing] = await db
      .select({ id: userSettings.id })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)

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
