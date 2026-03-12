'use client'

import React, { useEffect, useState } from 'react'
import { categoryService } from '@/services/category.service'
import type { Category } from '@/types/category'

interface CategoryCardProps {
  image: string
  title: string
  href?: string
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  image,
  title,
  href = '#',
}) => {
  return (
    <a
      href={href}
      className="flex flex-col items-center text-center transition-transform hover:scale-105"
    >
      <div className="w-full rounded-2xl shadow-md overflow-hidden mb-2">
        <img
          src={image}
          alt={title}
          className="w-full h-[120px] object-cover"
        />
      </div>
    </a>
  )
}

interface CategoryItem {
  id: number | string
  title: string
  image: string
}

export const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await categoryService.getAllCategories()

        const responseData = response as any
        const categoriesList: Category[] =
          responseData?.data ?? responseData ?? []

        const mapped: CategoryItem[] = categoriesList
          .filter(c => c.image)
          .map(c => ({
            id: c.id,
            title: c.name,
            image: c.image,
          }))

        setCategories(mapped)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Không thể tải danh mục sản phẩm')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-black">
            Danh mục sản phẩm
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl h-[120px] bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error && categories.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-black">
            Danh mục sản phẩm
          </h2>
          <div className="text-gray-600">{error}</div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              title={category.title}
              image={category.image}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
