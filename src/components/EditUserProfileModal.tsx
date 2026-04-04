'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { userService, type UserProfile } from '@/services/user.service'
import type { ApiError } from '@/types/api'

interface EditUserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userProfile: UserProfile | null
}

export function EditUserProfileModal({
  isOpen,
  onClose,
  onSuccess,
  userProfile,
}: EditUserProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        password: '',
      })
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }, [userProfile, isOpen])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)

    const reader = new FileReader()
    reader.onload = e => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Tên không được để trống')
      return
    }
    if (!formData.email.trim()) {
      toast.error('Email không được để trống')
      return
    }

    try {
      setLoading(true)

      // Build FormData if avatar is selected
      if (avatarFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name)
        formDataToSend.append('email', formData.email)
        if (formData.password) {
          formDataToSend.append('password', formData.password)
        }
        formDataToSend.append('avatar', avatarFile)

        await userService.updateMe(formDataToSend)
      } else {
        // No avatar, send JSON
        const payload: any = {
          name: formData.name,
          email: formData.email,
        }
        if (formData.password) {
          payload.password = formData.password
        }

        await userService.updateMe(payload)
      }

      toast.success('Cập nhật hồ sơ thành công!')
      onSuccess()
      onClose()
    } catch (err) {
      const apiError = err as Partial<ApiError> & { details?: any }
      const message =
        (typeof apiError?.message === 'string' && apiError.message) ||
        (typeof apiError?.details?.message === 'string' &&
          apiError.details.message) ||
        'Không thể cập nhật hồ sơ'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-xl border border-gray-100 p-6 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Chỉnh sửa hồ sơ
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            label="Tên"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên của bạn"
            required
          />

          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Nhập email"
            required
          />

          {/* Password */}
          <Input
            label="Mật khẩu mới (để trống nếu không đổi)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            showPasswordToggle
          />

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>

            {/* Avatar Preview */}
            {avatarPreview && (
              <div className="mb-3">
                <div className="relative inline-block">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-600 mt-2">Chọn ảnh để cập nhật</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
