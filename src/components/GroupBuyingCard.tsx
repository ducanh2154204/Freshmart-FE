import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from './ui/Button'

interface GroupBuyingCardProps {
  id?: number | string
  image: string
  title: string
  currentPrice: number
  originalPrice: number
  rating?: number
  participants?: any[] | number
  timeLeft?: string
  deliveryInfo?: string
  size?: 'large' | 'small'
  targetQuantity?: number
  currentQuantity?: number
  endTime?: string
  isOwner?: boolean
  currentUserId?: string | number
  createdBy?: string | number
  onJoin?: () => void
}

export const GroupBuyingCard: React.FC<GroupBuyingCardProps> = ({
  id,
  image,
  title,
  currentPrice,
  originalPrice,
  rating = 5,
  participants = 0,
  timeLeft,
  deliveryInfo,
  size = 'large',
  targetQuantity,
  currentQuantity,
  endTime,
  isOwner = false,
  currentUserId,
  createdBy,
  onJoin,
}) => {
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Calculate countdown timer
  useEffect(() => {
    if (!endTime) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(price) + 'đ'
    )
  }

  // Tính discount an toàn
  const discountAmount = Math.max(0, originalPrice - currentPrice)
  const discount =
    originalPrice > 0 && discountAmount > 0
      ? Math.round((discountAmount / originalPrice) * 100)
      : 0

  // Calculate participants count
  const participantsCount = Array.isArray(participants)
    ? participants.length
    : typeof participants === 'number'
      ? participants
      : 0
  const participantsArray = Array.isArray(participants) ? participants : []

  // Determine if user is owner - convert to string for comparison
  const currentUserIdStr = String(currentUserId || '')
  const createdByStr = String(createdBy || '')
  const userIsOwner =
    isOwner ||
    (currentUserIdStr && createdByStr && currentUserIdStr === createdByStr)

  // Enhanced debug log for ownership check
  useEffect(() => {
    if (id && size !== 'small') {
      console.log(`🔍 Card ${id} Ownership Check:`, {
        currentUserId,
        currentUserIdStr,
        createdBy,
        createdByStr,
        isOwner,
        userIsOwner,
        matches: currentUserIdStr === createdByStr,
        hasCurrentUser: !!currentUserId,
        hasCreatedBy: !!createdBy,
      })
    }
  }, [id, currentUserId, createdBy, userIsOwner, size])

  // Calculate progress
  const target = targetQuantity || currentQuantity || 10
  const current = currentQuantity || participantsCount
  const progress = Math.min((current / target) * 100, 100)
  const isFull = current >= target

  if (size === 'small') {
    const cardContent = (
      <>
        <div className="relative h-32 bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 font-bold text-base">
              {formatPrice(currentPrice)}
            </span>
            <span className="text-gray-400 text-xs line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-1.5"
          >
            Mua ngay
          </Button>
        </div>
      </>
    )

    return id ? (
      <Link
        href={`/group-buying/${id}`}
        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer block"
      >
        {cardContent}
      </Link>
    ) : (
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group cursor-pointer">
        {cardContent}
      </div>
    )
  }

  const cardContent = (
    <>
      {/* Image Container */}
      <div className="relative h-56 bg-gray-100 overflow-hidden group">
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          -{discount}%
        </div>
        {isFull && (
          <div className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            100%
          </div>
        )}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
          {title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-red-600">
            {formatPrice(currentPrice)}
          </span>
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(originalPrice)}
          </span>
        </div>

        {/* Progress Bar */}
        {targetQuantity && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Tiến độ</span>
              <span className="text-xs font-bold text-orange-600">
                {current}/{target} người
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${isFull ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Participants Avatars */}
        {participantsArray.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {participantsArray
              .slice(0, 5)
              .map((participant: any, idx: number) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                  title={participant.user?.name || participant.name || 'User'}
                >
                  {(participant.user?.name || participant.name || '?')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              ))}
            {participantsArray.length > 5 && (
              <span className="text-xs text-gray-500 ml-1">
                +{participantsArray.length - 5} người khác
              </span>
            )}
          </div>
        )}

        {/* Countdown Timer */}
        {endTime &&
        countdown.hours + countdown.minutes + countdown.seconds > 0 ? (
          <div className="flex items-center text-xs text-gray-600 mb-3 gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Còn {countdown.hours > 0 && `${countdown.hours} giờ `}
              {countdown.minutes} phút {countdown.seconds} giây
            </span>
          </div>
        ) : endTime ? (
          <div className="text-xs text-red-600 mb-3">Đã hết hạn</div>
        ) : null}

        {/* Delivery Info */}
        {deliveryInfo && (
          <div className="flex items-start text-xs text-gray-600 mb-3">
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="line-clamp-2">{deliveryInfo}</span>
          </div>
        )}

        {/* Button */}
        {isFull ? (
          <Button
            variant="primary"
            className="w-full bg-green-500 text-white font-semibold cursor-default"
            disabled
          >
            Đã đủ số lượng!
          </Button>
        ) : userIsOwner ? (
          id ? (
            <Link href={`/group-buying/${id}`} className="block">
              <Button
                variant="primary"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
              >
                Xem nhóm
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold"
            >
              Xem nhóm
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            onClick={e => {
              if (onJoin) {
                e.preventDefault()
                onJoin()
              }
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            Tham gia ngay
          </Button>
        )}
      </div>
    </>
  )

  return id && !onJoin ? (
    <Link
      href={`/group-buying/${id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden block"
    >
      {cardContent}
    </Link>
  ) : (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      {cardContent}
    </div>
  )
}
