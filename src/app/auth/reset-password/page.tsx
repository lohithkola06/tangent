'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const resetToken = urlParams.get('token')
    setToken(resetToken || null)
  }, [])

  useEffect(() => {
    // Validate token when it's available
    if (token && !success) {
      const supabase = createClient()
      
      // Extract email from token
      const email = token?.split(':')[0]
      
      // Verify the reset token
      supabase.auth.verifyOtp({
        email,
        token: token,
        type: 'email'
      }).then(({ error }) => {
        if (error) {
          setError('Invalid reset token')
          setIsLoading(false)
        }
      })
    }
  }, [token, success])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      // Update password using the reset token
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message || 'Failed to update password')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Failed to update password')
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600">Invalid reset token</p>
        <Link href="/signin" className="text-blue-600 hover:text-blue-500">
          Back to sign in
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <p className="text-green-600">Password reset successfully!</p>
        <Link href="/signin" className="text-blue-600 hover:text-blue-500">
          Sign in with your new password
        </Link>
      </div>
    )
  }

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
