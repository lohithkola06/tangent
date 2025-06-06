'use client'

import { SigninForm } from '@/components/auth/signin-form'
import { UserProfile } from '@/lib/types'

export default function SigninPage() {
  const handleSigninSuccess = (profile: UserProfile) => {
    // Redirect to dashboard after successful signin
    localStorage.setItem('userProfile', JSON.stringify(profile))
    window.location.href = '/dashboard'
  }

  return <SigninForm onSuccess={handleSigninSuccess} />
} 