'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  vendorService,
  type CreateProductPayload,
} from '@/services/vendor.service'
import { productService } from '@/services/product.service'
import type { ApiError } from '@/types/api'

interface Category {
  id: number
  name: string
  slug: string
  image: string
}

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    categoryId: '',
    unit: '',
    stock: '',
    images: [] as File[],
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  // Load categories when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await productService.getCategories()
      // Response might be BaseResponse wrapped or direct array
      const data = Array.isArray(response)
        ? response
        : (response as any)?.data || response
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading categories:', err)
      const apiError = err as Partial<ApiError> & { details?: any }
      const message =
        (typeof apiError?.message === 'string' && apiError.message) ||
        (typeof apiError?.details?.message === 'string' &&
          apiError.details.message) ||
        'Không thể tải danh mục'
      toast.error(message)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files],
    }))

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        setImagePreview(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Tên sản phẩm không được để trống')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Giá không hợp lệ')
      return
    }
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      toast.error('Giá gốc không hợp lệ')
      return
    }
    if (!formData.categoryId) {
      toast.error('Vui lòng chọn danh mục')
      return
    }
    if (formData.images.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 hình ảnh')
      return
    }

    try {
      setLoading(true)

      // Build FormData for multipart/form-data upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('originalPrice', formData.originalPrice)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('categoryId', formData.categoryId)
      formDataToSend.append('unit', formData.unit || 'kg')
      formDataToSend.append('stock', formData.stock || '0')

      // Append all image files
      formData.images.forEach(file => {
        formDataToSend.append('images', file)
      })

      await vendorService.createProduct(formDataToSend)

      // Success - reset form and close
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        description: '',
        categoryId: '',
        unit: '',
        stock: '',
        images: [],
      })
      setImagePreview([])
      toast.success('Thêm sản phẩm thành công!')
      onSuccess()
      onClose()
    } catch (err) {
      const apiError = err as Partial<ApiError> & { details?: any }
      const message =
        (typeof apiError?.message === 'string' && apiError.message) ||
        (typeof apiError?.details?.message === 'string' &&
          apiError.details.message) ||
        'Không thể thêm sản phẩm'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl bg-white shadow-xl border border-gray-100 p-6 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Thêm sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <Input
            label="Tên sản phẩm"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nhập tên sản phẩm"
            required
          />

          {/* Price and Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá bán"
              name="price"
              type="number"
              min="0"
              step="1000"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
            <Input
              label="Giá gốc"
              name="originalPrice"
              type="number"
              min="0"
              step="1000"
              value={formData.originalPrice}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả sản phẩm"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:text-gray-400"
              disabled={categoriesLoading}
              required
            >
              <option value="">
                {categoriesLoading ? 'Đang tải...' : 'Chọn danh mục'}
              </option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unit and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Đơn vị"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="kg, cái, lít..."
            />
            <Input
              label="Kho"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Chọn một hoặc nhiều hình ảnh
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              disabled={loading}
            >
              {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
