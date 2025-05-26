import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function PUT(request: NextRequest) {
  try {
    const { first_name, last_name, email } = await request.json()

    if (!first_name && !last_name && !email) {
      return NextResponse.json(
        { error: 'At least one field (first_name, last_name, or email) is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Prepare updates for auth.users table (only email can be updated here)
    const authUpdates: any = {}
    if (email && email !== user.email) {
      authUpdates.email = email
    }

    // Update auth.users table if email changed
    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } = await supabase.auth.updateUser(authUpdates)
      
      if (authUpdateError) {
        console.error('Auth update error:', authUpdateError)
        return NextResponse.json(
          { error: 'Failed to update email in authentication system' },
          { status: 500 }
        )
      }
    }

    // Prepare updates for public.users table
    const profileUpdates: any = {}
    if (first_name !== undefined) profileUpdates.first_name = first_name
    if (last_name !== undefined) profileUpdates.last_name = last_name
    if (email !== undefined) profileUpdates.email = email
    profileUpdates.updated_at = new Date().toISOString()

    // Update public.users table
    const { data: updatedUser, error: profileUpdateError } = await supabase
      .from('users')
      .update(profileUpdates)
      .eq('id', user.id)
      .select()
      .single()

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      return NextResponse.json(
        { error: 'Failed to update profile information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: {
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      }
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
} 