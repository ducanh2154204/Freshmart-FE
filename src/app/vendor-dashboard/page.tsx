'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import {
  vendorService,
  type VendorProfile,
  type VendorProduct,
  type VendorOrder,
} from '@/services/vendor.service'
import type { ApiError } from '@/types/api'

export default function VendorDashboardPage() {
  const router = useRouter()
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [orders, setOrders] = useState<VendorOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  const getErrorMessage = (err: unknown, fallback: string) => {
    const e = err as Partial<ApiError> & { details?: any }
    return (
      (typeof e?.message === 'string' && e.message) ||
      (typeof e?.details?.message === 'string' && e.details.message) ||
      fallback
    )
  }

  useEffect(() => {
    const loadVendorDashboard = async () => {
      if (typeof window === 'undefined') return

      const token = window.localStorage.getItem('accessToken')
      if (!token) {
        router.push('/auth')
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Check vendor profile
        const vendor = await vendorService.getMyVendor()

        if (!vendor) {
          // No vendor profile, redirect to profile page
          router.push('/profile')
          return
        }

        setVendorProfile(vendor)

        // Load products and orders in parallel
        const [productsRes, ordersRes] = await Promise.allSettled([
          vendorService.getVendorProducts({ page: 1, limit: 20 }),
          vendorService.getVendorOrders({ page: 1, limit: 20 }),
        ])

        if (productsRes.status === 'fulfilled' && productsRes.value) {
          const productData = productsRes.value as any
          const prodList = Array.isArray(productData)
            ? productData
            : productData?.data || []
          setProducts(prodList)
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value) {
          const orderData = ordersRes.value as any
          const orderList = Array.isArray(orderData)
            ? orderData
            : orderData?.data?.data || orderData?.data || []
          setOrders(orderList)
        }
      } catch (err) {
        const status = (err as ApiError)?.status
        if (status === 404) {
          // Vendor not found, redirect to profile
          router.push('/profile')
        } else {
          setError(getErrorMessage(err, 'Không thể tải bảng điều khiển vendor'))
        }
      } finally {
        setLoading(false)
      }
    }

    loadVendorDashboard()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Bạn cần đăng ký vendor để truy cập bảng điều khiển
            </p>
            <Button
              onClick={() => router.push('/profile')}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Đăng ký Vendor
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bảng điều khiển cửa hàng
          </h1>
          <p className="text-gray-600">
            Cửa hàng:{' '}
            <span className="font-semibold">{vendorProfile.storeName}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Sản phẩm ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Đơn hàng ({orders.length})
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Quản lý sản phẩm
              </h2>
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                + Thêm sản phẩm
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">Chưa có sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        ${product.price?.toFixed(2)}
                      </span>
                      {product.stock !== undefined && (
                        <span className="text-sm text-gray-600">
                          Còn: {product.stock}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-1"
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1"
                      >
                        Xóa
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quản lý đơn hàng
            </h2>

            {orders.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Đơn hàng #{order.orderId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                'vi-VN'
                              )
                            : '---'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-3 space-y-1 text-sm">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-gray-700">
                            {item.productName} x{item.quantity} =
                            <span className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <p className="font-bold text-gray-900">
                        Tổng: ${order.totalAmount?.toFixed(2)}
                      </p>
                      {order.status === 'pending' && (
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3"
                        >
                          Xác nhận đơn
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
