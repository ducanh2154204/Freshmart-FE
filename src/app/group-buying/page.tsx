import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GroupBuyingCard } from '@/components/GroupBuyingCard'
import Link from 'next/link'

export default function GroupBuyingPage() {
  const ongoingDeals = [
    {
      image:
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      title: 'Combo 5kg gạo ST25 cao cấp',
      currentPrice: 164000,
      originalPrice: 240000,
      rating: 5,
      participants: 45,
      timeLeft: 'Còn 2 ngày 15 giờ',
      deliveryInfo: 'Giao hàng miễn phí trong nội thành TP.HCM, Hà Nội',
    },
    {
      image:
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
      title: 'Hộp sữa tươi tiệt trùng Vinamilk 100% (1 lít x 12 hộp)',
      currentPrice: 360000,
      originalPrice: 420000,
      rating: 5,
      participants: 89,
      timeLeft: 'Còn 1 ngày 8 giờ',
      deliveryInfo: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 300.000đ',
    },
    {
      image:
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
      title: 'Combo trái cây tươi ngon (Nho + Kiwi + Xoài)',
      currentPrice: 245000,
      originalPrice: 350000,
      rating: 5,
      participants: 62,
      timeLeft: 'Còn 3 ngày 5 giờ',
      deliveryInfo: 'Giao hàng nhanh trong 24h tại khu vực nội thành',
    },
  ]

  const groupBuyingProducts = [
    {
      image:
        'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
      title: 'Thùng 30 trứng gà omega 3',
      currentPrice: 120000,
      originalPrice: 180000,
    },
    {
      image:
        'https://images.unsplash.com/photo-1574856344991-aaa31b6f4ce3?w=400&q=80',
      title: 'Combo rau củ quả hữu cơ',
      currentPrice: 180000,
      originalPrice: 250000,
    },
    {
      image:
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
      title: 'Thùng thịt heo sạch 5kg',
      currentPrice: 450000,
      originalPrice: 580000,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-600 via-yellow-500 to-orange-500 py-12 px-4 rounded-2xl mx-4 mt-4">
        <div className="container mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-white text-sm mb-4">
              <span>✨</span>
              <span>Tiết kiệm đến 30%</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Mua chung - Giá sốc
            </h1>
            <p className="text-base text-white mb-6">
              Tập hợp bạn bè, hàng xóm để mua với giá tốt nhất. Càng nhiều người
              tham gia, giá càng rẻ!
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Mua cùng nhau
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Giá tốt hơn
              </button>
              <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Giao hàng nhanh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-gray-900 text-3xl font-bold text-center mb-12">
            Cách thức hoạt động
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-700 text-white text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Chọn sản phẩm</h3>
              <p className="text-sm text-gray-600">
                Tạo hoặc tham gia nhóm mua chung cho sản phẩm bạn thích
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-700 text-white text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Mời bạn bè</h3>
              <p className="text-sm text-gray-600">
                Chia sẻ link với bạn bè và hàng xóm để đủ số lượng tối thiểu
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-700 text-white text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Nhận hàng</h3>
              <p className="text-sm text-gray-600">
                Khi đủ người, đơn hàng sẽ được xử lý và giao đến tận nơi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Deals */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-gray-900 text-2xl font-bold mb-1">
                Đang diễn ra
              </h2>
              <p className="text-sm text-gray-600">
                Tham gia ngay để nhận ưu đãi
              </p>
            </div>
            <Link
              href="/group-buying/create"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tạo nhóm mới
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {ongoingDeals.map((deal, index) => (
              <GroupBuyingCard key={index} {...deal} />
            ))}
          </div>
        </div>
      </section>

      {/* Group Buying Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-gray-800 text-2xl font-bold mb-6">
            Sản phẩm mua chung
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {groupBuyingProducts.map((product, index) => (
              <GroupBuyingCard key={index} {...product} size="small" />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
