'use client'

export default function ToggleSwitch({
  enabled,
  onChange
}: {
  enabled: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      aria-label={enabled ? 'Matikan tool' : 'Nyalakan tool'}
      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
        enabled
          ? 'border-white/20 bg-white/[0.18]'
          : 'border-white/[0.08] bg-white/[0.10]'
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-5 w-5 rounded-full shadow-sm transition-transform duration-200 ${
          enabled
            ? 'translate-x-5 bg-white'
            : 'translate-x-0 bg-[#8B8D91]'
        }`}
      />
    </button>
  )
}