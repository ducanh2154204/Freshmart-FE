import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

// Cấu trúc dữ liệu trả về có thể thay đổi theo BE,
// tạm thời chỉ quan tâm token + user để FE xử lý tiếp.
export interface AuthData {
  accessToken?: string
  token?: string
  user?: unknown
}

export const authService = {
  login(payload: LoginPayload) {
    return apiClient.post<BaseResponse<AuthData>>('/api/auth/login', payload)
  },

  register(payload: RegisterPayload) {
    const body = {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
    }

    return apiClient.post<BaseResponse<AuthData>>('/api/auth/register', body)
  },
}

