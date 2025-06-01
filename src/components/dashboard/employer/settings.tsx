'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/lib/supabase"
import { Loader2, ArrowLeft, Save } from "lucide-react"

interface SettingsProps {
  user: any
  onBack: () => void
}

interface EmployerData {
  id: string
  legal_business_name: string
  trade_name: string | null
  federal_employer_id: string
  address: string
  suite_floor_unit: string | null
  postal_code: string
  year_established: number
  total_us_employees: number
  telephone_number: string | null
  nature_of_business: string
  // I-129 specific fields
  naics_code: string | null
  country_of_incorporation: string
  state_of_incorporation: string | null
  is_individual_petitioner: boolean
  ssn_individual_petitioner: string | null
}

interface FinancialData {
  id: string
  employer_id: string
  gross_annual_income: number
  net_annual_income: number
  financial_documents_url: string
}

interface ContactData {
  id: string
  employer_id: string
  first_name: string
  last_name: string
  middle_name: string | null
  job_title: string
  telephone_number: string
  email_address: string
}

interface NotesData {
  id: string
  employer_id: string
  notes: string | null
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

export function Settings({ user, onBack }: SettingsProps) {
  const [employerData, setEmployerData] = useState<EmployerData | null>(null)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [contactData, setContactData] = useState<ContactData | null>(null)
  const [notesData, setNotesData] = useState<NotesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    loadOrganizationData()
  }, [user])

  const loadOrganizationData = async () => {
    try {
      const supabase = createClient()

      // Load employer data
      const { data: employer, error: employerError } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (employerError) {
        console.error('Error loading employer data:', employerError)
        return
      }

      setEmployerData(employer)

      // Load financial data
      const { data: finances, error: financesError } = await supabase
        .from('employer_finances')
        .select('*')
        .eq('employer_id', employer.id)
        .single()

      if (!financesError) {
        setFinancialData(finances)
      }

      // Load contact data
      const { data: contact, error: contactError } = await supabase
        .from('employer_contacts')
        .select('*')
        .eq('employer_id', employer.id)
        .single()

      if (!contactError) {
        setContactData(contact)
      }

      // Load notes data
      const { data: notes, error: notesError } = await supabase
        .from('employer_notes')
        .select('*')
        .eq('employer_id', employer.id)
        .single()

      if (!notesError) {
        setNotesData(notes)
      }

    } catch (error) {
      console.error('Error loading organization data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!employerData) return

    setIsSaving(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const supabase = createClient()

      // Update employer data with I-129 fields
      const { error: employerError } = await supabase
        .from('employers')
        .update({
          legal_business_name: employerData.legal_business_name,
          trade_name: employerData.trade_name,
          federal_employer_id: employerData.federal_employer_id,
          address: employerData.address,
          suite_floor_unit: employerData.suite_floor_unit,
          postal_code: employerData.postal_code,
          year_established: employerData.year_established,
          total_us_employees: employerData.total_us_employees,
          telephone_number: employerData.telephone_number,
          nature_of_business: employerData.nature_of_business,
          // I-129 specific fields
          naics_code: employerData.naics_code,
          country_of_incorporation: employerData.country_of_incorporation,
          state_of_incorporation: employerData.state_of_incorporation,
          is_individual_petitioner: employerData.is_individual_petitioner,
          ssn_individual_petitioner: employerData.ssn_individual_petitioner,
          updated_at: new Date().toISOString()
        })
        .eq('id', employerData.id)

      if (employerError) {
        throw employerError
      }

      // Update financial data if exists
      if (financialData) {
        const { error: financesError } = await supabase
          .from('employer_finances')
          .update({
            gross_annual_income: financialData.gross_annual_income,
            net_annual_income: financialData.net_annual_income,
            financial_documents_url: financialData.financial_documents_url
          })
          .eq('employer_id', employerData.id)

        if (financesError) {
          throw financesError
        }
      }

      // Update contact data if exists
      if (contactData) {
        const { error: contactError } = await supabase
          .from('employer_contacts')
          .update({
            first_name: contactData.first_name,
            last_name: contactData.last_name,
            middle_name: contactData.middle_name,
            job_title: contactData.job_title,
            telephone_number: contactData.telephone_number,
            email_address: contactData.email_address
          })
          .eq('employer_id', employerData.id)

        if (contactError) {
          throw contactError
        }
      }

      // Update notes data if exists
      if (notesData) {
        const { error: notesError } = await supabase
          .from('employer_notes')
          .update({
            notes: notesData.notes
          })
          .eq('employer_id', employerData.id)

        if (notesError) {
          throw notesError
        }
      }

      setSuccessMessage('Organization details updated successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (error: any) {
      console.error('Error updating organization:', error)
      setErrors({ general: error.message || 'Failed to update organization details' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!employerData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No organization data found</p>
          <Button onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your organization details</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your organization's basic details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="legal_business_name">Legal Business Name</Label>
                  <Input
                    id="legal_business_name"
                    value={employerData.legal_business_name}
                    onChange={(e) => setEmployerData(prev => prev ? { ...prev, legal_business_name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade_name">Trade Name</Label>
                  <Input
                    id="trade_name"
                    value={employerData.trade_name || ''}
                    onChange={(e) => setEmployerData(prev => prev ? { ...prev, trade_name: e.target.value || null } : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="federal_employer_id">Federal Employer ID</Label>
                <Input
                  id="federal_employer_id"
                  value={employerData.federal_employer_id}
                  onChange={(e) => setEmployerData(prev => prev ? { ...prev, federal_employer_id: e.target.value } : null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>
                Update your business address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={employerData.address}
                  onChange={(e) => setEmployerData(prev => prev ? { ...prev, address: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="suite_floor_unit">Suite/Floor/Unit</Label>
                  <Input
                    id="suite_floor_unit"
                    value={employerData.suite_floor_unit || ''}
                    onChange={(e) => setEmployerData(prev => prev ? { ...prev, suite_floor_unit: e.target.value || null } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={employerData.postal_code}
                    onChange={(e) => setEmployerData(prev => prev ? { ...prev, postal_code: e.target.value } : null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Update your business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year_established">Year Established</Label>
                  <Input
                    id="year_established"
                    type="number"
                    value={employerData.year_established}
                    onChange={(e) => setEmployerData(prev => prev ? { ...prev, year_established: Number(e.target.value) } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_us_employees">Total US Employees</Label>
                  <Input
                    id="total_us_employees"
                    type="number"
                    value={employerData.total_us_employees}
                    onChange={(e) => setEmployerData(prev => prev ? { ...prev, total_us_employees: Number(e.target.value) } : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone_number">Telephone Number</Label>
                <Input
                  id="telephone_number"
                  value={employerData.telephone_number || ''}
                  onChange={(e) => setEmployerData(prev => prev ? { ...prev, telephone_number: e.target.value || null } : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nature_of_business">Nature of Business</Label>
                <Textarea
                  id="nature_of_business"
                  value={employerData.nature_of_business}
                  onChange={(e) => setEmployerData(prev => prev ? { ...prev, nature_of_business: e.target.value } : null)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* I-129 Specific Information */}
          <Card>
            <CardHeader>
              <CardTitle>I-129 Petition Information</CardTitle>
              <CardDescription>
                Additional details required for H1-B petitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="naics_code">NAICS Code</Label>
                <Input
                  id="naics_code"
                  value={employerData.naics_code || ''}
                  onChange={(e) => setEmployerData(prev => prev ? { ...prev, naics_code: e.target.value || null } : null)}
                  placeholder="6-digit NAICS code"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500">
                  North American Industry Classification System code for your business
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country_of_incorporation">Country of Incorporation</Label>
                  <Select
                    value={employerData.country_of_incorporation}
                    onValueChange={(value) => setEmployerData(prev => prev ? { ...prev, country_of_incorporation: value } : null)}
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

                {employerData.country_of_incorporation === 'United States' && (
                  <div className="space-y-2">
                    <Label htmlFor="state_of_incorporation">State of Incorporation</Label>
                    <Select
                      value={employerData.state_of_incorporation || ''}
                      onValueChange={(value) => setEmployerData(prev => prev ? { ...prev, state_of_incorporation: value || null } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_individual_petitioner"
                    checked={employerData.is_individual_petitioner}
                    onCheckedChange={(checked) => setEmployerData(prev => prev ? { ...prev, is_individual_petitioner: !!checked } : null)}
                  />
                  <Label htmlFor="is_individual_petitioner" className="text-sm font-medium">
                    Individual Petitioner (not a company)
                  </Label>
                </div>
                
                {employerData.is_individual_petitioner && (
                  <div className="space-y-2">
                    <Label htmlFor="ssn_individual_petitioner">Social Security Number</Label>
                    <Input
                      id="ssn_individual_petitioner"
                      value={employerData.ssn_individual_petitioner || ''}
                      onChange={(e) => setEmployerData(prev => prev ? { ...prev, ssn_individual_petitioner: e.target.value || null } : null)}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          {financialData && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>
                  Update your financial details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gross_annual_income">Gross Annual Income ($)</Label>
                    <Input
                      id="gross_annual_income"
                      type="number"
                      value={financialData.gross_annual_income}
                      onChange={(e) => setFinancialData(prev => prev ? { ...prev, gross_annual_income: Number(e.target.value) } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net_annual_income">Net Annual Income ($)</Label>
                    <Input
                      id="net_annual_income"
                      type="number"
                      value={financialData.net_annual_income}
                      onChange={(e) => setFinancialData(prev => prev ? { ...prev, net_annual_income: Number(e.target.value) } : null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="financial_documents_url">Financial Documents URL</Label>
                  <Input
                    id="financial_documents_url"
                    value={financialData.financial_documents_url}
                    onChange={(e) => setFinancialData(prev => prev ? { ...prev, financial_documents_url: e.target.value } : null)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {contactData && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update primary contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_first_name">First Name</Label>
                    <Input
                      id="contact_first_name"
                      value={contactData.first_name}
                      onChange={(e) => setContactData(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_middle_name">Middle Name</Label>
                    <Input
                      id="contact_middle_name"
                      value={contactData.middle_name || ''}
                      onChange={(e) => setContactData(prev => prev ? { ...prev, middle_name: e.target.value || null } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_last_name">Last Name</Label>
                    <Input
                      id="contact_last_name"
                      value={contactData.last_name}
                      onChange={(e) => setContactData(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_job_title">Job Title</Label>
                    <Input
                      id="contact_job_title"
                      value={contactData.job_title}
                      onChange={(e) => setContactData(prev => prev ? { ...prev, job_title: e.target.value } : null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_telephone">Telephone</Label>
                    <Input
                      id="contact_telephone"
                      value={contactData.telephone_number}
                      onChange={(e) => setContactData(prev => prev ? { ...prev, telephone_number: e.target.value } : null)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email Address</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={contactData.email_address}
                    onChange={(e) => setContactData(prev => prev ? { ...prev, email_address: e.target.value } : null)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Any additional information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notesData?.notes || ''}
                  onChange={(e) => setNotesData(prev => prev ? { ...prev, notes: e.target.value } : { id: '', employer_id: employerData?.id || '', notes: e.target.value })}
                  rows={4}
                  placeholder="Enter any additional notes or comments..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 