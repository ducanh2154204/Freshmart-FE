import React from 'react'

interface CategoryCardProps {
  icon: React.ReactNode
  title: string
  color: string
  href?: string
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  icon,
  title,
  color,
  href = '#',
}) => {
  return (
    <a
      href={href}
      className={`${color} rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 shadow-md min-h-[120px]`}
    >
      <div className="text-white mb-2">{icon}</div>
      <span className="text-white font-medium text-sm">{title}</span>
    </a>
  )
}

export const CategoriesSection: React.FC = () => {
  const categories = [
    {
      title: 'Rau củ',
      color: 'bg-gradient-to-br from-green-400 to-green-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
        </svg>
      ),
    },
    {
      title: 'Trái cây',
      color: 'bg-gradient-to-br from-pink-400 to-pink-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C9.24 2 7 4.24 7 7c0 1.77.94 3.32 2.35 4.19C8.53 12.15 8 13.51 8 15c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.49-.53-2.85-1.35-3.81C18.06 10.32 19 8.77 19 7c0-2.76-2.24-5-5-5zm0 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
        </svg>
      ),
    },
    {
      title: 'Hải sản',
      color: 'bg-gradient-to-br from-blue-400 to-blue-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 16c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5zM12 3L2 9h20L12 3zm0 4.5L7.5 9h9L12 7.5z" />
        </svg>
      ),
    },
    {
      title: 'Sữa & Bơ',
      color: 'bg-gradient-to-br from-orange-400 to-orange-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2v11h3v9h4v-9h3V2H7zm8 2h2v7h-2V4zM9 4h2v7H9V4z" />
        </svg>
      ),
    },
    {
      title: 'Trái cây',
      color: 'bg-gradient-to-br from-purple-400 to-purple-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C9.24 2 7 4.24 7 7c0 1.77.94 3.32 2.35 4.19C8.53 12.15 8 13.51 8 15c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.49-.53-2.85-1.35-3.81C18.06 10.32 19 8.77 19 7c0-2.76-2.24-5-5-5z" />
        </svg>
      ),
    },
    {
      title: 'Đồ khô',
      color: 'bg-gradient-to-br from-pink-400 to-pink-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h6v5l-3-1.5L9 9V4z" />
        </svg>
      ),
    },
    {
      title: 'Đồ uống',
      color: 'bg-gradient-to-br from-teal-400 to-teal-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 3H9v2.4l1.81 1.45C10.93 6.94 11 7.09 11 7.24v4.26c0 .28-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5V7.24c0-.15.07-.3.19-.39L10 5.4V3H4v18h16V3zm-2 16H6V5h12v14z" />
        </svg>
      ),
    },
    {
      title: 'Gia vị',
      color: 'bg-gradient-to-br from-orange-400 to-red-500',
      icon: (
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83-3.45-1.13-6-4.82-6-8.83V6.31l6-2.12 6 2.12v4.78z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.title}
              color={category.color}
              icon={category.icon}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
