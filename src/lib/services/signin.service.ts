import { SigninRequest, UserProfile, AuthResponse, AuthSession } from '@/lib/types'
import { SupaService } from '@/lib/services/supaservices'

export class SigninService {
    private supaService: SupaService = new SupaService();

async signin(data: SigninRequest): Promise<AuthResponse> {
    

    try {
      const { session: authData, error: signInError } = await this.supaService.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (signInError) {
        throw new Error(signInError.message)
      }
      if (!authData) {
        throw new Error('Signin failed')
      }

      // Get user profile
      const { data: profile, error: profileError } = await this.supaService.getSupabaseClient()
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
      console.error('Error while signin:', error)
      throw new Error(error.message || 'An error occurred while signin')
    }
  }
}