import React from 'react'
import Link from 'next/link'
import { Button } from './ui/Button'

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FreshMart</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, danh mục..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="text-green-600 font-medium hover:text-green-700"
            >
              Trang chủ
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              Giới thiệu
            </Link>
            <Link href="/forum" className="text-gray-600 hover:text-gray-900">
              Forum
            </Link>
            <Link
              href="/group-buying"
              className="text-gray-600 hover:text-gray-900"
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

            {/* Login Button */}
            <Link href="/auth">
              <Button
                variant="primary"
                size="sm"
                className="bg-green-500 hover:bg-green-600"
              >
                Đăng nhập
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
