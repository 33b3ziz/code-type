import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Settings, Volume2, Eye, Keyboard, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getSettingsFn,
  updateSettingsFn,
  resetSettingsFn,
  DEFAULT_SETTINGS,
  type UserSettings,
} from '@/lib/settings-api'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
  loader: async () => {
    return await getSettingsFn()
  },
})

function SettingsPage() {
  const initialSettings = Route.useLoaderData()
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleChange = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const result = await updateSettingsFn({ data: { [key]: value } })
      if (result.success) {
        setSaveMessage('Settings saved')
        setTimeout(() => setSaveMessage(null), 2000)
      } else {
        setSaveMessage(result.error || 'Failed to save')
      }
    } catch {
      setSaveMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsSaving(true)
    try {
      const result = await resetSettingsFn()
      if (result.success) {
        setSettings(DEFAULT_SETTINGS)
        setSaveMessage('Settings reset to defaults')
        setTimeout(() => setSaveMessage(null), 2000)
      }
    } catch {
      setSaveMessage('Failed to reset settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {/* Save Status */}
        {saveMessage && (
          <div
            className={`mb-6 p-3 rounded-lg text-sm ${
              saveMessage.includes('Failed')
                ? 'bg-red-500/20 text-red-300'
                : 'bg-green-500/20 text-green-300'
            }`}
          >
            {saveMessage}
          </div>
        )}

        {/* Editor Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Editor</h2>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
            {/* Auto Indent */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto Indent</Label>
                <p className="text-sm text-gray-400">
                  Automatically indent new lines
                </p>
              </div>
              <Switch
                checked={settings.autoIndent}
                onCheckedChange={(v) => handleChange('autoIndent', v)}
              />
            </div>

            {/* Tab Size */}
            <div>
              <Label className="text-white">Tab Size</Label>
              <p className="text-sm text-gray-400 mb-3">
                Number of spaces per tab
              </p>
              <Select
                value={settings.tabSize.toString()}
                onValueChange={(v) => handleChange('tabSize', parseInt(v))}
              >
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div>
              <Label className="text-white">Font Size</Label>
              <p className="text-sm text-gray-400 mb-3">{settings.fontSize}px</p>
              <Slider
                value={[settings.fontSize]}
                min={12}
                max={24}
                step={1}
                onValueChange={([v]) => handleChange('fontSize', v)}
                className="w-48"
              />
            </div>

            {/* Show Line Numbers */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Line Numbers</Label>
                <p className="text-sm text-gray-400">
                  Show line numbers in code display
                </p>
              </div>
              <Switch
                checked={settings.showLineNumbers}
                onCheckedChange={(v) => handleChange('showLineNumbers', v)}
              />
            </div>

            {/* Caret Style */}
            <div>
              <Label className="text-white">Caret Style</Label>
              <p className="text-sm text-gray-400 mb-3">Cursor appearance</p>
              <Select
                value={settings.caretStyle}
                onValueChange={(v: 'line' | 'block' | 'underline') =>
                  handleChange('caretStyle', v)
                }
              >
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Smooth Caret */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Smooth Caret</Label>
                <p className="text-sm text-gray-400">
                  Animate caret movement
                </p>
              </div>
              <Switch
                checked={settings.smoothCaret}
                onCheckedChange={(v) => handleChange('smoothCaret', v)}
              />
            </div>
          </div>
        </section>

        {/* Sound Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Sound</h2>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
            {/* Sound Enabled */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Sound Effects</Label>
                <p className="text-sm text-gray-400">
                  Play sounds for keystrokes and errors
                </p>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(v) => handleChange('soundEnabled', v)}
              />
            </div>

            {/* Sound Volume */}
            {settings.soundEnabled && (
              <div>
                <Label className="text-white">Volume</Label>
                <p className="text-sm text-gray-400 mb-3">
                  {settings.soundVolume}%
                </p>
                <Slider
                  value={[settings.soundVolume]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={([v]) => handleChange('soundVolume', v)}
                  className="w-48"
                />
              </div>
            )}
          </div>
        </section>

        {/* Display Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Display</h2>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
            {/* Theme */}
            <div>
              <Label className="text-white">Theme</Label>
              <p className="text-sm text-gray-400 mb-3">
                Application color scheme
              </p>
              <Select
                value={settings.theme}
                onValueChange={(v: 'light' | 'dark' | 'system') =>
                  handleChange('theme', v)
                }
              >
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show WPM */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Show WPM</Label>
                <p className="text-sm text-gray-400">
                  Display words per minute during test
                </p>
              </div>
              <Switch
                checked={settings.showWpm}
                onCheckedChange={(v) => handleChange('showWpm', v)}
              />
            </div>

            {/* Show Accuracy */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Show Accuracy</Label>
                <p className="text-sm text-gray-400">
                  Display accuracy percentage during test
                </p>
              </div>
              <Switch
                checked={settings.showAccuracy}
                onCheckedChange={(v) => handleChange('showAccuracy', v)}
              />
            </div>

            {/* Show Timer */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Show Timer</Label>
                <p className="text-sm text-gray-400">
                  Display countdown timer during test
                </p>
              </div>
              <Switch
                checked={settings.showTimer}
                onCheckedChange={(v) => handleChange('showTimer', v)}
              />
            </div>
          </div>
        </section>

        {/* Test Settings */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Test Behavior</h2>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
            {/* Strict Mode */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Strict Mode</Label>
                <p className="text-sm text-gray-400">
                  End test immediately on error
                </p>
              </div>
              <Switch
                checked={settings.strictMode}
                onCheckedChange={(v) => handleChange('strictMode', v)}
              />
            </div>
          </div>
        </section>

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  )
}
