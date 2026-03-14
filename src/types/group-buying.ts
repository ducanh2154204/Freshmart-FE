// Group Buying types
export interface GroupBuying {
  id: number | string
  productId: number | string
  userId?: string | number
  createdBy?: string | number
  product?: {
    id: number | string
    name: string
    image: string
    price: number
    originalPrice?: number
  }
  title?: string
  image?: string
  currentPrice: number
  originalPrice: number
  quantity: number
  targetQuantity?: number
  currentQuantity?: number
  maxParticipants?: number
  currentParticipants?: number
  participants?: any[] | number
  participantsCount?: number
  status?: 'active' | 'completed' | 'cancelled' | 'expired'
  startTime?: string
  endTime?: string
  timeLeft?: string
  deliveryInfo?: string
  deliveryAddress?: string
  deliveryDetail?: {
    name: string
    phone: string
    address: string
  }
  recipientName?: string
  rating?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateGroupBuyingPayload {
  productId: number | string
  discountPrice: number
  targetQuantity: number
  endTime: string // ISO 8601 format
  deliveryDetail: {
    name: string
    phone: string
    address: string
  }
}

export interface JoinGroupBuyingPayload {
  groupBuyId: number | string
  quantity: number
  deliveryDetail: {
    name: string
    phone: string
    address: string
  }
}

export interface GroupBuyingListParams {
  page?: number
  limit?: number
  status?: 'active' | 'completed' | 'cancelled' | 'expired'
  productId?: number | string
}

export interface GroupBuyingListResponse {
  data: GroupBuying[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}
