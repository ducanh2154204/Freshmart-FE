// Product types
export interface Product {
  id: number | string
  name: string
  title?: string // Alias for name
  description?: string
  image: string
  images?: string[]
  price: number
  originalPrice?: number
  discount?: number
  brand?: string
  category?: string
  categoryId?: number | string
  rating?: number
  stock?: number
  unit?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductListParams {
  page?: number
  limit?: number
  category?: string | number
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name'
  order?: 'asc' | 'desc'
}

export interface ProductListResponse {
  data: Product[]
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}
