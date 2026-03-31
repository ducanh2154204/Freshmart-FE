import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'
import type { Product } from '@/types/product'

export interface VendorRegisterPayload {
  storeName: string
  slug: string
  description?: string
  bankAccountDetails: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

export interface VendorOwner {
  name?: string
  email?: string
}

export interface VendorProfile {
  id?: string | number
  userId?: string
  storeName?: string
  name?: string
  slug?: string
  description?: string
  logoUrl?: string | null
  status?: string
  commissionRate?: string | number
  bankAccountDetails?: {
    bankName?: string
    accountNumber?: string
    accountName?: string
  }
  owner?: VendorOwner
  createdAt?: string
  updatedAt?: string
}

export interface VendorProduct extends Product {
  vendorId?: string | number
}

export interface CreateProductPayload {
  name: string
  description?: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category?: string | number
  stock?: number
  unit?: string
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface VendorOrder {
  id: string | number
  orderId: string | number
  vendorId?: string | number
  customerId?: string | number
  totalAmount: number
  status: string
  items?: Array<{
    productId: string | number
    productName: string
    quantity: number
    price: number
  }>
  createdAt?: string
  updatedAt?: string
}

export interface VendorOrdersResponse {
  data: VendorOrder[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface UpdateOrderStatusPayload {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

export const vendorService = {
  // Vendor profile
  getMyVendor() {
    return apiClient.get<VendorProfile>('/api/vendors/me')
  },

  register(payload: VendorRegisterPayload) {
    return apiClient.post<VendorProfile>('/api/vendors/register', payload)
  },

  // Vendor products
  getVendorProducts(params?: { page?: number; limit?: number }) {
    return apiClient.get<BaseResponse<VendorProduct[]>>(
      '/api/vendors/products',
      {
        params,
      }
    )
  },

  createProduct(payload: CreateProductPayload) {
    return apiClient.post<BaseResponse<VendorProduct>>('/api/products', payload)
  },

  updateProduct(id: string | number, payload: UpdateProductPayload) {
    return apiClient.put<BaseResponse<VendorProduct>>(
      `/api/vendors/products/${id}`,
      payload
    )
  },

  deleteProduct(id: string | number) {
    return apiClient.delete<BaseResponse<void>>(`/api/vendors/products/${id}`)
  },

  // Vendor orders
  getVendorOrders(params?: { page?: number; limit?: number; status?: string }) {
    return apiClient.get<BaseResponse<VendorOrdersResponse>>(
      '/api/vendors/orders',
      {
        params,
      }
    )
  },

  updateOrderStatus(
    vendorOrderId: string | number,
    payload: UpdateOrderStatusPayload
  ) {
    return apiClient.put<BaseResponse<VendorOrder>>(
      `/api/orders/${vendorOrderId}/status`,
      payload
    )
  },
}
