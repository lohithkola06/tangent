import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'Email testing is only available in development'
      } as ApiResponse, { status: 403 })
    }

    const body = await request.json()
    const { type, email, firstName, lastName } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      } as ApiResponse, { status: 400 })
    }

    // Dynamic import to avoid webpack bundling issues
    const { EmailService } = await import('@/lib/services/email.service')
    const emailService = new EmailService()

    switch (type) {
      case 'welcome':
        if (!firstName || !lastName) {
          return NextResponse.json({
            success: false,
            error: 'First name and last name are required for welcome email'
          } as ApiResponse, { status: 400 })
        }
        
        await emailService.sendWelcomeEmail(email, firstName, lastName)
        break

      case 'invitation':
        const invitationData = {
          firstName: firstName || 'John',
          lastName: lastName || 'Doe',
          employerName: 'Test Company Inc.',
          caseType: 'h1b_petition',
          jobTitle: 'Software Engineer',
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signin?email=${encodeURIComponent(email)}&redirect=dashboard`,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          isReminder: false
        }
        
        await emailService.sendInvitationEmail(email, invitationData)
        break

      case 'reminder':
        const reminderData = {
          firstName: firstName || 'John',
          lastName: lastName || 'Doe',
          employerName: 'Test Company Inc.',
          caseType: 'h1b_petition',
          jobTitle: 'Software Engineer',
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/signin?email=${encodeURIComponent(email)}&redirect=dashboard`,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          isReminder: true
        }
        
        await emailService.sendInvitationEmail(email, reminderData)
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid email type. Use: welcome, invitation, or reminder'
        } as ApiResponse, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: `${type} email sent successfully to ${email}`,
      data: {
        type,
        email,
        sentAt: new Date().toISOString()
      }
    } as ApiResponse, { status: 200 })

  } catch (error: any) {
    console.error('Test email API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send test email'
    } as ApiResponse, { status: 500 })
  }
} 