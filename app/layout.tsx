import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500']
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700']
})

export const metadata: Metadata = {
  title: 'KitBox Control',
  description: 'Panel admin untuk mengatur tools KitBox'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-page text-textPrimary`}>{children}</body>
    </html>
  )
}
