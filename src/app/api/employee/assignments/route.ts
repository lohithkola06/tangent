import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/services/auth.service'
import { EmployeeService } from '@/lib/services/employee.service'
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

    if (user.role !== 'employee') {
      return NextResponse.json({
        success: false,
        error: 'Access denied. Employee role required.'
      } as ApiResponse, { status: 403 })
    }

    const employeeService = new EmployeeService()
    const assignments = await employeeService.getAssignmentsByEmail(user.email)

    return NextResponse.json({
      success: true,
      data: assignments
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Get employee assignments API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'An error occurred while fetching assignments'
    } as ApiResponse, { status: 500 })
  }
} 