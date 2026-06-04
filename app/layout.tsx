import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Task Manager',
  description: 'Manage your tasks efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#0d0b1e' }}>
          <div className="aurora-orb-1" />
          <div className="aurora-orb-2" />
          <div className="aurora-orb-3" />
        </div>
        {children}
      </body>
    </html>
  )
}
