'use client'

import ToggleSwitch from './ToggleSwitch'

export default function MasterKillSwitch({
  allEnabled,
  onToggleAll
}: {
  allEnabled: boolean
  onToggleAll: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface2 px-4 py-4">
      <div>
        <p className="text-sm font-medium text-textPrimary">Matikan semua tools</p>
        <p className="mt-0.5 text-xs text-textMuted">Kill switch darurat</p>
      </div>
      <ToggleSwitch enabled={allEnabled} onChange={() => onToggleAll(!allEnabled)} />
    </div>
  )
}
