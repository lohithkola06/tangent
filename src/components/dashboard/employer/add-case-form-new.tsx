'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { X, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { CaseData, CreateCaseRequest } from '@/lib/types'

interface AddCaseFormProps {
  onSuccess: (newCase: CaseData) => void
  onCancel: () => void
}

interface FormData {
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  case_type: CaseData['case_type']
  job_title: string
  job_description: string
  annual_salary: string
  start_date: string
  notes: string
}

export function AddCaseForm({ onSuccess, onCancel }: AddCaseFormProps) {
  const [formData, setFormData] = useState<FormData>({
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
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.employee_email.trim()) {
      newErrors.employee_email = 'Employee email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.employee_email)) {
      newErrors.employee_email = 'Invalid email format'
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

    if (!formData.annual_salary.trim()) {
      newErrors.annual_salary = 'Annual salary is required'
    } else if (isNaN(Number(formData.annual_salary)) || Number(formData.annual_salary) <= 0) {
      newErrors.annual_salary = 'Please enter a valid salary amount'
    }

    if (!formData.start_date.trim()) {
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
      const caseRequest: CreateCaseRequest = {
        employee_email: formData.employee_email,
        employee_first_name: formData.employee_first_name,
        employee_last_name: formData.employee_last_name,
        case_type: formData.case_type,
        job_title: formData.job_title,
        job_description: formData.job_description,
        annual_salary: Number(formData.annual_salary),
        start_date: formData.start_date,
        notes: formData.notes || undefined
      }

      const newCase = await apiClient.createCase(caseRequest)
      onSuccess(newCase)
    } catch (error: any) {
      console.error('Create case error:', error)
      setErrors({ employee_email: error.message || 'Failed to create case' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSelectChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Add New Case</CardTitle>
            <CardDescription>
              Create a new H1-B petition case for an employee
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employee Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employee_first_name">First Name</Label>
                <Input
                  id="employee_first_name"
                  value={formData.employee_first_name}
                  onChange={handleInputChange('employee_first_name')}
                  className={errors.employee_first_name ? 'border-red-500' : ''}
                />
                {errors.employee_first_name && (
                  <p className="text-sm text-red-500">{errors.employee_first_name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee_last_name">Last Name</Label>
                <Input
                  id="employee_last_name"
                  value={formData.employee_last_name}
                  onChange={handleInputChange('employee_last_name')}
                  className={errors.employee_last_name ? 'border-red-500' : ''}
                />
                {errors.employee_last_name && (
                  <p className="text-sm text-red-500">{errors.employee_last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee_email">Email Address</Label>
              <Input
                id="employee_email"
                type="email"
                value={formData.employee_email}
                onChange={handleInputChange('employee_email')}
                className={errors.employee_email ? 'border-red-500' : ''}
                placeholder="employee@company.com"
              />
              {errors.employee_email && (
                <p className="text-sm text-red-500">{errors.employee_email}</p>
              )}
            </div>
          </div>

          {/* Case Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Case Information</h3>
            
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
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={handleInputChange('job_title')}
                className={errors.job_title ? 'border-red-500' : ''}
                placeholder="Software Engineer"
              />
              {errors.job_title && (
                <p className="text-sm text-red-500">{errors.job_title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_description">Job Description</Label>
              <Textarea
                id="job_description"
                value={formData.job_description}
                onChange={handleInputChange('job_description')}
                className={errors.job_description ? 'border-red-500' : ''}
                placeholder="Detailed description of job duties and responsibilities..."
                rows={4}
              />
              {errors.job_description && (
                <p className="text-sm text-red-500">{errors.job_description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annual_salary">Annual Salary ($)</Label>
                <Input
                  id="annual_salary"
                  type="number"
                  value={formData.annual_salary}
                  onChange={handleInputChange('annual_salary')}
                  className={errors.annual_salary ? 'border-red-500' : ''}
                  placeholder="80000"
                />
                {errors.annual_salary && (
                  <p className="text-sm text-red-500">{errors.annual_salary}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
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
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Additional notes or special instructions..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Case...
                </>
              ) : (
                'Create Case'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 