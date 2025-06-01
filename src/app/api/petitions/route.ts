import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployerService } from '@/lib/services/employer.service'
import { PetitionService } from '@/lib/services/petition.service'
import { CreatePetitionRequest, ApiResponse } from '@/lib/types'

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
    const petitions = await petitionService.getPetitionsByEmployerId(employer.id)

    return NextResponse.json({
      success: true,
      data: petitions
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get petitions API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching petitions'
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

    const body: CreatePetitionRequest = await request.json()
    
    // Validate required fields
    if (!body.employee_email || !body.employee_first_name || !body.employee_last_name || 
        !body.job_title || !body.job_description || !body.employment_start_date || 
        !body.employment_end_date || !body.annual_salary) {
      return NextResponse.json({
        success: false,
        error: 'Missing required petition fields'
      } as ApiResponse, { status: 400 })
    }

    const petitionService = new PetitionService()
    const petition = await petitionService.createPetition(employer.id, body)

    return NextResponse.json({
      success: true,
      data: petition,
      message: 'Petition created successfully'
    } as ApiResponse, { status: 201 })

  } catch (error: any) {
    console.error('Create petition API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while creating petition'
    } as ApiResponse, { status: 500 })
  }
} 