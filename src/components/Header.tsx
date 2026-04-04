'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/Button'

export const Header: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthed, setIsAuthed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const syncAuth = () => {
    try {
      const token = window.localStorage.getItem('accessToken')
      setIsAuthed(!!token)

      const rawUser = window.localStorage.getItem('user')
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser) as {
            fullName?: string
            name?: string
            email?: string
          }
          const name =
            parsed.fullName?.trim() ||
            parsed.name?.trim() ||
            parsed.email?.trim() ||
            null
          setUserName(name)
          setUserEmail(parsed.email ?? null)
        } catch {
          setUserName(null)
          setUserEmail(null)
        }
      } else {
        setUserName(null)
        setUserEmail(null)
      }

      const storedAvatar = window.localStorage.getItem('avatarUrl')
      setAvatarUrl(storedAvatar || null)
    } catch {
      setIsAuthed(false)
      setUserName(null)
      setUserEmail(null)
      setAvatarUrl(null)
    }
  }

  const getToken = (): string | null => {
    try {
      return window.localStorage.getItem('accessToken')
    } catch {
      return null
    }
  }

  const getInitialFromToken = (token: string | null): string | null => {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length < 2) return null
    try {
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = payload + '==='.slice((payload.length + 3) % 4) // base64 padding
      const json = JSON.parse(atob(padded))
      const sub = (json?.sub as string | undefined) || ''
      const account = (json?.accountId as string | number | undefined) ?? ''
      const raw = (sub || String(account)).trim()
      if (!raw) return null
      return raw[0].toUpperCase()
    } catch {
      return null
    }
  }

  const avatarInitial = useMemo(() => {
    if (typeof window === 'undefined') return null
    return getInitialFromToken(getToken())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed])

  useEffect(() => {
    syncAuth()

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken') syncAuth()
    }
    const onAuthChanged = () => syncAuth()

    window.addEventListener('storage', onStorage)
    window.addEventListener('auth:changed', onAuthChanged as EventListener)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('auth:changed', onAuthChanged as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node | null
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const handleLogout = () => {
    try {
      window.localStorage.removeItem('accessToken')
      window.dispatchEvent(new Event('auth:changed'))
    } catch {
      // ignore
    }
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white shadow-sm" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/logoFM.jpg"
              alt="FreshMart"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, danh mục..."
                className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className={`font-medium hover:text-green-700 ${
                pathname === '/' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/about"
              className={`hover:text-gray-900 ${
                pathname?.startsWith('/about')
                  ? 'text-green-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              Giới thiệu
            </Link>
            <Link
              href="/forum"
              className={`hover:text-gray-900 ${
                pathname?.startsWith('/forum')
                  ? 'text-green-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              Forum
            </Link>
            <Link
              href="/group-buying"
              className={`hover:text-gray-900 ${
                pathname?.startsWith('/group-buying')
                  ? 'text-green-600 font-medium'
                  : 'text-gray-600'
              }`}
            >
              Mua chung
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <svg
                className="w-6 h-6 text-gray-600 hover:text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Auth */}
            {isAuthed ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(v => !v)}
                  className="h-11 w-11 rounded-full bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center font-semibold text-lg select-none overflow-hidden"
                  aria-label="Tài khoản"
                  title={userName || 'Tài khoản'}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName || 'Avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (avatarInitial && <span>{avatarInitial}</span>) || (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {userName || 'Người dùng'}
                      </div>
                      {userEmail && (
                        <div className="text-xs text-gray-500 truncate">
                          {userEmail}
                        </div>
                      )}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Trang cá nhân
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Đăng nhập
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
