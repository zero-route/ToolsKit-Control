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
          table: 'feature_flags'
        },
        (payload) => {
          const row = payload.new as FeatureFlag

          if (!row?.tool_id) return

          setFlags((current) => ({
            ...current,
            [row.tool_id]: row
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: inputPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Password salah.')
      }

      setPassword(inputPassword)
      setAuthenticated(true)
      setInputPassword('')
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Login gagal.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(
    toolId: string,
    enabled: boolean
  ) {
    setError('')

    const previous = flags[toolId]

    setFlags((current) => ({
      ...current,
      [toolId]: {
        tool_id: toolId,
        is_enabled: enabled,
        disabled_reason:
          previous?.disabled_reason ?? null
      }
    }))

    try {
      const response = await fetch('/api/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolId,
          enabled,
          password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Gagal mengubah status tool.'
        )
      }

      await loadFlags()
    } catch (toggleError) {
      setFlags((current) => ({
        ...current,
        ...(previous
          ? {
              [toolId]: previous
            }
          : {})
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

    const toolIds = categories.flatMap((category) =>
      category.tools.map((tool) => tool.id)
    )

    setFlags((current) => {
      const next = { ...current }

      for (const toolId of toolIds) {
        next[toolId] = {
          tool_id: toolId,
          is_enabled: enabled,
          disabled_reason:
            current[toolId]?.disabled_reason ?? null
        }
      }

      return next
    })

    const results = await Promise.allSettled(
      toolIds.map(async (toolId) => {
        const response = await fetch('/api/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            toolId,
            enabled,
            password
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.error || `Gagal mengubah ${toolId}.`
          )
        }
      })
    )

    const failedCount = results.filter(
      (result) => result.status === 'rejected'
    ).length

    await loadFlags()

    if (failedCount > 0) {
      setError(
        `${failedCount} tools gagal diubah, coba lagi`
      )
    }
  }

  async function handleKillAll() {
    await handleToggleAll(false)
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-textPrimary sm:px-6">
        <div className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="w-full rounded-xl border border-border bg-surface p-5 sm:p-6"
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl font-medium tracking-tight">
                ToolsKit Control
              </h1>

              <p className="mt-1.5 text-sm text-textMuted">
                Masukkan password admin untuk melanjutkan.
              </p>
            </div>

            <input
              type="password"
              value={inputPassword}
              onChange={(event) =>
                setInputPassword(event.target.value)
              }
              placeholder="Password admin"
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-page px-4 py-3 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-white/25"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Memeriksa...' : 'Masuk'}
            </button>

            {error && (
              <p className="mt-4 text-center text-xs text-red">
                {error}
              </p>
            )}
          </form>
        </div>
      </main>
    )
  }

  const enabledMap: Record<string, boolean> = {}

  for (const key in flags) {
    enabledMap[key] = flags[key].is_enabled
  }

  return (
    <main className="min-h-screen bg-page px-4 py-7 text-textPrimary sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-border pb-6">
          <h1 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
            ToolsKit Control
          </h1>

          <p className="mt-1.5 text-sm text-textMuted">
            Admin dashboard · Kelola status tools WebUtility.
          </p>
        </header>

        <div className="mt-6 flex flex-col gap-3">
          <MasterKillSwitch
            onKillAll={handleKillAll}
            onRestoreAll={() => handleToggleAll(true)}
          />

          <WeatherSettings password={password} />

          <DisabledToolsNote password={password} />
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red/20 bg-red/[0.06] px-4 py-3 text-xs text-red">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {categories.map((category) => (
            <CategoryGroup
              key={category.slug}
              category={category}
              flags={enabledMap}
              onToggle={handleToggle}
            />
          ))}
        </div>

        <footer className="py-8 text-center text-[11px] text-textMuted">
          ToolsKit Control · WebUtility admin
        </footer>
      </div>
    </main>
  )
}