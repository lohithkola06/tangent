import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployerService } from '@/lib/services/employer.service'
import { CreateOrganizationRequest, ApiResponse } from '@/lib/types'

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

    return NextResponse.json({
      success: true,
      data: employer
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get employer API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching employer data'
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

    const body: CreateOrganizationRequest = await request.json()
    
    // Validate required fields
    if (!body.legal_business_name || !body.federal_employer_id || !body.business_location?.address) {
      return NextResponse.json({
        success: false,
        error: 'Missing required organization fields'
      } as ApiResponse, { status: 400 })
    }

    const employerService = new EmployerService()
    const employer = await employerService.createOrganization(user.id, body)

    return NextResponse.json({
      success: true,
      data: employer,
      message: 'Organization created successfully'
    } as ApiResponse, { status: 201 })

  } catch (error: any) {
    console.error('Create organization API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while creating organization'
    } as ApiResponse, { status: 500 })
  }
} 