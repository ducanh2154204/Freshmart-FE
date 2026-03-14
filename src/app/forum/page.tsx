'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { forumService, parseForumPostContent } from '@/services/forum.service'
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

const MAX_POST_IMAGES = 8
const MAX_IMAGE_MB = 8

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
  const fileInputRef = useRef<HTMLInputElement | null>(null)
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
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])

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
  const [activePostId, setActivePostId] = useState<string | number | null>(null)

  useEffect(() => {
    if (!lightbox && !activePostId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox) {
          setLightbox(null)
          return
        }
        setActivePostId(null)
      }

      if (e.key === 'ArrowLeft' && lightbox) {
        setLightbox(prev => {
          if (!prev) return prev
          const nextIndex =
            (prev.index - 1 + prev.images.length) % prev.images.length
          return { ...prev, index: nextIndex }
        })
      }
      if (e.key === 'ArrowRight' && lightbox) {
        setLightbox(prev => {
          if (!prev) return prev
          const nextIndex = (prev.index + 1) % prev.images.length
          return { ...prev, index: nextIndex }
        })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activePostId, lightbox])

  useEffect(() => {
    const nextPreviewUrls = images.map(file => URL.createObjectURL(file))
    setImagePreviewUrls(nextPreviewUrls)

    return () => {
      nextPreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [images])

  const mapApiPostToUI = (post: ApiForumPost): ForumPostUI => {
    const parsedPost = parseForumPostContent(post.content)
    const normalizedContent = parsedPost.content
    const paragraphs = normalizedContent
      .split(/\n+/)
      .map(part => part.trim())
      .filter(Boolean)
    const createdAt = post.createdAt || new Date().toISOString()
    const titleFromContent =
      paragraphs.length > 1 ? paragraphs[0] : normalizedContent.slice(0, 80)
    const title =
      post.title ||
      parsedPost.metadata.title ||
      titleFromContent ||
      'Bài viết cộng đồng'
    const content =
      paragraphs.length > 1 && !parsedPost.metadata.title
        ? paragraphs.slice(1).join('\n\n')
        : normalizedContent
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
      productName: parsedPost.metadata.productName || post.productName || title,
      location:
        parsedPost.metadata.location || post.location || 'Không rõ địa điểm',
      minMembers: parsedPost.metadata.minMembers || post.minMembers || 2,
      currentMembers: post.currentMembers || 1,
      priceNote: parsedPost.metadata.priceNote || post.priceNote,
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

    if (images.length > MAX_POST_IMAGES) {
      return `Tối đa ${MAX_POST_IMAGES} ảnh cho mỗi bài viết`
    }

    const groupBuyIdRaw = form.groupBuyId.trim()
    if (groupBuyIdRaw) {
      const n = Number(groupBuyIdRaw)
      if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) {
        return 'GroupBuyId phải là số nguyên dương'
      }
    }

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

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    setImages(prev => {
      const nextImages = [...prev, ...selectedFiles].slice(0, MAX_POST_IMAGES)
      if (prev.length + selectedFiles.length > MAX_POST_IMAGES) {
        toast.info(`Chỉ giữ lại ${MAX_POST_IMAGES} ảnh đầu tiên`)
      }
      return nextImages
    })

    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, imageIndex) => imageIndex !== index))
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

      const createdPost = (await forumService.createPost({
        content: form.content.trim(),
        images,
        groupBuyId: form.groupBuyId.trim() || undefined,
        title: form.title.trim() || undefined,
        productName: form.productName.trim() || undefined,
        location: form.location.trim() || undefined,
        minMembers: Number(form.minMembers) || undefined,
        priceNote: form.priceNote.trim() || undefined,
      })) as ApiForumPost

      const uiPost = mapApiPostToUI(createdPost)

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
        const status: JoinStatus =
          nextMembers >= p.minMembers ? 'full' : p.status
        return { ...p, currentMembers: nextMembers, status }
      })
    )
  }

  const handleOpenComments = async (postId: string | number) => {
    setActivePostId(postId)
    await handleLoadComments(postId)
  }

  const handleSharePost = async (postId: string | number) => {
    const fallbackMessage = 'Đã sao chép liên kết bài viết'
    try {
      if (typeof window === 'undefined') {
        toast.success(fallbackMessage)
        return
      }

      const shareUrl = `${window.location.origin}/forum#post-${postId}`
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        toast.success(fallbackMessage)
        return
      }

      toast.info(
        'Thiết bị không hỗ trợ copy tự động. Vui lòng sao chép thủ công.'
      )
    } catch {
      toast.error('Không thể sao chép liên kết bài viết')
    }
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

  const openLightbox = (
    postId: string | number,
    images: string[],
    index: number
  ) => {
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

  const activePost = useMemo(
    () => posts.find(post => post.id === activePostId) || null,
    [activePostId, posts]
  )

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    })
  }

  const activePostComments = activePost
    ? commentsByPost[activePost.id] || []
    : []

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
                      i === lightbox.index ? 'border-white' : 'border-white/25'
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
      {activePost && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePostId(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)] lg:grid lg:grid-cols-[1.25fr,0.95fr]"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/10 text-lg text-slate-700 transition hover:bg-black/15"
              onClick={() => setActivePostId(null)}
              aria-label="Đóng popup bài viết"
            >
              ×
            </button>

            <div className="overflow-y-auto bg-[linear-gradient(160deg,#f5fff7_0%,#eef2ff_45%,#ffffff_100%)] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                  {activePost.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {activePost.author}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatTime(activePost.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                    {activePost.title}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                    {activePost.content}
                  </p>
                </div>

                {activePost.imageUrls.length > 0 && (
                  <div className="rounded-[26px] border border-white/80 bg-white/80 p-3 shadow-sm">
                    <button
                      type="button"
                      className="relative block aspect-[4/3] w-full overflow-hidden rounded-[22px] bg-slate-100"
                      onClick={() =>
                        openLightbox(activePost.id, activePost.imageUrls, 0)
                      }
                    >
                      <img
                        src={activePost.imageUrls[0]}
                        alt={activePost.title}
                        className="h-full w-full object-cover"
                      />
                    </button>

                    {activePost.imageUrls.length > 1 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {activePost.imageUrls.slice(1, 5).map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                            onClick={() =>
                              openLightbox(
                                activePost.id,
                                activePost.imageUrls,
                                index + 1
                              )
                            }
                          >
                            <img
                              src={url}
                              alt={`Ảnh bài viết ${index + 2}`}
                              className="h-full w-full object-cover"
                            />
                            {index === 3 && activePost.imageUrls.length > 5 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 text-sm font-semibold text-white">
                                +{activePost.imageUrls.length - 5}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-3 rounded-[26px] border border-slate-200 bg-white/85 p-4 text-sm text-slate-700 sm:grid-cols-2">
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Sản phẩm
                    </span>
                    <span className="mt-1 block font-medium text-slate-900">
                      {activePost.productName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Khu vực
                    </span>
                    <span className="mt-1 block font-medium text-slate-900">
                      {activePost.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Thành viên
                    </span>
                    <span className="mt-1 block font-medium text-slate-900">
                      {activePost.currentMembers}/{activePost.minMembers} nguoi
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Giá dự kiến
                    </span>
                    <span className="mt-1 block font-medium text-slate-900">
                      {activePost.priceNote || 'Đang cập nhật'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-slate-950">
                      Bình luận bài viết
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {activePost.likes} lượt thích • {activePost.commentsCount}{' '}
                      bình luận
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                {commentsLoading[activePost.id] ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Đang tải bình luận...
                  </div>
                ) : activePostComments.length > 0 ? (
                  <div className="space-y-4">
                    {activePostComments.map(comment => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                          {(comment.author?.name || 'A')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 rounded-[22px] bg-slate-100 px-4 py-3">
                          <div className="text-sm font-semibold text-slate-900">
                            {comment.author?.name || 'Thành viên'}
                          </div>
                          <div className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">
                            {comment.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm text-slate-500">
                    Chưa có bình luận nào. Hãy mở đầu cuộc trò chuyện.
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 px-5 py-4 sm:px-6">
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    {activePost.author.charAt(0).toUpperCase()}
                  </span>
                  Đang tham gia thảo luận với bài viết này
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Viết bình luận công khai..."
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newComment[activePost.id] || ''}
                    onChange={e =>
                      setNewComment(prev => ({
                        ...prev,
                        [activePost.id]: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full bg-emerald-500 px-4 py-3 text-white hover:bg-emerald-600"
                    onClick={() => handleAddComment(activePost.id)}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </div>
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
                className="border-b border-gray-100 px-4 pb-4 pt-4"
                onSubmit={handleCreatePost}
              >
                <div className="space-y-4 rounded-[28px] border border-emerald-100 bg-[linear-gradient(145deg,#fbfffb_0%,#f4fff7_42%,#f7fafc_100%)] p-4 shadow-[0_16px_40px_rgba(34,197,94,0.08)] sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700 shadow-sm">
                      B
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            Đăng bài mới cho nhóm mua chung
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Thêm đủ chi tiết để mọi người dễ dàng quyết định có
                            nên tham gia hay không.
                          </p>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {images.length}/{MAX_POST_IMAGES} ảnh
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <Input
                          name="title"
                          label="Tiêu đề bài viết"
                          value={form.title}
                          onChange={handleChange}
                          placeholder="Ví dụ: Nhóm mua trứng giao tại Vinhomes tối nay"
                          className="rounded-2xl border-white bg-white/95 text-sm shadow-sm"
                        />

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Nội dung chi tiết
                          </label>
                          <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            rows={4}
                            className="w-full resize-none rounded-[22px] border border-white bg-white/95 px-4 py-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Mô tả cách nhận hàng, mốc thời gian chốt đơn, lưu ý cho người tham gia và bất kỳ thông tin nào cần biết."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Input
                      name="productName"
                      label="Sản phẩm"
                      value={form.productName}
                      onChange={handleChange}
                      placeholder="Trứng gà, hành, trái cây..."
                      className="rounded-2xl border-white bg-white/95 text-sm shadow-sm"
                    />
                    <Input
                      name="location"
                      label="Khu vực nhận hàng"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Vinhomes, Quận 7, Thủ Đức..."
                      className="rounded-2xl border-white bg-white/95 text-sm shadow-sm"
                    />
                    <Input
                      name="minMembers"
                      type="number"
                      min={2}
                      label="Số người tối thiểu"
                      value={form.minMembers}
                      onChange={handleChange}
                      className="rounded-2xl border-white bg-white/95 text-sm shadow-sm"
                    />
                    <Input
                      name="priceNote"
                      label="Giá dự kiến"
                      value={form.priceNote}
                      onChange={handleChange}
                      placeholder="Ví dụ: 35k/khay"
                      className="rounded-2xl border-white bg-white/95 text-sm shadow-sm"
                    />
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr),minmax(0,1.4fr)]">
                    <Input
                      name="groupBuyId"
                      label="Liên kết GroupBuyId"
                      helperText="Bỏ trống nếu đây là bài đăng hỏi nhóm tự do."
                      value={form.groupBuyId}
                      onChange={handleChange}
                      placeholder="Nhập GroupBuyId nếu đã có nhóm mua"
                      className="rounded-2xl border-white bg-white/95 text-sm shadow-sm"
                    />

                    <div className="rounded-[24px] border border-slate-200 bg-white/90 p-3 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            Thêm ảnh vào bài viết
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Chọn tối đa {MAX_POST_IMAGES} ảnh. Bố cục preview sẽ
                            hiển thị ngay để bạn xem lại.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M12 5v14M5 12h14"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          Chọn ảnh
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelectImages}
                      />

                      {imagePreviewUrls.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div
                              key={`${url}-${index}`}
                              className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50"
                            >
                              <img
                                src={url}
                                alt={`Ảnh đã chọn ${index + 1}`}
                                className="aspect-square w-full object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 pb-3 pt-8 text-[11px] text-white">
                                <div className="truncate font-medium">
                                  {images[index]?.name}
                                </div>
                                <div className="text-white/75">
                                  {images[index]
                                    ? formatFileSize(images[index].size)
                                    : ''}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-sm text-white opacity-100 transition hover:bg-black/70 sm:opacity-0 sm:group-hover:opacity-100"
                                onClick={() => handleRemoveImage(index)}
                                aria-label={`Xóa ảnh ${index + 1}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-slate-50/90 px-4 py-8 text-center transition hover:border-emerald-300 hover:bg-emerald-50/60"
                        >
                          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                            <svg
                              className="h-7 w-7"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-9-4h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            Thêm ảnh theo kiểu album
                          </span>
                          <span className="mt-1 text-xs text-slate-500">
                            Bấm để chọn ảnh cho bài viết, giống khung thêm ảnh
                            trong social feed.
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-[24px] border border-white/80 bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Nội dung rõ ràng
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Ảnh minh họa dễ nhìn
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Thông tin nhận hàng đầy đủ
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500">
                        {submitting
                          ? 'Đang đăng bài...'
                          : loading
                            ? 'Đang tải feed...'
                            : 'Sẵn sàng đăng bài'}
                      </span>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="rounded-full bg-emerald-500 px-5 py-2 text-sm text-white hover:bg-emerald-600"
                        disabled={submitting}
                      >
                        Đăng bài
                      </Button>
                    </div>
                  </div>
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
                    Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ với
                    nhóm!
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <article
                      key={post.id}
                      id={`post-${post.id}`}
                      className="mx-3 my-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                    >
                      <header className="flex items-start justify-between px-4 pb-2 pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-sm font-semibold text-emerald-700">
                            {post.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[18px] font-semibold leading-5 text-slate-900">
                              {post.author}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              {formatTime(post.createdAt)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-2xl leading-none text-slate-400 hover:text-slate-600"
                          onClick={() => handleDeletePost(post.id)}
                          aria-label="Tùy chọn bài viết"
                        >
                          ⋯
                        </button>
                      </header>

                      <div className="px-4 pb-3">
                        <h3 className="mb-1 text-lg font-semibold text-slate-900">
                          {post.title}
                        </h3>
                        <p className="whitespace-pre-line text-[17px] leading-7 text-slate-700">
                          {post.content}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            {post.productName}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            {post.location}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1">
                            {post.currentMembers}/{post.minMembers} người
                          </span>
                        </div>
                      </div>

                      {post.imageUrls.length > 0 && (
                        <div className="overflow-hidden border-y border-slate-200 bg-white">
                          <div
                            className={`grid gap-px bg-gray-100 ${
                              post.imageUrls.length === 1
                                ? 'grid-cols-1'
                                : 'grid-cols-2'
                            }`}
                          >
                            {post.imageUrls.slice(0, 4).map((url, idx, arr) => {
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
                                      ? 'aspect-[4/3]'
                                      : isFirstAndOdd
                                        ? 'col-span-2 aspect-[4/3]'
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
                        </div>
                      )}

                      {post.tags.length > 0 && (
                        <div className="px-4 pt-3 flex flex-wrap gap-2">
                          {post.tags.filter(Boolean).map(tag => (
                            <span
                              key={tag}
                              className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 px-4 py-3">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div>{post.likes} lượt thích</div>
                          <button
                            type="button"
                            className="hover:text-emerald-600"
                            onClick={() => handleOpenComments(post.id)}
                          >
                            {post.commentsCount} bình luận
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 border-t border-slate-200 text-sm text-slate-600">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(post.id)}
                          className={`flex items-center justify-center gap-2 py-3 transition hover:bg-slate-50 ${
                            post.liked ? 'text-emerald-600' : ''
                          }`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill={post.liked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M12 21l-1.1-1C6.14 15.24 3 12.39 3 8.9A4.9 4.9 0 017.9 4 5.4 5.4 0 0112 5.91 5.4 5.4 0 0116.1 4 4.9 4.9 0 0121 8.9c0 3.49-3.14 6.34-7.9 11.1L12 21z"
                            />
                          </svg>
                          <span>Thích</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenComments(post.id)}
                          className="flex items-center justify-center gap-2 py-3 transition hover:bg-slate-50"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M8 10h8M8 14h5m-8 6 2.7-2.025A2 2 0 018.9 17.5H18a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v11.5A1.5 1.5 0 005 20z"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Bình luận</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSharePost(post.id)}
                          className="flex items-center justify-center gap-2 py-3 transition hover:bg-slate-50"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              d="M8.5 13.5 15 17m0-10-6.5 3.5M17 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 15.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm11 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Chia sẻ</span>
                        </button>
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
                      <button
                        type="button"
                        className="truncate text-left font-semibold hover:text-emerald-700"
                        onClick={() => handleOpenComments(post.id)}
                      >
                        {post.productName || post.title}
                      </button>
                      <span className="text-[11px] text-gray-500">
                        {formatTime(post.createdAt)}
                      </span>
                    </div>
                    <p
                      className="line-clamp-2 text-[11px] text-gray-600 cursor-pointer"
                      onClick={() => handleOpenComments(post.id)}
                    >
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
