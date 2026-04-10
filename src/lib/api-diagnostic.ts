/**
 * API Diagnostic Tool
 * This script helps debug API response structures
 * Run this in browser console to understand actual API responses
 */

export const apiDiagnostic = {
  /**
   * Pretty print any object with full structure
   */
  inspect: (data: any, depth = 3, currentDepth = 0): string => {
    if (currentDepth > depth) return '...'
    if (data === null) return 'null'
    if (data === undefined) return 'undefined'
    if (typeof data !== 'object') return String(data)

    if (Array.isArray(data)) {
      return `[${data.length} items] [${data
        .slice(0, 2)
        .map(item => apiDiagnostic.inspect(item, depth, currentDepth + 1))
        .join(', ')}${data.length > 2 ? ', ...' : ''}]`
    }

    const keys = Object.keys(data).slice(0, 5)
    const props = keys
      .map(
        k => `${k}: ${apiDiagnostic.inspect(data[k], depth, currentDepth + 1)}`
      )
      .join(', ')
    return `{${props}${Object.keys(data).length > 5 ? ', ...' : ''}}`
  },

  /**
   * Log API response with full analysis
   */
  logResponse: (name: string, response: any) => {
    console.group(`📊 API Response: ${name}`)
    console.log('Full Response:', response)
    console.log('Type:', typeof response)
    console.log('Is Array?', Array.isArray(response))
    console.log(
      'Keys:',
      Array.isArray(response) ? '(array)' : Object.keys(response)
    )
    console.log('Formatted:', apiDiagnostic.inspect(response))

    // Check common structures
    console.group('Structure Detection:')
    console.log('response.data exists?', !!response?.data)
    console.log('response.data is array?', Array.isArray(response?.data))
    console.log('response.orders exists?', !!response?.orders)
    console.log('response.vendors exists?', !!response?.vendors)
    console.log('response.total exists?', !!response?.total)
    console.log('response.page exists?', !!response?.page)
    console.groupEnd()

    console.groupEnd()
  },

  /**
   * Parse response with detection
   */
  parseResponse: (response: any) => {
    const result = {
      raw: response,
      detected: 'unknown',
      data: [] as any[],
      total: 0,
      page: 0,
    }

    if (Array.isArray(response)) {
      result.detected = 'direct-array'
      result.data = response
      result.total = response.length
    } else if (response?.data && Array.isArray(response.data)) {
      result.detected = 'wrapped-in-data'
      result.data = response.data
      result.total = response.total || response.data.length
      result.page = response.page || 1
    } else if (response?.orders && Array.isArray(response.orders)) {
      result.detected = 'wrapped-in-orders'
      result.data = response.orders
      result.total = response.total || response.orders.length
    } else if (response?.vendors && Array.isArray(response.vendors)) {
      result.detected = 'wrapped-in-vendors'
      result.data = response.vendors
      result.total = response.total || response.vendors.length
    } else if (typeof response === 'object' && response !== null) {
      // Might be a single object (for getVendorDetails)
      result.detected = 'single-object'
      result.data = [response]
      result.total = 1
    }

    return result
  },

  /**
   * Test all dashboard APIs
   */
  testAllAPIs: async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error('❌ No access token found!')
        return
      }

      const baseURL = 'https://fresh-mart-be.onrender.com'
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }

      console.group('🧪 Testing All Dashboard APIs')

      // Test Orders API
      console.group('1. Testing Orders API')
      try {
        const ordersRes = await fetch(
          `${baseURL}/api/dashboard/orders?page=1&limit=10`,
          {
            headers,
          }
        )
        const ordersData = await ordersRes.json()
        apiDiagnostic.logResponse('GET /api/dashboard/orders', ordersData)
        const parsed = apiDiagnostic.parseResponse(ordersData)
        console.log('Parsed Result:', parsed)
      } catch (e: any) {
        console.error('❌ Orders API Error:', e.message)
      }
      console.groupEnd()

      // Test Vendors API
      console.group('2. Testing Vendors API')
      try {
        const vendorsRes = await fetch(
          `${baseURL}/api/dashboard/vendors?page=1&limit=10`,
          {
            headers,
          }
        )
        const vendorsData = await vendorsRes.json()
        apiDiagnostic.logResponse('GET /api/dashboard/vendors', vendorsData)
        const parsed = apiDiagnostic.parseResponse(vendorsData)
        console.log('Parsed Result:', parsed)
      } catch (e: any) {
        console.error('❌ Vendors API Error:', e.message)
      }
      console.groupEnd()

      // Test Stats API
      console.group('3. Testing Access Stats API')
      try {
        const statsRes = await fetch(`${baseURL}/api/dashboard/access/stats`, {
          headers,
        })
        const statsData = await statsRes.json()
        apiDiagnostic.logResponse('GET /api/dashboard/access/stats', statsData)
      } catch (e: any) {
        console.error('❌ Stats API Error:', e.message)
      }
      console.groupEnd()

      console.groupEnd()
    } catch (err: any) {
      console.error('❌ Test Error:', err.message)
    }
  },
}

// Auto-run in development if you want
if (typeof window !== 'undefined') {
  ;(window as any).apiDiagnostic = apiDiagnostic
  console.log('✅ API Diagnostic Tool loaded. Run: apiDiagnostic.testAllAPIs()')
}
