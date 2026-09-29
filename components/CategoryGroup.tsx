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
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-textPrimary sm:text-[15px]">
            {category.name}
          </h2>

          <p className="mt-1 text-xs text-textMuted">
            {category.tools.length}{' '}
            {category.tools.length === 1 ? 'tool' : 'tools'}
          </p>
        </div>
      </div>

      <div>
        {category.tools.map((tool, index) => {
          const enabled = flags[tool.id] ?? false

          return (
            <div
              key={tool.id}
              className={`flex min-h-[64px] items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-white/[0.025] sm:px-5 ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <span className="min-w-0 text-sm text-textPrimary sm:text-[15px]">
                {tool.name}
              </span>

              <ToggleSwitch
                enabled={enabled}
                onChange={() => onToggle(tool.id, !enabled)}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}