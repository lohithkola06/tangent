'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"
import { Loader2, ArrowLeft, Plus } from "lucide-react"
import { InviteEmployee } from "./invite-employee"
import { UserRole } from "@/lib/supabase"
import { CaseInvitationService } from "@/lib/services/case-invitation.service"
import { toast } from "react-hot-toast"

interface AddCaseFormProps {
  employerId: string
  onBack: () => void
  onSuccess: () => void
}

interface CaseFormData {
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  case_type: string
  job_title: string
  job_description: string
  annual_salary: string
  start_date: string
  notes: string
}

export function AddCaseForm({ employerId, onBack, onSuccess }: AddCaseFormProps) {
  const [formData, setFormData] = useState<CaseFormData>({
    employee_email: '',
    employee_first_name: '',
    employee_last_name: '',
    case_type: 'h1b_petition',
    job_title: '',
    job_description: '',
    annual_salary: '',
    start_date: '',
    notes: ''
  })

  const [caseData, setCaseData] = useState<{
    id: string
    employer_id: string
    employee_email: string
    employee_first_name: string
    employee_last_name: string
    case_type: string
    case_status: string
    job_title: string
    job_description: string
    annual_salary: number
    start_date: string
    notes: string | null
    assigned_attorney: string
    created_at: string
    updated_at: string
  } | null>(null)
  const caseInvitationService = new CaseInvitationService()


  type FormDataErrors = Record<keyof CaseFormData, string | undefined> & {
    general?: string
  };
  const [errors, setErrors] = useState<FormDataErrors>({
    employee_email: undefined,
    employee_first_name: undefined,
    employee_last_name: undefined,
    case_type: undefined,
    job_title: undefined,
    job_description: undefined,
    annual_salary: undefined,
    start_date: undefined,
    notes: undefined,
    general: undefined
  });
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleError = (error: unknown) => {
    const newErrors: FormDataErrors = {
      employee_email: undefined,
      employee_first_name: undefined,
      employee_last_name: undefined,
      case_type: undefined,
      job_title: undefined,
      job_description: undefined,
      annual_salary: undefined,
      start_date: undefined,
      notes: undefined,
      general: error instanceof Error ? error.message : 'Missing or invalid data'
    }
    setErrors(newErrors)
  }

  const validateForm = (): boolean => {
    const newErrors: FormDataErrors = {
      employee_email: undefined,
      employee_first_name: undefined,
      employee_last_name: undefined,
      case_type: undefined,
      job_title: undefined,
      job_description: undefined,
      annual_salary: undefined,
      start_date: undefined,
      notes: undefined,
      general: undefined
    }
    
    console.log('Validating form data:', formData)
    console.log('Current errors:', errors)

    // Employee information
    if (!formData.employee_email?.trim()) {
      console.log('Validation error: employee_email is required')
      newErrors.employee_email = 'Employee email is required'
    } else if (!formData.employee_email.includes('@')) {
      console.log('Validation error: employee_email is invalid')
      newErrors.employee_email = 'Please enter a valid email address'
    }

    if (!formData.employee_first_name?.trim()) {
      console.log('Validation error: employee_first_name is required')
      newErrors.employee_first_name = 'First name is required'
    }

    if (!formData.employee_last_name?.trim()) {
      console.log('Validation error: employee_last_name is required')
      newErrors.employee_last_name = 'Last name is required'
    }

    // Case information
    if (!formData.case_type?.trim()) {
      console.log('Validation error: case_type is required')
      newErrors.case_type = 'Case type is required'
    }

    if (!formData.job_title?.trim()) {
      console.log('Validation error: job_title is required')
      newErrors.job_title = 'Job title is required'
    }

    if (!formData.job_description?.trim()) {
      console.log('Validation error: job_description is required')
      newErrors.job_description = 'Job description is required'
    }

    // Salary and date
    if (!formData.annual_salary?.trim()) {
      console.log('Validation error: annual_salary is required')
      newErrors.annual_salary = 'Annual salary is required'
    } else if (isNaN(Number(formData.annual_salary))) {
      console.log('Validation error: annual_salary is invalid')
      newErrors.annual_salary = 'Please enter a valid number'
    }

    if (!formData.start_date?.trim()) {
      console.log('Validation error: start_date is required')
      newErrors.start_date = 'Start date is required'
    }

    // Set errors only if there are actual errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined)
    if (hasErrors) {
      setErrors(newErrors)
    }

    return !hasErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submission started')
    console.log('Form data:', formData)
    console.log('Errors:', errors)
    
    e.preventDefault()
    
    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }
    
    console.log('Form validation passed')

    setIsLoading(true)

    try {
      const supabase = createClient()

      console.log('Creating new case...', formData)

      // 1. Check if user exists
      const { error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', formData.employee_email)
        .single()

      if (userError) {
        // If user doesn't exist, create new user account
        console.log('Creating new user account...')
        // First create employee record
       
        const { error: authError } = await supabase.auth.signUp({
          email: formData.employee_email,
          password: 'temp_password', // Will be reset immediately
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`
          }
        })

        if (authError) throw authError
      // Create user profile using stored procedure
      const { error: profileError, data: profileData } = await supabase
      .rpc('create_user_profile', {
        p_email: formData.employee_email,
        p_first_name: formData.employee_first_name,
        p_last_name: formData.employee_last_name,
        p_role: 'employee'
      })
      .select()
      .single()

      if (profileError) {
      console.error('Profile creation error:', profileError)
      throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      console.log('User profile created:', profileData)
        const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .insert({
          id: profileData.id,
          first_name: formData.employee_first_name,
          last_name: formData.employee_last_name,
          email_address: formData.employee_email
        })
        .select()
        .single()

      if (employeeError) throw employeeError
      const employeeId = employeeData.id

        // Send password reset request after creating new user
        console.log('Sending password reset request for new user...')
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.employee_email, {
          redirectTo: `${window.location.origin}/auth/reset-password?employeeId=${employeeId}`,
          captchaToken: undefined
        })

        if (resetError) throw resetError
      } else {
        // If user exists, send password reset request
        console.log('User exists, sending password reset request...')
        const { error: authError } = await supabase.auth.resetPasswordForEmail(formData.employee_email, {
          redirectTo: `${window.location.origin}/auth/reset-password?caseId=${employerId}`,
          captchaToken: undefined
        })

        if (authError) throw authError
      }

      // 2. Create the case record
      const { data, error } = await supabase
        .from('cases')
        .insert([{
          employer_id: employerId,
          employee_email: formData.employee_email,
          employee_first_name: formData.employee_first_name,
          employee_last_name: formData.employee_last_name,
          case_type: formData.case_type,
          job_title: formData.job_title,
          job_description: formData.job_description,
          annual_salary: formData.annual_salary,
          start_date: formData.start_date,
          notes: formData.notes,
          assigned_attorney: 'pending',
          case_status: 'questionnaires_assigned'  // Initial status for new cases
        }])
        .select()
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create case')

      setCaseData(data)

      // 3. Create case invitation for employee
      await caseInvitationService.createInvitation(
        data.id,
        employerId,
        formData.employee_email,
        'employee' as UserRole
      )

      // Create case invitation for attorney
      /*await caseInvitationService.createInvitation(
        data.id,
        employerId,
        data.assigned_attorney,
        'attorney' as UserRole
      )*/

      // Show success message
      toast.success('Case created successfully')
      onSuccess()
    } catch (error) {
      console.error('Error creating case:', error)
      handleError(error)
      toast.error('Failed to create case')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CaseFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSelectChange = (field: keyof CaseFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Case</h1>
                <p className="text-gray-600">Create a new H1-B petition case</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Case Information</CardTitle>
            <CardDescription>
              Enter the details for the new H1-B petition case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {/* Employer Information */}
              {/* {employer && (
                <EmployerInfo
                  employer={employer}
                  onEdit={() => {
                    // TODO: Implement employer edit functionality
                    console.log('Edit employer clicked')
                  }}
                />
              )}

              {/* Invite Employee */}
              {caseData && (
                <InviteEmployee
                  caseId={caseData.id}
                  employerId={employerId}
                />
              )}

              {/* Employee Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Employee Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_first_name">First Name *</Label>
                    <Input
                      id="employee_first_name"
                      value={formData.employee_first_name}
                      onChange={handleInputChange('employee_first_name')}
                      className={errors.employee_first_name ? 'border-red-500' : ''}
                      placeholder="Employee's first name"
                    />
                    {errors.employee_first_name && (
                      <p className="text-sm text-red-500">{errors.employee_first_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employee_last_name">Last Name *</Label>
                    <Input
                      id="employee_last_name"
                      value={formData.employee_last_name}
                      onChange={handleInputChange('employee_last_name')}
                      className={errors.employee_last_name ? 'border-red-500' : ''}
                      placeholder="Employee's last name"
                    />
                    {errors.employee_last_name && (
                      <p className="text-sm text-red-500">{errors.employee_last_name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_email">Email Address *</Label>
                  <Input
                    id="employee_email"
                    type="email"
                    value={formData.employee_email}
                    onChange={handleInputChange('employee_email')}
                    className={errors.employee_email ? 'border-red-500' : ''}
                    placeholder="employee@example.com"
                  />
                  {errors.employee_email && (
                    <p className="text-sm text-red-500">{errors.employee_email}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    An invitation will be sent to this email address
                  </p>
                </div>
              </div>

              {/* Case Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Case Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="case_type">Case Type</Label>
                  <Select value={formData.case_type} onValueChange={handleSelectChange('case_type')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="h1b_petition">H1-B Petition</SelectItem>
                      <SelectItem value="h1b_extension">H1-B Extension</SelectItem>
                      <SelectItem value="h1b_transfer">H1-B Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange('job_title')}
                    className={errors.job_title ? 'border-red-500' : ''}
                    placeholder="e.g., Software Engineer"
                  />
                  {errors.job_title && (
                    <p className="text-sm text-red-500">{errors.job_title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_description">Job Description *</Label>
                  <Textarea
                    id="job_description"
                    value={formData.job_description}
                    onChange={handleInputChange('job_description')}
                    className={errors.job_description ? 'border-red-500' : ''}
                    placeholder="Describe the job responsibilities and requirements"
                    rows={4}
                  />
                  {errors.job_description && (
                    <p className="text-sm text-red-500">{errors.job_description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="annual_salary">Annual Salary (USD) *</Label>
                    <Input
                      id="annual_salary"
                      type="number"
                      value={formData.annual_salary}
                      onChange={handleInputChange('annual_salary')}
                      className={errors.annual_salary ? 'border-red-500' : ''}
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    {errors.annual_salary && (
                      <p className="text-sm text-red-500">{errors.annual_salary}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_date">Proposed Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleInputChange('start_date')}
                      className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">{errors.start_date}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    placeholder="Any additional information or special requirements"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Case...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Case
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 