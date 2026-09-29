'use client'

export default function MasterKillSwitch({
  onKillAll,
  onRestoreAll
}: {
  onKillAll: () => void
  onRestoreAll: () => void
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-medium text-textPrimary sm:text-[15px]">
          Emergency control
        </h2>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-textMuted sm:text-sm">
          Aksi langsung untuk mengubah status seluruh tools WebUtility
          sekaligus.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={onKillAll}
          className="rounded-lg bg-red px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-red/40"
        >
          Matikan semua tools
        </button>

        <button
          type="button"
          onClick={onRestoreAll}
          className="rounded-lg border border-border-strong bg-transparent px-4 py-2.5 text-sm font-medium text-textSecondary transition hover:border-white/20 hover:bg-white/[0.03] hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          Nyalakan semua tools
        </button>
      </div>
    </section>
  )
}