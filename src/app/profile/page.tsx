'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, User } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { UserProfile } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentPasswordError, setCurrentPasswordError] = useState('')

  // Form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setIsLoading(true)
      const currentUser = await apiClient.getCurrentUser()
      if (!currentUser) {
        router.push('/signin')
        return
      }
      
      setUser(currentUser)
      setProfileForm({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || ''
      })
    } catch (error) {
      console.error('Error loading user:', error)
      router.push('/signin')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      // Check if any fields have actually changed
      const hasChanges = 
        profileForm.first_name !== (user?.first_name || '') ||
        profileForm.last_name !== (user?.last_name || '') ||
        profileForm.email !== (user?.email || '')

      if (!hasChanges) {
        setError('No changes detected')
        setIsSaving(false)
        return
      }

      // Prepare update data (only include changed fields)
      const updateData: any = {}
      if (profileForm.first_name !== (user?.first_name || '')) {
        updateData.first_name = profileForm.first_name
      }
      if (profileForm.last_name !== (user?.last_name || '')) {
        updateData.last_name = profileForm.last_name
      }
      if (profileForm.email !== (user?.email || '')) {
        updateData.email = profileForm.email
      }

      const result = await apiClient.updateProfile(updateData)
      
      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000) // Clear after 3 seconds
      
      // Update local user state with the returned user data
      setUser(result.user)
      
      // Update form with the latest data
      setProfileForm({
        first_name: result.user.first_name || '',
        last_name: result.user.last_name || '',
        email: result.user.email || ''
      })
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setPasswordError('')
    setCurrentPasswordError('')

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setIsSaving(false)
      return // Don't show error here, it's already shown under the field
    }

    // Validate password strength
    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long')
      setIsSaving(false)
      return
    }

    try {
      await apiClient.updatePassword({
        currentPassword: passwordForm.current_password,
        newPassword: passwordForm.new_password
      })
      
      setSuccessMessage('Password updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000) // Clear after 3 seconds
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      setShowPasswordForm(false)
      setPasswordsMatch(true)
    } catch (error: any) {
      if (error.message.includes('Current password is incorrect')) {
        setCurrentPasswordError('Incorrect password')
      } else {
        setPasswordError(error.message || 'Failed to update password')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null // Will redirect to signin
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'employer':
        return 'Employer'
      case 'employee':
        return 'Employee'
      case 'attorney':
        return 'Attorney'
      default:
        return 'User'
    }
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-700">{successMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => {
                        setProfileForm(prev => ({ ...prev, first_name: e.target.value }))
                        setSuccessMessage('') // Clear success message when user starts typing
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => {
                        setProfileForm(prev => ({ ...prev, last_name: e.target.value }))
                        setSuccessMessage('') // Clear success message when user starts typing
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm(prev => ({ ...prev, email: e.target.value }))
                      setSuccessMessage('') // Clear success message when user starts typing
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">
                      {getRoleDisplayName(user.role)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Contact support to change your account type
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Update Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button 
                  variant="outline" 
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {passwordError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{passwordError}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="current_password">Current Password *</Label>
                    <Input
                      id="current_password"
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => {
                        setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))
                        setPasswordError('') // Clear error when user starts typing
                        setCurrentPasswordError('') // Clear current password error
                      }}
                      required
                      className={currentPasswordError ? 'border-red-500' : ''}
                    />
                    {currentPasswordError && (
                      <p className="text-xs text-red-500">{currentPasswordError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">New Password *</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => {
                        const newPassword = e.target.value
                        setPasswordForm(prev => ({ ...prev, new_password: newPassword }))
                        setPasswordError('') // Clear error when user starts typing
                        // Check if passwords match in real-time
                        if (passwordForm.confirm_password && newPassword !== passwordForm.confirm_password) {
                          setPasswordsMatch(false)
                        } else {
                          setPasswordsMatch(true)
                        }
                      }}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirm New Password *</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => {
                        const confirmPassword = e.target.value
                        setPasswordForm(prev => ({ ...prev, confirm_password: confirmPassword }))
                        setPasswordError('') // Clear error when user starts typing
                        // Check if passwords match in real-time
                        if (passwordForm.new_password && confirmPassword !== passwordForm.new_password) {
                          setPasswordsMatch(false)
                        } else {
                          setPasswordsMatch(true)
                        }
                      }}
                      required
                      className={!passwordsMatch && passwordForm.confirm_password ? 'border-red-500' : ''}
                    />
                    {!passwordsMatch && passwordForm.confirm_password && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordForm({
                          current_password: '',
                          new_password: '',
                          confirm_password: ''
                        })
                        setPasswordError('')
                        setCurrentPasswordError('')
                        setPasswordsMatch(true)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
                </div>
      </div>
    </DashboardLayout>
  )
} 