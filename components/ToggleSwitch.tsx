'use client'

export default function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={enabled}
      className="relative h-5 w-9 rounded-full transition-colors duration-200"
      style={{ backgroundColor: enabled ? '#333333' : '#E24B4A' }}
    >
      <span
        className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0px)' }}
      />
    </button>
  )
}
