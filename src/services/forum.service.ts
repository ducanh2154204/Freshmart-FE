import { apiClient } from '@/lib/api-client'
import type {
  ForumPost,
  CreateForumPostPayload,
  ForumComment,
  ForumCommentsResponse,
  ForumPostsResponse,
  ToggleLikeResponse,
  DeletePostResponse,
} from '@/types/forum'

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
    formData.append('content', payload.content)

    if (payload.groupBuyId !== undefined && payload.groupBuyId !== null && payload.groupBuyId !== '') {
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
    return apiClient.get<ForumCommentsResponse>(
      `/api/posts/${postId}/comments`
    )
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

