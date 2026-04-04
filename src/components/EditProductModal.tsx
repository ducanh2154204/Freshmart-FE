'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  vendorService,
  type UpdateProductPayload,
  type VendorProduct,
} from '@/services/vendor.service'
import type { ApiError } from '@/types/api'

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product: VendorProduct | null
}

export function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  })
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        description: product.description || '',
      })
      setExistingImage(product.image || null)
    }
  }, [product])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!product?.id) {
      toast.error('Product ID không hợp lệ')
      return
    }

    // Validation
    if (!formData.name.trim()) {
      toast.error('Tên sản phẩm không được để trống')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Giá không hợp lệ')
      return
    }

    try {
      setLoading(true)

      let payload: UpdateProductPayload | FormData

      // Use FormData if image is selected
      if (imageFile) {
        const formDataPayload = new FormData()
        formDataPayload.append('name', formData.name)
        formDataPayload.append('price', parseFloat(formData.price).toString())
        formDataPayload.append(
          'stock',
          formData.stock ? parseInt(formData.stock).toString() : '0'
        )
        formDataPayload.append('description', formData.description)
        formDataPayload.append('images', imageFile)
        payload = formDataPayload
      } else {
        // Use JSON if no image is selected
        payload = {
          name: formData.name,
          price: parseFloat(formData.price),
          stock: formData.stock ? parseInt(formData.stock) : 0,
          description: formData.description,
        }
      }

      const response = await vendorService.updateProduct(product.id, payload)

      // Check if response indicates success
      // Backend returns direct object {id, name, ...} not wrapped
      const successData = (response as any)?.id
        ? response
        : (response as any)?.data
      if (successData?.id) {
        toast.success('Cập nhật sản phẩm thành công!')
        onSuccess()
        onClose()
      } else {
        toast.error('Không thể cập nhật sản phẩm')
      }
    } catch (err) {
      const apiError = err as Partial<ApiError> & { details?: any }
      const message =
        (typeof apiError?.message === 'string' && apiError.message) ||
        (typeof apiError?.details?.message === 'string' &&
          apiError.details.message) ||
        'Không thể cập nhật sản phẩm'
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
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Chỉnh sửa sản phẩm
        </h2>

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

          {/* Price and Stock */}
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
              label="Kho"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả sản phẩm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh sản phẩm (Tùy chọn)
            </label>

            {imagePreview ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <img
                  src={imagePreview}
                  alt="New product image"
                  className="w-32 h-32 object-cover rounded-md mb-3"
                />
                <p className="text-sm text-gray-600 mb-3">
                  ✓ Hình ảnh mới sẽ được cập nhật
                </p>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  ✕ Bỏ ảnh
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image-input"
                />
                <label
                  htmlFor="product-image-input"
                  className="cursor-pointer w-full text-center"
                >
                  <div className="text-2xl mb-2">📷</div>
                  <p className="text-sm font-medium text-gray-700">
                    Tải lên hình ảnh mới
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {existingImage
                      ? 'Chọn để thay đổi hình ảnh hiện tại'
                      : 'Chọn để thêm hình ảnh'}
                  </p>
                </label>
              </div>
            )}

            {existingImage && !imagePreview && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded">
                <p className="text-xs text-gray-600">
                  💡 Hình ảnh hiện tại sẽ được giữ nguyên nếu không chọn ảnh mới
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
