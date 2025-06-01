import { createClient } from '@/lib/supabase'
import { EmployeeInvitation, QuestionnaireResponse, CaseData } from '@/lib/types'

export interface EmployeeAssignment {
  invitation: EmployeeInvitation
  case: CaseData
  response: QuestionnaireResponse | null
}

export class EmployeeService {
  private async getSupabaseClient() {
    return createClient()
  }

  async getAssignmentsByEmail(email: string): Promise<EmployeeAssignment[]> {
    const supabase = await this.getSupabaseClient()

    try {
      // Get all invitations for this employee email
      const { data: invitations, error: invitationsError } = await supabase
        .from('employee_invitations')
        .select(`
          *,
          cases!inner(*)
        `)
        .eq('employee_email', email)
        .order('created_at', { ascending: false })

      if (invitationsError) {
        console.error('Error loading employee assignments:', invitationsError)
        throw new Error(invitationsError.message)
      }

      if (!invitations || invitations.length === 0) {
        return []
      }

      // Get questionnaire responses for each invitation
      const assignments: EmployeeAssignment[] = []
      
      for (const invitation of invitations) {
        const { data: response, error: responseError } = await supabase
          .from('questionnaire_responses')
          .select('*')
          .eq('invitation_id', invitation.id)
          .single()

        if (responseError && responseError.code !== 'PGRST116') {
          console.error('Error loading questionnaire response:', responseError)
        }

        assignments.push({
          invitation: invitation as EmployeeInvitation,
          case: invitation.cases as CaseData,
          response: response as QuestionnaireResponse | null
        })
      }

      return assignments
    } catch (error: any) {
      console.error('Get employee assignments error:', error)
      throw new Error(error.message || 'Failed to fetch employee assignments')
    }
  }

  async getAssignmentByInvitationId(invitationId: string, userEmail: string): Promise<EmployeeAssignment | null> {
    const supabase = await this.getSupabaseClient()

    try {
      // Get invitation with case details
      const { data: invitation, error: invitationError } = await supabase
        .from('employee_invitations')
        .select(`
          *,
          cases!inner(*)
        `)
        .eq('id', invitationId)
        .eq('employee_email', userEmail)
        .single()

      if (invitationError) {
        if (invitationError.code === 'PGRST116') {
          return null
        }
        console.error('Error loading assignment:', invitationError)
        throw new Error(invitationError.message)
      }

      // Check if invitation is expired
      if (new Date(invitation.expires_at) < new Date()) {
        // Update status to expired
        await supabase
          .from('employee_invitations')
          .update({ status: 'expired' })
          .eq('id', invitationId)
        return null
      }

      // Get questionnaire response
      const { data: response, error: responseError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('invitation_id', invitation.id)
        .single()

      if (responseError && responseError.code !== 'PGRST116') {
        console.error('Error loading questionnaire response:', responseError)
        throw new Error(responseError.message)
      }

      // Mark as opened if first time accessing and not already opened
      if (invitation.status === 'sent' && !invitation.opened_at) {
        await supabase
          .from('employee_invitations')
          .update({
            status: 'opened',
            opened_at: new Date().toISOString()
          })
          .eq('id', invitation.id)
      }

      return {
        invitation: invitation as EmployeeInvitation,
        case: invitation.cases as CaseData,
        response: response as QuestionnaireResponse | null
      }
    } catch (error: any) {
      console.error('Get assignment by invitation ID error:', error)
      throw new Error(error.message || 'Failed to fetch assignment')
    }
  }

  async updateQuestionnaireProgress(
    invitationId: string,
    userEmail: string,
    data: Partial<QuestionnaireResponse>
  ): Promise<QuestionnaireResponse> {
    const supabase = await this.getSupabaseClient()

    try {
      // Verify the invitation belongs to this user
      const assignment = await this.getAssignmentByInvitationId(invitationId, userEmail)
      if (!assignment) {
        throw new Error('Assignment not found or access denied')
      }

      // Check if response already exists
      const { data: existingResponse, error: checkError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('invitation_id', invitationId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message)
      }

      let response: QuestionnaireResponse

      if (existingResponse) {
        // Update existing response
        const { data: updated, error: updateError } = await supabase
          .from('questionnaire_responses')
          .update(data)
          .eq('invitation_id', invitationId)
          .select()
          .single()

        if (updateError) {
          throw new Error(updateError.message)
        }

        response = updated as QuestionnaireResponse
      } else {
        // Create new response
        const { data: created, error: createError } = await supabase
          .from('questionnaire_responses')
          .insert({
            invitation_id: invitationId,
            case_id: assignment.case.id,
            ...data
          })
          .select()
          .single()

        if (createError) {
          throw new Error(createError.message)
        }

        response = created as QuestionnaireResponse
      }

      // If questionnaire is now complete, update invitation status
      if (response.is_complete) {
        await supabase
          .from('employee_invitations')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', invitationId)
      }

      return response
    } catch (error: any) {
      console.error('Update questionnaire progress error:', error)
      throw new Error(error.message || 'Failed to update questionnaire progress')
    }
  }
} 