'use client'

import { useState } from 'react'
import { RoleSelection } from '@/components/signup/role-selection'
import { SignupForm } from '@/components/signup/signup-form'
import { SignupSuccess } from '@/components/signup/signup-success'
import { UserRole } from '@/lib/supabase'

type SignupStep = 'role-selection' | 'form' | 'success'

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<SignupStep>('role-selection')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setCurrentStep('form')
  }

  const handleBack = () => {
    setCurrentStep('role-selection')
    setSelectedRole(null)
  }

  const handleSignupSuccess = () => {
    setCurrentStep('success')
  }

  const handleContinue = () => {
    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  return (
    <>
      {currentStep === 'role-selection' && (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      )}
      
      {currentStep === 'form' && selectedRole && (
        <SignupForm 
          selectedRole={selectedRole}
          onBack={handleBack}
          onSuccess={handleSignupSuccess}
        />
      )}
      
      {currentStep === 'success' && (
        <SignupSuccess onContinue={handleContinue} />
      )}
    </>
  )
} 