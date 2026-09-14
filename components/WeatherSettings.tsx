'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function WeatherSettings({ password }: { password: string }) {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
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
        if (map.weather_mode === 'manual') setMode('manual')
        setLatitude(map.manual_latitude ?? '')
        setLongitude(map.manual_longitude ?? '')
      })
  }, [])

  async function saveSetting(key: string, value: string) {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, password })
    })
    return res.ok
  }

  async function handleModeChange(nextMode: 'auto' | 'manual') {
    setMode(nextMode)
    const ok = await saveSetting('weather_mode', nextMode)
    setStatus(ok ? null : 'Password salah atau gagal menyimpan')
  }

  async function handleSaveCoordinates() {
    const okLat = await saveSetting('manual_latitude', latitude)
    const okLon = await saveSetting('manual_longitude', longitude)
    setStatus(okLat && okLon ? 'Koordinat tersimpan' : 'Password salah atau gagal menyimpan')
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm font-medium text-textPrimary">Pengaturan cuaca</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => handleModeChange('auto')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
            mode === 'auto' ? 'bg-red text-white' : 'border border-border text-textSecondary'
          }`}
        >
          Otomatis (IP pengunjung)
        </button>
        <button
          onClick={() => handleModeChange('manual')}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
            mode === 'manual' ? 'bg-red text-white' : 'border border-border text-textSecondary'
          }`}
        >
          Manual
        </button>
      </div>

      {mode === 'manual' && (
        <div className="mt-4 flex flex-col gap-2">
          <input
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            placeholder="Latitude, misal -6.2"
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-textPrimary outline-none focus:border-red"
          />
          <input
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            placeholder="Longitude, misal 106.8"
            className="rounded-lg border border-border bg-surface2 px-3 py-2 text-sm text-textPrimary outline-none focus:border-red"
          />
          <button
            onClick={handleSaveCoordinates}
            className="rounded-lg bg-red px-3 py-2 text-xs font-medium text-white hover:bg-red-dark"
          >
            Simpan koordinat
          </button>
        </div>
      )}

      {status && <p className="mt-2 text-xs text-red">{status}</p>}
    </div>
  )
}
