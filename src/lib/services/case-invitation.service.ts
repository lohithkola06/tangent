import { createClient } from "@/lib/supabase"
import { UserRole } from "@/lib/supabase"

interface CaseInvitation {
  id: string
  case_id: string
  employer_id: string
  email: string
  role: UserRole
  created_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

export class CaseInvitationService {
  private supabase = createClient()

  async createInvitation(
    caseId: string,
    employerId: string,
    email: string,
    role: UserRole
  ): Promise<CaseInvitation> {
    const { data, error } = await this.supabase
      .from('case_invitations')
      .insert({
        case_id: caseId,
        employer_id: employerId,
        email: email,
        role: role,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getInvitationsByCase(caseId: string): Promise<CaseInvitation[]> {
    const { data, error } = await this.supabase
      .from('case_invitations')
      .select('*')
      .eq('case_id', caseId)

    if (error) throw error
    return data
  }

  async acceptInvitation(invitationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('case_invitations')
      .update({
        status: 'accepted'
      })
      .eq('id', invitationId)

    if (error) throw error
  }

  async rejectInvitation(invitationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('case_invitations')
      .update({
        status: 'rejected'
      })
      .eq('id', invitationId)

    if (error) throw error
  }
}

export const caseInvitationService = new CaseInvitationService()
