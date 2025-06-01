'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase"
import { Loader2, Building, MapPin, DollarSign, Users, Globe } from "lucide-react"

interface OrganizationFormProps {
  onSuccess: () => void
  userId: string
}

interface BusinessLocation {
  address: string
  suite_floor_unit: string
  postal_code: string
}

interface BusinessDetails {
  year_established: string
  total_us_employees: string
  telephone_number: string
  nature_of_business: string
  naics_code: string
  country_of_incorporation: string
  state_of_incorporation: string
  is_individual_petitioner: boolean
  ssn_individual_petitioner: string
}

interface FinancialInfo {
  gross_annual_income: string
  net_annual_income: string
  financial_documents_url: string
}

interface ContactInfo {
  last_name: string
  first_name: string
  middle_name: string
  job_title: string
  telephone_number: string
  email_address: string
}

interface FormData {
  legal_business_name: string
  trade_name: string
  federal_employer_id: string
  business_location: BusinessLocation
  business_details: BusinessDetails
  financial_info: FinancialInfo
  contact_info: ContactInfo
  notes: string
}

interface FormErrors {
  [key: string]: string | undefined
  general?: string
}

// US States for incorporation dropdown
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
]

export function OrganizationForm({ onSuccess, userId }: OrganizationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    legal_business_name: '',
    trade_name: '',
    federal_employer_id: '',
    business_location: {
      address: '',
      suite_floor_unit: '',
      postal_code: ''
    },
    business_details: {
      year_established: '',
      total_us_employees: '',
      telephone_number: '',
      nature_of_business: '',
      naics_code: '',
      country_of_incorporation: 'United States',
      state_of_incorporation: '',
      is_individual_petitioner: false,
      ssn_individual_petitioner: ''
    },
    financial_info: {
      gross_annual_income: '',
      net_annual_income: '',
      financial_documents_url: ''
    },
    contact_info: {
      last_name: '',
      first_name: '',
      middle_name: '',
      job_title: '',
      telephone_number: '',
      email_address: ''
    },
    notes: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {}

    if (step === 1) {
      // Basic Business Information
      if (!formData.legal_business_name.trim()) {
        newErrors.legal_business_name = 'Legal business name is required'
      }
      if (!formData.federal_employer_id.trim()) {
        newErrors.federal_employer_id = 'Federal Employer ID is required'
      }
    }

    if (step === 2) {
      // Business Location
      if (!formData.business_location.address.trim()) {
        newErrors['business_location.address'] = 'Address is required'
      }
      if (!formData.business_location.postal_code.trim()) {
        newErrors['business_location.postal_code'] = 'Postal code is required'
      }
    }

    if (step === 3) {
      // Business Details & I-129 Information
      if (!formData.business_details.year_established) {
        newErrors['business_details.year_established'] = 'Year established is required'
      }
      if (!formData.business_details.total_us_employees) {
        newErrors['business_details.total_us_employees'] = 'Total US employees is required'
      }
      if (!formData.business_details.nature_of_business.trim()) {
        newErrors['business_details.nature_of_business'] = 'Nature of business is required'
      }
      if (formData.business_details.country_of_incorporation === 'United States' && !formData.business_details.state_of_incorporation) {
        newErrors['business_details.state_of_incorporation'] = 'State of incorporation is required for US companies'
      }
      if (formData.business_details.is_individual_petitioner && !formData.business_details.ssn_individual_petitioner.trim()) {
        newErrors['business_details.ssn_individual_petitioner'] = 'SSN is required for individual petitioners'
      }
    }

    if (step === 4) {
      // Financial Information
      if (!formData.financial_info.gross_annual_income) {
        newErrors['financial_info.gross_annual_income'] = 'Gross annual income is required'
      }
      if (!formData.financial_info.net_annual_income) {
        newErrors['financial_info.net_annual_income'] = 'Net annual income is required'
      }
      if (!formData.financial_info.financial_documents_url.trim()) {
        newErrors['financial_info.financial_documents_url'] = 'Financial documents URL is required'
      }
    }

    if (step === 5) {
      // Contact Information
      if (!formData.contact_info.first_name.trim()) {
        newErrors['contact_info.first_name'] = 'First name is required'
      }
      if (!formData.contact_info.last_name.trim()) {
        newErrors['contact_info.last_name'] = 'Last name is required'
      }
      if (!formData.contact_info.job_title.trim()) {
        newErrors['contact_info.job_title'] = 'Job title is required'
      }
      if (!formData.contact_info.telephone_number.trim()) {
        newErrors['contact_info.telephone_number'] = 'Telephone number is required'
      }
      if (!formData.contact_info.email_address.trim()) {
        newErrors['contact_info.email_address'] = 'Email address is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      console.log('Creating organization...', formData)

      // 1. Create employer record with I-129 fields
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .insert({
          user_id: userId,
          legal_business_name: formData.legal_business_name,
          trade_name: formData.trade_name || null,
          federal_employer_id: formData.federal_employer_id,
          address: formData.business_location.address,
          suite_floor_unit: formData.business_location.suite_floor_unit || null,
          postal_code: formData.business_location.postal_code,
          year_established: Number(formData.business_details.year_established),
          total_us_employees: Number(formData.business_details.total_us_employees),
          telephone_number: formData.business_details.telephone_number || null,
          nature_of_business: formData.business_details.nature_of_business,
          // I-129 specific fields
          naics_code: formData.business_details.naics_code || null,
          country_of_incorporation: formData.business_details.country_of_incorporation,
          state_of_incorporation: formData.business_details.state_of_incorporation || null,
          is_individual_petitioner: formData.business_details.is_individual_petitioner,
          ssn_individual_petitioner: formData.business_details.ssn_individual_petitioner || null
        })
        .select()
        .single()

      if (employerError) {
        console.error('Employer creation error:', employerError)
        throw employerError
      }

      console.log('Employer created:', employerData)

      // 2. Create employer finances record
      const { error: financesError } = await supabase
        .from('employer_finances')
        .insert({
          employer_id: employerData.id,
          gross_annual_income: Number(formData.financial_info.gross_annual_income),
          net_annual_income: Number(formData.financial_info.net_annual_income),
          financial_documents_url: formData.financial_info.financial_documents_url
        })

      if (financesError) {
        console.error('Finances creation error:', financesError)
        throw financesError
      }

      // 3. Create employer contact record
      const { error: contactError } = await supabase
        .from('employer_contacts')
        .insert({
          employer_id: employerData.id,
          last_name: formData.contact_info.last_name,
          first_name: formData.contact_info.first_name,
          middle_name: formData.contact_info.middle_name || null,
          job_title: formData.contact_info.job_title,
          telephone_number: formData.contact_info.telephone_number,
          email_address: formData.contact_info.email_address
        })

      if (contactError) {
        console.error('Contact creation error:', contactError)
        throw contactError
      }

      // 4. Create employer notes record (if notes provided)
      if (formData.notes.trim()) {
        const { error: notesError } = await supabase
          .from('employer_notes')
          .insert({
            employer_id: employerData.id,
            notes: formData.notes
          })

        if (notesError) {
          console.error('Notes creation error:', notesError)
          // Don't throw for notes error, it's optional
        }
      }

      console.log('Organization created successfully!')
      onSuccess()

    } catch (error: unknown) {
      console.error('Organization creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the organization'
      setErrors({ general: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (section: string, field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value
      }
    }))
    
    // Clear error when user starts typing
    const errorKey = `${section}.${field}`
    if (errors[errorKey]) {
      setErrors((prev: FormErrors) => ({ ...prev, [errorKey]: undefined }))
    }
  }

  const updateBasicField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }))
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Basic Business Information</h2>
              <p className="mt-2 text-gray-600">Let&apos;s start with your organization&apos;s basic details</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legal_business_name">Legal Business Name *</Label>
                <Input
                  id="legal_business_name"
                  value={formData.legal_business_name}
                  onChange={(e) => updateBasicField('legal_business_name', e.target.value)}
                  className={errors.legal_business_name ? 'border-red-500' : ''}
                  placeholder="Enter your legal business name"
                />
                {errors.legal_business_name && (
                  <p className="text-sm text-red-500">{errors.legal_business_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade_name">Trade Name (DBA)</Label>
                <Input
                  id="trade_name"
                  value={formData.trade_name}
                  onChange={(e) => updateBasicField('trade_name', e.target.value)}
                  placeholder="Doing business as (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="federal_employer_id">Federal Employer ID (EIN) *</Label>
                <Input
                  id="federal_employer_id"
                  value={formData.federal_employer_id}
                  onChange={(e) => updateBasicField('federal_employer_id', e.target.value)}
                  className={errors.federal_employer_id ? 'border-red-500' : ''}
                  placeholder="XX-XXXXXXX"
                />
                {errors.federal_employer_id && (
                  <p className="text-sm text-red-500">{errors.federal_employer_id}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Business Location</h2>
              <p className="mt-2 text-gray-600">Where is your business located?</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  value={formData.business_location.address}
                  onChange={(e) => updateFormData('business_location', 'address', e.target.value)}
                  className={errors['business_location.address'] ? 'border-red-500' : ''}
                  placeholder="Street address"
                />
                {errors['business_location.address'] && (
                  <p className="text-sm text-red-500">{errors['business_location.address']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="suite_floor_unit">Suite/Floor/Unit</Label>
                <Input
                  id="suite_floor_unit"
                  value={formData.business_location.suite_floor_unit}
                  onChange={(e) => updateFormData('business_location', 'suite_floor_unit', e.target.value)}
                  placeholder="Suite 100, Floor 5, etc. (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Postal Code *</Label>
                <Input
                  id="postal_code"
                  value={formData.business_location.postal_code}
                  onChange={(e) => updateFormData('business_location', 'postal_code', e.target.value)}
                  className={errors['business_location.postal_code'] ? 'border-red-500' : ''}
                  placeholder="12345"
                />
                {errors['business_location.postal_code'] && (
                  <p className="text-sm text-red-500">{errors['business_location.postal_code']}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Business Details & I-129 Information</h2>
              <p className="mt-2 text-gray-600">Additional details required for H1-B petitions</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year_established">Year Established *</Label>
                  <Input
                    id="year_established"
                    type="number"
                    value={formData.business_details.year_established}
                    onChange={(e) => updateFormData('business_details', 'year_established', e.target.value)}
                    className={errors['business_details.year_established'] ? 'border-red-500' : ''}
                    placeholder="2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                  {errors['business_details.year_established'] && (
                    <p className="text-sm text-red-500">{errors['business_details.year_established']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_us_employees">Total US Employees *</Label>
                  <Input
                    id="total_us_employees"
                    type="number"
                    value={formData.business_details.total_us_employees}
                    onChange={(e) => updateFormData('business_details', 'total_us_employees', e.target.value)}
                    className={errors['business_details.total_us_employees'] ? 'border-red-500' : ''}
                    placeholder="Number of employees"
                    min="0"
                  />
                  {errors['business_details.total_us_employees'] && (
                    <p className="text-sm text-red-500">{errors['business_details.total_us_employees']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone_number">Telephone Number</Label>
                <Input
                  id="telephone_number"
                  value={formData.business_details.telephone_number}
                  onChange={(e) => updateFormData('business_details', 'telephone_number', e.target.value)}
                  placeholder="Business phone number (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="naics_code">NAICS Code</Label>
                <Input
                  id="naics_code"
                  value={formData.business_details.naics_code}
                  onChange={(e) => updateFormData('business_details', 'naics_code', e.target.value)}
                  placeholder="6-digit NAICS code (optional)"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">
                  North American Industry Classification System code for your business
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_of_incorporation">Country of Incorporation *</Label>
                  <Select
                    value={formData.business_details.country_of_incorporation}
                    onValueChange={(value) => updateFormData('business_details', 'country_of_incorporation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.business_details.country_of_incorporation === 'United States' && (
                  <div className="space-y-2">
                    <Label htmlFor="state_of_incorporation">State of Incorporation *</Label>
                    <Select
                      value={formData.business_details.state_of_incorporation}
                      onValueChange={(value) => updateFormData('business_details', 'state_of_incorporation', value)}
                    >
                      <SelectTrigger className={errors['business_details.state_of_incorporation'] ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors['business_details.state_of_incorporation'] && (
                      <p className="text-sm text-red-500">{errors['business_details.state_of_incorporation']}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_individual_petitioner"
                    checked={formData.business_details.is_individual_petitioner}
                    onCheckedChange={(checked) => updateFormData('business_details', 'is_individual_petitioner', !!checked)}
                  />
                  <Label htmlFor="is_individual_petitioner" className="text-sm font-medium">
                    Individual Petitioner (not a company)
                  </Label>
                </div>
                
                {formData.business_details.is_individual_petitioner && (
                  <div className="space-y-2">
                    <Label htmlFor="ssn_individual_petitioner">Social Security Number *</Label>
                    <Input
                      id="ssn_individual_petitioner"
                      value={formData.business_details.ssn_individual_petitioner}
                      onChange={(e) => updateFormData('business_details', 'ssn_individual_petitioner', e.target.value)}
                      className={errors['business_details.ssn_individual_petitioner'] ? 'border-red-500' : ''}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                    />
                    {errors['business_details.ssn_individual_petitioner'] && (
                      <p className="text-sm text-red-500">{errors['business_details.ssn_individual_petitioner']}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nature_of_business">Nature of Business *</Label>
                <Textarea
                  id="nature_of_business"
                  value={formData.business_details.nature_of_business}
                  onChange={(e) => updateFormData('business_details', 'nature_of_business', e.target.value)}
                  className={errors['business_details.nature_of_business'] ? 'border-red-500' : ''}
                  placeholder="Describe your business activities and industry"
                  rows={3}
                />
                {errors['business_details.nature_of_business'] && (
                  <p className="text-sm text-red-500">{errors['business_details.nature_of_business']}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Financial Information</h2>
              <p className="mt-2 text-gray-600">Financial details for H1-B petition requirements</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_annual_income">Gross Annual Income ($) *</Label>
                  <Input
                    id="gross_annual_income"
                    type="number"
                    value={formData.financial_info.gross_annual_income}
                    onChange={(e) => updateFormData('financial_info', 'gross_annual_income', e.target.value)}
                    className={errors['financial_info.gross_annual_income'] ? 'border-red-500' : ''}
                    placeholder="1000000"
                    min="0"
                  />
                  {errors['financial_info.gross_annual_income'] && (
                    <p className="text-sm text-red-500">{errors['financial_info.gross_annual_income']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_annual_income">Net Annual Income ($) *</Label>
                  <Input
                    id="net_annual_income"
                    type="number"
                    value={formData.financial_info.net_annual_income}
                    onChange={(e) => updateFormData('financial_info', 'net_annual_income', e.target.value)}
                    className={errors['financial_info.net_annual_income'] ? 'border-red-500' : ''}
                    placeholder="800000"
                    min="0"
                  />
                  {errors['financial_info.net_annual_income'] && (
                    <p className="text-sm text-red-500">{errors['financial_info.net_annual_income']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financial_documents_url">Financial Documents URL *</Label>
                <Input
                  id="financial_documents_url"
                  value={formData.financial_info.financial_documents_url}
                  onChange={(e) => updateFormData('financial_info', 'financial_documents_url', e.target.value)}
                  className={errors['financial_info.financial_documents_url'] ? 'border-red-500' : ''}
                  placeholder="https://example.com/financial-documents"
                />
                {errors['financial_info.financial_documents_url'] && (
                  <p className="text-sm text-red-500">{errors['financial_info.financial_documents_url']}</p>
                )}
                <p className="text-xs text-gray-500">
                  Link to tax returns, financial statements, or other financial documentation
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-blue-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="mt-2 text-gray-600">Primary contact for H1-B petition matters</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.contact_info.first_name}
                    onChange={(e) => updateFormData('contact_info', 'first_name', e.target.value)}
                    className={errors['contact_info.first_name'] ? 'border-red-500' : ''}
                    placeholder="First name"
                  />
                  {errors['contact_info.first_name'] && (
                    <p className="text-sm text-red-500">{errors['contact_info.first_name']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={formData.contact_info.middle_name}
                    onChange={(e) => updateFormData('contact_info', 'middle_name', e.target.value)}
                    placeholder="Middle name (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.contact_info.last_name}
                    onChange={(e) => updateFormData('contact_info', 'last_name', e.target.value)}
                    className={errors['contact_info.last_name'] ? 'border-red-500' : ''}
                    placeholder="Last name"
                  />
                  {errors['contact_info.last_name'] && (
                    <p className="text-sm text-red-500">{errors['contact_info.last_name']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={formData.contact_info.job_title}
                  onChange={(e) => updateFormData('contact_info', 'job_title', e.target.value)}
                  className={errors['contact_info.job_title'] ? 'border-red-500' : ''}
                  placeholder="Job title"
                />
                {errors['contact_info.job_title'] && (
                  <p className="text-sm text-red-500">{errors['contact_info.job_title']}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_telephone">Telephone Number *</Label>
                  <Input
                    id="contact_telephone"
                    value={formData.contact_info.telephone_number}
                    onChange={(e) => updateFormData('contact_info', 'telephone_number', e.target.value)}
                    className={errors['contact_info.telephone_number'] ? 'border-red-500' : ''}
                    placeholder="Phone number"
                  />
                  {errors['contact_info.telephone_number'] && (
                    <p className="text-sm text-red-500">{errors['contact_info.telephone_number']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email Address *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_info.email_address}
                    onChange={(e) => updateFormData('contact_info', 'email_address', e.target.value)}
                    className={errors['contact_info.email_address'] ? 'border-red-500' : ''}
                    placeholder="Email address"
                  />
                  {errors['contact_info.email_address'] && (
                    <p className="text-sm text-red-500">{errors['contact_info.email_address']}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateBasicField('notes', e.target.value)}
                  placeholder="Any additional notes or comments (optional)"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of 5</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 5) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Error message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Form content */}
        <Card>
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 