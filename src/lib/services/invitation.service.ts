import { createClient } from '@/lib/supabase'
import { EmployeeInvitation, CreateInvitationRequest, CreateInvitationForPetitionRequest, QuestionnaireResponse, UpdateQuestionnaireRequest } from '@/lib/types'
import { EmailService, InvitationEmailData } from './email.service'
import crypto from 'crypto'

export class InvitationService {
  private emailService: EmailService

  constructor() {
    this.emailService = new EmailService()
  }

  private async getSupabaseClient() {
    return createClient()
  }

  // New method for petition-based invitations
  async createInvitationForPetition(data: CreateInvitationForPetitionRequest): Promise<EmployeeInvitation> {
    const supabase = await this.getSupabaseClient()

    try {
      // Generate a secure invitation token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Set expiration to 30 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      console.log('Creating petition invitation...', data)

      const { data: invitation, error } = await supabase
        .from('employee_invitations')
        .insert({
          petition_id: data.petition_id,
          employee_email: data.employee_email,
          invitation_token: token,
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating petition invitation:', error)
        throw new Error(error.message)
      }

      console.log('Petition invitation created successfully:', invitation)

      // Send email invitation
      await this.sendPetitionInvitationEmail(invitation, data.employee_first_name, data.employee_last_name, data.petition_id)

      return invitation as EmployeeInvitation
    } catch (error: any) {
      console.error('Create petition invitation error:', error)
      throw new Error(error.message || 'Failed to create petition invitation')
    }
  }

  // Legacy method for case-based invitations (backward compatibility)
  async createInvitation(data: CreateInvitationRequest): Promise<EmployeeInvitation> {
    const supabase = await this.getSupabaseClient()

    try {
      // Generate a secure invitation token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Set expiration to 30 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      console.log('Creating invitation...', data)

      const insertData: any = {
        employee_email: data.employee_email,
        invitation_token: token,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      }

      // Support both case_id and petition_id
      if (data.case_id) {
        insertData.case_id = data.case_id
      }
      if (data.petition_id) {
        insertData.petition_id = data.petition_id
      }

      const { data: invitation, error } = await supabase
        .from('employee_invitations')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        throw new Error(error.message)
      }

      console.log('Invitation created successfully:', invitation)

      // Send email invitation
      if (data.case_id) {
        await this.sendInvitationEmail(invitation, data.employee_first_name, data.employee_last_name, data.case_id)
      } else if (data.petition_id) {
        await this.sendPetitionInvitationEmail(invitation, data.employee_first_name, data.employee_last_name, data.petition_id)
      }

      return invitation as EmployeeInvitation
    } catch (error: any) {
      console.error('Create invitation error:', error)
      throw new Error(error.message || 'Failed to create invitation')
    }
  }

