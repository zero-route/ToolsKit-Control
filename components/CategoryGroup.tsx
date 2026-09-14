'use client'

import { AdminCategory } from '@/lib/toolsData'
import ToggleSwitch from './ToggleSwitch'

export default function CategoryGroup({
  category,
  flags,
  onToggle
}: {
  category: AdminCategory
  flags: Record<string, boolean>
  onToggle: (toolId: string, enabled: boolean) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="bg-surface2 px-4 py-2 text-xs font-medium text-textSecondary">{category.name}</div>
      <div className="flex flex-col">
        {category.tools.map((tool) => {
          const enabled = flags[tool.id] ?? true
          return (
            <div
              key={tool.id}
              className="flex items-center justify-between border-t border-border bg-surface px-4 py-3 first:border-t-0"
            >
              <span className="text-sm text-textPrimary">{tool.name}</span>
              <ToggleSwitch enabled={enabled} onChange={() => onToggle(tool.id, !enabled)} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
