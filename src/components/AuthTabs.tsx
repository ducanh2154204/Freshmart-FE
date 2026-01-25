'use client'

import React, { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

type TabType = 'login' | 'register'

export const AuthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('login')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', loginData)
    // Add login logic here
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Register:', registerData)
    // Add register logic here
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
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
          >
            Đăng nhập
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
              htmlFor="register-phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Số điện thoại
            </label>
            <Input
              id="register-phone"
              type="tel"
              placeholder="0987654321"
              value={registerData.phone}
              onChange={e =>
                setRegisterData({ ...registerData, phone: e.target.value })
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
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
          >
            Đăng ký
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
