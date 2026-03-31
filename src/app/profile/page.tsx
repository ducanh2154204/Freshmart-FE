'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  vendorService,
  type VendorProfile,
  type VendorRegisterPayload,
} from '@/services/vendor.service'
import type { ApiError } from '@/types/api'

interface StoredUser {
  fullName?: string
  name?: string
  email?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<StoredUser | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [vendorChecking, setVendorChecking] = useState(false)
  const [vendorRegistering, setVendorRegistering] = useState(false)
  const [vendorError, setVendorError] = useState<string | null>(null)
  const [vendorSuccess, setVendorSuccess] = useState<string | null>(null)
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [vendorForm, setVendorForm] = useState<VendorRegisterPayload>({
    storeName: '',
    slug: '',
    description: '',
    bankAccountDetails: {
      bankName: '',
      accountNumber: '',
      accountName: '',
    },
  })

  const getErrorMessage = (error: unknown, fallback: string) => {
    const e = error as Partial<ApiError> & { details?: any }
    return (
      (typeof e?.message === 'string' && e.message) ||
      (typeof e?.details?.message === 'string' && e.details.message) ||
      fallback
    )
  }

  const loadVendorProfile = async () => {
    if (typeof window === 'undefined') return

    const token = window.localStorage.getItem('accessToken')
    if (!token) {
      setVendorProfile(null)
      return
    }

    try {
      setVendorChecking(true)
      const vendorData = await vendorService.getMyVendor()
      setVendorProfile(vendorData || null)
    } catch (error) {
      const status = (error as ApiError)?.status
      if (status === 404) {
        setVendorProfile(null)
      } else {
        setVendorError(getErrorMessage(error, 'Không thể tải thông tin vendor'))
      }
    } finally {
      setVendorChecking(false)
    }
  }

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

    loadVendorProfile()
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
    return displayName ? (displayName.trim()[0]?.toUpperCase() ?? '') : ''
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

  const displayStoreName =
    vendorProfile?.storeName?.trim() ||
    vendorProfile?.name?.trim() ||
    'Cửa hàng của bạn'

  const displaySlug = vendorProfile?.slug?.trim() || '---'

  const displayBank =
    vendorProfile?.bankAccountDetails?.bankName?.trim() || '---'

  const vendorStatusLabel = (status?: string) => {
    const normalized = (status || '').toLowerCase()
    if (['approved', 'active', 'verified'].includes(normalized)) {
      return 'Đang hoạt động'
    }
    if (['pending', 'reviewing'].includes(normalized)) {
      return 'Đang chờ duyệt'
    }
    if (['rejected', 'inactive', 'blocked'].includes(normalized)) {
      return 'Cần cập nhật hồ sơ'
    }
    return status || 'Đã gửi đăng ký'
  }

  const slugify = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

