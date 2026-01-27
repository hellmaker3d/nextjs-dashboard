import '@/app/ui/global.css'
import { ReactNode } from 'react'
import { inter } from '@/app/ui/invoices/fonts'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body>
        {children}
      </body>
    </html>
  )
}
