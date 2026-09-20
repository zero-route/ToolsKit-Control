'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CategoryGroup from '@/components/CategoryGroup'
import MasterKillSwitch from '@/components/MasterKillSwitch'
import WeatherSettings from '@/components/WeatherSettings'
import DisabledToolsNote from '@/components/DisabledToolsNote'
import { categories } from '@/lib/toolsData'

type FeatureFlag = {
  tool_id: string
  is_enabled: boolean
  disabled_reason: string | null
}

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [inputPassword, setInputPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({})
  const [error, setError] = useState('')

  async function loadFlags() {
    const { data, error: fetchError } = await supabase
      .from('feature_flags')
      .select('tool_id, is_enabled, disabled_reason')

    if (fetchError) {
      setError(fetchError.message)
      return
    }

    const nextFlags: Record<string, FeatureFlag> = {}

    for (const flag of data ?? []) {
      nextFlags[flag.tool_id] = flag
    }

    setFlags(nextFlags)
  }

  useEffect(() => {
    if (!authenticated) return

    loadFlags()

    const channel = supabase
      .channel('admin-feature-flags')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_flags',
        },
        (payload) => {
          const row = payload.new as FeatureFlag

          if (!row?.tool_id) return

          setFlags((current) => ({
            ...current,
            [row.tool_id]: row,
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [authenticated])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!inputPassword.trim()) {
      setError('Masukkan password admin.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: inputPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Password salah.')
      }

      setPassword(inputPassword)
      setAuthenticated(true)
      setInputPassword('')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(toolId: string, enabled: boolean) {
    setError('')

    const previous = flags[toolId]

    setFlags((current) => ({
      ...current,
      [toolId]: {
        tool_id: toolId,
        is_enabled: enabled,
        disabled_reason: previous?.disabled_reason ?? null,
      },
    }))

    try {
      const response = await fetch('/api/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          enabled,
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengubah status tool.')
      }

      await loadFlags()
    } catch (toggleError) {
      setFlags((current) => ({
        ...current,
        ...(previous ? { [toolId]: previous } : {}),
      }))

      setError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Gagal mengubah status tool.'
      )
    }
  }

  async function handleToggleAll(enabled: boolean) {
    setError('')

    const toolIds = categories.flatMap((category) => category.tools.map((tool) => tool.id))

    setFlags((current) => {
      const next = { ...current }

      for (const toolId of toolIds) {
        next[toolId] = {
          tool_id: toolId,
          is_enabled: enabled,
          disabled_reason: current[toolId]?.disabled_reason ?? null,
        }
      }

      return next
    })

    const results = await Promise.allSettled(
      toolIds.map(async (toolId) => {
        const response = await fetch('/api/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            toolId,
            enabled,
            password,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `Gagal mengubah ${toolId}.`)
        }
      })
    )

    const failedCount = results.filter((result) => result.status === 'rejected').length

    await loadFlags()

    if (failedCount > 0) {
      setError(`${failedCount} tools gagal diubah, coba lagi`)
    }
  }

  async function handleKillAll() {
    await handleToggleAll(false)
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
          >
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">
                ToolsKit Control
              </h1>
              <p className="mt-2 text-sm text-white/50">
                Masukkan password admin untuk melanjutkan.
              </p>
            </div>

            <input
              type="password"
              value={inputPassword}
              onChange={(event) => setInputPassword(event.target.value)}
              placeholder="Password admin"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Memeriksa...' : 'Masuk'}
            </button>

            {error && (
              <p className="mt-4 text-center text-xs text-red-400">
                {error}
              </p>
            )}
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h1 className="text-3xl font-semibold">
            ToolsKit Control
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Kelola status tools WebUtility.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-4">
          <MasterKillSwitch
            onKillAll={handleKillAll}
            onRestoreAll={() => handleToggleAll(true)}
          />

          <WeatherSettings />
        </div>

        <DisabledToolsNote password={password} />

        {error && (
          <p className="mt-4 text-center text-xs text-red-400">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-4">
          {categories.map((category) => (
            <CategoryGroup
              key={category.slug}
              category={category}
              flags={flags}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
