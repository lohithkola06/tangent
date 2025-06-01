'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { EmployerData, FinancialData, ContactData } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [employer, setEmployer] = useState<EmployerData | null>(null)
  const [finances, setFinances] = useState<FinancialData | null>(null)
  const [contact, setContact] = useState<ContactData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form states
  const [businessForm, setBusinessForm] = useState({
    legal_business_name: '',
    trade_name: '',
    federal_employer_id: '',
    address: '',
    suite_floor_unit: '',
    postal_code: '',
    year_established: '',
    total_us_employees: '',
    telephone_number: '',
    nature_of_business: ''
  })

  const [financialForm, setFinancialForm] = useState({
    gross_annual_income: '',
    net_annual_income: '',
    financial_documents_url: ''
  })

  const [contactForm, setContactForm] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    job_title: '',
    telephone_number: '',
    email_address: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getEmployerDetails()
      
      setEmployer(data.employer)
      setFinances(data.finances)
      setContact(data.contact)

      // Populate forms
      if (data.employer) {
        setBusinessForm({
          legal_business_name: data.employer.legal_business_name || '',
          trade_name: data.employer.trade_name || '',
          federal_employer_id: data.employer.federal_employer_id || '',
          address: data.employer.address || '',
          suite_floor_unit: data.employer.suite_floor_unit || '',
          postal_code: data.employer.postal_code || '',
          year_established: data.employer.year_established?.toString() || '',
          total_us_employees: data.employer.total_us_employees?.toString() || '',
          telephone_number: data.employer.telephone_number || '',
          nature_of_business: data.employer.nature_of_business || ''
        })
      }

      if (data.finances) {
        setFinancialForm({
          gross_annual_income: data.finances.gross_annual_income?.toString() || '',
          net_annual_income: data.finances.net_annual_income?.toString() || '',
          financial_documents_url: data.finances.financial_documents_url || ''
        })
      }

      if (data.contact) {
        setContactForm({
          first_name: data.contact.first_name || '',
          last_name: data.contact.last_name || '',
          middle_name: data.contact.middle_name || '',
          job_title: data.contact.job_title || '',
          telephone_number: data.contact.telephone_number || '',
          email_address: data.contact.email_address || ''
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      // Convert string values back to numbers for API
      const businessData = {
        ...businessForm,
        year_established: parseInt(businessForm.year_established) || 0,
        total_us_employees: parseInt(businessForm.total_us_employees) || 0
      }
      await apiClient.updateBusinessInfo(businessData)
      alert('Business information updated successfully!')
      // Reload data to show updated information
      await loadData()
    } catch (error: any) {
      setErrors({ business: error.message || 'Failed to update business information' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinancialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      // Convert string values back to numbers for API
      const financialData = {
        ...financialForm,
        gross_annual_income: parseFloat(financialForm.gross_annual_income) || 0,
        net_annual_income: parseFloat(financialForm.net_annual_income) || 0
      }
      await apiClient.updateFinancialInfo(financialData)
      alert('Financial information updated successfully!')
      await loadData()
    } catch (error: any) {
      setErrors({ financial: error.message || 'Failed to update financial information' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrors({})

    try {
      await apiClient.updateContactInfo(contactForm)
      alert('Contact information updated successfully!')
      await loadData()
    } catch (error: any) {
      setErrors({ contact: error.message || 'Failed to update contact information' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!employer) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Organization Found</h1>
            <p className="text-gray-600 mb-4">You need to create an organization first.</p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600">Manage your organization information</p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business">Business Information</TabsTrigger>
            <TabsTrigger value="financial">Financial Information</TabsTrigger>
            <TabsTrigger value="contact">Contact Information</TabsTrigger>
          </TabsList>

          {/* Business Information Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your organization's basic business details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBusinessSubmit} className="space-y-6">
                  {errors.business && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{errors.business}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legal_business_name">Legal Business Name *</Label>
                      <Input
                        id="legal_business_name"
                        value={businessForm.legal_business_name}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, legal_business_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trade_name">Trade Name</Label>
                      <Input
                        id="trade_name"
                        value={businessForm.trade_name}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, trade_name: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="federal_employer_id">Federal Employer ID (EIN) *</Label>
                    <Input
                      id="federal_employer_id"
                      value={businessForm.federal_employer_id}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, federal_employer_id: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={businessForm.address}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        value={businessForm.postal_code}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, postal_code: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suite_floor_unit">Suite/Floor/Unit</Label>
                    <Input
                      id="suite_floor_unit"
                      value={businessForm.suite_floor_unit}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, suite_floor_unit: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year_established">Year Established *</Label>
                      <Input
                        id="year_established"
                        type="number"
                        value={businessForm.year_established}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, year_established: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_us_employees">Total US Employees *</Label>
                      <Input
                        id="total_us_employees"
                        type="number"
                        value={businessForm.total_us_employees}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, total_us_employees: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telephone_number">Telephone Number</Label>
                      <Input
                        id="telephone_number"
                        value={businessForm.telephone_number}
                        onChange={(e) => setBusinessForm(prev => ({ ...prev, telephone_number: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nature_of_business">Nature of Business *</Label>
                    <Textarea
                      id="nature_of_business"
                      value={businessForm.nature_of_business}
                      onChange={(e) => setBusinessForm(prev => ({ ...prev, nature_of_business: e.target.value }))}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Information Tab */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>
                  Update your organization's financial details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFinancialSubmit} className="space-y-6">
                  {errors.financial && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{errors.financial}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gross_annual_income">Gross Annual Income ($) *</Label>
                      <Input
                        id="gross_annual_income"
                        type="number"
                        value={financialForm.gross_annual_income}
                        onChange={(e) => setFinancialForm(prev => ({ ...prev, gross_annual_income: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="net_annual_income">Net Annual Income ($) *</Label>
                      <Input
                        id="net_annual_income"
                        type="number"
                        value={financialForm.net_annual_income}
                        onChange={(e) => setFinancialForm(prev => ({ ...prev, net_annual_income: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="financial_documents_url">Financial Documents URL *</Label>
                    <Input
                      id="financial_documents_url"
                      type="url"
                      value={financialForm.financial_documents_url}
                      onChange={(e) => setFinancialForm(prev => ({ ...prev, financial_documents_url: e.target.value }))}
                      placeholder="https://example.com/financial-docs"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Information Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Update your organization's primary contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  {errors.contact && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{errors.contact}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_first_name">First Name *</Label>
                      <Input
                        id="contact_first_name"
                        value={contactForm.first_name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_middle_name">Middle Name</Label>
                      <Input
                        id="contact_middle_name"
                        value={contactForm.middle_name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, middle_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_last_name">Last Name *</Label>
                      <Input
                        id="contact_last_name"
                        value={contactForm.last_name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_job_title">Job Title *</Label>
                    <Input
                      id="contact_job_title"
                      value={contactForm.job_title}
                      onChange={(e) => setContactForm(prev => ({ ...prev, job_title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_telephone_number">Telephone Number *</Label>
                      <Input
                        id="contact_telephone_number"
                        value={contactForm.telephone_number}
                        onChange={(e) => setContactForm(prev => ({ ...prev, telephone_number: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email_address">Email Address *</Label>
                      <Input
                        id="contact_email_address"
                        type="email"
                        value={contactForm.email_address}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email_address: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
} 