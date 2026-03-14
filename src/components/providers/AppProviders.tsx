'use client'

import React from 'react'
import { ConfirmProvider } from '@/components/ui/confirm'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function AppProviders({
  children,
}: {
  children: React.ReactNode
}) {
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

