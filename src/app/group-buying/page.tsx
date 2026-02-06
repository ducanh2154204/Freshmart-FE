'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GroupBuyingCard } from '@/components/GroupBuyingCard'
import { groupBuyingService } from '@/services/group-buying.service'
import { productService } from '@/services/product.service'
import type { GroupBuying } from '@/types/group-buying'
import type { Product } from '@/types/product'
import Link from 'next/link'

export default function GroupBuyingPage() {
  const [ongoingDeals, setOngoingDeals] = useState<GroupBuying[]>([])
  const [groupBuyingProducts, setGroupBuyingProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch active group buyings (separate try-catch để không ảnh hưởng đến products)
      // TODO: Uncomment khi BE đã có endpoint group buying
      try {
        const dealsResponse = await groupBuyingService.getActiveGroupBuyings({
          limit: 10,
        })
        const dealsData = dealsResponse as any

        // Debug log để xem response structure
        console.log('Group buying response:', dealsData)

        const deals =
          dealsData?.data?.data ?? dealsData?.data ?? dealsData ?? []

        // Kiểm tra nếu deals là array
        if (Array.isArray(deals) && deals.length > 0) {
          const mappedDeals = deals.map((deal: GroupBuying) => ({
            id: deal.id,
            productId: deal.productId || deal.product?.id || 0,
            quantity: deal.quantity || deal.targetQuantity || 1,
            image:
              deal.image || deal.product?.image || '/images/placeholder.jpg',
            title: deal.title || deal.product?.name || 'Sản phẩm',
            currentPrice: deal.currentPrice || 0,
            originalPrice: deal.originalPrice || deal.product?.price || 0,
            rating: deal.rating || 5,
            participants: deal.participants || deal.currentParticipants || 0,
            timeLeft: deal.timeLeft,
            deliveryInfo: deal.deliveryInfo,
          }))

          setOngoingDeals(mappedDeals)
        } else {
          console.log('No group buying deals found or invalid format')
        }
      } catch (err: any) {
        // Log chi tiết hơn để debug
        const errorInfo = {
          message: err?.message,
          status: err?.status,
          code: err?.code,
          name: err?.name,
          stack: err?.stack,
          toString: String(err),
          keys: err ? Object.keys(err) : [],
        }
        console.warn('Group buying API not available or error:', errorInfo)
        // Giữ default deals nếu API fail - không throw error để không block UI
      }

      // Fetch products for group buying (separate try-catch)
      try {
        const productsResponse = await productService.getProducts({
          limit: 6,
        })
        const productsData = productsResponse as any
        const products =
          productsData?.data?.data ?? productsData?.data ?? productsData ?? []

        if (Array.isArray(products) && products.length > 0) {
          const mappedProducts = products.slice(0, 6).map((p: Product) => ({
            id: p.id,
            name: p.name || p.title || '',
            image: p.image || '/images/placeholder.jpg',
            title: p.name || p.title || '',
            price: p.price,
            currentPrice: p.price,
            originalPrice: p.originalPrice || p.price,
          }))

          setGroupBuyingProducts(mappedProducts)
        }
      } catch (err: any) {
        console.error('Error fetching products:', {
          message: err?.message,
          status: err?.status,
          error: err,
        })
        // Giữ default products nếu API fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const displayDeals = ongoingDeals
  const displayProducts = groupBuyingProducts

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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md h-96 animate-pulse"
                />
              ))}
            </div>
          ) : displayDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
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
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Hiện tại chưa có nhóm mua chung nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Hãy là người đầu tiên tạo nhóm mua chung và nhận được giá tốt
                  nhất!
                </p>
                <Link
                  href="/group-buying/create"
                  className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tạo nhóm mua chung
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {displayDeals.map((deal, index) => (
                <GroupBuyingCard
                  key={deal.id || `deal-${index}`}
                  id={deal.id}
                  image={deal.image || ''}
                  title={deal.title || ''}
                  currentPrice={deal.currentPrice}
                  originalPrice={deal.originalPrice}
                  rating={deal.rating}
                  participants={deal.participants}
                  timeLeft={deal.timeLeft}
                  deliveryInfo={deal.deliveryInfo}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Group Buying Products */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-gray-800 text-2xl font-bold mb-6">
            Sản phẩm mua chung
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md h-48 animate-pulse"
                />
              ))}
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Chưa có sản phẩm
                </h3>
                <p className="text-sm text-gray-600">
                  Các sản phẩm mua chung sẽ xuất hiện tại đây
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {displayProducts.map((product, index) => (
                <GroupBuyingCard
                  key={product.id || `product-${index}`}
                  id={product.id}
                  image={product.image}
                  title={product.title || product.name}
                  currentPrice={product.price}
                  originalPrice={product.originalPrice || product.price}
                  size="small"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
