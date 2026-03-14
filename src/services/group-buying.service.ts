import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'
import type {
  GroupBuying,
  CreateGroupBuyingPayload,
  GroupBuyingListParams,
  GroupBuyingListResponse,
  JoinGroupBuyingPayload,
} from '@/types/group-buying'

export const groupBuyingService = {
  /**
   * Lấy danh sách group buying (active)
   */
  getGroupBuyings(params?: GroupBuyingListParams) {
    return apiClient.get<BaseResponse<GroupBuyingListResponse>>(
      '/api/group-buys',
      {
        params: params as Record<string, string | number | boolean>,
      }
    )
  },

  /**
   * Lấy group buying của user hiện tại
   */
  getMyGroupBuyings(params?: GroupBuyingListParams) {
    return apiClient.get<BaseResponse<GroupBuyingListResponse>>(
      '/api/group-buys/my-groups',
      {
        params: params as Record<string, string | number | boolean>,
      }
    )
  },

  /**
   * Lấy chi tiết group buying theo ID
   */
  getGroupBuyingById(id: number | string) {
    return apiClient.get<BaseResponse<GroupBuying>>(`/api/group-buys/${id}`)
  },

  /**
   * Tạo group buying mới
   */
  createGroupBuying(payload: CreateGroupBuyingPayload) {
    return apiClient.post<BaseResponse<GroupBuying>>('/api/group-buys', payload)
  },

  /**
   * Cập nhật group buying
   */
  updateGroupBuying(
    id: number | string,
    payload: Partial<CreateGroupBuyingPayload>
  ) {
    return apiClient.put<BaseResponse<GroupBuying>>(
      `/api/group-buys/${id}`,
      payload
    )
  },

  /**
   * Tham gia group buying
   * Backend hiện yêu cầu body:
   * { groupBuyId, quantity, deliveryDetail: { name, phone, address } }
   */
  joinGroupBuying(payload: JoinGroupBuyingPayload | number | string) {
    const body: JoinGroupBuyingPayload =
      typeof payload === 'object'
        ? (payload as JoinGroupBuyingPayload)
        : {
            groupBuyId: payload,
            quantity: 1,
            deliveryDetail: {
              name: '',
              phone: '',
              address: '',
            },
          }

    return apiClient.post<BaseResponse<GroupBuying>>(
      '/api/group-buys/join',
      body
    )
  },

  /**
   * Rời khỏi group buying
   */
  leaveGroupBuying(groupBuyId: number | string) {
    return apiClient.post<BaseResponse<GroupBuying>>('/api/group-buys/leave', {
      groupBuyId,
    })
  },

  /**
   * Lấy group buying đang active (alias cho getGroupBuyings)
   */
  getActiveGroupBuyings(params?: Omit<GroupBuyingListParams, 'status'>) {
    return apiClient.get<BaseResponse<GroupBuyingListResponse>>(
      '/api/group-buys',
      {
        params: {
          ...params,
          status: 'active',
        } as Record<string, string | number | boolean>,
      }
    )
  },
}
