import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployerService } from '@/lib/services/employer.service'
import { InvitationService } from '@/lib/services/invitation.service'
import { CreateInvitationRequest, ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const authService = new AuthService()
    const user = await authService.getCurrentUser()

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      } as ApiResponse, { status: 401 })
    }

    const url = new URL(request.url)
    const caseId = url.searchParams.get('caseId')

    if (!caseId) {
      return NextResponse.json({
        success: false,
        error: 'Case ID is required'
      } as ApiResponse, { status: 400 })
    }

    const employerService = new EmployerService()
    const employer = await employerService.getEmployerByUserId(user.id)

    if (!employer) {
      return NextResponse.json({
        success: false,
        error: 'Employer not found'
      } as ApiResponse, { status: 404 })
    }

    const invitationService = new InvitationService()
    const invitations = await invitationService.getInvitationsByCase(caseId)

    return NextResponse.json({
      success: true,
      data: invitations
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get invitations API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching invitations'
    } as ApiResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body: CreateInvitationRequest = await request.json()
    
    // Validate required fields
    if (!body.case_id || !body.employee_email || !body.employee_first_name || !body.employee_last_name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required invitation fields'
      } as ApiResponse, { status: 400 })
    }

    const invitationService = new InvitationService()
    const invitation = await invitationService.createInvitation(body)

    return NextResponse.json({
      success: true,
      data: invitation,
      message: 'Invitation sent successfully'
    } as ApiResponse, { status: 201 })

  } catch (error: any) {
    console.error('Create invitation API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while creating invitation'
    } as ApiResponse, { status: 500 })
  }
} 