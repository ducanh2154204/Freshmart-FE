import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'
import type { Cart, AddToCartPayload, UpdateCartPayload } from '@/types/cart'

export const cartService = {
  /**
   * Lấy giỏ hàng của user
   */
  getCart() {
    return apiClient.get<BaseResponse<Cart>>('/api/cart')
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  addToCart(payload: AddToCartPayload) {
    return apiClient.post<BaseResponse<Cart>>('/api/cart', payload)
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  updateCartItem(payload: UpdateCartPayload) {
    return apiClient.put<BaseResponse<Cart>>('/api/cart', payload)
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeFromCart(itemId: number | string) {
    return apiClient.delete<BaseResponse<Cart>>(`/api/cart/${itemId}`)
  },
}
