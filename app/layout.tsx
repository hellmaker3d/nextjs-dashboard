import '@/app/ui/global.css';
import { inter } from '@/app/ui/invoices/fonts';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body>
        <h1>HOLA SOY MILO</h1>
        {children}
      </body>
    </html>
  );
}
