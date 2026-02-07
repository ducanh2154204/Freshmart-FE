'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { groupBuyingService } from '@/services/group-buying.service'
import { orderService } from '@/services/order.service'
import type { GroupBuying, Order, OrderStatusResponse } from '@/types'
import { Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function GroupBuyingCheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const groupBuyId = params.id as string

  const [groupBuy, setGroupBuy] = useState<GroupBuying | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD')
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    initCheckout()
  }, [groupBuyId])

  const initCheckout = async () => {
    try {
      setLoading(true)
      setError(null)

      // Kiểm tra đăng nhập
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Vui lòng đăng nhập để tiếp tục')
        router.push('/auth')
        return
      }

      // Lấy userId từ token
      const getCurrentUserId = () => {
        try {
          const token = localStorage.getItem('accessToken')
          if (!token) return null
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.userId || payload.sub || payload.id
        } catch {
          return null
        }
      }
      const currentUserId = getCurrentUserId()

      // Fetch group buy details
      const response = await groupBuyingService.getGroupBuyingById(groupBuyId)
      const groupBuyData =
        (response as any)?.data?.data || (response as any)?.data || response

      if (!groupBuyData || !groupBuyData.id) {
        throw new Error(`Không tìm thấy nhóm mua chung với ID ${groupBuyId}`)
      }

      setGroupBuy(groupBuyData)

      // Kiểm tra xem user đã join chưa (check trong participants array)
      const participants = Array.isArray(groupBuyData.participants)
        ? groupBuyData.participants
        : []
      const isAlreadyJoined = participants.some(
        (p: any) => String(p.userId) === String(currentUserId)
      )

      console.log('Current user ID:', currentUserId)
      console.log('Participants:', participants)
      console.log('Already joined:', isAlreadyJoined)

      if (!isAlreadyJoined) {
        // Chưa join → gọi API join
        console.log('User has not joined yet, calling join API...')
        try {
          const joinResponse =
            await groupBuyingService.joinGroupBuying(groupBuyId)
          console.log('Join response:', joinResponse)
          setHasJoined(true)

          // Refresh group buy data sau khi join
          const updatedResponse =
            await groupBuyingService.getGroupBuyingById(groupBuyId)
          const updatedData =
            (updatedResponse as any)?.data?.data ||
            (updatedResponse as any)?.data ||
            updatedResponse
          setGroupBuy(updatedData)
        } catch (joinErr: any) {
          console.error('Join error:', joinErr)
          throw new Error(
            joinErr?.message || 'Không thể tham gia nhóm mua chung'
          )
        }
      } else {
        console.log('User already joined this group')
        setHasJoined(true)
      }
    } catch (err: any) {
      console.error('Error initializing checkout:', err)
      const errorMessage =
        err?.message || 'Không thể tải thông tin nhóm mua chung'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = async () => {
    try {
      setProcessing(true)
      setError(null)

      console.log('Starting checkout with groupBuyId:', groupBuyId)

      // Kiểm tra token
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Vui lòng đăng nhập để tiếp tục')
        router.push('/auth')
        return
      }
      console.log('Token exists:', token ? 'Yes' : 'No')

      // Gọi API checkout - mỗi người thanh toán riêng
      const response = await orderService.checkoutGroupBuy({
        groupBuyId: Number(groupBuyId),
      })

      console.log('Checkout response:', response)

      // Theo API: response = { message: "Group buy order created", order: {...}, qrCode: "..." }
      // Axios trả về response.data, nhưng có thể response trực tiếp đã là data
      const orderData = (response as any).order || (response as any).data?.order
      const qrCode = (response as any).qrCode || (response as any).data?.qrCode

      console.log('Order data:', orderData)
      console.log('Order ID:', orderData?.id)
      console.log('QR Code:', qrCode)

      if (paymentMethod === 'ONLINE') {
        // Nếu chọn thanh toán online, chuyển sang trang payment với QR code
        if (orderData?.id) {
          console.log('Redirecting to payment page with orderId:', orderData.id)
          router.push(
            `/group-buying/${groupBuyId}/payment?orderId=${orderData.id}`
          )
        } else {
          console.error('No order ID found in response')
          setError('Không tìm thấy mã đơn hàng')
        }
      } else {
        // COD - thanh toán khi nhận hàng
        alert('Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.')
        router.push(`/group-buying`)
      }
    } catch (err: any) {
      console.error('Checkout error (full):', err)
      console.error('Error type:', typeof err)
      console.error('Error keys:', Object.keys(err || {}))
      console.error('Error message:', err?.message)
      console.error('Error response:', err?.response)
      console.error('Error status:', err?.status)

      let errorMessage = 'Có lỗi xảy ra khi thanh toán'

      if (err?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại'
        setTimeout(() => router.push('/auth'), 2000)
      } else if (err?.status === 404) {
        errorMessage = 'Không tìm thấy API endpoint. Vui lòng kiểm tra backend'
      } else if (err?.status === 400) {
        errorMessage = err?.message || 'Thông tin không hợp lệ'
      } else if (err?.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <LoadingSpinner />
        <p className="text-gray-600">
          {hasJoined ? 'Đang tải thông tin...' : 'Đang tham gia nhóm mua...'}
        </p>
      </div>
    )
  }

  if (error && !groupBuy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  if (!groupBuy) return null

  // Get prices with fallbacks
  const currentPrice =
    groupBuy.currentPrice ||
    (groupBuy as any).discountPrice ||
    groupBuy.product?.price ||
    0
  const originalPrice =
    groupBuy.originalPrice ||
    groupBuy.product?.originalPrice ||
    groupBuy.product?.price ||
    currentPrice

  // Tính discount an toàn
  const discount = Math.max(0, originalPrice - currentPrice)
  const discountPercent =
    originalPrice > 0 && discount > 0
      ? Math.round((discount / originalPrice) * 100)
      : 0

  // Tính số người: backend đã tính sẵn người tạo trong currentQuantity
  const targetPeople = Number(
    groupBuy.targetQuantity || groupBuy.maxParticipants || 10
  )
  const participantsValue = Array.isArray(groupBuy.participants)
    ? groupBuy.participants.length
    : typeof groupBuy.participants === 'number'
      ? groupBuy.participants
      : 0
  const currentPeople = Number(
    groupBuy.currentQuantity ||
      groupBuy.currentParticipants ||
      participantsValue ||
      0
  )

  // Validate and get safe image URL
  const getImageUrl = () => {
    const image = groupBuy.product?.image || groupBuy.image
    if (!image) return '/images/placeholder.png'

    // Check if it's a valid absolute URL
    try {
      new URL(image)
      return image
    } catch {
      // If not a valid URL, check if it's a local path
      if (image.startsWith('/')) return image
      // Otherwise use placeholder
      return '/images/placeholder.png'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <span className="mr-2">←</span>
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Thanh toán mua chung
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin sản phẩm */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin sản phẩm
              </h2>
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={getImageUrl()}
                    alt={groupBuy.product?.name || groupBuy.title || 'Product'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {groupBuy.product?.name || groupBuy.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xl font-bold text-green-600">
                      {currentPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-gray-400 line-through">
                      {originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    {discount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Tối đa {targetPeople} người
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((currentPeople / targetPeople) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {currentPeople}/{targetPeople} người tham gia
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Còn thời gian: {groupBuy.timeLeft || 'Đang cập nhật'}
                  </div>
                </div>
              </div>
            </div>

            {/* Thành viên nhóm */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thành viên nhóm ({currentPeople})
              </h2>
              <div className="text-sm text-gray-600">
                <p>Hiện có {currentPeople} người tham gia</p>
                <p className="mt-1">Tối đa: {targetPeople} người</p>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={e =>
                      setPaymentMethod(e.target.value as 'COD' | 'ONLINE')
                    }
                    className="w-4 h-4 text-green-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-900">
                      Thanh toán khi nhận hàng
                    </div>
                    <div className="text-sm text-gray-500">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={e =>
                      setPaymentMethod(e.target.value as 'COD' | 'ONLINE')
                    }
                    className="w-4 h-4 text-green-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-900">
                      Thanh toán online
                    </div>
                    <div className="text-sm text-gray-500">
                      Quét mã QR để thanh toán ngay
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Sidebar - Tóm tắt đơn hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giá gốc</span>
                  <span className="!text-gray-900 font-medium">
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm mua chung</span>
                  <span className="!text-red-500 font-medium">
                    -{discount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="!text-gray-900">Tổng cộng</span>
                    <span className="!text-green-600 font-bold text-xl">
                      {currentPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {groupBuy.deliveryInfo && (
                <div className="text-xs text-gray-500 mb-4 flex items-start gap-2">
                  <span>⏱</span>
                  <span>{groupBuy.deliveryInfo}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      Đang xử lý...
                    </span>
                  ) : paymentMethod === 'ONLINE' ? (
                    'Thanh toán online'
                  ) : (
                    'Đặt hàng (COD)'
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/group-buying')}
                  variant="outline"
                  className="w-full py-3 rounded-lg font-semibold"
                >
                  Tiếp tục mua chung
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
