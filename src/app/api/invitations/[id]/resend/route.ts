import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployerService } from '@/lib/services/employer.service'
import { InvitationService } from '@/lib/services/invitation.service'
import { ApiResponse } from '@/lib/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authService = new AuthService()
    const user = await authService.getCurrentUser()

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      } as ApiResponse, { status: 401 })
    }

    const employerService = new EmployerService()
    const employer = await employerService.getEmployerByUserId(user.id)

    if (!employer) {
      return NextResponse.json({
        success: false,
        error: 'Employer not found'
      } as ApiResponse, { status: 404 })
    }

    const invitationId = params.id

    if (!invitationId) {
      return NextResponse.json({
        success: false,
        error: 'Invitation ID is required'
      } as ApiResponse, { status: 400 })
    }

    const invitationService = new InvitationService()
    await invitationService.resendInvitation(invitationId)

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully'
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Resend invitation API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while resending invitation'
    } as ApiResponse, { status: 500 })
  }
} 