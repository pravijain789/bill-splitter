import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bill Splitter — Split Bills Fairly & Instantly',
  description:
    'Free bill splitting tool. Add people, choose a tip, split equally or by custom amounts. No ads, no sign-up required.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}