// Common types used across the application

export interface BaseResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

