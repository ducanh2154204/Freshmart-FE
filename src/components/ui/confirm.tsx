'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'

type ConfirmOptions = {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

type ConfirmState = ConfirmOptions & {
  open: boolean
}

type ConfirmContextValue = {
  confirm: (options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ open: false })
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  )

  const close = useCallback((value: boolean) => {
    resolver?.(value)
    setResolver(null)
    setState({ open: false })
  }, [resolver])

  const confirm = useCallback((options?: ConfirmOptions) => {
    setState({
      open: true,
      title: options?.title ?? 'Xác nhận',
      description: options?.description,
      confirmText: options?.confirmText ?? 'Đồng ý',
      cancelText: options?.cancelText ?? 'Hủy',
      destructive: options?.destructive ?? false,
    })

    return new Promise<boolean>(resolve => {
      setResolver(() => resolve)
    })
  }, [])

  const value = useMemo(() => ({ confirm }), [confirm])

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {state.open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => close(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-base font-semibold text-gray-900">
              {state.title}
            </div>
            {state.description && (
              <div className="mt-1 text-sm text-gray-600">
                {state.description}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className="bg-transparent hover:bg-gray-100"
                onClick={() => close(false)}
              >
                {state.cancelText}
              </Button>
              <Button
                type="button"
                variant={state.destructive ? 'secondary' : 'primary'}
                className={
                  state.destructive
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
                    : undefined
                }
                onClick={() => close(true)}
              >
                {state.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) {
    throw new Error('useConfirm must be used within ConfirmProvider')
  }
  return ctx.confirm
}

