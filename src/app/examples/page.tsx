'use client'

import { useState } from 'react'
import { Button, Input, Card, LoadingSpinner } from '@/components/ui'
import { useDebounce, useLocalStorage } from '@/hooks'
import { formatCurrency, formatDate, isValidEmail } from '@/utils'

export default function ExamplesPage() {
  const [inputValue, setInputValue] = useState('')
  const [email, setEmail] = useState('')
  const debouncedValue = useDebounce(inputValue, 500)
  const [storedValue, setStoredValue] = useLocalStorage('example-key', '')

  const isValid = email ? isValidEmail(email) : null

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold mb-8">Examples & Patterns</h1>

      {/* UI Components Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">UI Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Buttons">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <Button isLoading>Loading...</Button>
            </div>
          </Card>

          <Card title="Input">
            <div className="space-y-4">
              <Input
                label="Basic Input"
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Email Input"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={
                  email && !isValid ? 'Please enter a valid email' : undefined
                }
                helperText={isValid ? 'Valid email' : undefined}
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Hooks Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Custom Hooks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="useDebounce">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Input value: <code className="bg-gray-100 px-2 py-1 rounded">{inputValue}</code>
              </p>
              <p className="text-sm text-gray-600">
                Debounced value (500ms):{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">{debouncedValue}</code>
              </p>
            </div>
          </Card>

          <Card title="useLocalStorage">
            <div className="space-y-4">
              <Input
                label="Stored Value"
                value={storedValue}
                onChange={(e) => setStoredValue(e.target.value)}
                placeholder="This value persists in localStorage"
              />
              <Button onClick={() => setStoredValue('')} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Utils Examples */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Utility Functions</h2>
        <Card title="Formatting">
          <div className="space-y-2 text-sm">
            <p>
              Currency: <code className="bg-gray-100 px-2 py-1 rounded">{formatCurrency(1234567)}</code>
            </p>
            <p>
              Date: <code className="bg-gray-100 px-2 py-1 rounded">{formatDate(new Date())}</code>
            </p>
          </div>
        </Card>
      </section>

      {/* Loading Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Loading States</h2>
        <Card title="Loading Spinner">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      </section>
    </div>
  )
}

