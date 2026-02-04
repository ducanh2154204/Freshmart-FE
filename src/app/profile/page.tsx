'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/Button'

interface StoredUser {
  fullName?: string
  name?: string
  email?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const rawUser = window.localStorage.getItem('user')
      if (rawUser) {
        setUser(JSON.parse(rawUser) as StoredUser)
      }
    } catch {
      setUser(null)
    }

    try {
      const storedAvatar = window.localStorage.getItem('avatarUrl')
      if (storedAvatar) {
        setAvatarUrl(storedAvatar)
      }
    } catch {
      setAvatarUrl(null)
    }
  }, [])

  const displayName = useMemo(() => {
    if (!user) return 'Người dùng'
    return (
      user.fullName?.trim() ||
      user.name?.trim() ||
      user.email?.trim() ||
      'Người dùng'
    )
  }, [user])

  const initial = useMemo(() => {
    return displayName ? displayName.trim()[0]?.toUpperCase() ?? '' : ''
  }, [displayName])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result)
        try {
          window.localStorage.setItem('avatarUrl', reader.result)
          window.dispatchEvent(new Event('auth:changed'))
        } catch {
          // ignore
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const email = user?.email

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Hồ sơ cá nhân
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-28 w-28 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-3xl font-semibold overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial || displayName[0]
                )}
              </div>

              <label className="cursor-pointer">
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-green-50 text-green-700 hover:bg-green-100">
                  Đổi ảnh đại diện
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Họ và tên
                </p>
                <p className="text-base font-medium text-gray-900">
                  {displayName}
                </p>
              </div>
              {email && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-base text-gray-800">{email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-2">
            <p className="text-sm text-gray-600 mb-4">
              Thông tin hồ sơ sẽ được sử dụng để cá nhân hoá trải nghiệm mua
              sắm của bạn trên FreshMart.
            </p>
            <Button
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

