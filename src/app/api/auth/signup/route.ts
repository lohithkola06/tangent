import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { SignupRequest, ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName || !body.role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      } as ApiResponse, { status: 400 })
    }

    const authService = new AuthService()
    const result = await authService.signup(body)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Account created successfully'
    } as ApiResponse, { status: 201 })

  } catch (error: any) {
    console.error('Signup API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred during signup'
    } as ApiResponse, { status: 500 })
  }
} 