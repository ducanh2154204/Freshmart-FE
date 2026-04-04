import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'

export interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
}

export const userService = {
  // Get current user profile
  getMe() {
    return apiClient.get<UserProfile>('/api/users/me')
  },

  // Update user profile (supports FormData for avatar upload)
  updateMe(payload: UpdateUserPayload | FormData) {
    return apiClient.patch<UserProfile>('/api/users/me', payload)
  },
}
