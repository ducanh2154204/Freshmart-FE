import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import AppProviders from '@/components/providers/AppProviders'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: 'FreshMart - Mua Chung Mỗi Ngày, Giá Rẻ Bất Ngờ',
  description:
    'Cung cấp thực phẩm tươi ngon, chất lượng cao với giá tốt nhất cho mọi gia đình Việt Nam',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
