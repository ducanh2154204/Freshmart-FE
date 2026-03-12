'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { forumService } from '@/services/forum.service'
import type {
  ForumPost as ApiForumPost,
  ForumComment,
  ForumPostsResponse,
} from '@/types/forum'
import type { ApiError } from '@/types/api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useConfirm } from '@/components/ui/confirm'

type JoinStatus = 'open' | 'full' | 'closed'

interface ForumPostUI {
  id: string | number
  author: string
  createdAt: string
  title: string
  content: string
  imageUrls: string[]
  groupBuyId?: number | string | null
  productName: string
  location: string
  minMembers: number
  currentMembers: number
  priceNote?: string
  status: JoinStatus
  tags: string[]
  liked: boolean
  likes: number
  commentsCount: number
}

const ForumPage: React.FC = () => {
  const confirm = useConfirm()
  const [posts, setPosts] = useState<ForumPostUI[]>([])
  const [filterText, setFilterText] = useState('')
  const [form, setForm] = useState({
    title: '',
    content: '',
    productName: '',
    location: '',
    minMembers: '2',
    priceNote: '',
    groupBuyId: '',
  })
  const [images, setImages] = useState<File[]>([])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string | number, ForumComment[]>
  >({})
  const [commentsLoading, setCommentsLoading] = useState<
    Record<string | number, boolean>
  >({})
  const [newComment, setNewComment] = useState<Record<string | number, string>>(
    {}
  )
  const [lightbox, setLightbox] = useState<{
    postId: string | number
    index: number
    images: string[]
  } | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') {
        setLightbox(prev => {
          if (!prev) return prev
          const nextIndex =
            (prev.index - 1 + prev.images.length) % prev.images.length
          return { ...prev, index: nextIndex }
        })
      }
      if (e.key === 'ArrowRight') {
        setLightbox(prev => {
          if (!prev) return prev
          const nextIndex = (prev.index + 1) % prev.images.length
          return { ...prev, index: nextIndex }
        })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightbox])

  const mapApiPostToUI = (post: ApiForumPost): ForumPostUI => {
    const createdAt = post.createdAt || new Date().toISOString()
    const title =
      post.title ||
      (post.content ? post.content.slice(0, 80) : '') ||
      'Bài viết cộng đồng'
    const content = post.content || ''
    const imageUrls = (post.imageUrl || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    return {
      id: post.id,
      author: post.author?.name || post.authorName || 'Thành viên FreshMart',
      createdAt,
      title,
      content,
      imageUrls,
      groupBuyId: post.groupBuyId ?? null,
      productName: post.productName || title,
      location: post.location || 'Không rõ địa điểm',
      minMembers: post.minMembers || 2,
      currentMembers: post.currentMembers || 1,
      priceNote: post.priceNote,
      status: post.status || 'open',
      tags: post.tags || [],
      liked: Boolean(post.isLiked),
      likes: post.likesCount ?? 0,
      commentsCount: post.commentsCount ?? 0,
    }
  }

  const getErrorMessage = (err: unknown, fallback: string) => {
    const e = err as Partial<ApiError> | any
    return (
      (typeof e?.message === 'string' && e.message) ||
      (typeof e?.details?.message === 'string' && e.details.message) ||
      fallback
    )
  }

  const validateBeforeCreate = () => {
    const content = form.content.trim()
    if (!content) return 'Vui lòng nhập nội dung bài viết'

    const groupBuyIdRaw = form.groupBuyId.trim()
    if (groupBuyIdRaw) {
      const n = Number(groupBuyIdRaw)
      if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
        return 'GroupBuyId phải là số nguyên dương'
      }
    }

    const MAX_IMAGE_MB = 8
    for (const file of images) {
      if (!file.type.startsWith('image/')) {
        return 'Chỉ cho phép upload file ảnh'
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        return `Ảnh vượt quá ${MAX_IMAGE_MB}MB`
      }
    }

    return null
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = (await forumService.getPosts({
          page: 1,
          limit: 10,
        })) as ForumPostsResponse

        const mapped = (res.posts || []).map(mapApiPostToUI)
        setPosts(mapped)
      } catch (err) {
        console.error('Error fetching forum posts:', err)
        setError('Không thể tải bài viết. Vui lòng thử lại sau.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateBeforeCreate()
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const composedContent = form.title.trim()
        ? `${form.title.trim()}\n\n${form.content.trim()}`
        : form.content.trim()

      const createdPost = (await forumService.createPost({
        content: composedContent,
        images,
        groupBuyId: form.groupBuyId.trim() || undefined,
      })) as ApiForumPost

      const uiPost = mapApiPostToUI({
        ...createdPost,
        productName: form.productName.trim() || createdPost.productName,
        location: form.location.trim() || createdPost.location,
        minMembers: Number(form.minMembers) || createdPost.minMembers || 2,
        priceNote: form.priceNote.trim() || createdPost.priceNote,
      })

      setPosts(prev => [uiPost, ...prev])
      toast.success('Đăng bài thành công')
      setForm({
        title: '',
        content: '',
        productName: '',
        location: '',
        minMembers: '2',
        priceNote: '',
        groupBuyId: '',
      })
      setImages([])
    } catch (err) {
      console.error('Error creating forum post:', err)
      const msg = getErrorMessage(err, 'Đăng bài thất bại')
      toast.error(msg)
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleLike = async (id: string | number) => {
    try {
      setPosts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
              }
            : p
        )
      )

      const likeRes = await forumService.toggleLike(id)
      setPosts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, liked: likeRes.isLiked, likes: likeRes.likesCount }
            : p
        )
      )
    } catch (err) {
      console.error('Error toggling like:', err)
      toast.error(getErrorMessage(err, 'Không thể thực hiện thao tác like'))
      // Revert optimistic update if needed
      setPosts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                liked: !p.liked,
                likes: p.liked ? Math.max(0, p.likes - 1) : p.likes + 1,
              }
            : p
        )
      )
    }
  }

  const handleDeletePost = async (postId: string | number) => {
    const ok = await confirm({
      title: 'Xóa bài viết?',
      description: 'Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      destructive: true,
    })
    if (!ok) return

    try {
      await forumService.deletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
      toast.success('Đã xóa bài viết')
    } catch (err) {
      console.error('Error deleting post:', err)
      toast.error(getErrorMessage(err, 'Xóa bài viết thất bại'))
    }
  }

  const handleJoin = (id: string | number) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p
        if (p.status !== 'open') return p
        const nextMembers = p.currentMembers + 1
        const status: JoinStatus = nextMembers >= p.minMembers ? 'full' : p.status
        return { ...p, currentMembers: nextMembers, status }
      })
    )
  }

  const handleLoadComments = async (postId: string | number) => {
    if (commentsByPost[postId]) return
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }))
      const res = await forumService.getComments(postId)
      const comments = res.comments ?? []
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: comments,
      }))
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, commentsCount: res.totalItems ?? comments.length }
            : p
        )
      )
    } catch (err) {
      console.error('Error loading comments:', err)
      toast.error(getErrorMessage(err, 'Không thể tải bình luận'))
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleAddComment = async (postId: string | number) => {
    const content = (newComment[postId] || '').trim()
    if (!content) {
      toast.error('Vui lòng nhập nội dung bình luận')
      return
    }
    try {
      const created = await forumService.addComment(postId, content)
      setCommentsByPost(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), created],
      }))
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
        )
      )
      setNewComment(prev => ({ ...prev, [postId]: '' }))
    } catch (err) {
      console.error('Error adding comment:', err)
      toast.error(getErrorMessage(err, 'Gửi bình luận thất bại'))
    }
  }

  const openLightbox = (postId: string | number, images: string[], index: number) => {
    if (!images.length) return
    setLightbox({ postId, images, index })
  }

  const filteredPosts = useMemo(() => {
    if (!filterText.trim()) return posts
    const q = filterText.toLowerCase()
    return posts.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    )
  }, [posts, filterText])

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  return (
    <>
      <Header />
      <ToastContainer position="top-right" autoClose={2500} />
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-10 right-0 text-white/90 hover:text-white text-sm"
              onClick={() => setLightbox(null)}
            >
              Đóng (Esc)
            </button>

            <div className="relative rounded-2xl overflow-hidden bg-black">
              <img
                src={lightbox.images[lightbox.index]}
                alt={`Ảnh ${lightbox.index + 1}`}
                className="w-full max-h-[78vh] object-contain bg-black"
              />

              {lightbox.images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                    onClick={() =>
                      setLightbox(prev => {
                        if (!prev) return prev
                        const nextIndex =
                          (prev.index - 1 + prev.images.length) %
                          prev.images.length
                        return { ...prev, index: nextIndex }
                      })
                    }
                    aria-label="Ảnh trước"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                    onClick={() =>
                      setLightbox(prev => {
                        if (!prev) return prev
                        const nextIndex = (prev.index + 1) % prev.images.length
                        return { ...prev, index: nextIndex }
                      })
                    }
                    aria-label="Ảnh kế"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="absolute left-3 bottom-3 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">
                {lightbox.index + 1}/{lightbox.images.length}
              </div>
            </div>

            {lightbox.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {lightbox.images.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    type="button"
                    className={`h-14 w-14 rounded-lg overflow-hidden border ${
                      i === lightbox.index
                        ? 'border-white'
                        : 'border-white/25'
                    }`}
                    onClick={() =>
                      setLightbox(prev => (prev ? { ...prev, index: i } : prev))
                    }
                    aria-label={`Xem ảnh ${i + 1}`}
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <main className="min-h-screen bg-gradient-to-b from-green-50/60 to-gray-100 pb-12">
        <section className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Nhóm chat FreshMart
          </h1>
          <p className="text-gray-600 text-sm">
            Chia sẻ đơn mua chung, hỏi đáp kinh nghiệm mua sắm và kết nối với
            mọi người.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 mt-6 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Bảng tin nhóm
                </h2>
                <p className="text-xs text-gray-500">
                  Đăng bài mới, hỏi đáp, rủ mọi người mua chung.
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                {posts.length} bài viết
              </span>
            </div>

            {error && (
              <div className="px-4 py-3 border-b border-gray-100 bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form
              className="px-4 pt-4 pb-3 space-y-3 border-b border-gray-100"
              onSubmit={handleCreatePost}
            >
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  B
                </div>
                <div className="flex-1">
                  <Input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Chia sẻ với nhóm của bạn..."
                    className="text-sm"
                  />
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={3}
                    className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="Mô tả chi tiết đơn mua chung, địa điểm, thời gian chốt đơn..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <Input
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="Sản phẩm muốn mua chung"
                  className="text-xs"
                />
                <Input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Khu vực nhận hàng"
                  className="text-xs"
                />
                <div className="flex gap-2">
                  <Input
                    name="minMembers"
                    type="number"
                    min={2}
                    value={form.minMembers}
                    onChange={handleChange}
                    placeholder="Số người tối thiểu"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <Input
                  name="groupBuyId"
                  value={form.groupBuyId}
                  onChange={handleChange}
                  placeholder="GroupBuyId (tuỳ chọn)"
                  className="text-xs"
                />
                <div className="sm:col-span-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full text-xs"
                    onChange={e =>
                      setImages(Array.from(e.target.files || []))
                    }
                  />
                  {images.length > 0 && (
                    <div className="mt-1 text-[11px] text-gray-500">
                      Đã chọn {images.length} ảnh
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="text-[11px]">
                    {submitting ? 'Đang đăng...' : loading ? 'Đang tải...' : ''}
                  </span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-sm"
                  disabled={submitting}
                >
                  Đăng bài
                </Button>
              </div>
            </form>

            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <Input
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Tìm trong nhóm theo sản phẩm, khu vực, nội dung..."
                className="h-9 text-xs"
              />
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  Đang tải bài viết...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ với nhóm!
                </div>
              ) : (
                filteredPosts.map(post => (
                  <article
                    key={post.id}
                    className="px-4 py-4 flex flex-col gap-3 bg-white/60"
                  >
                    <header className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {post.author}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(post.createdAt)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          post.status === 'open'
                            ? 'bg-green-50 text-green-700'
                            : post.status === 'full'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {post.status === 'open'
                          ? 'Đang tìm người'
                          : post.status === 'full'
                          ? 'Đã đủ người'
                          : 'Đã đóng'}
                      </span>
                    </header>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {post.imageUrls.length > 0 && (
                      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                        <div
                          className={`grid gap-px bg-gray-100 ${
                            post.imageUrls.length === 1
                              ? 'grid-cols-1'
                              : 'grid-cols-2'
                          }`}
                        >
                          {post.imageUrls
                            .slice(0, 4)
                            .map((url, idx, arr) => {
                              const isLastTile =
                                idx === 3 && post.imageUrls.length > 4
                              const extraCount = post.imageUrls.length - 4
                              const isSingle = post.imageUrls.length === 1
                              const isFirstAndOdd =
                                post.imageUrls.length === 3 && idx === 0

                              return (
                                <div
                                  key={`${url}-${idx}`}
                                  className={`relative bg-white ${
                                    isSingle
                                      ? 'aspect-[16/9]'
                                      : isFirstAndOdd
                                      ? 'col-span-2 aspect-[16/9]'
                                      : 'aspect-square'
                                  }`}
                                >
                                  <img
                                    src={url}
                                    alt={`Ảnh bài viết ${idx + 1}`}
                                    className="absolute inset-0 h-full w-full object-cover cursor-zoom-in"
                                    loading="lazy"
                                    onClick={() =>
                                      openLightbox(post.id, post.imageUrls, idx)
                                    }
                                  />
                                  {isLastTile && (
                                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                      <span className="text-white font-semibold text-sm">
                                        +{extraCount}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                        {post.imageUrls.length > 1 && (
                          <div className="px-3 py-2 text-[11px] text-gray-500 border-t border-gray-100 bg-gray-50">
                            {post.imageUrls.length} ảnh
                          </div>
                        )}
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 space-y-1">
                      <div>
                        <span className="font-medium">Sản phẩm:</span>{' '}
                        {post.productName}
                      </div>
                      <div>
                        <span className="font-medium">Khu vực:</span>{' '}
                        {post.location}
                      </div>
                      <div>
                        <span className="font-medium">Thành viên:</span>{' '}
                        {post.currentMembers}/{post.minMembers} người
                      </div>
                      {post.priceNote && (
                        <div>
                          <span className="font-medium">Giá dự kiến:</span>{' '}
                          {post.priceNote}
                        </div>
                      )}
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags
                          .filter(Boolean)
                          .map(tag => (
                            <span
                              key={tag}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="pt-1 border-t border-gray-100 mt-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-xs text-gray-600">
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post.id)}
                            className="flex items-center gap-1 hover:text-green-600"
                          >
                            <svg
                              className={`w-4 h-4 ${
                                post.liked ? 'text-green-500' : 'text-gray-400'
                              }`}
                              fill={post.liked ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            <span>
                              Thích
                              {post.likes > 0 ? ` • ${post.likes}` : ''}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLoadComments(post.id)}
                            className="flex items-center gap-1 hover:text-green-600"
                          >
                            <span>
                              Bình luận
                              {post.commentsCount > 0
                                ? ` • ${post.commentsCount}`
                                : ''}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <span>Xóa</span>
                          </button>
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg"
                          disabled={post.status !== 'open'}
                          onClick={() => handleJoin(post.id)}
                        >
                          {post.status === 'open'
                            ? 'Tham gia nhóm'
                            : post.status === 'full'
                            ? 'Đã đủ người'
                            : 'Đã đóng'}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {commentsLoading[post.id] && (
                          <div className="text-[11px] text-gray-500">
                            Đang tải bình luận...
                          </div>
                        )}
                        {commentsByPost[post.id]?.length ? (
                          <div className="space-y-1">
                            {commentsByPost[post.id].map(c => (
                              <div
                                key={c.id}
                                className="flex items-start gap-2 text-[11px] text-gray-700"
                              >
                                <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center text-[10px] font-semibold text-green-700">
                                  {(c.author?.name || 'A').charAt(0)}
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-1.5">
                                  <div className="font-medium text-gray-900">
                                    {c.author?.name || 'Thành viên'}
                                  </div>
                                  <div>{c.content}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Viết bình luận..."
                            className="flex-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                            value={newComment[post.id] || ''}
                            onChange={e =>
                              setNewComment(prev => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onFocus={() => {
                              if (!commentsByPost[post.id]) {
                                handleLoadComments(post.id)
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="text-[11px] text-green-600 font-semibold hover:text-green-700"
                          >
                            Gửi
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              Tin mới nhất
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Các bài đăng gần đây giúp bạn không bỏ lỡ đơn mua chung nào.
            </p>
            <div className="space-y-3">
              {posts.map(post => (
                <div
                  key={post.id}
                  className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold truncate">
                      {post.productName || post.title}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {formatTime(post.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    {post.content}
                  </p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                    <span>
                      {post.currentMembers}/{post.minMembers} người
                    </span>
                    <button
                      type="button"
                      onClick={() => handleJoin(post.id)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Tham gia
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
      </main>
      <Footer />
    </>
  )
}

export default ForumPage

