import { apiClient } from '@/lib/api-client'
import type { Category } from '@/types/category'

export const categoryService = {
  /**
   * Lấy toàn bộ danh mục sản phẩm
   */
  getAllCategories() {
    return apiClient.get<Category[]>('/api/products/categories/all')
  },
}

