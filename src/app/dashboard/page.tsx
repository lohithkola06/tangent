'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { EmployerDashboard } from "@/components/dashboard/employer/employer-dashboard"
import { Loader2 } from "lucide-react"
import { UserRole } from "@/lib/supabase"

interface UserProfile {
  id: string
  email: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Authentication error')
        return
      }

      if (!session) {
        // Redirect to signin if not authenticated
        window.location.href = '/signin'
        return
      }

      console.log('Session found:', session.user.id)
      setUser(session.user)

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('Profile result:', { profile, profileError })

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Failed to load user profile')
        return
      }

      setUserProfile(profile)

    } catch (error) {
      console.error('Auth check error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.href = '/signin'}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No user data found</p>
          <button 
            onClick={() => window.location.href = '/signin'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  // Route to appropriate dashboard based on role
  switch (userProfile.role) {
    case 'employer':
      return <EmployerDashboard user={user} userProfile={userProfile} />
    
    case 'employee':
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee Dashboard</h2>
            <p className="text-gray-600 mb-4">Coming soon...</p>
            <p className="text-sm text-gray-500">
              Welcome, {userProfile.first_name} {userProfile.last_name}!
            </p>
          </div>
        </div>
      )
    
    case 'attorney':
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Attorney Dashboard</h2>
            <p className="text-gray-600 mb-4">Coming soon...</p>
            <p className="text-sm text-gray-500">
              Welcome, {userProfile.first_name} {userProfile.last_name}!
            </p>
          </div>
        </div>
      )
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
            <p className="text-gray-600">
              Your account role ({userProfile.role}) is not recognized.
            </p>
          </div>
        </div>
      )
  }
} 