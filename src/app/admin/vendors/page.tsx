'use client'

import { useState, useEffect } from 'react'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { AdminLayout } from '@/components/AdminLayout'
import { dashboardService } from '@/services/dashboard.service'
import type { Vendor, VendorsResponse } from '@/services/dashboard.service'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { toast } from 'react-toastify'
import { parseApiResponse } from '@/lib/response-parser'

export default function AdminVendorsPage() {
  const { isAdmin, loading: guardLoading } = useAdminGuard()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(true)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [totalVendors, setTotalVendors] = useState(0)

  const fetchVendors = async (p: number = 1) => {
    setLoading(true)
    try {
      const response = await dashboardService.getVendors(p, limit)
      console.log('Raw vendors response:', response)

      // Parse response with intelligent structure detection
      const parsed = parseApiResponse<Vendor>(response, 'vendors')
      console.log('Parse result:', {
        detected: parsed.debug.detectedStructure,
        itemCount: parsed.items.length,
        total: parsed.total,
      })

      if (parsed.hasError) {
        throw new Error(
          parsed.errorMessage || 'Failed to parse vendors response'
        )
      }

      console.log('Extracted vendors:', parsed.items)
      setVendors(parsed.items)
      setTotalVendors(parsed.total)
      setPage(p)
    } catch (err: any) {
      console.error('Error fetching vendors:', err)
      console.error('Error details:', {
        message: err?.message,
        status: err?.status,
      })
      toast.error(`Failed to load vendors: ${err?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchVendors(1)
  }, [isAdmin])

  const handleUpdateStatus = async (vendorId: number, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await dashboardService.updateVendorStatus(
        vendorId,
        newStatus as 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
      )

      toast.success(`Vendor status updated to ${newStatus}`)

      // Update local state
      setVendors(
        vendors.map(v =>
          v.id === vendorId ? { ...v, status: newStatus as any } : v
        )
      )

      if (selectedVendor?.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status: newStatus as any })
      }
    } catch (err) {
      console.error('Error updating vendor status:', err)
      toast.error('Failed to update vendor status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'SUSPENDED':
        return 'bg-red-100 text-red-700'
      case 'REJECTED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
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

  const totalPages = Math.ceil(totalVendors / limit)

  return (
    <AdminLayout>
      {/* Vendors Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Vendors ({totalVendors} total)
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <LoadingSpinner />
          </div>
        ) : vendors.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No vendors found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Store Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                      Status
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
                  {vendors.map(vendor => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {vendor.storeName}
                          </p>
                          <p className="text-gray-600">{vendor.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {vendor.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {vendor.user?.email || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            vendor.status
                          )}`}
                        >
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(vendor.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => setSelectedVendor(vendor)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium"
                        >
                          Manage
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
              <div className="flex gap-1 items-center">
                <Button
                  disabled={page <= 1}
                  onClick={() => fetchVendors(page - 1)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded font-medium disabled:opacity-50"
                >
                  ← Previous
                </Button>

                <div className="flex gap-1 mx-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => fetchVendors(pageNum)}
                        className={`px-3 py-2 text-sm rounded font-medium transition-colors ${
                          pageNum === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <Button
                  disabled={page >= totalPages}
                  onClick={() => fetchVendors(page + 1)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded font-medium disabled:opacity-50"
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full border border-gray-200 shadow-xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Vendor Details
              </h3>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Store Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Store Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Store Name</p>
                    <p className="text-gray-900 mt-1">
                      {selectedVendor.storeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Slug</p>
                    <p className="text-gray-900 mt-1 font-mono">
                      {selectedVendor.slug}
                    </p>
                  </div>
                </div>
                {selectedVendor.description && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600">Description</p>
                    <p className="text-gray-700 mt-1 text-sm">
                      {selectedVendor.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Owner Info */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Owner Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="text-gray-900 mt-1">
                      {selectedVendor.user?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-gray-900 mt-1">
                      {selectedVendor.user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                  Manage Status
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      selectedVendor.status
                    )}`}
                  >
                    {selectedVendor.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'].map(
                    status => (
                      <Button
                        key={status}
                        onClick={() =>
                          handleUpdateStatus(selectedVendor.id, status)
                        }
                        disabled={
                          updatingStatus || selectedVendor.status === status
                        }
                        className={`py-2 text-sm font-medium rounded ${
                          selectedVendor.status === status
                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                            : status === 'ACTIVE'
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : status === 'PENDING'
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : status === 'SUSPENDED'
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {status}
                      </Button>
                    )
                  )}
                </div>
              </div>

              {/* Created/Updated */}
              <div className="border-t border-gray-200 pt-6 text-xs text-gray-600">
                <p>
                  Created:{' '}
                  {new Date(selectedVendor.createdAt).toLocaleString('vi-VN')}
                </p>
                <p>
                  Updated:{' '}
                  {new Date(selectedVendor.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
