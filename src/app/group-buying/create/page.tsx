'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function CreateGroupPage() {
  const [quantity, setQuantity] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [purpose, setPurpose] = useState('')
  const [maxPeople, setMaxPeople] = useState('')
  const [duration, setDuration] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const products = [
    {
      id: 1,
      image:
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      title: 'Combo 5kg gạo ST25 cao cấp',
      price: 164000,
    },
    {
      id: 2,
      image:
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
      title: 'Hộp sữa tươi Vinamilk',
      price: 360000,
    },
    {
      id: 3,
      image:
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80',
      title: 'Combo trái cây tươi ngon',
      price: 245000,
    },
    {
      id: 4,
      image:
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
      title: 'Thùng thịt heo sạch 5kg',
      price: 450000,
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ'
  }

  const selectedProductData = products.find(p => p.id === selectedProduct)
  const subtotal = selectedProductData
    ? selectedProductData.price * quantity
    : 0
  const shipping = 20000
  const discount = 0
  const total = subtotal + shipping - discount

  const handleCreateGroup = () => {
    // Handle create group logic
    console.log('Creating group...')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <a href="/group-buying" className="hover:text-green-600">
              ← Quay lại
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tạo nhóm mua chung
          </h1>
          <p className="text-gray-600">
            Tìm và chọn sản phẩm. Theo dõi đơn hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Chọn sản phẩm
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`border-2 rounded-lg p-3 transition-all ${
                      selectedProduct === product.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                      {product.title}
                    </h3>
                    <p className="text-sm font-semibold text-green-600">
                      {formatPrice(product.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Thông tin nhóm
                </h2>
              </div>

              <div className="space-y-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng sản phẩm
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-16 h-8 text-center border border-gray-300 rounded text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">Sản phẩm</span>
                  </div>
                </div>

                {/* Max People */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số người tối đa trong nhóm
                  </label>
                  <select
                    value={maxPeople}
                    onChange={e => setMaxPeople(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="">-- Chọn số người --</option>
                    <option value="5">5 người</option>
                    <option value="10">10 người</option>
                    <option value="20">20 người</option>
                    <option value="50">50 người</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian
                  </label>
                  <select
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  >
                    <option value="">-- Chọn thời gian --</option>
                    <option value="3">3 tiếng</option>
                    <option value="6">6 tiếng</option>
                    <option value="9">9 tiếng</option>
                    <option value="12">12 tiếng</option>
                  </select>
                </div>

                {/* Recipient Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên giao hàng
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="Nhập họ tên người nhận"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nơi nhận hàng (địa chỉ chi tiết)
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-green-50 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tóm tắt
              </h3>

              <div className="space-y-3 mb-4">
                {selectedProductData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sản phẩm</span>
                    <span className="font-medium text-gray-900 text-right">
                      {selectedProductData.title}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số lượng</span>
                  <span className="font-medium text-gray-900">
                    {quantity} sản phẩm
                  </span>
                </div>

                {maxPeople && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số người</span>
                    <span className="font-medium text-gray-900">
                      {maxPeople} người
                    </span>
                  </div>
                )}

                {duration && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thời gian</span>
                    <span className="font-medium text-gray-900">
                      {duration} tiếng
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giao hàng</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ưu đãi</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(discount)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-green-200 pt-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Tổng giá trị đơn hàng
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={
                  !selectedProduct || !recipientName || !deliveryAddress
                }
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Tạo nhóm ngay
              </button>

              <p className="text-xs text-gray-600 mt-3 text-center">
                Bằng việc nhấn "Tạo nhóm ngay", bạn đồng ý với{' '}
                <a href="#" className="text-green-600 hover:underline">
                  Điều khoản sử dụng
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
