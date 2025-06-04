//import { createClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { SignupRequest, SigninRequest, UserProfile, AuthResponse } from '@/lib/types'

export class SupaService {
  private async getSupabaseClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async signup(data: SignupRequest): Promise<boolean> {
    const supabase = await this.getSupabaseClient()

    try {
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('User creation failed')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      const { error: profileError, data: profileData } = await supabase
        .rpc('employer_sign_up', {
          p_email: data.email,
          p_first_name: data.firstName,
          p_last_name: data.lastName
        });

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      return profileData;

    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'An error occurred during signup')
    }
  }

  async signin(data: SigninRequest): Promise<AuthResponse> {
    const supabase = await this.getSupabaseClient()

    try {
      console.log('Starting signin process...', { email: data.email })
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        console.error('Signin error:', authError)
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Signin failed')
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Failed to retrieve user profile')
      }

      console.log('Signin successful!')
      
      return {
        user: profile as UserProfile,
        session: authData.session
      }
    } catch (error: any) {
      console.error('Signin error:', error)
      throw new Error(error.message || 'An error occurred during signin')
    }
  }

  async signout(): Promise<void> {
    const supabase = await this.getSupabaseClient()

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
    } catch (error: any) {
      console.error('Signout error:', error)
      throw new Error(error.message || 'An error occurred during signout')
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const supabase = await this.getSupabaseClient()

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication error')
      }

      if (!session) {
        return null
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error('Failed to load user profile')
      }

      return profile as UserProfile
    } catch (error: any) {
      console.error('Get current user error:', error)
      throw new Error(error.message || 'An error occurred while fetching user')
    }
  }
} 