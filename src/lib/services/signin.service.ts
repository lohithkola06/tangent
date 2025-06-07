import { SigninRequest, AuthResponse } from '@/lib/types'
import { SupaService } from '@/lib/services/supaservices'

export class SigninService {
    private supaService: SupaService = new SupaService();

async signin(data: SigninRequest): Promise<AuthResponse> {
    

    try {
      const response = await this.supaService.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (response.error) {
        throw new Error(response.error.message)
      }
      if (!response.user) {
        throw new Error('Signin failed')
      }

      console.log('Signin successful!')
      
      return {
        user:   {
            id: response.user.id,
            email: response.user.email,
            first_name: response.user.first_name, // or get from user profile
            last_name: response.user.last_name, // or get from user profile
            role: response.user.role, // or get from user profile
            org_id: response.user.org_id, // or get from user profile
            status: response.user.status, // or get from user profile
            created_at: response.user.created_at,
            updated_at: response.user.updated_at
          },
        session: response.session,
        error: null
      }
    } catch (error: any) {
      console.error('Error while signin:', error)
      throw new Error(error.message || 'An error occurred while signin')
    }
  }
}