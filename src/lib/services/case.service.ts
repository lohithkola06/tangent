import { createClient } from '@/lib/supabase-server'
import { CaseData, CreateCaseRequest } from '@/lib/types'

export class CaseService {
  private async getSupabaseClient() {
    return await createClient()
  }

  async getCasesByEmployerId(employerId: string): Promise<CaseData[]> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading cases:', error)
        throw new Error(error.message)
      }

      return (data || []) as CaseData[]
    } catch (error: any) {
      console.error('Get cases error:', error)
      throw new Error(error.message || 'Failed to fetch cases')
    }
  }

  async getCaseById(caseId: string): Promise<CaseData | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading case:', error)
        throw new Error(error.message)
      }

      return data as CaseData | null
    } catch (error: any) {
      console.error('Get case error:', error)
      throw new Error(error.message || 'Failed to fetch case')
    }
  }

  async createCase(employerId: string, data: CreateCaseRequest): Promise<CaseData> {
    const supabase = await this.getSupabaseClient()

    try {
      console.log('Creating new case...', data)

      // Create the case record
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          employer_id: employerId,
          employee_email: data.employee_email,
          employee_first_name: data.employee_first_name,
          employee_last_name: data.employee_last_name,
          case_type: data.case_type,
          case_status: 'questionnaires_assigned',
          job_title: data.job_title,
          job_description: data.job_description,
          annual_salary: data.annual_salary,
          start_date: data.start_date,
          notes: data.notes || null,
          assigned_attorney: 'Wayne Nguyen, Esq.', // Default attorney for now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (caseError) {
        console.error('Case creation error:', caseError)
        throw new Error(caseError.message)
      }

      console.log('Case created successfully:', caseData)

      // TODO: Send invitation email to employee
      // TODO: Create questionnaire assignments

      return caseData as CaseData
    } catch (error: any) {
      console.error('Create case error:', error)
      throw new Error(error.message || 'Failed to create case')
    }
  }

  async updateCaseStatus(caseId: string, status: CaseData['case_status']): Promise<CaseData> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('cases')
        .update({
          case_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId)
        .select()
        .single()

      if (error) {
        console.error('Update case status error:', error)
        throw new Error(error.message)
      }

      return data as CaseData
    } catch (error: any) {
      console.error('Update case status error:', error)
      throw new Error(error.message || 'Failed to update case status')
    }
  }

  async getCaseStats(employerId: string): Promise<{ active: number; total: number }> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('cases')
        .select('case_status')
        .eq('employer_id', employerId)

      if (error) {
        console.error('Error loading case stats:', error)
        throw new Error(error.message)
      }

      const activeCases = data?.filter(c => 
        ['questionnaires_assigned', 'in_progress', 'under_review'].includes(c.case_status)
      ).length || 0
      
      return {
        active: activeCases,
        total: data?.length || 0
      }
    } catch (error: any) {
      console.error('Get case stats error:', error)
      throw new Error(error.message || 'Failed to fetch case statistics')
    }
  }
} 