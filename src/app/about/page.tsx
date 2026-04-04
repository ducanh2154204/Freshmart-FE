'use client'

import React, { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

type GuideType = 'buyer' | 'supplier'

interface GuideStep {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}

const buyerSteps: GuideStep[] = [
  {
    number: 1,
    title: 'Đăng ký tài khoản',
    description:
      'Truy cập trang Đăng nhập, tạo tài khoản với email và password. Sau khi đăng ký, bạn có thể sử dụng tất cả tính năng và mua chung được ngay lập tức.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Tìm deal mua chung',
    description:
      'Vào trang Mua chung để xem các deal đang mở. Mỗi deal có thông tin về giá gốc, giá nhóm, số người cần tham gia và thời gian còn lại.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 3L5 6.99h3V14h2V9.99h3L9 3zm7 14.01V10h-2v8.01H11L15 23l4-4.99h-3z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Tham gia deal',
    description:
      'Nhấn "Tham gia ngay" để tham gia deal mua chung. Khi đủ số người tham gia, deal sẽ được kích hoạt và bạn sẽ nhận được thông báo.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Thanh toán',
    description:
      'Sau khi deal được kích hoạt, bạn sẽ tiến hành thanh toán với giá ưu đãi nhóm. Tiết kiệm đến 30% so với mua lẻ!',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 8h-3V4H3c-1.11 0-1.99.9-1.99 2L1 18c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-8h2v-2zm-1 2h-2V4h2v6zM3 6h10v10H3V6z" />
      </svg>
    ),
  },
  {
    number: 5,
    title: 'Chat & thảo luận',
    description:
      'Sử dụng nhóm chat để trò chuyện với người mua khác và nhà cung cấp về sản phẩm, hoặc nhận phần hỗ trợ từ cộng đồng mua chung.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12h-8v-2h8v2zm0-3h-8V9h8v2zm0-3h-8V6h8v2z" />
      </svg>
    ),
  },
]

