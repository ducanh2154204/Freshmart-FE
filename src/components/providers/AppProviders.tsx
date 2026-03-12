'use client'

import React from 'react'
import { ConfirmProvider } from '@/components/ui/confirm'

export default function AppProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return <ConfirmProvider>{children}</ConfirmProvider>
}

