import type { RequestConfig, ApiError } from '@/types/api'

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fresh-mart-be.onrender.com'

class ApiClient {
  private baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || DEFAULT_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', headers = {}, body, params } = config
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData

    // Build URL with query params
    const url = new URL(endpoint, this.baseURL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    // Default headers
    // - With FormData: let browser set multipart boundary automatically
    const defaultHeaders: Record<string, string> = isFormData
      ? {}
      : {
          'Content-Type': 'application/json',
        }

    // Merge headers
    const mergedHeaders: Record<string, string> = { ...defaultHeaders, ...headers }

    // Auto-attach access token (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const token = window.localStorage.getItem('accessToken')
        const hasAuthHeader = Object.keys(mergedHeaders).some(
          k => k.toLowerCase() === 'authorization'
        )
        if (token && !hasAuthHeader) {
          mergedHeaders.Authorization = `Bearer ${token}`
        }
      } catch {
        // ignore localStorage errors
      }
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: mergedHeaders,
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      fetchOptions.body = isFormData ? (body as FormData) : JSON.stringify(body)
    }

    try {
      const response = await fetch(url.toString(), fetchOptions)

      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      const parseBody = async () => {
        if (response.status === 204) return null
        if (isJson) {
          try {
            return await response.json()
          } catch {
            return null
          }
        }
        try {
          return await response.text()
        } catch {
          return null
        }
      }

      const data = await parseBody()

      if (!response.ok) {
        const errObj = (data && typeof data === 'object') ? (data as any) : null
        const error: ApiError = {
          status: response.status,
          message:
            (errObj?.message as string) ||
            (typeof data === 'string' ? data : '') ||
            `HTTP error! status: ${response.status}`,
          code: errObj?.code,
          details: data,
        }
        throw error
      }

      return data as T
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in (error as any)) {
        throw error as ApiError
      }
      if (error instanceof Error) {
        throw { message: error.message } as ApiError
      }
      throw { message: 'Có lỗi xảy ra' } as ApiError
    }
  }

  async get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }

