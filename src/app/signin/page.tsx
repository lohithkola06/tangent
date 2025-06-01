'use client'

import { SigninForm } from '@/components/auth/signin-form'

export default function SigninPage() {
  const handleSigninSuccess = () => {
    // Redirect to dashboard after successful signin
    window.location.href = '/dashboard'
  }

  return <SigninForm onSuccess={handleSigninSuccess} />
} 