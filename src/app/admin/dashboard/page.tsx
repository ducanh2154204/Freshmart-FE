'use client'

import { useState, useEffect } from 'react'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { AdminLayout } from '@/components/AdminLayout'
import { dashboardService } from '@/services/dashboard.service'
import type { AccessStats } from '@/services/dashboard.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { toast } from 'react-toastify'

export default function AdminDashboardPage() {
  const { isAdmin, loading: guardLoading } = useAdminGuard()
  const [stats, setStats] = useState<AccessStats | null>(null)
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Access Trends Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Access Trends
          </h3>
          <div className="space-y-4">
            {/* Today */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Today</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.accesses.today || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((stats?.accesses.today || 0) /
                        Math.max(
                          stats?.accesses.today || 1,
                          stats?.accesses.week || 1,
                          stats?.accesses.month || 1
                        )) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* This Week */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  This Week
                </span>
                <span className="text-lg font-bold text-green-600">
                  {stats?.accesses.week || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((stats?.accesses.week || 0) /
                        Math.max(
                          stats?.accesses.today || 1,
                          stats?.accesses.week || 1,
                          stats?.accesses.month || 1
                        )) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* This Month */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  This Month
                </span>
                <span className="text-lg font-bold text-purple-600">
                  {stats?.accesses.month || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((stats?.accesses.month || 0) /
                        Math.max(
                          stats?.accesses.today || 1,
                          stats?.accesses.week || 1,
                          stats?.accesses.month || 1
                        )) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Users Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Live Users Breakdown
          </h3>
          <div className="space-y-4">
            {/* Total Users */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {stats?.liveUsers.total || 0}
                  </p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            {/* Authenticated Users */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Authenticated
                  </p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {stats?.liveUsers.authenticated || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.liveUsers.total
                      ? (
                          ((stats.liveUsers.authenticated || 0) /
                            stats.liveUsers.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-4xl">✓</div>
              </div>
            </div>

            {/* Guest Users */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Guest</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">
                    {stats?.liveUsers.guest || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.liveUsers.total
                      ? (
                          ((stats.liveUsers.guest || 0) /
                            stats.liveUsers.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-4xl">🔓</div>
              </div>
            </div>

            {/* Active Window */}
            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-gray-600">
                Active in last{' '}
                <span className="font-semibold text-gray-900">
                  {stats?.liveUsers.liveWindowMinutes || 0} minutes
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
