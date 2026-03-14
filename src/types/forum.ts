// Forum / Community posts types
export interface ForumPost {
  id: number | string
  content: string
  createdAt: string
  updatedAt?: string

  // Fields from backend (Swagger sample)
  userId?: string
  imageUrl?: string | null
  groupBuyId?: number | string | null
  likesCount?: number
  commentsCount?: number
  author?: {
    id: string
    name: string
    email?: string
  }
  groupBuy?: unknown | null

  // Optional fields depending on backend implementation
  title?: string
  authorName?: string
  authorId?: number | string
  isLiked?: boolean
  tags?: string[]

  // UI-only metadata (not guaranteed to exist on backend)
  productName?: string
  location?: string
  minMembers?: number
  currentMembers?: number
  priceNote?: string
  status?: 'open' | 'full' | 'closed'
}

export interface ForumPostMetadata {
  title?: string
  productName?: string
  location?: string
  minMembers?: number
  priceNote?: string
}

export interface CreateForumPostPayload {
  content: string
  images?: File[]
  groupBuyId?: number | string
  title?: string
  productName?: string
  location?: string
  minMembers?: number
  priceNote?: string
}

export interface ForumComment {
  id: number | string
  postId: number | string
  content: string
  createdAt: string
  updatedAt?: string
  userId?: string
  author?: {
    id: string
    name: string
  }
}

export interface ForumCommentsResponse {
  totalItems: number
  comments: ForumComment[]
}

export interface ForumPostsResponse {
  totalItems: number
  totalPages: number
  currentPage: number
  posts: ForumPost[]
}

export interface ToggleLikeResponse {
  message: string
  isLiked: boolean
  likesCount: number
}

export interface DeletePostResponse {
  message: string
}
