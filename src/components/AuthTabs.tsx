'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { authService } from '@/services/auth.service'
import { userService } from '@/services/user.service'
import type { ApiError } from '@/types/api'

type TabType = 'login' | 'register'

export const AuthTabs: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loginLoading, setLoginLoading] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  const extractToken = (response: unknown): string | null => {
    const r = response as any
    return (
      r?.data?.accessToken ??
      r?.data?.token ??
      r?.accessToken ??
      r?.token ??
      null
    )
  }

  const extractUser = (
    response: unknown
  ): { fullName?: string; email?: string } | null => {
    const r = response as any
    const user =
      r?.data?.user ?? r?.data?.account ?? r?.user ?? r?.account ?? null

    if (!user || typeof user !== 'object') return null
    return {
      fullName:
        (user.fullName as string | undefined) ||
        (user.name as string | undefined),
      email: user.email as string | undefined,
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    try {
      const response = await authService.login(loginData)
      const token = extractToken(response)
      const user = extractUser(response)
      if (!token) {
        toast.error('Đăng nhập thành công nhưng không nhận được accessToken.')
        return
      }

      window.localStorage.setItem('accessToken', token)
      if (user) {
        window.localStorage.setItem('user', JSON.stringify(user))
      }

      // Call API me để lấy đầy đủ thông tin user
      try {
        const meResponse = await userService.getMe()
        const fullUserData = meResponse.data ?? meResponse
        window.localStorage.setItem('user', JSON.stringify(fullUserData))
        // Lưu avatarUrl riêng nếu có
        if (fullUserData?.avatarUrl) {
          window.localStorage.setItem('avatarUrl', fullUserData.avatarUrl)
        }
      } catch (meError) {
        console.warn('Failed to fetch user profile:', meError)
        // Vẫn tiếp tục với basic user info từ login response
      }

      window.dispatchEvent(new Event('auth:changed'))
      toast.success('Đăng nhập thành công!')
      router.push('/')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.')
      return
    }

    setRegisterLoading(true)

    try {
      const response = await authService.register(registerData)
      const token = extractToken(response)
      const user = extractUser(response)
      if (token) {
        window.localStorage.setItem('accessToken', token)
        if (user) {
          window.localStorage.setItem('user', JSON.stringify(user))
        }

        // Call API me để lấy đầy đủ thông tin user
        try {
          const meResponse = await userService.getMe()
          const fullUserData = meResponse.data ?? meResponse
          window.localStorage.setItem('user', JSON.stringify(fullUserData))
          // Lưu avatarUrl riêng nếu có
          if (fullUserData?.avatarUrl) {
            window.localStorage.setItem('avatarUrl', fullUserData.avatarUrl)
          }
        } catch (meError) {
          console.warn('Failed to fetch user profile:', meError)
          // Vẫn tiếp tục với basic user info từ register response
        }

        window.dispatchEvent(new Event('auth:changed'))
        toast.success('Đăng ký thành công!')
        router.push('/')
        return
      }

      // Nếu BE không trả token khi đăng ký, chuyển qua tab login
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      setActiveTab('login')
    } catch (error) {
      const apiError = error as ApiError
      toast.error(apiError?.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setRegisterLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-3 text-center font-semibold transition-colors relative ${
            activeTab === 'login'
              ? 'text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đăng nhập
          {activeTab === 'login' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex-1 py-3 text-center font-semibold transition-colors relative ${
            activeTab === 'register'
              ? 'text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đăng ký
          {activeTab === 'register' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
          )}
        </button>
      </div>

      {/* Login Form */}
      {activeTab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="example@email.com"
              value={loginData.email}
              onChange={e =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={e =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              required
              className="w-full"
              showPasswordToggle
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <a
              href="#"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Quên mật khẩu?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loginLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3"
          >
            {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Đăng ký ngay
            </button>
          </div>
        </form>
      )}

      {/* Register Form */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="register-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Họ và tên
            </label>
            <Input
              id="register-name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={registerData.fullName}
              onChange={e =>
                setRegisterData({ ...registerData, fullName: e.target.value })
              }
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <Input
              id="register-email"
              type="email"
              placeholder="example@email.com"
              value={registerData.email}
              onChange={e =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <Input
              id="register-password"
              type="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={e =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
              required
              className="w-full"
              showPasswordToggle
            />
          </div>

          <div>
            <label
              htmlFor="register-confirm"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Xác nhận mật khẩu
            </label>
            <Input
              id="register-confirm"
              type="password"
              placeholder="••••••••"
              value={registerData.confirmPassword}
              onChange={e =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
              required
              className="w-full"
              showPasswordToggle
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
            />
            <label className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a
                href="#"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Chính sách bảo mật
              </a>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={registerLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3"
          >
            {registerLoading ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>

          <div className="mt-6 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="text-green-600 hover:text-green-700 font-semibold"
            >
              Đăng nhập ngay
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
