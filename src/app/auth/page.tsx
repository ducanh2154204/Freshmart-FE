import Link from 'next/link'
import { AuthTabs } from '@/components/AuthTabs'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Logo / Back to Home */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Quay lại trang chủ</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 py-8">
          {/* Left Side - Branding */}
          <div className="w-full lg:w-1/2 max-w-lg">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <img
                  src="/images/logoFM.jpg"
                  alt="FreshMart"
                  className="h-20 w-auto object-contain rounded-2xl shadow-lg"
                />
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Mua Chung Mỗi Ngày,
                <br />
                <span className="text-green-600">Giá Rẻ Bất Ngờ</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                Tham gia FreshMart để nhận ưu đãi hấp dẫn và mua sắm thực phẩm
                tươi ngon với giá tốt nhất
              </p>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">
                      Sản phẩm tươi ngon
                    </h3>
                    <p className="text-gray-600">
                      Đảm bảo chất lượng, nguồn gốc rõ ràng
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">
                      Giá cả cạnh tranh
                    </h3>
                    <p className="text-gray-600">
                      Giảm giá đến 30% cho nhiều sản phẩm
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">
                      Giao hàng nhanh chóng
                    </h3>
                    <p className="text-gray-600">
                      Miễn phí vận chuyển cho đơn hàng từ 300.000đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <AuthTabs />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
