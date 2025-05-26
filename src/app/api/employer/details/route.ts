import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployerService } from '@/lib/services/employer.service'
import { ApiResponse } from '@/lib/types'

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

    // Get additional details
    const [finances, contact] = await Promise.all([
      employerService.getEmployerFinances(employer.id),
      employerService.getEmployerContact(employer.id)
    ])

    return NextResponse.json({
      success: true,
      data: {
        employer,
        finances,
        contact
      }
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get employer details API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching employer details'
    } as ApiResponse, { status: 500 })
  }
} 