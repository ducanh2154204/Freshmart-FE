/**
 * Smart API response parser that handles multiple structures
 * Helps debug and extract data from various API response formats
 */

export interface ParsedResponse<T = any> {
  items: T[]
  total: number
  page: number
  hasError: boolean
  errorMessage?: string
  debug: {
    detectedStructure: string
    rawResponse: any
  }
}

export const parseApiResponse = <T = any>(
  response: any,
  itemsKey?: string
): ParsedResponse<T> => {
  const result: ParsedResponse<T> = {
    items: [],
    total: 0,
    page: 1,
    hasError: false,
    debug: {
      detectedStructure: 'unknown',
      rawResponse: response,
    },
  }

  try {
    if (!response) {
      result.hasError = true
      result.errorMessage = 'Response is empty'
      result.debug.detectedStructure = 'empty'
      return result
    }

    // Case 1: Response is a direct array
    if (Array.isArray(response)) {
      result.debug.detectedStructure = 'direct-array'
      result.items = response
      result.total = response.length
      return result
    }

    // For non-array responses, check common wrapping patterns
    const responseObj = response as any

    // Case 2: Standard API wrapper with result/data field
    // Most backend APIs wrap data in a "data" or "result" field
    // E.g., { success: true, data: [...], total: 10, page: 1 }
    if (responseObj.data && Array.isArray(responseObj.data)) {
      result.debug.detectedStructure = 'wrapped-in-data'
      result.items = responseObj.data
      result.total = responseObj.total ?? responseObj.data.length
      result.page = responseObj.page ?? 1
      return result
    }

    // Case 3: Results/items naming conventions
    if (responseObj.result && Array.isArray(responseObj.result)) {
      result.debug.detectedStructure = 'wrapped-in-result'
      result.items = responseObj.result
      result.total = responseObj.total ?? responseObj.result.length
      result.page = responseObj.page ?? 1
      return result
    }

    if (responseObj.items && Array.isArray(responseObj.items)) {
      result.debug.detectedStructure = 'wrapped-in-items'
      result.items = responseObj.items
      result.total = responseObj.total ?? responseObj.items.length
      result.page = responseObj.page ?? 1
      return result
    }

    if (responseObj.list && Array.isArray(responseObj.list)) {
      result.debug.detectedStructure = 'wrapped-in-list'
      result.items = responseObj.list
      result.total = responseObj.total ?? responseObj.list.length
      result.page = responseObj.page ?? 1
      return result
    }

    // Case 4: Custom key passed as parameter
    if (
      itemsKey &&
      responseObj[itemsKey] &&
      Array.isArray(responseObj[itemsKey])
    ) {
      result.debug.detectedStructure = `wrapped-in-${itemsKey}`
      result.items = responseObj[itemsKey]
      result.total = responseObj.total ?? responseObj[itemsKey].length
      result.page = responseObj.page ?? 1
      return result
    }

    // Case 5: Orders, vendors, etc. specific names
    if (responseObj.orders && Array.isArray(responseObj.orders)) {
      result.debug.detectedStructure = 'wrapped-in-orders'
      result.items = responseObj.orders
      result.total = responseObj.total ?? responseObj.orders.length
      result.page = responseObj.page ?? 1
      return result
    }

    if (responseObj.vendors && Array.isArray(responseObj.vendors)) {
      result.debug.detectedStructure = 'wrapped-in-vendors'
      result.items = responseObj.vendors
      result.total = responseObj.total ?? responseObj.vendors.length
      result.page = responseObj.page ?? 1
      return result
    }

    // Case 6: Single object (for detail endpoints)
    // If nothing matches but we have an object with expected fields
    if (
      typeof responseObj === 'object' &&
      Object.keys(responseObj).length > 0
    ) {
      // Check if this looks like a single item rather than a collection
      const hasCollectionIndicators = [
        'data',
        'result',
        'items',
        'list',
        'orders',
        'vendors',
        'total',
        'page',
      ]
      const hasCollectionField = hasCollectionIndicators.some(key =>
        responseObj.hasOwnProperty(key)
      )

      if (!hasCollectionField) {
        // Treat as single object
        result.debug.detectedStructure = 'single-object'
        result.items = [responseObj]
        result.total = 1
        result.page = 1
        return result
      }
    }

    // Case 7: Unknown structure
    result.hasError = true
    result.errorMessage = `Could not parse response structure. Keys: ${Object.keys(responseObj || {}).join(', ')}`
    result.debug.detectedStructure = 'unknown'

    return result
  } catch (error) {
    result.hasError = true
    result.errorMessage =
      error instanceof Error ? error.message : 'Unknown parsing error'
    result.debug.detectedStructure = 'error'
    return result
  }
}
