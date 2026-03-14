import { io, Socket } from 'socket.io-client'
import type { ChatMessage } from '@/types'

const SOCKET_URL = 'wss://fresh-mart-be.onrender.com'

// Singleton socket instance on client
let socket: Socket | null = null

export const getChatSocket = (): Socket | null => {
  if (typeof window === 'undefined') {
    return null
  }

  if (socket) return socket

  const token =
    window.localStorage.getItem('accessToken') ||
    window.localStorage.getItem('token')

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
    query: token ? { token } : undefined,
  })

  return socket
}

export type { ChatMessage }

