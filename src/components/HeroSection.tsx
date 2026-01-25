import React from 'react'
import { Button } from './ui/Button'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-orange-50 to-green-50 overflow-hidden">
      <div className="container mx-auto px-4 py-16">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Mua Chung Mỗi Ngày, Giá Rẻ Bất Ngờ
          </h1>
          <p className="text-xl text-white mb-8 drop-shadow">
            Giảm giá đến 30% Phi Vận Chuyển
          </p>
          <Button
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg"
          >
            Mua ngay
          </Button>
        </div>

        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-90"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/70 to-green-600/50"></div>
        </div>
      </div>
    </section>
  )
}
