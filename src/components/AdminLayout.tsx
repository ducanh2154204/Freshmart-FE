'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('user')
    window.dispatchEvent(new Event('auth:changed'))
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: '📊',
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: '📋',
    },
    {
      label: 'Vendors',
      href: '/admin/vendors',
      icon: '🏪',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ☰
          </button>
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-green-600 mt-4">
              FreshMart Admin
            </h1>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-6 space-y-3">
          {menuItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-green-50 text-green-600 font-medium border-l-4 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium"
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-600">Manage your platform</p>
        </div>

        {/* Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
