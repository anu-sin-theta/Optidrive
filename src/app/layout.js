import React from 'react'
import { Inter } from 'next/font/google'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Optidrive',
  description: 'Your Secure Local Image and Media Storage Solution for Nerds',
}

export default function RootLayout({ children }) {
  return (
      <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
      </html>
  )
}

