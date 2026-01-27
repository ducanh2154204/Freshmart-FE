import React from 'react'
import { Button } from './ui/Button'

export const GroupBuyingBanner: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-green-500 via-yellow-500 to-orange-500">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Mua chung - Giá sốc
          </h2>
          <p className="text-lg text-white mb-6">
            Cùng bạn bè, hàng xóm mua chung để nhận lại đặt đặc biệt. Càng nhiều
            người, giá càng rẻ!
          </p>
          <Button
            size="lg"
            className="bg-white text-green-500 hover:bg-gray-600 font-semibold"
          >
            Khám phá ngay
          </Button>
        </div>
      </div>
    </section>
  )
}
