/**
 * Admin guard hook - checks if user is admin, otherwise redirects to home
 */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { userService } from '@/services/user.service'

export function useAdminGuard() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (typeof window === 'undefined') return

        const token = window.localStorage.getItem('accessToken')
        if (!token) {
          toast.error('Vui lòng đăng nhập')
          router.push('/auth')
          setLoading(false)
          return
        }

        // First, try to get role from user object in localStorage
        const userStr = window.localStorage.getItem('user')
        if (userStr) {
          try {
            const user = JSON.parse(userStr) as { role?: string }
            if (user.role === 'ADMIN') {
              setIsAdmin(true)
              setLoading(false)
              return
            }
          } catch (e) {
            console.warn('Error parsing user from localStorage:', e)
          }
        }

        // If not found in localStorage, try to fetch from API
        try {
          const fullUserData = await userService.getMe()
          if (fullUserData?.role === 'ADMIN') {
            setIsAdmin(true)
            // Update localStorage with fresh user data
            window.localStorage.setItem('user', JSON.stringify(fullUserData))
          } else {
            toast.error('Chỉ admin mới có quyền truy cập')
            router.push('/')
          }
        } catch (apiError) {
          console.error('Error fetching user from API:', apiError)
          toast.error('Lỗi xác thực')
          router.push('/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  return { isAdmin, loading }
}
