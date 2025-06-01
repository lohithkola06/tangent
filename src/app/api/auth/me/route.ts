import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
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

    return NextResponse.json({
      success: true,
      data: user
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get current user API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching user'
    } as ApiResponse, { status: 500 })
  }
} 