const supplierSteps: GuideStep[] = [
  {
    number: 1,
    title: 'Đăng ký & được cấp quyền',
    description:
      'Đăng ký tài khoản thương nhân, sau đó liên hệ quản trị viên để được cấp quyền nhà cung cấp (supplier).',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Truy cập Dashboard',
    description:
      'Sau khi được cấp quyền supplier, vào menu người dùng → Nhà cung cấp để mở bảng điều khiển quản lý của bạn.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Tạo deal mua chung',
    description:
      'Nhấn "Tạo deal mới", nhập thông tin sản phẩm: tên, giá gốc, giá nhóm, số người cần tham gia, thời gian, hình ảnh.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Quản lý deal',
    description:
      'Theo dõi số người tham gia, trang thái deal ở dashboard của bạn. Quản lý các hàng tự dashboard và đảm bảo giao hàng đúng hạn.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    number: 5,
    title: 'Tăng trưởng',
    description:
      'Tận dụng nhóm chat và công đồng để quảng bá sản phẩm, nội dung và cải thiện doanh số bán hàng của bạn.',
    icon: (
      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 6l2.29 2.29-4.29 4.29 4 6-6-4-6 4 4-6-4.29-4.29L8 6h8zm0-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
]

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<GuideType>('buyer')

  const steps = activeTab === 'buyer' ? buyerSteps : supplierSteps
  const tabTitle =
    activeTab === 'buyer'
      ? 'Hướng dẫn cho người mua'
      : 'Hướng dẫn cho nhà cung cấp'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-green-500 to-green-600 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="inline-flex bg-white rounded-full p-4 mb-4">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Hướng dẫn sử dụng FreshMart
              </h1>
              <p className="text-lg text-green-100 max-w-2xl mx-auto">
                Tìm hiểu chi tiết cách sử dụng FreshMart để mua chung với giá
                tốt nhất hoặc quản lý cửa hàng của bạn
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                📌 Về FreshMart
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <span className="font-semibold text-green-600">
                    FreshMart
                  </span>{' '}
                  là một nền tảng mua chung thực phẩm tươi sống, tạo điều kiện
                  kết nối những người tiêu dùng thông minh với các nhà cung cấp
                  uy tín.
                </p>
                <p>
                  Chúng tôi tin rằng khi mua chung, bạn không chỉ tiết kiệm chi
                  phí mà còn được hưởng lợi từ sức mạnh của cộng đồng. Mỗi deal
                  trên FreshMart là một cơ hội để bạn:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tiết kiệm đến 30% so với giá mua lẻ</li>
                  <li>Lựa chọn từ các sản phẩm chất lượng cao</li>
                  <li>Trao đổi với cộng đồng người mua chung</li>
                  <li>Hỗ trợ các nhà cung cấp địa phương</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-6 py-6">
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-6 py-3 font-medium rounded-lg transition-all ${
                  activeTab === 'buyer'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👤 Hướng dẫn người mua
              </button>
              <button
                onClick={() => setActiveTab('supplier')}
                className={`px-6 py-3 font-medium rounded-lg transition-all ${
                  activeTab === 'supplier'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏪 Hướng dẫn nhà cung cấp
              </button>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
              {tabTitle}
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              {activeTab === 'buyer'
                ? 'Theo dõi 5 bước đơn giản để bắt đầu mua chung tại FreshMart và nhận những ưu đãi tốt nhất'
                : 'Theo dõi 5 bước để đăng ký và quản lý các deal mua chung tại FreshMart'}
            </p>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {steps.map(step => (
                <div
                  key={step.number}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6 border-t-4 border-green-500"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600">
                        {step.icon}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-2xl font-bold text-green-600 bg-green-50 w-8 h-8 flex items-center justify-center rounded-full">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 text-center border border-green-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Sẵn sàng bắt đầu?
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'buyer'
                  ? 'Tham gia cộng đồng FreshMart ngay hôm nay và bắt đầu tiết kiệm'
                  : 'Đăng ký nhà cung cấp và quản lý deal mua chung của bạn'}
              </p>
              <a
                href={activeTab === 'buyer' ? '/group-buying' : '/profile'}
                className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                {activeTab === 'buyer'
                  ? 'Khám phá mua chung →'
                  : 'Đăng ký vendor →'}
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              ❓ Câu hỏi thường gặp
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {activeTab === 'buyer' ? (
                <>
                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Có phí gì khi tham gia mua chung không?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Không có phí tham gia. Bạn chỉ cần thanh toán tiền hàng
                      theo giá nhóm đã công bố. Chúng tôi không lấy hoa hồng từ
                      khách hàng.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Nếu deal không đủ người tham gia thì sao?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Nếu khi hết thời gian deal mà chưa đủ số người, nhà cung
                      cấp sẽ thông báo hủy deal. Bạn sẽ được hoàn 100% tiền hoặc
                      chọn để giữ trong tài khoản.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Làm sao để theo dõi độ tiến của deal?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Sau khi tham gia, bạn sẽ thấy trang deal của chúng tôi với
                      số người tham gia hiện tại, thời gian còn lại và thông tin
                      chi tiết. Bạn cũng có thể nhắn tin trong nhóm chat.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Sản phẩm có đảm bảo chất lượng không?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Tất cả sản phẩm trên FreshMart được lựa chọn từ các nhà
                      cung cấp uy tín. Chúng tôi có quy trình kiểm duyệt nghiêm
                      ngặt để đảm bảo chất lượng cao nhất cho khách hàng.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Giao hàng như thế nào và mất bao lâu?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Sau khi deal được kích hoạt và thanh toán, nhà cung cấp sẽ
                      giao hàng trong khoảng thời gian thỏa thuận (thường là 3-5
                      ngày). Bạn sẽ nhận được thông báo cập nhật trạng thái giao
                      hàng.
                    </p>
                  </details>
                </>
              ) : (
                <>
                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Có phí gì khi tạo deal trên FreshMart không?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Có một khoảng hoa hồng nhỏ từ doanh số bán, cụ thể nhà
                      cung cấp sẽ được thông báo rõ trước khi tạo deal. Không có
                      phí ẩn hoặc chi phí lõng khằm khác.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Tôi có thể quản lý nhiều deal cùng lúc không?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Có, bạn có thể tạo và quản lý nhiều deal cùng lúc từ
                      dashboard. Mỗi deal có thể được theo dõi độc lập và bạn có
                      thể dễ dàng cập nhật thông tin.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Làm sao để xử lý khi có sai sót trong đơn hàng?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Bạn có thể liên hệ trực tiếp với nhóm hỗ trợ khách hàng
                      của chúng tôi qua chat hoặc email. Chúng tôi sẽ hỗ trợ
                      giải quyết sai sót nhanh chóng.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Làm sao để tăng doanh số bán hàng?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Bạn có thể sử dụng nhóm chat để quảng bá sản phẩm, chia sẻ
                      ưu đãi đặc biệt và tương tác với cộng đồng. Cung cấp các
                      deal hấp dẫn với giá cạnh tranh sẽ giúp tăng lượng người
                      tham gia.
                    </p>
                  </details>

                  <details className="bg-gray-50 rounded-lg p-4 cursor-pointer group">
                    <summary className="font-semibold text-gray-900 flex items-center justify-between">
                      Có hỗ trợ nào cho vendor mới không?
                      <span className="group-open:rotate-180 transition-transform">
                        ⧗
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 text-sm">
                      Có, chúng tôi cung cấp hỗ trợ đầy đủ cho vendor mới, bao
                      gồm hướng dẫn tạo deal, công thức tính giá, và các chiến
                      lược tiếp thị. Liên hệ với đội hỗ trợ để tìm hiểu thêm.
                    </p>
                  </details>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📞 Cần hỗ trợ?
              </h2>
              <p className="text-gray-600 mb-8">
                Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với đội hỗ
                trợ của chúng tôi
              </p>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold text-gray-900">Email:</span>{' '}
                  <a
                    href="mailto:support@freshmart.com"
                    className="text-green-600 hover:text-green-700"
                  >
                    support@freshmart.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold text-gray-900">
                    Trò chuyện:
                  </span>{' '}
                  <span className="text-gray-600">
                    Sử dụng chat trên trang web để nói chuyện với đội hỗ trợ
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
