'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { categories } from '@/lib/toolsData'
import MasterKillSwitch from '@/components/MasterKillSwitch'
import CategoryGroup from '@/components/CategoryGroup'
import WeatherSettings from '@/components/WeatherSettings'
import DisabledToolsNote from '@/components/DisabledToolsNote'

const allToolIds = categories.flatMap((category) => category.tools.map((tool) => tool.id))

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('feature_flags')
      .select('tool_id, is_enabled')
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, boolean> = {}
        data.forEach((row) => {
          map[row.tool_id] = row.is_enabled
        })
        setFlags(map)
      })
  }, [])

  async function updateFlag(toolId: string, enabled: boolean) {
    setFlags((prev) => ({ ...prev, [toolId]: enabled }))

    const res = await fetch('/api/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toolId, enabled, password })
    })

    if (!res.ok) {
      setFlags((prev) => ({ ...prev, [toolId]: !enabled }))
      setError('Password salah atau gagal menyimpan')
    } else {
      setError(null)
    }
  }

  function handleToggleAll(enabled: boolean) {
    allToolIds.forEach((toolId) => updateFlag(toolId, enabled))
  }

  function handleKillAll() {
    if (window.confirm('Matikan semua tools sekarang?')) {
      handleToggleAll(false)
    }
  }

  async function handleLogin() {
    setLoginError(null)
    setIsLoggingIn(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    setIsLoggingIn(false)

    if (res.ok) {
      setUnlocked(true)
    } else {
      setLoginError('Password salah')
    }
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-xs rounded-xl border border-border bg-surface p-6">
          <h1 className="font-display text-lg font-medium text-textPrimary">KitBox control</h1>
          <p className="mt-1 text-sm text-textMuted">Masukkan password admin</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-4 w-full rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-textPrimary outline-none focus:border-red"
          />
          {loginError && <p className="mt-2 text-xs text-red">{loginError}</p>}
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="mt-3 w-full rounded-lg bg-red px-4 py-2 text-sm font-medium text-white hover:bg-red-dark disabled:opacity-50"
          >
            {isLoggingIn ? 'Memeriksa...' : 'Mask'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="text-center font-display text-2xl font-medium text-textPrimary">KitBox control</h1>

      <div className="mt-8 flex flex-col gap-4">
        <MasterKillSwitch onKillAll={handleKillAll} onRestoreAll={() => handleToggleAll(true)} />
        <WeatherSettings password={password} />
      </div>

      {error && <p className="mt-4 text-center text-xs text-red">{error}</p>}

      <div className="mt-6 flex flex-col gap-4">
        {categories.map((category) => (
          <CategoryGroup key={category.slug} category={category} flags={flags} onToggle={updateFlag} />
        ))}
      </div>
    </div>
  )
}
