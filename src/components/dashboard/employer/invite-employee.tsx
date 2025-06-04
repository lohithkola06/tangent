'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface InviteEmployeeProps {
  caseId: string
  employerId: string
}

export function InviteEmployee({ caseId, employerId }: InviteEmployeeProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!email.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Create a case invitation
      const { error: inviteError } = await supabase
        .from('case_invitations')
        .insert({
          case_id: caseId,
          employer_id: employerId,
          email: email,
          role: 'employee'
        })

      if (inviteError) throw inviteError

      // Send invitation email
      const { error: emailError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify?caseId=${caseId}&employerId=${employerId}`
        }
      })

      if (emailError) throw emailError

      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Invitation Sent!</CardTitle>
          <CardDescription>
            An invitation has been sent to {email}. The employee will receive an email with instructions to create their account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false)
              setEmail("")
            }}
          >
            Send Another Invitation
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Invite Employee</CardTitle>
        <CardDescription>
          Send an invitation to your employee to create their account and manage this case
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="employeeEmail">Employee Email</Label>
            <Input
              id="employeeEmail"
              type="email"
              placeholder="employee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button
            onClick={handleInvite}
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
