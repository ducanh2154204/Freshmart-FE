'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { groupBuyingService } from '@/services/group-buying.service'
import { formatCurrency } from '@/utils'
import type { GroupBuying } from '@/types'
import { Button, Input } from '@/components/ui'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { GroupBuyChat } from '@/components/GroupBuyChat'

// Helper to calculate time remaining
const calculateTimeRemaining = (endTime: string) => {
  const now = new Date().getTime()
  const end = new Date(endTime).getTime()
  const diff = end - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, expired: false }
}

export default function GroupBuyingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const groupBuyId = params.id as string

  const [groupBuy, setGroupBuy] = useState<GroupBuying | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [joinForm, setJoinForm] = useState({
    name: '',
    phone: '',
    address: '',
  })
  const [joinErrors, setJoinErrors] = useState<{
    name?: string
    phone?: string
    address?: string
  }>({})
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  })

  useEffect(() => {
    fetchGroupBuyDetails().then(gb => {
      if (!gb) return
      const delivery = gb.deliveryDetail
      setJoinForm(prev => ({
        name: delivery?.name || gb.recipientName || prev.name,
        phone: delivery?.phone || prev.phone,
        address: delivery?.address || gb.deliveryAddress || prev.address,
      }))
    })
    // Lấy userId hiện tại từ localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          // Decode JWT để lấy userId
          const payload = JSON.parse(atob(token.split('.')[1]))
          setCurrentUserId(payload.userId || payload.id || payload.sub)
        } catch (e) {
          // Nếu không decode được, thử lấy từ localStorage
          const userId = localStorage.getItem('userId')
          setCurrentUserId(userId)
        }
      }
    }
  }, [groupBuyId])

  // Real-time countdown timer
  useEffect(() => {
    if (!groupBuy?.endTime) return

    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(groupBuy.endTime!))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [groupBuy?.endTime])

  // Polling để kiểm tra status group mỗi 3 giây khi user đã join
  useEffect(() => {
    // Check nếu user đã join
    if (!currentUserId || !groupBuy || !Array.isArray(groupBuy.participants))
      return
    const userJoined = groupBuy.participants.some(
      (p: any) => String(p.userId || p.id) === String(currentUserId)
    )
    if (!userJoined) return

    let wasGroupFull = false
    const isFull = (g: GroupBuying) => {
      const targetPeople = Number(g.targetQuantity || g.maxParticipants || 10)
      const participantsValue = Array.isArray(g.participants)
        ? g.participants.length
        : typeof g.participants === 'number'
          ? g.participants
          : 0
      const currentPeople = Number(
        g.currentQuantity || g.currentParticipants || participantsValue || 0
      )
      return currentPeople >= targetPeople
    }

    const checkGroupStatus = async () => {
      try {
        const response = await groupBuyingService.getGroupBuyingById(groupBuyId)
        const updatedGroup =
          (response as any)?.data?.data || (response as any)?.data || response

        if (updatedGroup) {
          setGroupBuy(updatedGroup)

          // Kiểm tra xem group mới full nhưng trước đó chưa full
          if (isFull(updatedGroup) && !wasGroupFull) {
            wasGroupFull = true
            toast.success('✓ Nhóm đã đủ người! Bạn có thể thanh toán ngay.')
          }
        }
      } catch (err) {
        console.error('Error checking group status:', err)
      }
    }

    // Check ngay lần đầu
    checkGroupStatus()

    // Sau đó polling mỗi 3 giây
    const interval = setInterval(checkGroupStatus, 3000)

    return () => clearInterval(interval)
  }, [groupBuyId, currentUserId])

  const fetchGroupBuyDetails = async (): Promise<GroupBuying | null> => {
    try {
      setLoading(true)

      // Dùng API GET /group-buys/{id}
      const response = await groupBuyingService.getGroupBuyingById(groupBuyId)

      // Response có thể là { data: {...} } hoặc direct object
      let groupBuyData: GroupBuying | null = null

      if (response && typeof response === 'object' && 'data' in response) {
        groupBuyData = (response as any)?.data?.data || (response as any)?.data
      } else {
        groupBuyData = response as GroupBuying
      }

      if (!groupBuyData || !groupBuyData.id) {
        throw new Error(`Không tìm thấy nhóm mua chung với ID ${groupBuyId}`)
      }

      setGroupBuy(groupBuyData)
      return groupBuyData
    } catch (err: any) {
      console.error('Error fetching group buy:', err)
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải thông tin nhóm mua chung'
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  const requireAuth = (nextPath: string) => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null

    if (!token) {
      const returnUrl = encodeURIComponent(nextPath)
      router.push(`/auth?returnUrl=${returnUrl}`)
      return false
    }

    return true
  }

  // Join group (không thanh toán)
  const handleJoinGroup = async () => {
    if (!groupBuy) return

    const ok = requireAuth(`/group-buying/${groupBuyId}`)
    if (!ok) return

    try {
      setJoinErrors({})
      const nextErrors: typeof joinErrors = {}
      if (!joinForm.name.trim()) nextErrors.name = 'Vui lòng nhập tên'
      if (!joinForm.phone.trim()) nextErrors.phone = 'Vui lòng nhập SĐT'
      if (!joinForm.address.trim()) nextErrors.address = 'Vui lòng nhập địa chỉ'

      if (Object.keys(nextErrors).length > 0) {
        setJoinErrors(nextErrors)
        toast.error('Vui lòng điền đầy đủ thông tin nhận hàng để tham gia nhóm')
        return
      }

      setLoading(true)

      await groupBuyingService.joinGroupBuying({
        groupBuyId: Number(groupBuyId),
        quantity,
        deliveryDetail: {
          name: joinForm.name.trim(),
          phone: joinForm.phone.trim(),
          address: joinForm.address.trim(),
        },
      })

      const updated = await fetchGroupBuyDetails()

      toast.success('Tham gia nhóm thành công!')

      // Polling sẽ tự động detect khi group full và enable button thanh toán
    } catch (err: any) {
      console.error('Join group error:', err, {
        keys: err ? Object.keys(err) : [],
      })
      const message =
        err?.details?.message ||
        err?.message ||
        err?.message ||
        'Không thể tham gia nhóm, vui lòng thử lại'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Chỉ dùng cho bước thanh toán (khi đã join & đủ người)
  const handleCheckout = () => {
    const ok = requireAuth(`/group-buying/${groupBuyId}/checkout`)
    if (!ok) return

    router.push(`/group-buying/${groupBuyId}/checkout`)
  }

  // Kiểm tra xem user hiện tại có phải là chủ nhóm không
  const isGroupOwner = () => {
    if (!currentUserId || !groupBuy) return false
    const creatorId = String(
      (groupBuy as any).creatorId || groupBuy.userId || groupBuy.createdBy || ''
    )
    return creatorId === String(currentUserId)
  }

  // Kiểm tra xem user đã join nhóm (không quan tâm đã thanh toán hay chưa)
  const isJoined = () => {
    if (!currentUserId || !groupBuy) return false
    if (!Array.isArray(groupBuy.participants)) return false

    return groupBuy.participants.some(
      (p: any) => String(p.userId || p.id) === String(currentUserId)
    )
  }

  // Kiểm tra xem user đã tham gia nhóm chưa (và đã thanh toán)
  const hasPaid = () => {
    if (!currentUserId || !groupBuy) return false
    if (Array.isArray(groupBuy.participants)) {
      const participant = groupBuy.participants.find(
        (p: any) => String(p.userId || p.id) === String(currentUserId)
      )

      if (!participant) return false

      // Kiểm tra xem participant đã thanh toán chưa
      // Backend trả về paymentStatus: "PAID" (uppercase)
      const isPaid =
        participant.isPaid === true ||
        participant.paymentStatus === 'PAID' ||
        participant.paymentStatus === 'paid' ||
        participant.status === 'PAID' ||
        participant.status === 'paid' ||
        participant.paymentDate != null ||
        participant.paidAt != null

      return isPaid
    }
    return false
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
        <Footer />
      </>
    )
  }

  if (!groupBuy) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Không tìm thấy nhóm mua chung</p>
            <Button onClick={() => router.push('/group-buying')}>
              Quay lại danh sách
            </Button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

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
  const progress = (currentPeople / targetPeople) * 100

  // Calculate costs
  const itemPrice = currentPrice * quantity
  const shippingFee = 20000
  const totalCost = itemPrice + shippingFee

  // Generate share URL and QR code
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`

  const joined = isJoined()
  const paid = hasPaid()
  const isFull = currentPeople >= targetPeople
  const canCheckout = joined && isFull && !timeRemaining.expired

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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <span className="mr-2">←</span>
              Quay lại
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,3fr,2fr] gap-8">
              {/* Left Side - Image */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={getImageUrl()}
                    alt={groupBuy.product?.name || groupBuy.title || 'Product'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>

                {/* Share QR Code */}
                <div className="bg-white border-2 border-green-500 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Chia nhóm mua chung
                    </p>
                    <div className="flex justify-center mb-2">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-40 h-40 border-2 border-gray-200 rounded"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Quét mã để tham gia nhóm
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle - Details */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {groupBuy.product?.name || groupBuy.title}
                </h1>

                {/* Prices */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm text-gray-500">Giá mua lẻ</span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-700 font-medium">
                      Giá mua nhóm
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                      {formatCurrency(currentPrice)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="mt-2 inline-block bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                      Tiết kiệm {discountPercent}% ({formatCurrency(discount)})
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tiến trình nhóm
                    </span>
                    <span className="text-sm font-bold text-orange-600">
                      {currentPeople}/{targetPeople}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Cần thêm {Math.max(0, targetPeople - currentPeople)} người
                    để đạt mục tiêu
                  </p>
                </div>

                {/* Countdown Timer */}
                {groupBuy.endTime && !timeRemaining.expired ? (
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">Thời gian còn lại</span>
                    </div>
                    <div className="flex justify-center gap-4 text-center">
                      <div>
                        <div className="text-3xl font-bold">
                          {String(timeRemaining.days).padStart(2, '0')}
                        </div>
                        <div className="text-xs opacity-90">Ngày</div>
                      </div>
                      <div className="text-3xl font-bold">:</div>
                      <div>
                        <div className="text-3xl font-bold">
                          {String(timeRemaining.hours).padStart(2, '0')}
                        </div>
                        <div className="text-xs opacity-90">Giờ</div>
                      </div>
                      <div className="text-3xl font-bold">:</div>
                      <div>
                        <div className="text-3xl font-bold">
                          {String(timeRemaining.minutes).padStart(2, '0')}
                        </div>
                        <div className="text-xs opacity-90">Phút</div>
                      </div>
                      <div className="text-3xl font-bold">:</div>
                      <div>
                        <div className="text-3xl font-bold">
                          {String(timeRemaining.seconds).padStart(2, '0')}
                        </div>
                        <div className="text-xs opacity-90">Giây</div>
                      </div>
                    </div>
                  </div>
                ) : groupBuy.endTime && timeRemaining.expired ? (
                  <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 text-center">
                    <span className="font-semibold">Nhóm mua đã hết hạn</span>
                  </div>
                ) : null}

                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold text-xl"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={e =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg text-gray-900 font-semibold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-700 font-bold text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="border-2 border-gray-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giá mua chung</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(itemPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(shippingFee)}
                    </span>
                  </div>
                  <div className="border-t-2 border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {paid ? (
                    // Đã thanh toán
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                      <p className="text-green-700 font-semibold mb-2">
                        ✓ Bạn đã thanh toán cho nhóm này
                      </p>
                      <Button
                        onClick={() => router.push('/profile')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold"
                      >
                        Xem đơn hàng của tôi
                      </Button>
                    </div>
                  ) : !joined ? (
                    // Chưa join nhóm → tham gia nhóm (chưa thanh toán)
                    <>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
                        <div className="text-sm font-semibold text-gray-900">
                          Thông tin nhận hàng
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <Input
                            label="Họ và tên"
                            value={joinForm.name}
                            onChange={e =>
                              setJoinForm(prev => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            error={joinErrors.name}
                            placeholder="Nhập họ và tên"
                          />
                          <Input
                            label="Số điện thoại"
                            value={joinForm.phone}
                            onChange={e =>
                              setJoinForm(prev => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            error={joinErrors.phone}
                            placeholder="Nhập số điện thoại"
                          />
                          <Input
                            label="Địa chỉ"
                            value={joinForm.address}
                            onChange={e =>
                              setJoinForm(prev => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                            error={joinErrors.address}
                            placeholder="Nhập địa chỉ nhận hàng"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleJoinGroup}
                        disabled={timeRemaining.expired}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg disabled:bg-gray-400"
                      >
                        {!currentUserId
                          ? 'Đăng nhập để tham gia nhóm'
                          : 'Tham gia nhóm'}
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        Bạn chỉ thanh toán khi nhóm đủ số lượng và được áp dụng
                        giá cuối.
                      </p>
                    </>
                  ) : (
                    // Đã join nhóm, chờ đủ người để thanh toán
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 text-center text-sm text-blue-800">
                        {isFull
                          ? 'Nhóm đã đủ người, bạn có thể tiến hành thanh toán với giá cuối.'
                          : `Bạn đã tham gia nhóm. Chờ thêm ${
                              targetPeople - currentPeople
                            } người để mở thanh toán giá cuối.`}
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={!canCheckout}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold text-lg disabled:bg-gray-400"
                      >
                        {canCheckout
                          ? 'Thanh toán giá cuối'
                          : 'Chờ đủ người để thanh toán'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {/* Right Side - Group Chat */}
              <div className="flex flex-col">
                <GroupBuyChat groupBuyId={groupBuy.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
