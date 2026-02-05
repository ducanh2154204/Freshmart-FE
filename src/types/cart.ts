// Cart types
export interface CartItem {
  id: number | string
  productId: number | string
  product?: {
    id: number | string
    name: string
    image: string
    price: number
    stock?: number
  }
  quantity: number
  price: number
  totalPrice: number
  createdAt?: string
  updatedAt?: string
}

export interface Cart {
  id: number | string
  userId: number | string
  items: CartItem[]
  totalItems: number
  totalPrice: number
  createdAt?: string
  updatedAt?: string
}

export interface AddToCartPayload {
  productId: number | string
  quantity: number
}

export interface UpdateCartPayload {
  quantity: number
}
