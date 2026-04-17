'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { AdminLayout } from '@/components/AdminLayout'
import { dashboardService } from '@/services/dashboard.service'
import type {
  DashboardOrder,
  DashboardOrdersResponse,
} from '@/services/dashboard.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { parseApiResponse } from '@/lib/response-parser'

export default function AdminOrdersPage() {
  const { isAdmin, loading: guardLoading } = useAdminGuard()
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'xlsx' | null>(
    null
  )
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(
    null
  )

  const fetchOrders = async (p: number = 1) => {
    setLoading(true)
    try {
      const response = await dashboardService.getOrders(
        p,
        limit,
        statusFilter,
        typeFilter
      )
      console.log('Raw orders response:', response)

      // Parse response with intelligent structure detection
      const parsed = parseApiResponse<DashboardOrder>(response)
      console.log('Parse result:', {
        detected: parsed.debug.detectedStructure,
        itemCount: parsed.items.length,
        total: parsed.total,
      })

      if (parsed.hasError) {
        throw new Error(
          parsed.errorMessage || 'Failed to parse orders response'
        )
      }

      console.log('Extracted orders:', parsed.items)
      setOrders(parsed.items)
      setTotalOrders(parsed.total)
      setPage(p)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      console.error('Error details:', {
        message: err?.message,
        status: err?.status,
        response: err?.response,
      })
      toast.error(`Failed to load orders: ${err?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchOrders(1)
  }, [isAdmin, statusFilter, typeFilter])

  const handleExportOrders = async (format: 'pdf' | 'xlsx' = 'pdf') => {
    setExportingFormat(format)
    try {
      // Download file as blob or get export URL
      const result = await dashboardService.downloadOrdersFile(format)

      if (typeof result === 'string') {
        // Result is an export URL from the server (R2 CDN)
        console.log('Export URL from server:', result)

        // Fetch file from URL and convert to blob
        const fileResponse = await fetch(result)
        if (!fileResponse.ok) {
          throw new Error(
            `Failed to fetch file from URL: ${fileResponse.status}`
          )
        }

        const blob = await fileResponse.blob()
        const url = window.URL.createObjectURL(blob)

        // Create temporary link and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the blob URL
        window.URL.revokeObjectURL(url)
      } else {
        // Result is a blob
        const url = window.URL.createObjectURL(result)

        // Create temporary link and trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = `orders-export-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the blob URL
        window.URL.revokeObjectURL(url)
      }

      toast.success(`Orders exported to ${format.toUpperCase()} successfully!`)
    } catch (err: any) {
      console.error('Error exporting orders:', err)
      toast.error(`Failed to export orders: ${err?.message || 'Unknown error'}`)
    } finally {
      setExportingFormat(null)
    }
  }

  if (guardLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    )
  }

  if (!isAdmin) {
    return null
  }

  const totalPages = Math.ceil(totalOrders / limit)

  return (
    <AdminLayout>
      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
            >
              <option value="">All Types</option>
              <option value="REGULAR">Regular</option>
              <option value="GROUP_BUY">Group Buy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items per page
            </label>
            <select
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Orders ({totalOrders} total)
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportOrders('pdf')}
              disabled={
                loading || exportingFormat !== null || orders.length === 0
              }
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {exportingFormat === 'pdf' ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Exporting...
                </>
              ) : (
                '📄 Export PDF'
              )}
            </Button>
            <Button
              onClick={() => handleExportOrders('xlsx')}
              disabled={
                loading || exportingFormat !== null || orders.length === 0
              }
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {exportingFormat === 'xlsx' ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Exporting...
                </>
              ) : (
                '📊 Export Excel'
              )}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {order.id.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {order.user?.name || 'N/A'}
                          </p>
                          <p className="text-gray-600">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        {parseFloat(order.totalAmount).toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : order.status === 'FAILED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            order.type === 'GROUP_BUY'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => fetchOrders(page - 1)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded font-medium disabled:opacity-50"
                >
                  Previous
                </Button>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => fetchOrders(page + 1)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded font-medium disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Order ID
                  </p>
                  <p className="text-gray-900 font-mono mt-1">
                    {selectedOrder.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Status
                  </p>
                  <p className="text-gray-900 mt-1">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Customer
                  </p>
                  <p className="text-gray-900 mt-1">
                    {selectedOrder.user?.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Email
                  </p>
                  <p className="text-gray-900 mt-1">
                    {selectedOrder.user?.email}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  Items
                </p>
                {selectedOrder.items?.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm py-2 border-b border-gray-200"
                  >
                    <span className="text-gray-700">
                      {item.product?.name || 'Product'}
                    </span>
                    <div className="text-right">
                      <p className="text-gray-900 font-semibold">
                        {parseFloat(item.price).toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-gray-600 text-xs">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-lg font-bold text-green-600">
                  Total:{' '}
                  {parseFloat(selectedOrder.totalAmount).toLocaleString(
                    'vi-VN'
                  )}
                  đ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
