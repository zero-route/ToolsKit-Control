'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DisabledToolsNote({ password }: { password: string }) {
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'disabled_tools_note')
      .maybeSingle()
      .then(({ data }) => {
        const value = data?.value ?? ''
        setNote(value)
        setSavedNote(value)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setStatus(null)

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: 'disabled_tools_note',
        value: note.trim(),
        password
      })
    })

    setSaving(false)

    if (!res.ok) {
      setStatus('Password salah atau gagal menyimpan')
      return
    }

    setSavedNote(note.trim())
    setNote(note.trim())
    setStatus('Catatan berhasil disimpan')
  }

  const hasChanges = note.trim() !== savedNote

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div>
        <p className="text-sm font-medium text-textPrimary">
          Catatan tools dinonaktifkan
        </p>

        <p className="mt-1 text-xs leading-5 text-textMuted">
          Catatan ini akan ditampilkan pada semua tools yang sedang dinonaktifkan oleh admin.
        </p>
      </div>

      <textarea
        value={note}
        onChange={(event) => {
          setNote(event.target.value)
          setStatus(null)
        }}
        maxLength={200}
        rows={3}
        placeholder="Contoh: Tool sedang dalam maintenance. Silakan coba kembali nanti."
        className="mt-4 w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm leading-5 text-textPrimary outline-none placeholder:text-textMuted focus:border-red"
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-textMuted">
          {note.length}/200
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="rounded-lg bg-red px-4 py-2 text-xs font-medium text-white transition-opacity hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? 'Menyimpan...' : 'Simpan catatan'}
        </button>
      </div>

      {status && (
        <p
          className={`mt-2 text-xs ${
            status === 'Catatan berhasil disimpan'
              ? 'text-green-400'
              : 'text-red'
          }`}
        >
          {status}
        </p>
      )}
    </div>
  )
}