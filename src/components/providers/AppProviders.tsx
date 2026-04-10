'use client'

import React, { useEffect } from 'react'
import { ConfirmProvider } from '@/components/ui/confirm'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AppProviders({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Load development tools
    if (process.env.NODE_ENV === 'development') {
      import('@/lib/admin-test-helper').catch(() => {
        // Silently fail if helper can't be loaded
      })
      import('@/lib/api-diagnostic').catch(() => {
        // Silently fail if diagnostic can't be loaded
      })
    }
  }, [])

  return (
    <ConfirmProvider>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ConfirmProvider>
  )
}
