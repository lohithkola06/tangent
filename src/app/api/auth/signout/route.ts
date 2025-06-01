import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const authService = new AuthService()
    await authService.signout()

    return NextResponse.json({
      success: true,
      message: 'Signed out successfully'
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Signout API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred during signout'
    } as ApiResponse, { status: 500 })
  }
} 