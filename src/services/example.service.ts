// Example service - replace with your actual services
import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'

// Example: User service
export const exampleService = {
  // Example method
  async getData(): Promise<BaseResponse<unknown>> {
    return apiClient.get<BaseResponse<unknown>>('/api/example')
  },
}

