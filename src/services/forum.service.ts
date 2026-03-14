import { apiClient } from '@/lib/api-client'
import type {
  ForumPost,
  CreateForumPostPayload,
  ForumComment,
  ForumCommentsResponse,
  ForumPostsResponse,
  ToggleLikeResponse,
  DeletePostResponse,
  ForumPostMetadata,
} from '@/types/forum'

const FORUM_META_OPEN = '[freshmart-meta]'
const FORUM_META_CLOSE = '[/freshmart-meta]'
const FORUM_META_BLOCK_REGEX =
  /^\[freshmart-meta\]\n([\s\S]*?)\n\[\/freshmart-meta\]\n*/

const trimText = (value?: string | null) => value?.trim() || undefined

const sanitizeMinMembers = (value?: number) => {
  if (!Number.isFinite(value)) return undefined
  const normalized = Math.trunc(Number(value))
  return normalized > 0 ? normalized : undefined
}

const buildMetadata = (
  payload: Pick<
    CreateForumPostPayload,
    'title' | 'productName' | 'location' | 'minMembers' | 'priceNote'
  >
): ForumPostMetadata => {
  const metadata: ForumPostMetadata = {
    title: trimText(payload.title),
    productName: trimText(payload.productName),
    location: trimText(payload.location),
    minMembers: sanitizeMinMembers(payload.minMembers),
    priceNote: trimText(payload.priceNote),
  }

  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined)
  ) as ForumPostMetadata
}

export const serializeForumPostContent = (
  payload: Pick<
    CreateForumPostPayload,
    | 'content'
    | 'title'
    | 'productName'
    | 'location'
    | 'minMembers'
    | 'priceNote'
  >
) => {
  const content = payload.content.trim()
  const metadata = buildMetadata(payload)

  if (!Object.keys(metadata).length) {
    return content
  }

  return `${FORUM_META_OPEN}\n${JSON.stringify(metadata)}\n${FORUM_META_CLOSE}\n${content}`
}

export const parseForumPostContent = (rawContent?: string | null) => {
  const content = rawContent || ''
  const match = content.match(FORUM_META_BLOCK_REGEX)

  if (!match) {
    return {
      content: content.trim(),
      metadata: {} as ForumPostMetadata,
    }
  }

  try {
    const parsed = JSON.parse(match[1]) as ForumPostMetadata
    return {
      content: content.replace(FORUM_META_BLOCK_REGEX, '').trim(),
      metadata: buildMetadata(parsed),
    }
  } catch {
    return {
      content: content.trim(),
      metadata: {} as ForumPostMetadata,
    }
  }
}

export const forumService = {
  /**
   * Lấy danh sách tất cả bài viết (feed)
   */
  getPosts(params?: { page?: number; limit?: number }) {
    return apiClient.get<ForumPostsResponse>('/api/posts', {
      params: params as Record<string, string | number | boolean>,
    })
  },

  /**
   * Tạo bài viết mới
   */
  createPost(payload: CreateForumPostPayload) {
    const formData = new FormData()
    formData.append('content', serializeForumPostContent(payload))

    if (
      payload.groupBuyId !== undefined &&
      payload.groupBuyId !== null &&
      payload.groupBuyId !== ''
    ) {
      formData.append('groupBuyId', String(payload.groupBuyId))
    }

    if (payload.images?.length) {
      payload.images.forEach(file => {
        formData.append('images', file)
      })
    }

    return apiClient.post<ForumPost>('/api/posts', formData)
  },

  /**
   * Lấy chi tiết một bài viết
   */
  getPostDetail(id: number | string) {
    return apiClient.get<ForumPost>(`/api/posts/${id}`)
  },

  /**
   * Xóa bài viết
   */
  deletePost(id: number | string) {
    return apiClient.delete<DeletePostResponse>(`/api/posts/${id}`)
  },

  /**
   * Toggle like cho một bài viết
   */
  toggleLike(id: number | string) {
    return apiClient.post<ToggleLikeResponse>(`/api/posts/${id}/like`)
  },

  /**
   * Lấy danh sách bình luận của bài viết
   */
  getComments(postId: number | string) {
    return apiClient.get<ForumCommentsResponse>(`/api/posts/${postId}/comments`)
  },

  /**
   * Thêm bình luận cho bài viết
   */
  addComment(postId: number | string, content: string) {
    return apiClient.post<ForumComment>(`/api/posts/${postId}/comments`, {
      content,
    })
  },
}
