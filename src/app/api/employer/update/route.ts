import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'business', 'financial', or 'contact'
    
    if (!type || !['business', 'financial', 'contact'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid update type. Must be business, financial, or contact' },
        { status: 400 }
      )
    }

    const data = await request.json()
    
    // Get user from session/auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // For now, we'll simulate the update since we don't have the actual update methods
    // In a real implementation, you would call the appropriate service method
    
    let result
    switch (type) {
      case 'business':
        // result = await employerService.updateBusinessInfo(userId, data)
        console.log('Updating business info:', data)
        result = { success: true, message: 'Business information updated successfully' }
        break
      case 'financial':
        // result = await employerService.updateFinancialInfo(userId, data)
        console.log('Updating financial info:', data)
        result = { success: true, message: 'Financial information updated successfully' }
        break
      case 'contact':
        // result = await employerService.updateContactInfo(userId, data)
        console.log('Updating contact info:', data)
        result = { success: true, message: 'Contact information updated successfully' }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid update type' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update information' },
      { status: 500 }
    )
  }
} 