'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { AddProductModal } from '@/components/AddProductModal'
import { EditProductModal } from '@/components/EditProductModal'
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
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null)
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false)
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false)
  const [selectedEditProduct, setSelectedEditProduct] =
    useState<VendorProduct | null>(null)

  const loadProducts = async () => {
    try {
      const res = await vendorService.getVendorProducts({ page: 1, limit: 20 })
      const productData = res as any
      const prodList = Array.isArray(productData)
        ? productData
        : productData?.data || []
      setProducts(prodList)
    } catch (err) {
      console.error('Error loading products:', err)
    }
  }

  const handleAddProductSuccess = () => {
    // Reload products after successful creation
    loadProducts()
  }

  const handleEditClick = (product: VendorProduct) => {
    setSelectedEditProduct(product)
    setIsEditProductModalOpen(true)
    setActiveMenuId(null)
  }

  const handleEditProductSuccess = () => {
    // Reload products after successful update
    loadProducts()
  }

  const handleDeleteProduct = async (productId: string | number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
      return
    }

    try {
      await vendorService.deleteProduct(productId)
      toast.success('Xóa sản phẩm thành công!')
      loadProducts()
      setActiveMenuId(null)
    } catch (err) {
      const apiError = err as Partial<ApiError> & { details?: any }
      const message =
        (typeof apiError?.message === 'string' && apiError.message) ||
        (typeof apiError?.details?.message === 'string' &&
          apiError.details.message) ||
        'Không thể xóa sản phẩm'
      toast.error(message)
    }
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
          const apiError = err as Partial<ApiError> & { details?: any }
          const message =
            (typeof apiError?.message === 'string' && apiError.message) ||
            (typeof apiError?.details?.message === 'string' &&
              apiError.details.message) ||
            'Không thể tải bảng điều khiển vendor'
          toast.error(message)
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
              <Button
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                + Thêm sản phẩm
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">Chưa có sản phẩm nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Product image */}
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-28 h-28 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    {/* Product info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-lg font-bold text-green-600">
                            {Number(product.price || 0).toLocaleString('vi-VN')}{' '}
                            đ
                          </span>
                          <div className="flex items-center gap-2">
                            {product.stock !== undefined && (
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                Còn: {product.stock}
                              </span>
                            )}
                            {/* Menu button on same line as stock */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveMenuId(
                                    activeMenuId === product.id
                                      ? null
                                      : product.id
                                  )
                                }
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium whitespace-nowrap"
                                title="Chỉnh sửa"
                              >
                                Chỉnh sửa
                              </button>
                              {activeMenuId === product.id && (
                                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-max">
                                  <button
                                    onClick={() => handleEditClick(product)}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                  >
                                    ✏️ Sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteProduct(product.id)
                                    }
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200"
                                  >
                                    🗑️ Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
                              {Number(
                                item.price * item.quantity
                              ).toLocaleString('vi-VN')}{' '}
                              đ
                            </span>
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                      <p className="font-bold text-gray-900">
                        Tổng:{' '}
                        {Number(order.totalAmount || 0).toLocaleString('vi-VN')}{' '}
                        đ
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

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSuccess={handleAddProductSuccess}
      />

      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        onSuccess={handleEditProductSuccess}
        product={selectedEditProduct}
      />
    </div>
  )
}
