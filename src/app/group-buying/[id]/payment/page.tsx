'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { groupBuyingService } from '@/services/group-buying.service'
import { orderService } from '@/services/order.service'
import type { GroupBuying, Order, OrderStatusResponse } from '@/types'
import { Button } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const groupBuyId = params.id as string
  const orderId = searchParams.get('orderId')

  const [groupBuy, setGroupBuy] = useState<GroupBuying | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<OrderStatusResponse | null>(
    null
  )
  const [polling, setPolling] = useState(false)
  const [pollingTimeout, setPollingTimeout] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy mã đơn hàng')
      setLoading(false)
      return
    }

    fetchData()
  }, [orderId, groupBuyId])

  useEffect(() => {
    // Bắt đầu polling khi có orderId
    if (orderId && !polling) {
      startPolling()
    }
  }, [orderId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Lấy thông tin group buy
      const groupBuyResponse =
        await groupBuyingService.getGroupBuyingById(groupBuyId)
      const groupBuyData =
        (groupBuyResponse as any)?.data?.data ||
        (groupBuyResponse as any)?.data ||
        groupBuyResponse

      if (groupBuyData && groupBuyData.id) {
        setGroupBuy(groupBuyData)
      }

      // Lấy thông tin order
      if (orderId) {
        const orderResponse = await orderService.getOrderDetails(orderId)
        console.log('Order response:', orderResponse)

        // Response có thể là { order: {...} } hoặc trực tiếp là order object
        const orderData =
          (orderResponse as any).order ||
          (orderResponse as any).data?.order ||
          (orderResponse as any).data ||
          orderResponse

        console.log('Order data:', orderData)

        if (orderData) {
          setOrder(orderData)
        } else {
          console.error('No order data found in response')
        }
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err?.message || 'Không thể tải thông tin thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const startPolling = async () => {
    if (!orderId || polling) return

    try {
      setPolling(true)
      setPollingTimeout(false)
      const maxTime = 300 // 15 phút (mỗi bước 3s)
      setCountdown(maxTime)

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            return 0
          }
          return prev - 1
        })
      }, 3000)

      await orderService.pollOrderStatus(
        orderId,
        status => {
          console.log('Status update:', status)

          // Kiểm tra status hợp lệ trước khi sử dụng
          if (!status || !status.status) {
            console.warn('Invalid status received:', status)
            return
          }

          setOrderStatus(status)

          // Nếu đã thanh toán thành công
          if (status.status === 'PAID') {
            clearInterval(countdownInterval)
            alert('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.')
            router.push(`/group-buying`)
          }
        },
        3000, // Poll mỗi 3 giây
        300 // Tối đa 15 phút
      )
      clearInterval(countdownInterval)
    } catch (err: any) {
      console.error('Polling error:', err)
      if (err?.message?.includes('Timeout')) {
        setPollingTimeout(true)
      }
    } finally {
      setPolling(false)
      setCountdown(0)
    }
  }

  const handleCheckPaymentStatus = async () => {
    if (!orderId) return

    try {
      setError(null)
      const response = await orderService.getOrderStatus(orderId)
      const statusData = (response as any).data || response

      if (statusData && statusData.status) {
        setOrderStatus(statusData)

        if (statusData.status === 'PAID') {
          alert('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.')
          router.push(`/group-buying`)
        } else if (statusData.status === 'PENDING') {
          alert(
            'Đơn hàng vẫn chưa được thanh toán. Vui lòng hoàn tất thanh toán.'
          )
        } else {
          alert(`Trạng thái đơn hàng: ${statusData.status}`)
        }
      }
    } catch (err: any) {
      console.error('Check status error:', err)
      setError('Không thể kiểm tra trạng thái đơn hàng')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            {error || 'Không tìm thấy đơn hàng'}
          </div>
          <Button onClick={() => router.push('/group-buying')}>
            Quay lại trang mua chung
          </Button>
        </div>
      </div>
    )
  }

  // Get prices with fallbacks
  const currentPrice =
    groupBuy?.currentPrice ||
    (groupBuy as any)?.discountPrice ||
    groupBuy?.product?.price ||
    0
  const originalPrice =
    groupBuy?.originalPrice ||
    groupBuy?.product?.originalPrice ||
    groupBuy?.product?.price ||
    currentPrice

  // Validate and get safe image URL
  const getImageUrl = () => {
    if (!groupBuy) return '/images/placeholder.png'

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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Thanh toán đơn hàng
          </h1>
          <p className="text-gray-600 mt-2">
            Quét mã QR bên dưới để hoàn tất thanh toán
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Mã QR thanh toán
            </h2>
            {order.qrCodeUrl || order.qrCode ? (
              <div className="text-center">
                <img
                  src={order.qrCodeUrl || order.qrCode}
                  alt="QR Code"
                  className="mx-auto w-full max-w-sm"
                />
                <p className="text-sm text-gray-600 mt-4">
                  Quét mã QR để thanh toán
                </p>
                {orderStatus && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm">
                      Trạng thái:{' '}
                      <span
                        className={`font-semibold ${
                          orderStatus.status === 'PAID'
                            ? 'text-green-600'
                            : orderStatus.status === 'PENDING'
                              ? 'text-orange-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {orderStatus.status === 'PAID'
                          ? 'Đã thanh toán'
                          : orderStatus.status === 'PENDING'
                            ? 'Đang chờ thanh toán'
                            : orderStatus.status}
                      </span>
                    </p>
                  </div>
                )}
                {polling && orderStatus?.status !== 'PAID' && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <LoadingSpinner />
                      <span className="text-sm">
                        Đang chờ xác nhận thanh toán...
                      </span>
                    </div>
                    {countdown > 0 && (
                      <p className="text-xs text-center text-gray-500">
                        Tự động kiểm tra trong{' '}
                        {Math.floor((countdown * 3) / 60)} phút{' '}
                        {Math.floor((countdown * 3) % 60)} giây
                      </p>
                    )}
                  </div>
                )}
                {pollingTimeout && orderStatus?.status !== 'PAID' && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800 mb-2">
                      ⏰ Hết thời gian chờ. Vui lòng kiểm tra lại hoặc liên hệ
                      hỗ trợ nếu đã thanh toán.
                    </p>
                    <Button
                      onClick={startPolling}
                      variant="outline"
                      className="w-full text-sm py-2"
                    >
                      Thử lại
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">Đang tạo mã QR...</div>
            )}
          </div>

          {/* Thông tin đơn hàng */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin đơn hàng
            </h2>

            {groupBuy && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={getImageUrl()}
                      alt={
                        groupBuy.product?.name || groupBuy.title || 'Product'
                      }
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {groupBuy.product?.name || groupBuy.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-green-600">
                        {currentPrice.toLocaleString('vi-VN')}đ
                      </span>
                      {originalPrice > currentPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {originalPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã đơn hàng:</span>
                    <span className="font-mono text-gray-900">#{order.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số lượng:</span>
                    <span className="text-gray-900">1</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="text-gray-900">Thanh toán online</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span className="text-gray-900">Tổng cộng:</span>
                    <span className="text-green-600 text-lg">
                      {currentPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              {orderStatus?.status !== 'PAID' && (
                <Button
                  onClick={handleCheckPaymentStatus}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                >
                  ✓ Tôi đã thanh toán
                </Button>
              )}
              <Button
                onClick={() => router.push('/group-buying')}
                variant="outline"
                className="w-full py-3 rounded-lg font-semibold"
              >
                Quay lại trang mua chung
              </Button>
            </div>
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Hướng dẫn thanh toán
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Mở ứng dụng ngân hàng hoặc ví điện tử của bạn</li>
            <li>Chọn chức năng quét mã QR</li>
            <li>Quét mã QR bên trên</li>
            <li>Xác nhận thông tin và hoàn tất thanh toán</li>
            <li>Hệ thống sẽ tự động xác nhận sau khi thanh toán thành công</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
