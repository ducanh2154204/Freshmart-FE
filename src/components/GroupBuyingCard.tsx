import React from 'react'
import Link from 'next/link'
import { Button } from './ui/Button'

interface GroupBuyingCardProps {
  id?: number | string
  image: string
  title: string
  currentPrice: number
  originalPrice: number
  rating?: number
  participants?: number
  timeLeft?: string
  deliveryInfo?: string
  size?: 'large' | 'small'
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
}) => {
  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(price) + 'đ'
    )
  }

  const discount = Math.round(
    ((originalPrice - currentPrice) / originalPrice) * 100
  )

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
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3rem]">
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

        {/* Rating */}
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 ml-2">{rating}.0</span>
        </div>

        {/* Info */}
        {deliveryInfo && (
          <div className="flex items-start text-xs text-gray-600 mb-2">
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

        {timeLeft && (
          <div className="flex items-center text-xs text-orange-600 font-medium mb-3">
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {timeLeft}
          </div>
        )}

        {/* Button */}
        <Button
          variant="primary"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold"
        >
          Xem chi tiết
        </Button>

        {participants > 0 && (
          <p className="text-xs text-gray-500 text-center mt-2">
            {participants} người đã tham gia
          </p>
        )}
      </div>
    </>
  )

  return id ? (
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
