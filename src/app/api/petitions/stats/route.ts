import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployerService } from '@/lib/services/employer.service'
import { PetitionService } from '@/lib/services/petition.service'
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

    const petitionService = new PetitionService()
    const stats = await petitionService.getPetitionStatsByEmployerId(employer.id)

    return NextResponse.json({
      success: true,
      data: stats
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get petition stats API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching petition statistics'
    } as ApiResponse, { status: 500 })
  }
} 