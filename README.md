# FE App

Một dự án Next.js với TypeScript được xây dựng với kiến trúc sạch, dễ bảo trì và mở rộng.

## 🚀 Công nghệ sử dụng

- **Next.js 14** - React framework với App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📁 Cấu trúc thư mục

```
fe-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── loading.tsx        # Loading UI
│   │   ├── error.tsx          # Error boundary
│   │   └── not-found.tsx      # 404 page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...               # Feature components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library configurations
│   │   └── api-client.ts     # API client
│   ├── services/             # API services
│   ├── types/                # TypeScript types
│   ├── utils/                # Utility functions
│   ├── constants/            # Application constants
│   └── styles/               # Global styles
├── public/                   # Static assets
├── .eslintrc.json           # ESLint config
├── .prettierrc              # Prettier config
├── next.config.js           # Next.js config
├── tsconfig.json            # TypeScript config
└── tailwind.config.ts       # Tailwind config
```

## 🛠️ Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

2. **Tạo file environment:**
```bash
cp .env.example .env.local
```

3. **Chạy development server:**
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code với Prettier
- `npm run format:check` - Kiểm tra format code
- `npm run type-check` - Kiểm tra TypeScript types

## 🏗️ Kiến trúc

### Components
- **UI Components** (`src/components/ui/`): Các component tái sử dụng (Button, Input, Modal, etc.)
- **Feature Components**: Các component theo từng feature/module

### Hooks
- Custom hooks được đặt trong `src/hooks/`
- Ví dụ: `useDebounce`, `useLocalStorage`

### Services
- API services được đặt trong `src/services/`
- Sử dụng `apiClient` từ `src/lib/api-client.ts`

### Types
- TypeScript types được đặt trong `src/types/`
- Tách riêng theo domain (api.ts, user.ts, etc.)

### Utils
- Utility functions được đặt trong `src/utils/`
- Format, validation, helpers, etc.

### Path Aliases
Dự án sử dụng path aliases để import dễ dàng:
- `@/*` → `src/*`
- `@/components/*` → `src/components/*`
- `@/hooks/*` → `src/hooks/*`
- `@/utils/*` → `src/utils/*`
- `@/services/*` → `src/services/*`
- `@/types/*` → `src/types/*`
- `@/constants/*` → `src/constants/*`
- `@/styles/*` → `src/styles/*`
- `@/lib/*` → `src/lib/*`

## 📦 Thêm dependencies

Khi thêm dependencies mới, hãy đảm bảo:
1. Cài đặt với `npm install <package>`
2. Cập nhật types nếu cần: `npm install -D @types/<package>`
3. Cập nhật README nếu cần

## 🎨 Styling

Dự án sử dụng Tailwind CSS. Có thể tùy chỉnh trong `tailwind.config.ts`.

## 🔒 Best Practices

1. **Type Safety**: Luôn sử dụng TypeScript types
2. **Component Structure**: Tách component nhỏ, dễ test
3. **Code Organization**: Tuân theo cấu trúc thư mục
4. **Error Handling**: Sử dụng error boundaries và try-catch
5. **Performance**: Sử dụng React.memo, useMemo, useCallback khi cần
6. **Accessibility**: Đảm bảo components accessible

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

## 📄 License

MIT

