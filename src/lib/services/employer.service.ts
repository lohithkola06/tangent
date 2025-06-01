import { createClient } from '@/lib/supabase-server'
import { 
  EmployerData, 
  FinancialData, 
  ContactData, 
  CreateOrganizationRequest,
  UpdateEmployerRequest,
  UpdateFinancialRequest,
  UpdateContactRequest
} from '@/lib/types'

export class EmployerService {
  private async getSupabaseClient() {
    return await createClient()
  }

  async getEmployerByUserId(userId: string): Promise<EmployerData | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching employer data:', error)
        throw new Error(error.message)
      }

      return data as EmployerData | null
    } catch (error: any) {
      console.error('Get employer error:', error)
      throw new Error(error.message || 'Failed to fetch employer data')
    }
  }

  async getEmployerFinances(employerId: string): Promise<FinancialData | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('employer_finances')
        .select('*')
        .eq('employer_id', employerId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching employer finances:', error)
        throw new Error(error.message)
      }

      return data as FinancialData | null
    } catch (error: any) {
      console.error('Get employer finances error:', error)
      throw new Error(error.message || 'Failed to fetch financial data')
    }
  }

  async getEmployerContact(employerId: string): Promise<ContactData | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('employer_contacts')
        .select('*')
        .eq('employer_id', employerId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching employer contact:', error)
        throw new Error(error.message)
      }

      return data as ContactData | null
    } catch (error: any) {
      console.error('Get employer contact error:', error)
      throw new Error(error.message || 'Failed to fetch contact data')
    }
  }

  async createOrganization(userId: string, data: CreateOrganizationRequest): Promise<EmployerData> {
    const supabase = await this.getSupabaseClient()

    try {
      console.log('Creating organization...', data)

      // 1. Create employer record
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .insert({
          user_id: userId,
          legal_business_name: data.legal_business_name,
          trade_name: data.trade_name || null,
          federal_employer_id: data.federal_employer_id,
          address: data.business_location.address,
          suite_floor_unit: data.business_location.suite_floor_unit || null,
          postal_code: data.business_location.postal_code,
          year_established: Number(data.business_details.year_established),
          total_us_employees: Number(data.business_details.total_us_employees),
          telephone_number: data.business_details.telephone_number || null,
          nature_of_business: data.business_details.nature_of_business
        })
        .select()
        .single()

      if (employerError) {
        console.error('Employer creation error:', employerError)
        throw new Error(employerError.message)
      }

      console.log('Employer created:', employerData)

      // 2. Create employer finances record
      const { error: financesError } = await supabase
        .from('employer_finances')
        .insert({
          employer_id: employerData.id,
          gross_annual_income: Number(data.financial_info.gross_annual_income),
          net_annual_income: Number(data.financial_info.net_annual_income),
          financial_documents_url: data.financial_info.financial_documents_url
        })

      if (financesError) {
        console.error('Finances creation error:', financesError)
        throw new Error(financesError.message)
      }

      // 3. Create employer contact record
      const { error: contactError } = await supabase
        .from('employer_contacts')
        .insert({
          employer_id: employerData.id,
          first_name: data.contact_info.first_name,
          last_name: data.contact_info.last_name,
          middle_name: data.contact_info.middle_name || null,
          job_title: data.contact_info.job_title,
          telephone_number: data.contact_info.telephone_number,
          email_address: data.contact_info.email_address
        })

      if (contactError) {
        console.error('Contact creation error:', contactError)
        throw new Error(contactError.message)
      }

      // 4. Create employer notes record if notes provided
      if (data.notes) {
        const { error: notesError } = await supabase
          .from('employer_notes')
          .insert({
            employer_id: employerData.id,
            notes: data.notes
          })

        if (notesError) {
          console.error('Notes creation error:', notesError)
          // Don't throw error for notes, just log it
        }
      }

      console.log('Organization created successfully!')
      return employerData as EmployerData
    } catch (error: any) {
      console.error('Create organization error:', error)
      throw new Error(error.message || 'Failed to create organization')
    }
  }

  async updateEmployer(employerId: string, data: UpdateEmployerRequest): Promise<EmployerData> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data: updatedData, error } = await supabase
        .from('employers')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', employerId)
        .select()
        .single()

      if (error) {
        console.error('Update employer error:', error)
        throw new Error(error.message)
      }

      return updatedData as EmployerData
    } catch (error: any) {
      console.error('Update employer error:', error)
      throw new Error(error.message || 'Failed to update employer data')
    }
  }

  async updateFinances(employerId: string, data: UpdateFinancialRequest): Promise<FinancialData> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data: updatedData, error } = await supabase
        .from('employer_finances')
        .update(data)
        .eq('employer_id', employerId)
        .select()
        .single()

      if (error) {
        console.error('Update finances error:', error)
        throw new Error(error.message)
      }

      return updatedData as FinancialData
    } catch (error: any) {
      console.error('Update finances error:', error)
      throw new Error(error.message || 'Failed to update financial data')
    }
  }

  async updateContact(employerId: string, data: UpdateContactRequest): Promise<ContactData> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data: updatedData, error } = await supabase
        .from('employer_contacts')
        .update(data)
        .eq('employer_id', employerId)
        .select()
        .single()

      if (error) {
        console.error('Update contact error:', error)
        throw new Error(error.message)
      }

      return updatedData as ContactData
    } catch (error: any) {
      console.error('Update contact error:', error)
      throw new Error(error.message || 'Failed to update contact data')
    }
  }
} 