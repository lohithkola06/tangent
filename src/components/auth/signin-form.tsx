'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { UserProfile } from "@/lib/types"
import { SigninService } from "@/lib/services/signin.service"

interface SigninFormProps {
  onSuccess?: (profile: UserProfile, session: any) => void
}

interface FormData {
  email: string
  password: string
}

export function SigninForm({ onSuccess }: SigninFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const signinService = new SigninService()
      console.log('Starting signin process...', { email: formData.email })
      // Sign in with password
      const response = await signinService.signin({
        email: formData.email,
        password: formData.password
      })

      if (response.error) {
        if (response.error.message.includes('User not found')) {
          setErrors({ email: 'User does not exist' })
        } else {
          setErrors({ email: response.error.message })
        }
        setIsLoading(false)
        return
      }
      console.log('Signin successful user!', response.user)
      console.log('Signin successful session!', response.session)
      // If successful, proceed with sign in
      if (response.session) {
        console.log('in Session :', response.session.access_token)
        localStorage.setItem('supabase-auth-token', response.session.access_token)

        console.log('User signed in:', response.user.id)  
        // Verify user has a profile
        

        console.log('User profile found:', response.user)
        if(onSuccess){
          onSuccess(response.user,response.session)
        }
        
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setErrors({ email: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: e.target.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: Partial<FormData>) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={errors.email ? 'border-red-500' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Don&apos;t have an account? </span>
              <Link 
                href="/signup" 
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign up
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-gray-600 hover:text-gray-500 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 