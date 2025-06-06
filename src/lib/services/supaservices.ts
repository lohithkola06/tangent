//import { createClient } from '@/lib/supabase-server'
import { createClient } from '@/lib/supabase'
import { SignupRequest, SigninRequest, AuthUser, AuthResponse,Organization,OrganizationH1BApprovers } from '@/lib/types'

export class SupaService {
  private async getSupabaseClient() {
    return createClient()
  }

  async signInWithPassword(data:SigninRequest):Promise<AuthResponse>{
    const supabase = await this.getSupabaseClient()
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })  

      return {
        user:authData.user,
        session: authData.session,
        error: authError
      }
      
    } catch (error: any) {
      console.error('Error while signin:', error)
      throw new Error(error.message || 'An error occurred while signin')
    }
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
      
    // Create organization
    const { error: orgError, data: orgData } = await supabase
      .from('organization')
      .upsert({
        employer_id: authData.user.id
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      throw new Error(`Failed to create organization: ${orgError.message}`)
    }
    const { error: profileError } = await supabase
    .from('users')
    .upsert({
      id: authData.user.id,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      role: data.role,
      org_id: orgData.id,
      status: 'active'
    })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    throw new Error(`Failed to create user profile: ${profileError.message}`)
  }
      return true;

    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(error.message || 'An error occurred during signup')
    }
  }

  async userprofileSelect(data: UserProfile): Promise<UserProfile> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data: userprofile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.id)
        .single()

      if (profileError || !userprofile) {
        throw new Error('Failed to retrieve user profile')
      }

      return userprofile as UserProfile
      
    } catch (error: any) {
      console.error('Error while retrieving user profile:', error)
      throw new Error(error.message || 'An error occurred while retrieving user profile')
    }
  }
  async userprofileUpsert(data: UserProfile): Promise<UserProfile> {
    const supabase = await this.getSupabaseClient()

    try {
      const userprofileData = {
        ...(data.id && { id: data.id }),
        ...(data.email && { email: data.email }),
        ...(data.first_name && { first_name: data.first_name }),
        ...(data.last_name && { last_name: data.last_name }),
        ...(data.role && { role: data.role }),
        ...(data.org_id && { org_id: data.org_id }),
        ...(data.status && { status: data.status }),
        ...(data.created_at && { created_at: data.created_at }),
        ...(data.updated_at && { updated_at: data.updated_at }),
      };
      const { data: userprofile, error: profileError } = await supabase
        .from('users')
        .upsert(userprofileData)
        .select('*')
        .single()
     
      if (profileError || !userprofile) {
        throw new Error('Failed to updating user profile')
      }

      return userprofile as UserProfile
      
    } catch (error: any) {
      console.error('Error while updating user profile:', error)
      throw new Error(error.message || 'An error occurred while updating user profile')
    }
  }
  
  async OrgnizationUpsert(data: Organization): Promise<Organization> {
    const supabase = await this.getSupabaseClient()

    try {
      const orgupsertData = {
        ...(data.org_id && { org_id: data.org_id }),
        ...(data.legal_business_name && { legal_business_name: data.legal_business_name }),
        ...(data.trade_name && { trade_name: data.trade_name }),
        ...(data.federal_employer_id && { federal_employer_id: data.federal_employer_id }),
        ...(data.address && { address: data.address }),
        ...(data.suite_floor_unit && { suite_floor_unit: data.suite_floor_unit }),
        ...(data.postal_code && { postal_code: data.postal_code }),
        ...(data.year_established && { year_established: data.year_established }),
        ...(data.total_us_employees && { total_us_employees: data.total_us_employees }),
        ...(data.gross_annual_income && { gross_annual_income: data.gross_annual_income }),
        ...(data.net_annual_income && { net_annual_income: data.net_annual_income }),
        ...(data.financial_documents_url && { financial_documents_url: data.financial_documents_url }),
        ...(data.telephone_number && { telephone_number: data.telephone_number }),
        ...(data.nature_of_business && { nature_of_business: data.nature_of_business }),
        ...(data.naics_code && { naics_code: data.naics_code }),
        ...(data.country_of_incorporation && { country_of_incorporation: data.country_of_incorporation }),
        ...(data.state_of_incorporation && { state_of_incorporation: data.state_of_incorporation }),
        ...(data.ssn_individual_petitioner && { ssn_individual_petitioner: data.ssn_individual_petitioner }),
        ...(data.is_individual_petitioner && { is_individual_petitioner: data.is_individual_petitioner }),
        ...(data.created_at && { created_at: data.created_at }),
        ...(data.updated_at && { updated_at: data.updated_at }),
      };
      const { error: orgError, data: orgData } = await supabase
    .from('organization')
    .upsert(orgupsertData).select().single()
    if(orgError){
      throw new Error(orgError.message || 'An error occurred while updating Organization')
    }
    return orgData
    } catch (error: any) {
      console.error('Supabase Error while updating Organization :', error)
      throw new Error(error.message || 'An error occurred while updating Organization')
    }
  }
  
  async SelectOrgnization(data: Organization): Promise<Organization> {
    const supabase = await this.getSupabaseClient()

    try {
      const { error: orgError, data: orgData } = await supabase
    .from('organization')
    .select('*').eq('org_id', data.org_id).single()
      if(orgError){
        throw new Error(orgError.message || 'An error occurred while Selecting Organization')
      }
      return orgData
    } catch (error: any) {
      console.error('Supabase Error while Selecting Organization :', error)
      throw new Error(error.message || 'An error occurred while Selecting Organization')
    }
  }

  async approverSelect(data: OrganizationH1BApprovers): Promise<OrganizationH1BApprovers> {
    const supabase = await this.getSupabaseClient()

    try {
      const { error: orgError, data: orgData } = await supabase
    .from('org_contacts')
    .select('*').eq('org_id', data.org_id).single()
      if(orgError){
        throw new Error(orgError.message || 'An error occurred while Selecting Organization')
      }
      return orgData
    } catch (error: any) {
      console.error('Supabase Error while Selecting Organization :', error)
      throw new Error(error.message || 'An error occurred while Selecting Organization')
    }
  }
async approverUpsert(data: OrganizationH1BApprovers): Promise<OrganizationH1BApprovers> {
  const supabase = await this.getSupabaseClient()

  try {
    const approverData = {
      ...(data.org_id && { org_id: data.org_id }),
      ...(data.first_name && { first_name: data.first_name }),
      ...(data.last_name && { last_name: data.last_name }),
      ...(data.middle_name && { middle_name: data.middle_name }),
      ...(data.job_title && { job_title: data.job_title }),
      ...(data.telephone_number && { telephone_number: data.telephone_number }),
      ...(data.email_address && { email_address: data.email_address }),
      ...(data.created_at && { created_at: data.created_at }),
      ...(data.updated_at && { updated_at: data.updated_at }),
    };

    const { error: orgError, data: orgData } = await supabase
  .from('org_contacts')
  .upsert(approverData).select().single()
    if(orgError){
      throw new Error(orgError.message || 'An error occurred while updating Organization Approvers')
    }
    return orgData
  } catch (error: any) {
    console.error('Supabase Error while updating Organization Approvers :', error)
    throw new Error(error.message || 'An error occurred while updating Organization Approvers')
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