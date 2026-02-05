// Order types
export interface Order {
  id: number | string
  userId: number | string
  orderNumber?: string
  type: 'single' | 'group-buy'
  groupBuyId?: number | string
  items: OrderItem[]
  totalAmount: number
  discount?: number
  finalAmount: number
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'E_WALLET'
  paymentStatus: OrderStatus
  status: OrderStatus
  qrCode?: string
  qrCodeUrl?: string
  bankInfo?: BankInfo
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number | string
  productId: number | string
  product?: {
    id: number | string
    name: string
    image: string
    price: number
  }
  quantity: number
  price: number
  totalPrice: number
}

export interface BankInfo {
  bankName?: string
  accountNumber?: string
  accountName?: string
  amount?: number
  content?: string
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'

export interface CheckoutCartPayload {
  paymentMethod: 'COD' | 'BANK_TRANSFER' | 'E_WALLET'
  note?: string
  shippingAddress?: string
}

export interface CheckoutGroupBuyPayload {
  groupBuyId: number
}

export interface OrderStatusResponse {
  orderId: number | string
  status: OrderStatus
  paymentStatus: OrderStatus
  updatedAt: string
}
