import { useEffect, useRef, useState, useCallback } from 'react'
import { getChatSocket, type ChatMessage } from '@/lib/chat-socket'

interface UseGroupBuyChatOptions {
  enabled?: boolean
}

interface UseGroupBuyChatResult {
  messages: ChatMessage[]
  isConnected: boolean
  isJoining: boolean
  error: string | null
  sendMessage: (content: string) => void
  clearMessages: () => void
}

export const useGroupBuyChat = (
  groupBuyId: number | string | undefined,
  options: UseGroupBuyChatOptions = {}
): UseGroupBuyChatResult => {
  const { enabled = true } = options
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const groupIdRef = useRef<number | string | undefined>(groupBuyId)

  useEffect(() => {
    groupIdRef.current = groupBuyId
  }, [groupBuyId])

  useEffect(() => {
    if (!enabled || !groupBuyId) return

    const socket = getChatSocket()
    if (!socket) return

    const handleConnect = () => {
      setIsConnected(true)
      setError(null)
      setIsJoining(true)
      socket.emit('join_group_buy', groupBuyId)
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    const handleNewMessage = (newMessage: ChatMessage) => {
      setMessages(prev => [...prev, newMessage])
    }

    const handleError = (err: unknown) => {
      const message =
        typeof err === 'string'
          ? err
          : (err as any)?.message || 'Đã xảy ra lỗi kết nối chat'
      // eslint-disable-next-line no-console
      console.error('Socket error:', err)
      setError(message)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('new_message', handleNewMessage)
    socket.on('error', handleError)

    // Nếu đã kết nối trước đó, join luôn
    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.emit('leave_group_buy', groupIdRef.current)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('new_message', handleNewMessage)
      socket.off('error', handleError)
    }
  }, [enabled, groupBuyId])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || !groupBuyId) return
      const socket = getChatSocket()
      if (!socket) return

      socket.emit('send_message', {
        groupBuyId,
        content: content.trim(),
      })
    },
    [groupBuyId]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isConnected,
    isJoining,
    error,
    sendMessage,
    clearMessages,
  }
}

