import { createClient } from '@/lib/supabase'
import { PetitionData, CreatePetitionRequest, EmployerData } from '@/lib/types'
import { InvitationService } from './invitation.service'

export class PetitionService {
  private invitationService = new InvitationService()

  private async getSupabaseClient() {
    return createClient()
  }

  async getPetitionsByEmployerId(employerId: string): Promise<PetitionData[]> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading petitions:', error)
        throw new Error(error.message)
      }

      return (data || []) as PetitionData[]
    } catch (error: any) {
      console.error('Get petitions error:', error)
      throw new Error(error.message || 'Failed to fetch petitions')
    }
  }

  async getPetitionStatsByEmployerId(employerId: string) {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('petition_status')
        .eq('employer_id', employerId)

      if (error) {
        console.error('Error loading petition stats:', error)
        throw new Error(error.message)
      }

      const activePetitions = data?.filter(p => 
        ['draft', 'submitted', 'rfe_issued', 'rfe_responded'].includes(p.petition_status)
      ).length || 0
      
      return {
        active: activePetitions,
        total: data?.length || 0
      }
    } catch (error: any) {
      console.error('Get petition stats error:', error)
      throw new Error(error.message || 'Failed to fetch petition statistics')
    }
  }

  async createPetition(employerId: string, data: CreatePetitionRequest): Promise<PetitionData> {
    const supabase = await this.getSupabaseClient()

    try {
      console.log('Creating new petition...', data)

      // Get employer data to auto-populate petition fields
      const { data: employer, error: employerError } = await supabase
        .from('employers')
        .select(`
          *,
          employer_contacts(*),
          employer_finances(*)
        `)
        .eq('id', employerId)
        .single()

      if (employerError) {
        console.error('Error loading employer data:', employerError)
        throw new Error('Failed to load employer information')
      }

      // Auto-populate work location from employer address
      const workAddress = employer.address
      const workCity = this.extractCityFromAddress(employer.address)
      const workState = this.extractStateFromAddress(employer.address) 
      const workZipCode = employer.postal_code

      // Create the petition record with auto-populated employer data
      const { data: petitionData, error: petitionError } = await supabase
        .from('petitions')
        .insert({
          employer_id: employerId,
          employee_email: data.employee_email,
          employee_first_name: data.employee_first_name,
          employee_last_name: data.employee_last_name,
          employee_middle_name: data.employee_middle_name || null,
          petition_type: data.petition_type || 'h1b_initial',
          petition_status: 'draft',
          classification_sought: 'H1B',
          is_new_employment: data.petition_type === 'h1b_initial',
          is_extension: data.petition_type === 'h1b_extension',
          is_transfer: data.petition_type === 'h1b_transfer',
          is_amendment: data.petition_type === 'h1b_amendment',
          job_title: data.job_title,
          job_description: data.job_description,
          employment_start_date: data.employment_start_date,
          employment_end_date: data.employment_end_date,
          is_full_time: data.is_full_time ?? true,
          hours_per_week: data.hours_per_week || 40,
          work_address: workAddress,
          work_city: workCity,
          work_state: workState,
          work_zip_code: workZipCode,
          work_country: 'United States',
          annual_salary: data.annual_salary,
          salary_currency: 'USD',
          pay_frequency: 'annually',
          supervisor_name: data.supervisor_name || null,
          supervisor_title: data.supervisor_title || null,
          assigned_attorney: data.assigned_attorney || null,
          notes: data.notes || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (petitionError) {
        console.error('Petition creation error:', petitionError)
        throw new Error(petitionError.message)
      }

      console.log('Petition created successfully:', petitionData)

      // Create employee invitation for questionnaire
      try {
        await this.invitationService.createInvitationForPetition({
          petition_id: petitionData.id,
          employee_email: data.employee_email,
          employee_first_name: data.employee_first_name,
          employee_last_name: data.employee_last_name
        })
        console.log('Employee invitation created successfully')
      } catch (invitationError) {
        console.error('Failed to create invitation:', invitationError)
        // Don't fail the petition creation if invitation fails
      }

      return petitionData as PetitionData
    } catch (error: any) {
      console.error('Create petition error:', error)
      throw new Error(error.message || 'Failed to create petition')
    }
  }

  async getPetitionById(petitionId: string): Promise<PetitionData | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .eq('id', petitionId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        console.error('Error loading petition:', error)
        throw new Error(error.message)
      }

      return data as PetitionData
    } catch (error: any) {
      console.error('Get petition by ID error:', error)
      throw new Error(error.message || 'Failed to fetch petition')
    }
  }

  async updatePetitionStatus(petitionId: string, status: PetitionData['petition_status']): Promise<void> {
    const supabase = await this.getSupabaseClient()

    try {
      const { error } = await supabase
        .from('petitions')
        .update({
          petition_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', petitionId)

      if (error) {
        console.error('Error updating petition status:', error)
        throw new Error(error.message)
      }
    } catch (error: any) {
      console.error('Update petition status error:', error)
      throw new Error(error.message || 'Failed to update petition status')
    }
  }

  async getPetitionWithEmployerData(petitionId: string): Promise<PetitionData & { employer: EmployerData } | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('petitions')
        .select(`
          *,
          employers!inner(*)
        `)
        .eq('id', petitionId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error loading petition with employer:', error)
        throw new Error(error.message)
      }

      return {
        ...data,
        employer: data.employers
      } as PetitionData & { employer: EmployerData }
    } catch (error: any) {
      console.error('Get petition with employer error:', error)
      throw new Error(error.message || 'Failed to fetch petition with employer data')
    }
  }

  // Helper methods for address parsing
  private extractCityFromAddress(address: string): string {
    // Simple city extraction - can be enhanced with proper address parsing
    const parts = address.split(',')
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim()
    }
    return ''
  }

  private extractStateFromAddress(address: string): string {
    // Simple state extraction - can be enhanced with proper address parsing
    const parts = address.split(',')
    if (parts.length >= 1) {
      const lastPart = parts[parts.length - 1].trim()
      const stateMatch = lastPart.match(/([A-Z]{2})\s+\d{5}/)
      return stateMatch ? stateMatch[1] : ''
    }
    return ''
  }
} 