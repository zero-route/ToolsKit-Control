import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'rgb(var(--ad-page) / <alpha-value>)',
        surface: 'rgb(var(--ad-surface) / <alpha-value>)',
        surface2: 'rgb(var(--ad-surface-2) / <alpha-value>)',
        border: 'rgb(var(--ad-border) / <alpha-value>)',
        textPrimary: 'rgb(var(--ad-text-primary) / <alpha-value>)',
        textSecondary: 'rgb(var(--ad-text-secondary) / <alpha-value>)',
        textMuted: 'rgb(var(--ad-text-muted) / <alpha-value>)',
        red: {
          DEFAULT: 'rgb(var(--ad-red) / <alpha-value>)',
          dark: 'rgb(var(--ad-red-dark) / <alpha-value>)'
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      }
    }
  },
  plugins: []
}

export default config
