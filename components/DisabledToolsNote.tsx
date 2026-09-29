'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DisabledToolsNote({
  password
}: {
  password: string
}) {
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
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-medium text-textPrimary sm:text-[15px]">
          Catatan tools dinonaktifkan
        </h2>

        <p className="mt-1 max-w-3xl text-xs leading-5 text-textMuted sm:text-sm">
          Pesan ini akan ditampilkan pada semua tools yang sedang
          dinonaktifkan oleh admin.
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
        className="mt-4 w-full resize-none rounded-lg border border-border bg-surface2 px-3 py-3 text-sm leading-5 text-textPrimary outline-none transition placeholder:text-textMuted focus:border-white/25"
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[11px] text-textMuted">
          {note.length}/200
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="rounded-lg border border-border-strong px-4 py-2 text-xs font-medium text-textPrimary transition hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:border-border disabled:text-textMuted"
        >
          {saving ? 'Menyimpan...' : 'Simpan catatan'}
        </button>
      </div>

      {status && (
        <p
          className={`mt-2 text-xs ${
            status === 'Catatan berhasil disimpan'
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