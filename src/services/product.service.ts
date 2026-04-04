import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'
import type {
  Product,
  ProductListParams,
  ProductListResponse,
} from '@/types/product'

export const productService = {
  /**
   * Lấy danh sách sản phẩm
   */
  getProducts(params?: ProductListParams) {
    return apiClient.get<BaseResponse<ProductListResponse>>('/api/products', {
      params: params as Record<string, string | number | boolean>,
    })
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  getProductById(id: number | string) {
    return apiClient.get<BaseResponse<Product>>(`/api/products/${id}`)
  },

  /**
   * Tìm kiếm sản phẩm
   */
  searchProducts(query: string, params?: Omit<ProductListParams, 'search'>) {
    return apiClient.get<BaseResponse<ProductListResponse>>('/api/products', {
      params: {
        ...params,
        search: query,
      } as Record<string, string | number | boolean>,
    })
  },

  /**
   * Lấy sản phẩm theo danh mục
   */
  getProductsByCategory(
    categoryId: number | string,
    params?: Omit<ProductListParams, 'category'>
  ) {
    return apiClient.get<BaseResponse<ProductListResponse>>('/api/products', {
      params: {
        ...params,
        category: categoryId,
      } as Record<string, string | number | boolean>,
    })
  },

  /**
   * Lấy tất cả danh mục
   */
  getCategories() {
    return apiClient.get('/api/products/categories/all')
  },
}