  const handleVendorInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name.startsWith('bank.')) {
      const field = name.replace('bank.', '') as
        | 'bankName'
        | 'accountNumber'
        | 'accountName'
      setVendorForm(prev => ({
        ...prev,
        bankAccountDetails: {
          ...prev.bankAccountDetails,
          [field]: value,
        },
      }))
      return
    }

    if (name === 'storeName') {
      setVendorForm(prev => ({
        ...prev,
        storeName: value,
        slug: slugManuallyEdited ? prev.slug : slugify(value),
      }))
      return
    }

    if (name === 'slug') {
      setSlugManuallyEdited(true)
      setVendorForm(prev => ({ ...prev, slug: slugify(value) }))
      return
    }

    setVendorForm(prev => ({ ...prev, [name]: value }))
  }

  const handleVendorRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setVendorError(null)
    setVendorSuccess(null)

    const payload = {
      storeName: vendorForm.storeName.trim(),
      slug: vendorForm.slug.trim(),
      description: vendorForm.description?.trim() || undefined,
      bankAccountDetails: {
        bankName: vendorForm.bankAccountDetails.bankName.trim(),
        accountNumber: vendorForm.bankAccountDetails.accountNumber.trim(),
        accountName: vendorForm.bankAccountDetails.accountName.trim(),
      },
    }

    if (
      !payload.storeName ||
      !payload.slug ||
      !payload.bankAccountDetails.bankName ||
      !payload.bankAccountDetails.accountNumber ||
      !payload.bankAccountDetails.accountName
    ) {
      setVendorError('Vui lòng nhập đầy đủ thông tin đăng ký vendor')
      return
    }

    try {
      setVendorRegistering(true)
      await vendorService.register(payload)
      setVendorSuccess('Đăng ký vendor thành công. Hệ thống sẽ xét duyệt sớm.')
      setVendorForm({
        storeName: '',
        slug: '',
        description: '',
        bankAccountDetails: {
          bankName: '',
          accountNumber: '',
          accountName: '',
        },
      })
      setSlugManuallyEdited(false)
      await loadVendorProfile()
    } catch (error) {
      setVendorError(getErrorMessage(error, 'Đăng ký vendor thất bại'))
    } finally {
      setVendorRegistering(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8">
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
              Thông tin hồ sơ sẽ được sử dụng để cá nhân hoá trải nghiệm mua sắm
              của bạn trên FreshMart.
            </p>
            <Button
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white font-semibold"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Lưu thay đổi
            </Button>
          </div>

          <section className="mt-8 border-t border-gray-100 pt-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {vendorProfile ? 'Cửa hàng của bạn' : 'Trở thành Vendor'}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {vendorProfile
                    ? 'Quản lý cửa hàng và sản phẩm của bạn'
                    : 'Gửi thông tin cửa hàng để bắt đầu bán hàng trên FreshMart'}
                </p>
              </div>
              {vendorProfile && (
                <span
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    vendorProfile.status === 'APPROVED' ||
                    vendorProfile.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : vendorProfile.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {vendorStatusLabel(vendorProfile.status)}
                </span>
              )}
            </div>

            {vendorChecking ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Đang kiểm tra trạng thái vendor...
              </div>
            ) : vendorProfile ? (
              <div className="space-y-4">
                {/* Vendor Info Card */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-lg bg-white border-2 border-emerald-100 flex items-center justify-center overflow-hidden">
                        {vendorProfile.logoUrl ? (
                          <img
                            src={vendorProfile.logoUrl}
                            alt={vendorProfile.storeName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-2xl font-bold">
                            {vendorProfile.storeName?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vendor Details */}
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-600">
                            Tên cửa hàng
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {vendorProfile.storeName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-600">
                            Slug
                          </p>
                          <p className="text-sm font-medium text-gray-700">
                            {vendorProfile.slug}
                          </p>
                        </div>

                        {vendorProfile.owner && (
                          <>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-600">
                                Chủ cửa hàng
                              </p>
                              <p className="text-sm text-gray-900">
                                {vendorProfile.owner.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-gray-600">
                                Email
                              </p>
                              <p className="text-sm text-gray-900">
                                {vendorProfile.owner.email}
                              </p>
                            </div>
                          </>
                        )}

                        {vendorProfile.description && (
                          <div className="sm:col-span-2">
                            <p className="text-xs uppercase tracking-wide text-gray-600">
                              Mô tả
                            </p>
                            <p className="text-sm text-gray-800 line-clamp-2">
                              {vendorProfile.description}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-600">
                            Tỷ lệ hoa hồng
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {vendorProfile.commissionRate}%
                          </p>
                        </div>
                      </div>

                      {/* Bank Details */}
                      {vendorProfile.bankAccountDetails && (
                        <div className="rounded-lg border border-emerald-100 bg-white p-3">
                          <p className="text-xs uppercase tracking-wide text-gray-600 mb-2">
                            Tài khoản ngân hàng
                          </p>
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="text-gray-600">Ngân hàng:</span>{' '}
                              <span className="font-medium text-gray-900">
                                {vendorProfile.bankAccountDetails.bankName}
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-600">
                                Tên tài khoản:
                              </span>{' '}
                              <span className="font-medium text-gray-900">
                                {vendorProfile.bankAccountDetails.accountName}
                              </span>
                            </p>
                            <p>
                              <span className="text-gray-600">
                                Số tài khoản:
                              </span>{' '}
                              <span className="font-medium text-gray-900 font-mono">
                                {vendorProfile.bankAccountDetails.accountNumber}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    type="button"
                    onClick={() => router.push('/vendor-dashboard')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold"
                  >
                    → Đi đến Bảng điều khiển
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    disabled
                  >
                    Chỉnh sửa hồ sơ (Sắp tới)
                  </Button>
                </div>
              </div>
            ) : (
              <form
                className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-5"
                onSubmit={handleVendorRegister}
              >
                <Input
                  name="storeName"
                  label="Tên cửa hàng"
                  placeholder="Ví dụ: FreshMart Vinhomes"
                  value={vendorForm.storeName}
                  onChange={handleVendorInputChange}
                  required
                />
                <Input
                  name="slug"
                  label="Slug cửa hàng"
                  placeholder="freshmart-vinhomes"
                  value={vendorForm.slug}
                  onChange={handleVendorInputChange}
                  required
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Mô tả ngắn
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={vendorForm.description}
                    onChange={handleVendorInputChange}
                    placeholder="Bạn bán gì, thời gian hoạt động, khu vực phục vụ..."
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2">
                  <h3 className="sm:col-span-2 text-sm font-semibold text-gray-900">
                    Thông tin tài khoản ngân hàng
                  </h3>
                  <Input
                    name="bank.bankName"
                    label="Tên ngân hàng"
                    placeholder="Vietcombank"
                    value={vendorForm.bankAccountDetails.bankName}
                    onChange={handleVendorInputChange}
                    required
                  />
                  <Input
                    name="bank.accountNumber"
                    label="Số tài khoản"
                    placeholder="Nhập số tài khoản"
                    value={vendorForm.bankAccountDetails.accountNumber}
                    onChange={handleVendorInputChange}
                    required
                  />
                  <div className="sm:col-span-2">
                    <Input
                      name="bank.accountName"
                      label="Tên chủ tài khoản"
                      placeholder="NGUYEN VAN A"
                      value={vendorForm.bankAccountDetails.accountName}
                      onChange={handleVendorInputChange}
                      required
                    />
                  </div>
                </div>

                {vendorError && (
                  <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {vendorError}
                  </p>
                )}

                {vendorSuccess && (
                  <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {vendorSuccess}
                  </p>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                    disabled={vendorRegistering}
                  >
                    {vendorRegistering
                      ? 'Đang gửi đăng ký...'
                      : 'Gửi đăng ký Vendor'}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
