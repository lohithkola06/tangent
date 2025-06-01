import { NextRequest, NextResponse } from 'next/server'
import { InvitationService } from '@/lib/services/invitation.service'
import { CaseService } from '@/lib/services/case.service'
import { ApiResponse } from '@/lib/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Invitation token is required'
      } as ApiResponse, { status: 400 })
    }

    const invitationService = new InvitationService()
    const invitation = await invitationService.getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired invitation'
      } as ApiResponse, { status: 404 })
    }

    // Get case details
    const caseService = new CaseService()
    const caseData = await caseService.getCaseById(invitation.case_id)

    if (!caseData) {
      return NextResponse.json({
        success: false,
        error: 'Case not found'
      } as ApiResponse, { status: 404 })
    }

    // Get existing questionnaire response if any
    const response = await invitationService.getQuestionnaireResponse(invitation.id)

    return NextResponse.json({
      success: true,
      data: {
        invitation,
        case: caseData,
        response
      }
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get questionnaire API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching questionnaire'
    } as ApiResponse, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Invitation token is required'
      } as ApiResponse, { status: 400 })
    }

    const invitationService = new InvitationService()
    const invitation = await invitationService.getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired invitation'
      } as ApiResponse, { status: 404 })
    }

    const body = await request.json()
    
    // Save questionnaire response
    const response = await invitationService.createOrUpdateQuestionnaireResponse(
      invitation.id,
      invitation.case_id,
      body
    )

    return NextResponse.json({
      success: true,
      data: response,
      message: 'Questionnaire saved successfully'
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Save questionnaire API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while saving questionnaire'
    } as ApiResponse, { status: 500 })
  }
} 