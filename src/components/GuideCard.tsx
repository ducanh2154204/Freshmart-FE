import React from 'react'
import Link from 'next/link'

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
}

export const GuideCard: React.FC = () => {
  const features: FeatureItem[] = [
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      title: 'Mua chung giá tốt',
      description:
        'Càng nhiều người, giá càng rẻ. Tiết kiệm đến 30% so với mua lẻ',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
      ),
      title: 'Hàng chất lượng',
      description: 'Được lựa chọn kỹ lưỡng từ các nhà cung cấp đáng tin cậy',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v-2h8v2zm0-3h-8V9h8v2zm0-3h-8V6h8v2z" />
        </svg>
      ),
      title: 'Chat & thảo luận',
      description:
        'Trao đổi trực tiếp với nhóm mua chung về sản phẩm và ưu đãi',
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-4 flex justify-center">
              <img
                src="/images/logoFM.jpg"
                alt="FreshMart Logo"
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Mua Chung Thông Minh
            </h2>
            <p className="text-lg text-gray-600">
              Nền tảng mua chung thực phẩm tươi sống, kết nối người tiêu dùng
              với nhà cung cấp uy tín
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow text-center"
              >
                <div className="inline-flex bg-green-100 rounded-full p-3 mb-4 text-green-600">
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 font-medium">Bắt đầu ngay</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Two-Column Guide Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Buyer Guide */}
            <div className="bg-white border-2 border-green-100 rounded-lg p-8 hover:border-green-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <h3 className="text-xl font-bold text-gray-900">Người mua</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Tìm hiểu 5 bước đơn giản để bắt đầu mua chung tại FreshMart và
                nhận những ưu đãi tốt nhất
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">1.</span>
                  <span>Đăng ký tài khoản</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">2.</span>
                  <span>Tìm deal mua chung</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">3.</span>
                  <span>Tham gia deal</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">4.</span>
                  <span>Thanh toán</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold">5.</span>
                  <span>Chat & thảo luận</span>
                </div>
              </div>
              <Link
                href="/about?tab=buyer"
                className="inline-block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Xem chi tiết hướng dẫn →
              </Link>
            </div>

            {/* Supplier Guide */}
            <div className="bg-white border-2 border-blue-100 rounded-lg p-8 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  🏪
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Nhà cung cấp
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                Theo dõi 5 bước để đăng ký và quản lý các deal mua chung tại
                FreshMart
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Đăng ký & được cấp quyền</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Truy cập Dashboard</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Tạo deal mua chung</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Quản lý deal</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>Tăng trưởng</span>
                </div>
              </div>
              <Link
                href="/about?tab=supplier"
                className="inline-block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Xem chi tiết hướng dẫn →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
