# Kiến trúc dự án

Tài liệu này mô tả chi tiết về kiến trúc và cách tổ chức code trong dự án.

## 📐 Nguyên tắc thiết kế

### 1. Separation of Concerns
- Mỗi module/feature có trách nhiệm rõ ràng
- Tách biệt logic business và UI
- Tách biệt data fetching và presentation

### 2. Reusability
- Components có thể tái sử dụng
- Utilities và hooks được chia sẻ
- Types được định nghĩa tập trung

### 3. Scalability
- Cấu trúc thư mục dễ mở rộng
- Path aliases để import dễ dàng
- Code splitting tự động với Next.js

### 4. Maintainability
- Code được tổ chức rõ ràng
- TypeScript cho type safety
- ESLint và Prettier cho code quality

## 🗂️ Cấu trúc thư mục chi tiết

### `/src/app`
Next.js App Router - chứa các routes và layouts
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── loading.tsx        # Loading UI
├── error.tsx          # Error boundary
└── not-found.tsx      # 404 page
```

### `/src/components`
React components được tổ chức theo:
- **UI Components** (`/ui`): Components tái sử dụng (Button, Input, Card, etc.)
- **Feature Components**: Components theo từng feature/module

**Quy tắc:**
- Mỗi component có file riêng
- Export types cùng với component
- Sử dụng `index.ts` để export tập trung

### `/src/hooks`
Custom React hooks

**Ví dụ:**
- `useDebounce` - Debounce giá trị
- `useLocalStorage` - Quản lý localStorage
- `useAsync` - Xử lý async operations

### `/src/lib`
Library configurations và wrappers

**Ví dụ:**
- `api-client.ts` - API client với error handling

### `/src/services`
API services - tách biệt logic gọi API

**Quy tắc:**
- Mỗi domain có service riêng (user.service.ts, product.service.ts, etc.)
- Sử dụng `apiClient` từ `/lib/api-client.ts`
- Export types cho responses

### `/src/types`
TypeScript type definitions

**Tổ chức:**
- `index.ts` - Common types
- `api.ts` - API related types
- Domain-specific types (user.ts, product.ts, etc.)

### `/src/utils`
Utility functions

**Phân loại:**
- `format.ts` - Formatting functions (currency, date, etc.)
- `validation.ts` - Validation functions
- `helpers.ts` - General helper functions

### `/src/constants`
Application constants

- API endpoints
- Storage keys
- Configuration values

### `/src/styles`
Global styles và CSS

## 🔄 Data Flow

```
Component → Hook → Service → API Client → Backend
    ↓         ↓        ↓
  State    Logic   Error Handling
```

## 📝 Code Patterns

### Component Pattern
```typescript
// src/components/ui/Button.tsx
import React from 'react'
import { classNames } from '@/utils/helpers'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => {
  return <button className={classNames('base-styles', variantStyles[variant])} {...props} />
}
```

### Service Pattern
```typescript
// src/services/user.service.ts
import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'
import type { User } from '@/types/user'

export const userService = {
  async getUser(id: string): Promise<BaseResponse<User>> {
    return apiClient.get<BaseResponse<User>>(`/api/users/${id}`)
  },
}
```

### Hook Pattern
```typescript
// src/hooks/useUser.ts
import { useState, useEffect } from 'react'
import { userService } from '@/services/user.service'

export function useUser(userId: string) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    userService.getUser(userId).then(setUser).finally(() => setLoading(false))
  }, [userId])
  
  return { user, loading }
}
```

## 🎯 Best Practices

### 1. Import Order
```typescript
// 1. React và Next.js
import React from 'react'
import Link from 'next/link'

// 2. Third-party libraries
import axios from 'axios'

// 3. Internal imports với path aliases
import { Button } from '@/components/ui'
import { useDebounce } from '@/hooks'
import { formatDate } from '@/utils'
import type { User } from '@/types'
```

### 2. Naming Conventions
- **Components**: PascalCase (Button, UserCard)
- **Hooks**: camelCase với prefix "use" (useUser, useDebounce)
- **Utils**: camelCase (formatDate, isValidEmail)
- **Types**: PascalCase (User, ApiResponse)
- **Constants**: UPPER_SNAKE_CASE (API_URL, STORAGE_KEYS)

### 3. File Organization
- Mỗi component/hook/service có file riêng
- Export types cùng với implementation
- Sử dụng `index.ts` để re-export

### 4. Type Safety
- Luôn định nghĩa types cho props
- Sử dụng `interface` cho object types
- Sử dụng `type` cho unions và intersections
- Tránh `any`, sử dụng `unknown` nếu cần

### 5. Error Handling
- Sử dụng try-catch trong async functions
- Error boundaries cho component errors
- Consistent error response format

## 🚀 Mở rộng dự án

### Thêm Feature mới
1. Tạo types trong `/src/types`
2. Tạo service trong `/src/services`
3. Tạo hooks nếu cần trong `/src/hooks`
4. Tạo components trong `/src/components`
5. Tạo pages trong `/src/app`

### Thêm UI Component
1. Tạo component trong `/src/components/ui`
2. Export trong `/src/components/ui/index.ts`
3. Thêm types nếu cần
4. Document props và usage

## 📚 Tài liệu tham khảo

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://typescript-handbook.gitbook.io/)

