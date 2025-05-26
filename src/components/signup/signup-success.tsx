'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"

interface SignupSuccessProps {
  onContinue: () => void
}

export function SignupSuccess({ onContinue }: SignupSuccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Created Successfully!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Welcome to Tangent! Your account has been created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Check your email
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We've sent you a confirmation email. Please click the link to verify your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                Continue to Dashboard
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 