import React from 'react'
import Image from 'next/image'
import { Button } from './ui/Button'

interface ProductCardProps {
  image: string
  title: string
  brand?: string
  price: number
  originalPrice?: number
  rating?: number
  discount?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  brand,
  price,
  originalPrice,
  rating = 5,
  discount,
}) => {
  const formatPrice = (price: number) => {
    return (
      new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
      }).format(price) + 'đ'
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            {discount}
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
        {brand && <p className="text-xs text-gray-500 mb-1">{brand}</p>}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 h-10">
          {title}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 ml-1">{rating}.0</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-green-600">
              {formatPrice(price)}
            </p>
            {originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="sm"
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <svg
            className="w-4 h-4 mr-1"
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
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  )
}

export const ProductsSection: React.FC = () => {
  const products = [
    {
      image:
        'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80',
      title: 'Cà chua bi hữu cơ',
      brand: 'Nông trại xanh',
      price: 35000,
      originalPrice: 54000,
      rating: 5,
      discount: '-35%',
    },
    {
      image:
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
      title: 'Thịt ba chỉ tươi',
      brand: 'Thịt sạch Việt',
      price: 120000,
      originalPrice: 140000,
      rating: 5,
      discount: '-14%',
    },
    {
      image:
        'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&q=80',
      title: 'Tôm sú tươi sống',
      brand: 'Hải sản Vũng Tàu',
      price: 280000,
      rating: 5,
    },
    {
      image:
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
      title: 'Sữa tươi không đường',
      brand: 'Vinamilk',
      price: 32000,
      rating: 5,
    },
    {
      image: '/images/watermelon.jpg.png',
      title: 'Dưa hấu ruột đỏ',
      brand: 'Trái cây Đà Lạt',
      price: 25000,
      originalPrice: 45000,
      rating: 5,
      discount: '-44%',
    },
    {
      image:
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80',
      title: 'Gạo ST25 cao cấp',
      brand: 'Gạo Việt',
      price: 220000,
      rating: 5,
    },
  ]

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Sản phẩm nổi bật</h2>
          <a
            href="#"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Xem tất cả →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  )
}
