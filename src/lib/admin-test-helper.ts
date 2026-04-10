import { apiClient } from '@/lib/api-client'
import type { BaseResponse } from '@/types'

/**
 * Test/Development Helper for Admin Access
 * Use this in browser console for quick admin testing
 */

export const adminTestHelper = {
  /**
   * Create mock admin token (for development only)
   * JWT Payload: { role: "ADMIN", sub: "admin-test" }
   */
  generateMockAdminToken(): string {
    // This is a valid JWT structure with role ADMIN
    // Note: This is ONLY for testing. Use real tokens in production.
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiJhZG1pbi10ZXN0In0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ'
    return mockToken
  },

  /**
   * Set mock admin session (for testing)
   */
  setMockAdminSession() {
    const token = this.generateMockAdminToken()
    const mockUser = {
      id: 'admin-test',
      name: 'Test Admin',
      email: 'admin@freshmart.local',
      role: 'ADMIN',
      avatarUrl: null,
    }

    window.localStorage.setItem('accessToken', token)
    window.localStorage.setItem('user', JSON.stringify(mockUser))
    window.dispatchEvent(new Event('auth:changed'))

    console.log('✅ Mock admin session set!')
    console.log('📧 Email: admin@freshmart.local')
    console.log('🔑 Role: ADMIN')
    console.log('⏭️  Redirecting to dashboard in 2 seconds...')

    setTimeout(() => {
      window.location.href = '/admin/dashboard'
    }, 2000)
  },

  /**
   * Clear session
   */
  clearSession() {
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('avatarUrl')
    window.dispatchEvent(new Event('auth:changed'))
    console.log('✅ Session cleared')
  },

  /**
   * Check current user role
   */
  checkRole() {
    const user = JSON.parse(window.localStorage.getItem('user') || '{}')
    const token = window.localStorage.getItem('accessToken')

    console.log('📋 Current User Info:')
    console.log(`  ID: ${user.id || 'N/A'}`)
    console.log(`  Name: ${user.name || 'N/A'}`)
    console.log(`  Email: ${user.email || 'N/A'}`)
    console.log(`  Role: ${user.role || 'N/A'}`)
    console.log(`  Token: ${token ? '✅ Present' : '❌ Missing'}`)

    if (token) {
      const parts = token.split('.')
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]))
          console.log(`  Token Role: ${payload.role || 'N/A'}`)
        } catch (e) {
          console.log('  Token Role: ⚠️ Could not decode')
        }
      }
    }

    return user.role === 'ADMIN'
  },

  /**
   * Quick guide
   */
  printGuide() {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   ADMIN TEST HELPER GUIDE                     ║
╚═══════════════════════════════════════════════════════════════╝

📌 Available Commands:

1. SET MOCK ADMIN SESSION (Testing Only)
   → adminTestHelper.setMockAdminSession()
   
2. CHECK CURRENT ROLE
   → adminTestHelper.checkRole()
   
3. CLEAR SESSION
   → adminTestHelper.clearSession()
   
4. PRINT THIS GUIDE
   → adminTestHelper.printGuide()

═══════════════════════════════════════════════════════════════

⚠️  PRODUCTION SETUP:

To properly set up admin access in production, follow these steps:

Step 1: Create Admin Account
  • Database: INSERT role = 'ADMIN' into users table
  • OR API: Call /api/auth/register-admin if available
  • Sample: UPDATE users SET role='ADMIN' WHERE email='admin@mail.com'

Step 2: Login
  • Go to /auth and login with admin credentials
  • System will fetch user profile with role from /api/users/me

Step 3: Access Dashboard
  • Header will show admin badge after role is loaded
  • Click "📊 Admin Dashboard" in user menu
  • OR go directly to /admin/dashboard

═══════════════════════════════════════════════════════════════

📖 Role Verification Flow:

1. Login → Token stored in localStorage
2. Get /api/users/me → Gets full user with role
3. Store user data with role in localStorage
4. Header component reads role → shows admin link
5. Admin guard checks role → allows/denies access

═══════════════════════════════════════════════════════════════

🔍 Debugging:

Check Token: console.log(localStorage.getItem('accessToken'))
Check User:  console.log(JSON.parse(localStorage.getItem('user')))
Decode JWT:  
  const token = localStorage.getItem('accessToken')
  console.log(JSON.parse(atob(token.split('.')[1])))

═══════════════════════════════════════════════════════════════
    `)
  },
}

// Auto-inject into Window for easy console access
if (typeof window !== 'undefined') {
  ;(window as any).adminTestHelper = adminTestHelper
}
