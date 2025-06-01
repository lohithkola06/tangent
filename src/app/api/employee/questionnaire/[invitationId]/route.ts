import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployeeService } from '@/lib/services/employee.service'
import { ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
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

    if (user.role !== 'employee') {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Employee role required.'
      } as ApiResponse, { status: 403 })
    }

    const invitationId = params.invitationId

    if (!invitationId) {
      return NextResponse.json({
        success: false,
        error: 'Invitation ID is required'
      } as ApiResponse, { status: 400 })
    }

    const employeeService = new EmployeeService()
    const assignment = await employeeService.getAssignmentByInvitationId(invitationId, user.email)

    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'Assignment not found or access denied'
      } as ApiResponse, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: assignment
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get employee questionnaire API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching questionnaire'
    } as ApiResponse, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
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

    if (user.role !== 'employee') {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Employee role required.'
      } as ApiResponse, { status: 403 })
    }

    const invitationId = params.invitationId

    if (!invitationId) {
      return NextResponse.json({
        success: false,
        error: 'Invitation ID is required'
      } as ApiResponse, { status: 400 })
    }

    const body = await request.json()
    
    const employeeService = new EmployeeService()
    const response = await employeeService.updateQuestionnaireProgress(
      invitationId,
      user.email,
      body
    )

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Questionnaire saved successfully'
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Save employee questionnaire API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while saving questionnaire'
    } as ApiResponse, { status: 500 })
  }
} 