'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { EmployerDashboard } from '@/components/dashboard/employer/employer-dashboard-new'
import { apiClient } from '@/lib/api-client'
import { UserProfile } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser()
      if (!currentUser) {
        router.push('/signin')
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error('Error loading user:', error)
      router.push('/signin')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'employer':
      return <EmployerDashboard />
    case 'employee':
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Employee Dashboard</h1>
            <p className="text-gray-600">Employee dashboard coming soon...</p>
          </div>
        </DashboardLayout>
      )
    case 'attorney':
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Attorney Dashboard</h1>
            <p className="text-gray-600">Attorney dashboard coming soon...</p>
          </div>
        </DashboardLayout>
      )
    default:
      return (
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <p className="text-gray-600">Unknown user role: {user.role}</p>
          </div>
        </DashboardLayout>
      )
  }
} 