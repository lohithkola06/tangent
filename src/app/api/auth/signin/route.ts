import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { SigninRequest, ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: SigninRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse, { status: 400 })
    }

    const authService = new AuthService()
    const result = await authService.signin(body)

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Signed in successfully'
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Signin API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred during signin'
    } as ApiResponse, { status: 401 })
  }
} 