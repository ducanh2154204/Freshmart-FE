import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'

export interface DashboardOrder {
  id: string
  userId: string
  totalAmount: string
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED'
  type: 'REGULAR' | 'GROUP_BUY'
  groupBuyId?: number
  paymentMethod: string
  qrCode?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
  }
  items: any[]
  groupBuy?: any
}

export interface DashboardOrdersResponse {
  total: number
  page: number
  limit: number
  totalPages: number
  data: DashboardOrder[]
}

export interface AccessStats {
  liveUsers: {
    liveWindowMinutes: number
    total: number
    authenticated: number
    guest: number
  }
  accesses: {
    today: number
    week: number
    month: number
  }
  generatedAt: string
}

export interface Vendor {
  id: number
  storeName: string
  slug: string
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
  description?: string
  logoUrl?: string
  userId: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface VendorsResponse {
  total: number
  page: number
  limit: number
  totalPages: number
  data: Vendor[]
}

export const dashboardService = {
  /**
   * Get all orders with full details (admin only)
   */
  getOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    type?: string
  ) {
    return apiClient.get<BaseResponse<DashboardOrdersResponse>>(
      '/api/dashboard/orders',
      {
        params: {
          page,
          limit,
          ...(status && { status }),
          ...(type && { type }),
        },
      }
    )
  },

  /**
   * Get access statistics (admin only)
   */
  getAccessStats() {
    return apiClient.get<BaseResponse<AccessStats>>(
      '/api/dashboard/access/stats'
    )
  },

  /**
   * Get all vendors (admin only)
   */
  getVendors(page: number = 1, limit: number = 20) {
    return apiClient.get<BaseResponse<VendorsResponse>>(
      '/api/dashboard/vendors',
      {
        params: { page, limit },
      }
    )
  },

  /**
   * Get single vendor details (admin only)
   */
  getVendorDetails(vendorId: number | string) {
    return apiClient.get<BaseResponse<Vendor>>(
      `/api/dashboard/vendors/${vendorId}`
    )
  },

  /**
   * Update vendor status (admin only)
   */
  updateVendorStatus(
    vendorId: number | string,
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
  ) {
    return apiClient.patch<BaseResponse<Vendor>>(
      `/api/dashboard/vendors/${vendorId}/status`,
      { status }
    )
  },
}
