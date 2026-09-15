'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  const parts = input.split(',').map((part) => part.trim())

  if (parts.length !== 2) return null

  const latitude = parseFloat(parts[0])
  const longitude = parseFloat(parts[1])

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null

  return { latitude, longitude }
}

export default function WeatherSettings({ password }: { password: string }) {
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
          setCoordinateInput(`${map.manual_latitude},${map.manual_longitude}`)
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

    const ok = await saveSetting('weather_mode', nextMode)

    setStatus(ok ? null : 'Password salah atau gagal menyimpan')
  }

  async function handleSaveCoordinates() {
    const parsed = parseCoordinates(coordinateInput)

    if (!parsed) {
      setStatus('Format koordinat tidak valid, contoh: -6.177602,106.826648')
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
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-medium text-textPrimary">
        Pengaturan cuaca
      </p>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleModeChange('auto')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
            mode === 'auto'
              ? 'bg-red text-white'
              : 'border border-border text-textSecondary'
          }`}
        >
          Otomatis (IP pengunjung)
        </button>

        <button
          onClick={() => handleModeChange('manual')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
            mode === 'manual'
              ? 'bg-red text-white'
              : 'border border-border text-textSecondary'
          }`}
        >
          Manual
        </button>
      </div>

      {mode === 'manual' && (
        <div className="mt-4 flex flex-col gap-2">
          <input
            value={coordinateInput}
            onChange={(event) => setCoordinateInput(event.target.value)}
            placeholder="-6.177602,106.826648"
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-textPrimary outline-none focus:border-red"
          />

          <p className="text-xs text-textMuted">
            Format: latitude,longitude (pisah koma, tanpa spasi)
          </p>

          <button
            onClick={handleSaveCoordinates}
            className="rounded-lg bg-red px-3 py-2 text-xs font-medium text-white hover:bg-red-dark"
          >
            Simpan koordinat
          </button>
        </div>
      )}

      {status && (
        <p className="mt-2 text-xs text-red">
          {status}
        </p>
      )}
    </div>
  )
}