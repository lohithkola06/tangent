'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Loader2, Building, User, Briefcase, Calendar, DollarSign } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { CreatePetitionRequest, PetitionData } from '@/lib/types'

interface AddPetitionFormProps {
  employerId: string
  onBack: () => void
  onSuccess: (petition: PetitionData) => void
}

interface PetitionFormData {
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  employee_middle_name: string
  petition_type: 'h1b_initial' | 'h1b_extension' | 'h1b_transfer' | 'h1b_amendment'
  job_title: string
  job_description: string
  employment_start_date: string
  employment_end_date: string
  is_full_time: boolean
  hours_per_week: number
  annual_salary: string
  supervisor_name: string
  supervisor_title: string
  assigned_attorney: string
  notes: string
}

export function AddPetitionForm({ employerId, onBack, onSuccess }: AddPetitionFormProps) {
  const [formData, setFormData] = useState<PetitionFormData>({
    employee_email: '',
    employee_first_name: '',
    employee_last_name: '',
    employee_middle_name: '',
    petition_type: 'h1b_initial',
    job_title: '',
    job_description: '',
    employment_start_date: '',
    employment_end_date: '',
    is_full_time: true,
    hours_per_week: 40,
    annual_salary: '',
    supervisor_name: '',
    supervisor_title: '',
    assigned_attorney: '',
    notes: ''
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof PetitionFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Required fields validation
    if (!formData.employee_email) newErrors.employee_email = 'Employee email is required'
    if (!formData.employee_first_name) newErrors.employee_first_name = 'First name is required'
    if (!formData.employee_last_name) newErrors.employee_last_name = 'Last name is required'
    if (!formData.job_title) newErrors.job_title = 'Job title is required'
    if (!formData.job_description) newErrors.job_description = 'Job description is required'
    if (!formData.employment_start_date) newErrors.employment_start_date = 'Start date is required'
    if (!formData.employment_end_date) newErrors.employment_end_date = 'End date is required'
    if (!formData.annual_salary) newErrors.annual_salary = 'Annual salary is required'

    // Email validation
    if (formData.employee_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employee_email)) {
      newErrors.employee_email = 'Please enter a valid email address'
    }

    // Salary validation
    if (formData.annual_salary && (isNaN(Number(formData.annual_salary)) || Number(formData.annual_salary) <= 0)) {
      newErrors.annual_salary = 'Please enter a valid salary amount'
    }

    // Date validation
    if (formData.employment_start_date && formData.employment_end_date) {
      const startDate = new Date(formData.employment_start_date)
      const endDate = new Date(formData.employment_end_date)
      if (endDate <= startDate) {
        newErrors.employment_end_date = 'End date must be after start date'
      }
    }

    // Hours per week validation for part-time
    if (!formData.is_full_time && formData.hours_per_week <= 0) {
      newErrors.hours_per_week = 'Hours per week must be greater than 0'
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
      const petitionData: CreatePetitionRequest = {
        employee_email: formData.employee_email,
        employee_first_name: formData.employee_first_name,
        employee_last_name: formData.employee_last_name,
        employee_middle_name: formData.employee_middle_name || undefined,
        petition_type: formData.petition_type,
        job_title: formData.job_title,
        job_description: formData.job_description,
        employment_start_date: formData.employment_start_date,
        employment_end_date: formData.employment_end_date,
        is_full_time: formData.is_full_time,
        hours_per_week: formData.is_full_time ? 40 : formData.hours_per_week,
        annual_salary: Number(formData.annual_salary),
        supervisor_name: formData.supervisor_name || undefined,
        supervisor_title: formData.supervisor_title || undefined,
        assigned_attorney: formData.assigned_attorney || undefined,
        notes: formData.notes || undefined
      }

      const petition = await apiClient.createPetition(petitionData)
      onSuccess(petition)

    } catch (error: any) {
      console.error('Petition creation error:', error)
      setErrors({ general: error.message || 'An error occurred while creating the petition' })
    } finally {
      setIsLoading(false)
    }
  }

  const petitionTypeOptions = [
    { value: 'h1b_initial', label: 'H1-B Initial Petition' },
    { value: 'h1b_extension', label: 'H1-B Extension' },
    { value: 'h1b_transfer', label: 'H1-B Transfer' },
    { value: 'h1b_amendment', label: 'H1-B Amendment' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create New H1-B Petition</h1>
        <p className="text-gray-600">
          Create a comprehensive H1-B petition with auto-populated employer information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Employee Information
            </CardTitle>
            <CardDescription>
              Basic information about the employee for this petition
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_first_name">First Name *</Label>
                <Input
                  id="employee_first_name"
                  value={formData.employee_first_name}
                  onChange={(e) => handleInputChange('employee_first_name', e.target.value)}
                  className={errors.employee_first_name ? 'border-red-500' : ''}
                />
                {errors.employee_first_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.employee_first_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employee_last_name">Last Name *</Label>
                <Input
                  id="employee_last_name"
                  value={formData.employee_last_name}
                  onChange={(e) => handleInputChange('employee_last_name', e.target.value)}
                  className={errors.employee_last_name ? 'border-red-500' : ''}
                />
                {errors.employee_last_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.employee_last_name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_middle_name">Middle Name</Label>
                <Input
                  id="employee_middle_name"
                  value={formData.employee_middle_name}
                  onChange={(e) => handleInputChange('employee_middle_name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="employee_email">Email Address *</Label>
                <Input
                  id="employee_email"
                  type="email"
                  value={formData.employee_email}
                  onChange={(e) => handleInputChange('employee_email', e.target.value)}
                  className={errors.employee_email ? 'border-red-500' : ''}
                />
                {errors.employee_email && (
                  <p className="text-sm text-red-600 mt-1">{errors.employee_email}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Petition Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Petition Type
            </CardTitle>
            <CardDescription>
              Select the type of H1-B petition you're filing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="petition_type">Petition Type *</Label>
              <Select
                value={formData.petition_type}
                onValueChange={(value) => handleInputChange('petition_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select petition type" />
                </SelectTrigger>
                <SelectContent>
                  {petitionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Job Information
            </CardTitle>
            <CardDescription>
              Details about the position and job responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="job_title">Job Title *</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                className={errors.job_title ? 'border-red-500' : ''}
              />
              {errors.job_title && (
                <p className="text-sm text-red-600 mt-1">{errors.job_title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="job_description">Job Description *</Label>
              <Textarea
                id="job_description"
                value={formData.job_description}
                onChange={(e) => handleInputChange('job_description', e.target.value)}
                className={errors.job_description ? 'border-red-500' : ''}
                rows={4}
                placeholder="Detailed description of job duties and responsibilities..."
              />
              {errors.job_description && (
                <p className="text-sm text-red-600 mt-1">{errors.job_description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supervisor_name">Supervisor Name</Label>
                <Input
                  id="supervisor_name"
                  value={formData.supervisor_name}
                  onChange={(e) => handleInputChange('supervisor_name', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supervisor_title">Supervisor Title</Label>
                <Input
                  id="supervisor_title"
                  value={formData.supervisor_title}
                  onChange={(e) => handleInputChange('supervisor_title', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Employment Details
            </CardTitle>
            <CardDescription>
              Employment dates and work schedule information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employment_start_date">Employment Start Date *</Label>
                <Input
                  id="employment_start_date"
                  type="date"
                  value={formData.employment_start_date}
                  onChange={(e) => handleInputChange('employment_start_date', e.target.value)}
                  className={errors.employment_start_date ? 'border-red-500' : ''}
                />
                {errors.employment_start_date && (
                  <p className="text-sm text-red-600 mt-1">{errors.employment_start_date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="employment_end_date">Employment End Date *</Label>
                <Input
                  id="employment_end_date"
                  type="date"
                  value={formData.employment_end_date}
                  onChange={(e) => handleInputChange('employment_end_date', e.target.value)}
                  className={errors.employment_end_date ? 'border-red-500' : ''}
                />
                {errors.employment_end_date && (
                  <p className="text-sm text-red-600 mt-1">{errors.employment_end_date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="is_full_time">Employment Type</Label>
                <Select
                  value={formData.is_full_time ? 'full_time' : 'part_time'}
                  onValueChange={(value) => handleInputChange('is_full_time', value === 'full_time')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!formData.is_full_time && (
                <div>
                  <Label htmlFor="hours_per_week">Hours Per Week *</Label>
                  <Input
                    id="hours_per_week"
                    type="number"
                    min="1"
                    max="40"
                    value={formData.hours_per_week}
                    onChange={(e) => handleInputChange('hours_per_week', Number(e.target.value))}
                    className={errors.hours_per_week ? 'border-red-500' : ''}
                  />
                  {errors.hours_per_week && (
                    <p className="text-sm text-red-600 mt-1">{errors.hours_per_week}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Compensation
            </CardTitle>
            <CardDescription>
              Salary and compensation information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="annual_salary">Annual Salary (USD) *</Label>
              <Input
                id="annual_salary"
                type="number"
                min="0"
                step="1000"
                value={formData.annual_salary}
                onChange={(e) => handleInputChange('annual_salary', e.target.value)}
                className={errors.annual_salary ? 'border-red-500' : ''}
                placeholder="e.g., 85000"
              />
              {errors.annual_salary && (
                <p className="text-sm text-red-600 mt-1">{errors.annual_salary}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Optional fields for additional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="assigned_attorney">Assigned Attorney</Label>
              <Input
                id="assigned_attorney"
                value={formData.assigned_attorney}
                onChange={(e) => handleInputChange('assigned_attorney', e.target.value)}
                placeholder="e.g., Wayne Nguyen, Esq."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                placeholder="Any additional notes or special circumstances..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Petition...
              </>
            ) : (
              'Create Petition'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 