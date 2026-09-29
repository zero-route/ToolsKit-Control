'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function parseCoordinates(
  input: string
): { latitude: number; longitude: number } | null {
  const parts = input.split(',').map((part) => part.trim())

  if (parts.length !== 2) return null

  const latitude = parseFloat(parts[0])
  const longitude = parseFloat(parts[1])

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return {
    latitude,
    longitude
  }
}

export default function WeatherSettings({
  password
}: {
  password: string
}) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [coordinateInput, setCoordinateInput] = useState('')
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['weather_mode', 'manual_latitude', 'manual_longitude'])
      .then(({ data }) => {
        if (!data) return

        const map: Record<string, string | null> = {}

        data.forEach((row) => {
          map[row.key] = row.value
        })

        if (map.weather_mode === 'manual') {
          setMode('manual')
        }

        if (map.manual_latitude && map.manual_longitude) {
          setCoordinateInput(
            `${map.manual_latitude},${map.manual_longitude}`
          )
        }
      })
  }, [])

  async function saveSetting(key: string, value: string) {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key,
        value,
        password
      })
    })

    return res.ok
  }

  async function handleModeChange(nextMode: 'auto' | 'manual') {
    setMode(nextMode)
    setStatus(null)

    const ok = await saveSetting('weather_mode', nextMode)

    setStatus(ok ? null : 'Password salah atau gagal menyimpan')
  }

  async function handleSaveCoordinates() {
    const parsed = parseCoordinates(coordinateInput)

    if (!parsed) {
      setStatus(
        'Format koordinat tidak valid, contoh: -6.177602,106.826648'
      )
      return
    }

    const okLat = await saveSetting(
      'manual_latitude',
      String(parsed.latitude)
    )

    const okLon = await saveSetting(
      'manual_longitude',
      String(parsed.longitude)
    )

    setStatus(
      okLat && okLon
        ? 'Koordinat tersimpan'
        : 'Password salah atau gagal menyimpan'
    )
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-medium text-textPrimary sm:text-[15px]">
          Pengaturan cuaca
        </h2>

        <p className="mt-1 text-xs text-textMuted sm:text-sm">
          Pilih sumber lokasi yang digunakan untuk data cuaca.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleModeChange('auto')}
          className={`rounded-lg border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
            mode === 'auto'
              ? 'border-white/20 bg-white/[0.08] text-textPrimary'
              : 'border-border bg-transparent text-textSecondary hover:bg-white/[0.03] hover:text-textPrimary'
          }`}
        >
          <span className="block text-sm font-medium">
            Otomatis
          </span>

          <span className="mt-0.5 block text-xs text-textMuted">
            IP pengunjung
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          className={`rounded-lg border px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
            mode === 'manual'
              ? 'border-white/20 bg-white/[0.08] text-textPrimary'
              : 'border-border bg-transparent text-textSecondary hover:bg-white/[0.03] hover:text-textPrimary'
          }`}
        >
          <span className="block text-sm font-medium">
            Manual
          </span>

          <span className="mt-0.5 block text-xs text-textMuted">
            Atur koordinat sendiri
          </span>
        </button>
      </div>

      {mode === 'manual' && (
        <div className="mt-4 rounded-lg border border-border bg-surface2 p-3">
          <input
            value={coordinateInput}
            onChange={(event) => {
              setCoordinateInput(event.target.value)
              setStatus(null)
            }}
            placeholder="-6.177602,106.826648"
            className="w-full rounded-lg border border-border bg-page px-3 py-2.5 text-sm text-textPrimary outline-none transition placeholder:text-textMuted focus:border-white/25"
          />

          <p className="mt-2 text-xs text-textMuted">
            Format: latitude,longitude (pisah koma, tanpa spasi)
          </p>

          <button
            type="button"
            onClick={handleSaveCoordinates}
            className="mt-3 rounded-lg border border-border-strong px-3 py-2 text-xs font-medium text-textPrimary transition hover:bg-white/[0.05]"
          >
            Simpan koordinat
          </button>
        </div>
      )}

      {status && (
        <p
          className={`mt-3 text-xs ${
            status === 'Koordinat tersimpan'
              ? 'text-textSecondary'
              : 'text-red'
          }`}
        >
          {status}
        </p>
      )}
    </section>
  )
}