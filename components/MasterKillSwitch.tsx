'use client'

export default function MasterKillSwitch({
  onKillAll,
  onRestoreAll
}: {
  onKillAll: () => void
  onRestoreAll: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-surface2 px-4 py-4">
      <p className="text-sm font-medium text-textPrimary">Kill switch darurat</p>
      <p className="mt-0.5 text-xs text-textMuted">Aksi langsung, tidak mencerminkan status toggle di bawah</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onKillAll}
          className="flex-1 rounded-lg bg-red px-3 py-2 text-xs font-medium text-white hover:bg-red-dark"
        >
          Matikan semua tools
        </button>
        <button
          onClick={onRestoreAll}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-textSecondary hover:text-textPrimary"
        >
          Nyalakan semua tools
        </button>
      </div>
    </div>
  )
}
