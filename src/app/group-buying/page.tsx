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
              deal.image ||
              deal.product?.image ||
              'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
            title: deal.title || deal.product?.name || 'Sản phẩm',
            currentPrice: deal.currentPrice || deal.discountPrice || 0,
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
            image: p.image || '/images/placeholder.jpg',
            title: p.name || p.title || '',
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {displayDeals.map((deal, index) => (
                <GroupBuyingCard key={deal.id || `deal-${index}`} {...deal} />
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
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {displayProducts.map((product, index) => (
                <GroupBuyingCard
                  key={product.id || `product-${index}`}
                  {...product}
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
