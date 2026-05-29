import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FinFlow Analytics — Real-Time Financial Intelligence Dashboard',
  description:
    'Enterprise SaaS analytics dashboard delivering unified real-time financial intelligence for 10,000+ DAU. Role-based access, one-click exports, 99.9% uptime.',
  keywords: [
    'financial analytics',
    'SaaS dashboard',
    'real-time reporting',
    'fintech',
    'MRR ARR tracking',
    'role-based access control',
  ],
  openGraph: {
    title: 'FinFlow Analytics — Real-Time Financial Intelligence',
    description:
      'Unified executive dashboard replacing 7 fragmented financial tools. 60% faster reporting, 99.9% uptime, real-time WebSocket updates.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinFlow Analytics Dashboard',
    description: 'Real-time financial intelligence for enterprise fintech teams.',
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  )
}
