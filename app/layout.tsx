import '@/app/ui/global.css'
import { ReactNode } from 'react'
import { inter } from '@/app/ui/invoices/fonts'
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body>
        {children}
      </body>
    </html>
  )
}
