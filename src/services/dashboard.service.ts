import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'

export interface DashboardOrder {
  id: string
  userId: string
  totalAmount: string
  status: 'PAID' | 'PENDING' | 'CANCELLED'
  type: 'STANDARD' | 'GROUP_BUY'
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
  revenue: {
    gross: number
    paid: number
    page: number
  }
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

export interface ExportResponse {
  format: string
  url: string
  generatedAt: string
}

export const dashboardService = {
  /**
   * Get all orders with full details (admin only)
   *
   * Revenue breakdown:
   * - gross: Tổng doanh thu theo bộ lọc
   * - paid: Doanh thu đã thanh toán thực tế
   * - page: Doanh thu của riêng trang admin đang xem
   */
  getOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    type?: string,
    exportFormat?: string
  ) {
    return apiClient.get<
      BaseResponse<DashboardOrdersResponse | ExportResponse>
    >('/api/dashboard/orders', {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(type && { type }),
        ...(exportFormat && { export: exportFormat }),
      },
    })
  },

  /**
   * Export orders to PDF file (admin only)
   */
  exportOrders(format: 'pdf' | 'xlsx' = 'pdf') {
    return apiClient.get<BaseResponse<ExportResponse>>(
      '/api/dashboard/orders',
      {
        params: {
          export: format,
        },
      }
    )
  },

  /**
   * Download orders as file (PDF or Excel)
   * API returns export URL in the response when export parameter is provided
   */
  async downloadOrdersFile(
    format: 'pdf' | 'xlsx' = 'pdf'
  ): Promise<Blob | string> {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null
    const baseURL = 'https://fresh-mart-be.onrender.com'
    const url = new URL('/api/dashboard/orders', baseURL)
    url.searchParams.append('export', format)

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    })

    console.log('Export response status:', response.status)
    console.log('Export response headers:', {
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Export error response:', text)
      throw new Error(`Failed to download file: ${response.status} - ${text}`)
    }

    // Check if response is JSON (API returns export URL)
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      try {
        const jsonData = await response.json()
        console.log('Export JSON response:', jsonData)

        // Check various possible response structures for export URL
        let exportUrl: string | null = null

        if (jsonData?.export?.url) {
          exportUrl = jsonData.export.url
          console.log('Found export URL at export.url')
        } else if (jsonData?.data?.export?.url) {
          exportUrl = jsonData.data.export.url
          console.log('Found export URL at data.export.url')
        } else if (jsonData?.url) {
          exportUrl = jsonData.url
          console.log('Found export URL at url')
        }

        if (exportUrl) {
          return exportUrl
        }

        // If no export URL found, response might be the orders list
        throw new Error(
          'API returned JSON but no export URL found. API may not have completed export generation yet.'
        )
      } catch (e: any) {
        console.error('Error parsing JSON response:', e)
        throw new Error(`Failed to parse export response: ${e.message}`)
      }
    }

    // Response is binary file (PDF/Excel)
    const blob = await response.blob()
    console.log('Blob size:', blob.size, 'Blob type:', blob.type)

    // Validate blob is not empty
    if (blob.size === 0) {
      throw new Error('Export file is empty')
    }

    return blob
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
