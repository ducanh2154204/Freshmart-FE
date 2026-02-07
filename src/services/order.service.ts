import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'
import type {
  Order,
  CheckoutCartPayload,
  CheckoutGroupBuyPayload,
  OrderStatusResponse,
} from '@/types/order'

export const orderService = {
  /**
   * Thanh toán từ giỏ hàng (mua hàng 1 người)
   */
  checkoutCart(payload: CheckoutCartPayload) {
    return apiClient.post<BaseResponse<Order>>(
      '/api/orders/checkout/cart',
      payload
    )
  },

  /**
   * Thanh toán cho group buy (mua theo nhóm)
   */
  checkoutGroupBuy(payload: CheckoutGroupBuyPayload) {
    return apiClient.post<BaseResponse<Order>>(
      '/api/orders/checkout/group-buy',
      payload
    )
  },

  /**
   * Lấy trạng thái đơn hàng (dùng cho polling)
   */
  getOrderStatus(orderId: number | string) {
    return apiClient.get<BaseResponse<OrderStatusResponse>>(
      `/api/orders/${orderId}/status`
    )
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getOrderDetails(orderId: number | string) {
    return apiClient.get<BaseResponse<Order>>(`/api/orders/${orderId}`)
  },

  /**
   * Polling để kiểm tra trạng thái thanh toán
   * @param orderId - ID đơn hàng cần kiểm tra
   * @param onStatusChange - Callback khi status thay đổi
   * @param interval - Khoảng thời gian giữa các lần poll (ms), mặc định 3000ms
   * @param maxAttempts - Số lần poll tối đa, mặc định 60 lần (3 phút)
   */
  async pollOrderStatus(
    orderId: number | string,
    onStatusChange: (status: OrderStatusResponse) => void,
    interval: number = 3000,
    maxAttempts: number = 60
  ): Promise<OrderStatusResponse> {
    let attempts = 0

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        attempts++

        console.log(`Polling attempt ${attempts}/${maxAttempts}`)

        // Kiểm tra timeout TRƯỚC khi gọi API
        if (attempts > maxAttempts) {
          clearInterval(pollInterval)
          reject(new Error('Timeout: Không thể xác nhận trạng thái thanh toán'))
          return
        }

        try {
          const response = await this.getOrderStatus(orderId)
          console.log('Polling response:', response)

          // Response có thể là { data: {...} } hoặc trực tiếp là object
          const statusData = (response as any).data || response

          console.log('Status data:', statusData)

          // Nếu statusData không hợp lệ, bỏ qua vòng lặp này
          if (!statusData || !statusData.status) {
            console.warn('Invalid status data, skipping...', statusData)
            return
          }

          // Gọi callback để cập nhật UI
          onStatusChange(statusData)

          // Nếu đã thanh toán thành công hoặc thất bại, dừng polling
          if (
            statusData.status === 'PAID' ||
            statusData.status === 'FAILED' ||
            statusData.status === 'CANCELLED'
          ) {
            clearInterval(pollInterval)
            resolve(statusData)
          }
        } catch (error) {
          console.error('Poll error:', error)
          // Không dừng polling khi gặp lỗi API, chỉ log và tiếp tục
          // clearInterval(pollInterval)
          // reject(error)
        }
      }, interval)
    })
  },
}
