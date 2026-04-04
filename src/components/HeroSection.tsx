import React from 'react'
import Link from 'next/link'
import { Button } from './ui/Button'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm font-semibold text-green-700">
                Giá sốc - Mua chung
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Mua Chung Thực Phẩm Tươi Sống, Kết Nối Người Dùng
            </h1>

            <p className="text-xl text-gray-600 mb-2 leading-relaxed">
              Nên tăng mua chung thực phẩm tươi sống, kết nối người tiêu dùng
              với nhà cung cấp uy tín
            </p>

            <p className="text-lg text-green-600 font-semibold mb-8">
              💰 Tiết kiệm chi phí nhờ sức mạnh của công đồng!
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/group-buying">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg"
                >
                  ► Mua chung ngay
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold shadow"
                >
                  📖 Hướng dẫn sử dụng
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 aspect-square flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full opacity-50 -mr-8 -mt-8"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-200 rounded-full opacity-50 -ml-12 -mb-12"></div>

                {/* Illustration */}
                <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">
                    Mua Chung Thông Minh
                  </h3>
                  <p className="text-gray-700 text-sm max-w-xs">
                    Cùng cộng đồng, cùng tiết kiệm, cùng phát triển
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
