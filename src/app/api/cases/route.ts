import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/supaservices'
import { EmployerService } from '@/lib/services/employer.service'
import { CaseService } from '@/lib/services/case.service'
import { CreateCaseRequest, ApiResponse } from '@/lib/types'

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

    const employerService = new EmployerService()
    const employer = await employerService.getEmployerByUserId(user.id)

    if (!employer) {
      return NextResponse.json({
        success: false,
        error: 'Employer not found'
      } as ApiResponse, { status: 404 })
    }

    const caseService = new CaseService()
    const cases = await caseService.getCasesByEmployerId(employer.id)

    return NextResponse.json({
      success: true,
      data: cases
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get cases API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching cases'
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

    const body: CreateCaseRequest = await request.json()
    
    // Validate required fields
    if (!body.employee_email || !body.employee_first_name || !body.employee_last_name || !body.job_title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required case fields'
      } as ApiResponse, { status: 400 })
    }

    const caseService = new CaseService()
    const newCase = await caseService.createCase(employer.id, body)

    return NextResponse.json({
      success: true,
      data: newCase,
      message: 'Case created successfully'
    } as ApiResponse, { status: 201 })

  } catch (error: any) {
    console.error('Create case API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while creating case'
    } as ApiResponse, { status: 500 })
  }
} 