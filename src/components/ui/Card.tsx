import React from 'react'
import { classNames } from '@/utils/helpers'

export interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  footer?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  footer,
}) => {
  return (
    <div
      className={classNames(
        'bg-white rounded-lg shadow-md overflow-hidden',
        className
      )}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  )
}