  async getInvitationsByCase(caseId: string): Promise<EmployeeInvitation[]> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('employee_invitations')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading invitations:', error)
        throw new Error(error.message)
      }

      return (data || []) as EmployeeInvitation[]
    } catch (error: any) {
      console.error('Get invitations error:', error)
      throw new Error(error.message || 'Failed to fetch invitations')
    }
  }

  async getInvitationsByPetition(petitionId: string): Promise<EmployeeInvitation[]> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('employee_invitations')
        .select('*')
        .eq('petition_id', petitionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading petition invitations:', error)
        throw new Error(error.message)
      }

      return (data || []) as EmployeeInvitation[]
    } catch (error: any) {
      console.error('Get petition invitations error:', error)
      throw new Error(error.message || 'Failed to fetch petition invitations')
    }
  }

  async getInvitationByToken(token: string): Promise<EmployeeInvitation | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('employee_invitations')
        .select('*')
        .eq('invitation_token', token)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        console.error('Error loading invitation:', error)
        throw new Error(error.message)
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        await this.updateInvitationStatus(data.id, 'expired')
        return null
      }

      // Mark as opened if first time accessing
      if (data.status === 'sent' && !data.opened_at) {
        await this.updateInvitationStatus(data.id, 'opened')
      }

      return data as EmployeeInvitation
    } catch (error: any) {
      console.error('Get invitation by token error:', error)
      throw new Error(error.message || 'Failed to fetch invitation')
    }
  }

  async updateInvitationStatus(invitationId: string, status: EmployeeInvitation['status']): Promise<void> {
    const supabase = await this.getSupabaseClient()

    try {
      const updateData: any = { status }

      // Set appropriate timestamp based on status
      switch (status) {
        case 'sent':
          updateData.sent_at = new Date().toISOString()
          break
        case 'opened':
          updateData.opened_at = new Date().toISOString()
          break
        case 'completed':
          updateData.completed_at = new Date().toISOString()
          break
      }

      const { error } = await supabase
        .from('employee_invitations')
        .update(updateData)
        .eq('id', invitationId)

      if (error) {
        console.error('Error updating invitation status:', error)
        throw new Error(error.message)
      }
    } catch (error: any) {
      console.error('Update invitation status error:', error)
      throw new Error(error.message || 'Failed to update invitation status')
    }
  }

  async resendInvitation(invitationId: string): Promise<void> {
    const supabase = await this.getSupabaseClient()

    try {
      // Get the invitation details with both case and petition data
      const { data: invitation, error: invitationError } = await supabase
        .from('employee_invitations')
        .select(`
          *,
          cases(
            employee_first_name,
            employee_last_name,
            job_title,
            case_type
          ),
          petitions(
            employee_first_name,
            employee_last_name,
            job_title,
            petition_type
          )
        `)
        .eq('id', invitationId)
        .single()

      if (invitationError) {
        throw new Error(invitationError.message)
      }

      // Update reminder count and timestamp
      const { error: updateError } = await supabase
        .from('employee_invitations')
        .update({
          reminder_count: invitation.reminder_count + 1,
          last_reminder_sent_at: new Date().toISOString(),
          status: 'sent'
        })
        .eq('id', invitationId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Send reminder email based on whether it's case or petition based
      if (invitation.case_id && invitation.cases) {
        await this.sendInvitationEmail(
          invitation, 
          invitation.cases.employee_first_name, 
          invitation.cases.employee_last_name,
          invitation.case_id,
          true
        )
      } else if (invitation.petition_id && invitation.petitions) {
        await this.sendPetitionInvitationEmail(
          invitation, 
          invitation.petitions.employee_first_name, 
          invitation.petitions.employee_last_name,
          invitation.petition_id,
          true
        )
      }
    } catch (error: any) {
      console.error('Resend invitation error:', error)
      throw new Error(error.message || 'Failed to resend invitation')
    }
  }

  async getQuestionnaireResponse(invitationId: string): Promise<QuestionnaireResponse | null> {
    const supabase = await this.getSupabaseClient()

    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('invitation_id', invitationId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null
        }
        console.error('Error loading questionnaire response:', error)
        throw new Error(error.message)
      }

      return data as QuestionnaireResponse
    } catch (error: any) {
      console.error('Get questionnaire response error:', error)
      throw new Error(error.message || 'Failed to fetch questionnaire response')
    }
  }

  async createOrUpdateQuestionnaireResponse(
    invitationId: string, 
    data: UpdateQuestionnaireRequest
  ): Promise<QuestionnaireResponse> {
    const supabase = await this.getSupabaseClient()

    try {
      // Get the invitation to determine if it's case or petition based
      const { data: invitation, error: invitationError } = await supabase
        .from('employee_invitations')
        .select('case_id, petition_id')
        .eq('id', invitationId)
        .single()

      if (invitationError) {
        throw new Error('Invitation not found')
      }

      // Check if response already exists
      const existingResponse = await this.getQuestionnaireResponse(invitationId)

      const responseData = {
        invitation_id: invitationId,
        case_id: invitation.case_id || null,
        petition_id: invitation.petition_id || null,
        ...data
      }

      if (existingResponse) {
        // Update existing response
        const { data: updated, error: updateError } = await supabase
          .from('questionnaire_responses')
          .update(responseData)
          .eq('invitation_id', invitationId)
          .select()
          .single()

        if (updateError) {
          throw new Error(updateError.message)
        }

        return updated as QuestionnaireResponse
      } else {
        // Create new response
        const { data: created, error: createError } = await supabase
          .from('questionnaire_responses')
          .insert(responseData)
          .select()
          .single()

        if (createError) {
          throw new Error(createError.message)
        }

        return created as QuestionnaireResponse
      }
    } catch (error: any) {
      console.error('Create/update questionnaire response error:', error)
      throw new Error(error.message || 'Failed to save questionnaire response')
    }
  }

  // New method for petition-based email sending
  private async sendPetitionInvitationEmail(
    invitation: EmployeeInvitation,
    firstName: string,
    lastName: string,
    petitionId: string,
    isReminder: boolean = false
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient()

      // Get petition details for the email
      const { data: petitionData, error: petitionError } = await supabase
        .from('petitions')
        .select(`
          job_title,
          petition_type,
          employers!inner(legal_business_name)
        `)
        .eq('id', petitionId)
        .single()

      if (petitionError) {
        console.error('Error fetching petition data for email:', petitionError)
        throw new Error('Failed to fetch petition data for email')
      }

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin?email=${encodeURIComponent(invitation.employee_email)}&redirect=dashboard`

      const emailData: InvitationEmailData = {
        firstName,
        lastName,
        employerName: petitionData.employers?.legal_business_name || '',
        caseType: petitionData.petition_type,
        jobTitle: petitionData.job_title,
        loginUrl,
        expiresAt: invitation.expires_at,
        isReminder
      }

      await this.emailService.sendInvitationEmail(invitation.employee_email, emailData)

      console.log('Petition invitation email sent successfully:', {
        to: invitation.employee_email,
        isReminder,
        loginUrl
      })

      // Update status to sent
      if (!isReminder) {
        await this.updateInvitationStatus(invitation.id, 'sent')
      }

    } catch (error: any) {
      console.error('Error sending petition invitation email:', error)
      
      // Don't throw the error to prevent invitation creation from failing
      console.log('Email sending failed, but invitation was created successfully')
    }
  }

  // Legacy method for case-based email sending (backward compatibility)
  private async sendInvitationEmail(
    invitation: EmployeeInvitation,
    firstName: string,
    lastName: string,
    caseId: string,
    isReminder: boolean = false
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient()

      // Get case details for the email
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
          job_title,
          case_type,
          employers!inner(legal_business_name)
        `)
        .eq('id', caseId)
        .single()

      if (caseError) {
        console.error('Error fetching case data for email:', caseError)
        throw new Error('Failed to fetch case data for email')
      }

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin?email=${encodeURIComponent(invitation.employee_email)}&redirect=dashboard`

      const emailData: InvitationEmailData = {
        firstName,
        lastName,
        employerName: caseData.employers?.legal_business_name || '',
        caseType: caseData.case_type,
        jobTitle: caseData.job_title,
        loginUrl,
        expiresAt: invitation.expires_at,
        isReminder
      }

      await this.emailService.sendInvitationEmail(invitation.employee_email, emailData)

      console.log('Invitation email sent successfully:', {
        to: invitation.employee_email,
        isReminder,
        loginUrl
      })

      // Update status to sent
      if (!isReminder) {
        await this.updateInvitationStatus(invitation.id, 'sent')
      }

    } catch (error: any) {
      console.error('Error sending invitation email:', error)
      
      // Don't throw the error to prevent invitation creation from failing
      console.log('Email sending failed, but invitation was created successfully')
    }
  }
} 