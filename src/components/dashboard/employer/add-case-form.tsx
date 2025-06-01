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
  annual_salary: number | ''
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

  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: any = {}

    if (!formData.employee_email.trim()) {
      newErrors.employee_email = 'Employee email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.employee_email)) {
      newErrors.employee_email = 'Email is invalid'
    }

    if (!formData.employee_first_name.trim()) {
      newErrors.employee_first_name = 'First name is required'
    }

    if (!formData.employee_last_name.trim()) {
      newErrors.employee_last_name = 'Last name is required'
    }

    if (!formData.job_title.trim()) {
      newErrors.job_title = 'Job title is required'
    }

    if (!formData.job_description.trim()) {
      newErrors.job_description = 'Job description is required'
    }

    if (!formData.annual_salary) {
      newErrors.annual_salary = 'Annual salary is required'
    } else if (Number(formData.annual_salary) <= 0) {
      newErrors.annual_salary = 'Annual salary must be greater than 0'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      console.log('Creating new case...', formData)

      // Create the case record
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .insert({
          employer_id: employerId,
          employee_email: formData.employee_email,
          employee_first_name: formData.employee_first_name,
          employee_last_name: formData.employee_last_name,
          case_type: formData.case_type,
          case_status: 'questionnaires_assigned',
          job_title: formData.job_title,
          job_description: formData.job_description,
          annual_salary: Number(formData.annual_salary),
          start_date: formData.start_date,
          notes: formData.notes || null,
          assigned_attorney: 'Wayne Nguyen, Esq.', // Default attorney for now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (caseError) {
        console.error('Case creation error:', caseError)
        throw caseError
      }

      console.log('Case created successfully:', caseData)

      // TODO: Send invitation email to employee
      // TODO: Create questionnaire assignments

      onSuccess()

    } catch (error: any) {
      console.error('Case creation error:', error)
      setErrors({ general: error.message || 'An error occurred while creating the case' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof CaseFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'annual_salary' ? (e.target.value ? Number(e.target.value) : '') : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSelectChange = (field: keyof CaseFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
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