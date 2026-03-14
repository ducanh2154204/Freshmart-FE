export interface ChatUser {
  id: number | string
  name: string
}

export interface ChatMessage {
  id: number | string
  groupBuyId: number | string
  content: string
  createdAt: string
  user: ChatUser
}

