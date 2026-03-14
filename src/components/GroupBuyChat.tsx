'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useGroupBuyChat } from '@/hooks'
import type { ChatMessage } from '@/types'
import { Button } from './ui'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface GroupBuyChatProps {
  groupBuyId: number | string
}

export const GroupBuyChat: React.FC<GroupBuyChatProps> = ({ groupBuyId }) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const { messages, isConnected, error, sendMessage } = useGroupBuyChat(
    groupBuyId
  )

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages.length])

  const renderMessage = (msg: ChatMessage) => {
    return (
      <div
        key={msg.id}
        className="flex flex-col mb-2 bg-gray-50 rounded-lg px-3 py-2"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-gray-800">
            {msg.user?.name || 'Người dùng'}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {msg.content}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">
          Chat nhóm mua ({groupBuyId})
        </h3>
        <span
          className={`inline-flex items-center gap-1 text-xs ${
            isConnected ? 'text-green-600' : 'text-gray-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-gray-300'
            }`}
          />
          {isConnected ? 'Đang kết nối' : 'Đang kết nối...'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 max-h-80">
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-2">
            {error}
          </div>
        )}

        {!error && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-xs text-gray-500">
            <p>Chưa có tin nhắn nào. Hãy là người đầu tiên bắt chuyện!</p>
          </div>
        )}

        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-gray-200 px-3 py-2 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim()}
          className="px-3 py-2 text-xs"
        >
          Gửi
        </Button>
      </form>
    </div>
  )
}

