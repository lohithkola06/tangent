'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Loader2, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { EmployerData, CreateOrganizationRequest } from '@/lib/types'

interface CreateOrganizationFormProps {
  onSuccess: (employer: EmployerData) => void
  onCancel: () => void
}

interface FormData {
  // Step 1: Basic Business Information
  legal_business_name: string
  trade_name: string
  federal_employer_id: string
  
  // Step 2: Business Location
  address: string
  suite_floor_unit: string
  postal_code: string
  
  // Step 3: Business Details
  year_established: string
  total_us_employees: string
  telephone_number: string
  nature_of_business: string
  
  // Step 4: Financial Information
  gross_annual_income: string
  net_annual_income: string
  financial_documents_url: string
  
  // Step 5: Contact Information
  contact_first_name: string
  contact_last_name: string
  contact_middle_name: string
  contact_job_title: string
  contact_telephone_number: string
  contact_email_address: string
  notes: string
}

export function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    legal_business_name: '',
    trade_name: '',
    federal_employer_id: '',
    address: '',
    suite_floor_unit: '',
    postal_code: '',
    year_established: '',
    total_us_employees: '',
    telephone_number: '',
    nature_of_business: '',
    gross_annual_income: '',
    net_annual_income: '',
    financial_documents_url: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_middle_name: '',
    contact_job_title: '',
    contact_telephone_number: '',
    contact_email_address: '',
    notes: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {}

    switch (step) {
      case 1:
        if (!formData.legal_business_name.trim()) {
          newErrors.legal_business_name = 'Legal business name is required'
        }
        if (!formData.federal_employer_id.trim()) {
          newErrors.federal_employer_id = 'Federal Employer ID is required'
        }
        break
      case 2:
        if (!formData.address.trim()) {
          newErrors.address = 'Address is required'
        }
        if (!formData.postal_code.trim()) {
          newErrors.postal_code = 'Postal code is required'
        }
        break
      case 3:
        if (!formData.year_established.trim()) {
          newErrors.year_established = 'Year established is required'
        }
        if (!formData.total_us_employees.trim()) {
          newErrors.total_us_employees = 'Total US employees is required'
        }
        if (!formData.nature_of_business.trim()) {
          newErrors.nature_of_business = 'Nature of business is required'
        }
        break
      case 4:
        if (!formData.gross_annual_income.trim()) {
          newErrors.gross_annual_income = 'Gross annual income is required'
        }
        if (!formData.net_annual_income.trim()) {
          newErrors.net_annual_income = 'Net annual income is required'
        }
        if (!formData.financial_documents_url.trim()) {
          newErrors.financial_documents_url = 'Financial documents URL is required'
        }
        break
      case 5:
        if (!formData.contact_first_name.trim()) {
          newErrors.contact_first_name = 'Contact first name is required'
        }
        if (!formData.contact_last_name.trim()) {
          newErrors.contact_last_name = 'Contact last name is required'
        }
        if (!formData.contact_job_title.trim()) {
          newErrors.contact_job_title = 'Contact job title is required'
        }
        if (!formData.contact_telephone_number.trim()) {
          newErrors.contact_telephone_number = 'Contact telephone number is required'
        }
        if (!formData.contact_email_address.trim()) {
          newErrors.contact_email_address = 'Contact email address is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return
    }

    setIsLoading(true)
    
    try {
      const organizationRequest: CreateOrganizationRequest = {
        legal_business_name: formData.legal_business_name,
        trade_name: formData.trade_name || undefined,
        federal_employer_id: formData.federal_employer_id,
        business_location: {
          address: formData.address,
          suite_floor_unit: formData.suite_floor_unit || undefined,
          postal_code: formData.postal_code
        },
        business_details: {
          year_established: formData.year_established,
          total_us_employees: formData.total_us_employees,
          telephone_number: formData.telephone_number || undefined,
          nature_of_business: formData.nature_of_business
        },
        financial_info: {
          gross_annual_income: formData.gross_annual_income,
          net_annual_income: formData.net_annual_income,
          financial_documents_url: formData.financial_documents_url
        },
        contact_info: {
          first_name: formData.contact_first_name,
          last_name: formData.contact_last_name,
          middle_name: formData.contact_middle_name || undefined,
          job_title: formData.contact_job_title,
          telephone_number: formData.contact_telephone_number,
          email_address: formData.contact_email_address
        },
        notes: formData.notes || undefined
      }

      const employer = await apiClient.createOrganization(organizationRequest)
      onSuccess(employer)
    } catch (error: any) {
      console.error('Create organization error:', error)
      setErrors({ legal_business_name: error.message || 'Failed to create organization' })
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Business Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="legal_business_name">Legal Business Name *</Label>
              <Input
                id="legal_business_name"
                value={formData.legal_business_name}
                onChange={handleInputChange('legal_business_name')}
                className={errors.legal_business_name ? 'border-red-500' : ''}
                placeholder="Enter your legal business name"
              />
              {errors.legal_business_name && (
                <p className="text-sm text-red-500">{errors.legal_business_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_name">Trade Name (Optional)</Label>
              <Input
                id="trade_name"
                value={formData.trade_name}
                onChange={handleInputChange('trade_name')}
                placeholder="Enter your trade name if different"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="federal_employer_id">Federal Employer ID (EIN) *</Label>
              <Input
                id="federal_employer_id"
                value={formData.federal_employer_id}
                onChange={handleInputChange('federal_employer_id')}
                className={errors.federal_employer_id ? 'border-red-500' : ''}
                placeholder="XX-XXXXXXX"
              />
              {errors.federal_employer_id && (
                <p className="text-sm text-red-500">{errors.federal_employer_id}</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Location</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange('address')}
                className={errors.address ? 'border-red-500' : ''}
                placeholder="Street address"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="suite_floor_unit">Suite/Floor/Unit (Optional)</Label>
              <Input
                id="suite_floor_unit"
                value={formData.suite_floor_unit}
                onChange={handleInputChange('suite_floor_unit')}
                placeholder="Suite 100, Floor 5, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange('postal_code')}
                className={errors.postal_code ? 'border-red-500' : ''}
                placeholder="12345"
              />
              {errors.postal_code && (
                <p className="text-sm text-red-500">{errors.postal_code}</p>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Business Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year_established">Year Established *</Label>
                <Input
                  id="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={handleInputChange('year_established')}
                  className={errors.year_established ? 'border-red-500' : ''}
                  placeholder="2020"
                />
                {errors.year_established && (
                  <p className="text-sm text-red-500">{errors.year_established}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_us_employees">Total US Employees *</Label>
                <Input
                  id="total_us_employees"
                  type="number"
                  value={formData.total_us_employees}
                  onChange={handleInputChange('total_us_employees')}
                  className={errors.total_us_employees ? 'border-red-500' : ''}
                  placeholder="50"
                />
                {errors.total_us_employees && (
                  <p className="text-sm text-red-500">{errors.total_us_employees}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone_number">Telephone Number (Optional)</Label>
              <Input
                id="telephone_number"
                value={formData.telephone_number}
                onChange={handleInputChange('telephone_number')}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nature_of_business">Nature of Business *</Label>
              <Textarea
                id="nature_of_business"
                value={formData.nature_of_business}
                onChange={handleInputChange('nature_of_business')}
                className={errors.nature_of_business ? 'border-red-500' : ''}
                placeholder="Describe your business activities..."
                rows={3}
              />
              {errors.nature_of_business && (
                <p className="text-sm text-red-500">{errors.nature_of_business}</p>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gross_annual_income">Gross Annual Income ($) *</Label>
                <Input
                  id="gross_annual_income"
                  type="number"
                  value={formData.gross_annual_income}
                  onChange={handleInputChange('gross_annual_income')}
                  className={errors.gross_annual_income ? 'border-red-500' : ''}
                  placeholder="1000000"
                />
                {errors.gross_annual_income && (
                  <p className="text-sm text-red-500">{errors.gross_annual_income}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="net_annual_income">Net Annual Income ($) *</Label>
                <Input
                  id="net_annual_income"
                  type="number"
                  value={formData.net_annual_income}
                  onChange={handleInputChange('net_annual_income')}
                  className={errors.net_annual_income ? 'border-red-500' : ''}
                  placeholder="800000"
                />
                {errors.net_annual_income && (
                  <p className="text-sm text-red-500">{errors.net_annual_income}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="financial_documents_url">Financial Documents URL *</Label>
              <Input
                id="financial_documents_url"
                value={formData.financial_documents_url}
                onChange={handleInputChange('financial_documents_url')}
                className={errors.financial_documents_url ? 'border-red-500' : ''}
                placeholder="https://example.com/financial-docs"
              />
              {errors.financial_documents_url && (
                <p className="text-sm text-red-500">{errors.financial_documents_url}</p>
              )}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_first_name">First Name *</Label>
                <Input
                  id="contact_first_name"
                  value={formData.contact_first_name}
                  onChange={handleInputChange('contact_first_name')}
                  className={errors.contact_first_name ? 'border-red-500' : ''}
                />
                {errors.contact_first_name && (
                  <p className="text-sm text-red-500">{errors.contact_first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_middle_name">Middle Name</Label>
                <Input
                  id="contact_middle_name"
                  value={formData.contact_middle_name}
                  onChange={handleInputChange('contact_middle_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_last_name">Last Name *</Label>
                <Input
                  id="contact_last_name"
                  value={formData.contact_last_name}
                  onChange={handleInputChange('contact_last_name')}
                  className={errors.contact_last_name ? 'border-red-500' : ''}
                />
                {errors.contact_last_name && (
                  <p className="text-sm text-red-500">{errors.contact_last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_job_title">Job Title *</Label>
              <Input
                id="contact_job_title"
                value={formData.contact_job_title}
                onChange={handleInputChange('contact_job_title')}
                className={errors.contact_job_title ? 'border-red-500' : ''}
                placeholder="HR Manager"
              />
              {errors.contact_job_title && (
                <p className="text-sm text-red-500">{errors.contact_job_title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_telephone_number">Telephone Number *</Label>
                <Input
                  id="contact_telephone_number"
                  value={formData.contact_telephone_number}
                  onChange={handleInputChange('contact_telephone_number')}
                  className={errors.contact_telephone_number ? 'border-red-500' : ''}
                  placeholder="(555) 123-4567"
                />
                {errors.contact_telephone_number && (
                  <p className="text-sm text-red-500">{errors.contact_telephone_number}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email_address">Email Address *</Label>
                <Input
                  id="contact_email_address"
                  type="email"
                  value={formData.contact_email_address}
                  onChange={handleInputChange('contact_email_address')}
                  className={errors.contact_email_address ? 'border-red-500' : ''}
                  placeholder="contact@company.com"
                />
                {errors.contact_email_address && (
                  <p className="text-sm text-red-500">{errors.contact_email_address}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create Organization</CardTitle>
            <CardDescription>
              Step {currentStep} of {totalSteps}: Set up your organization profile
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 