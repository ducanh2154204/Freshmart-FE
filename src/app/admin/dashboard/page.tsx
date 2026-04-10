'use client'

import { useState, useEffect } from 'react'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { AdminLayout } from '@/components/AdminLayout'
import { dashboardService } from '@/services/dashboard.service'
import type { AccessStats, DashboardOrder } from '@/services/dashboard.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-toastify'
import { parseApiResponse } from '@/lib/response-parser'

export default function AdminDashboardPage() {
  const { isAdmin, loading: guardLoading } = useAdminGuard()
  const [stats, setStats] = useState<AccessStats | null>(null)
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch stats
        const statsResponse = await dashboardService.getAccessStats()
        console.log('Raw stats response:', statsResponse)
        // Stats is typically a single object, not an array
        const statsData = (statsResponse as any)?.data || statsResponse
        console.log('Parsed stats data:', statsData)
        setStats(statsData as AccessStats)

        // Fetch recent orders
        const ordersResponse = await dashboardService.getOrders(1, 10)
        console.log('Raw orders response:', ordersResponse)

        // Parse response with intelligent structure detection
        const parsed = parseApiResponse<DashboardOrder>(ordersResponse)
        console.log('Orders parse result:', {
          detected: parsed.debug.detectedStructure,
          itemCount: parsed.items.length,
          total: parsed.total,
        })

        if (parsed.hasError) {
          throw new Error(
            parsed.errorMessage || 'Failed to parse orders response'
          )
        }

        console.log('Final orders:', parsed.items)
        setOrders(parsed.items)
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        console.error('Error details:', {
          message: err?.message,
          status: err?.status,
        })
        toast.error(
          `Failed to load dashboard: ${err?.message || 'Unknown error'}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  if (guardLoading || loading) {
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

  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Live Users */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Live Users</p>
              <p className="text-3xl font-bold mt-2">
                {stats?.liveUsers.total || 0}
              </p>
              <p className="text-xs text-blue-100 mt-2">
                {stats?.liveUsers.authenticated || 0} authenticated
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        {/* Today Accesses */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Today Visits</p>
              <p className="text-3xl font-bold mt-2">
                {stats?.accesses.today || 0}
              </p>
              <p className="text-xs text-green-100 mt-2">page views</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        {/* Weekly Accesses */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100">This Week</p>
              <p className="text-3xl font-bold mt-2">
                {stats?.accesses.week || 0}
              </p>
              <p className="text-xs text-orange-100 mt-2">page views</p>
            </div>
            <div className="text-4xl">📈</div>
          </div>
        </div>

        {/* Monthly Accesses */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100">This Month</p>
              <p className="text-3xl font-bold mt-2">
                {stats?.accesses.month || 0}
              </p>
              <p className="text-xs text-purple-100 mt-2">page views</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600 mt-1">Last 10 orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders yet</div>
        ) : (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {order.id.substring(0, 16)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.user?.name || 'N/A'}
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
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
