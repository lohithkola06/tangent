'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { OrganizationForm } from "./organization-form"
import { CasesTable } from "./cases-table"
import { AddCaseForm } from "./add-case-form"
import { Settings } from "./settings"
import { UserProfileMenu } from "../user-profile-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Users, FileText, Plus, Loader2, AlertTriangle, Settings as SettingsIcon } from "lucide-react"

interface EmployerDashboardProps {
  user: any
  userProfile: any
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
  country_of_incorporation: string | null
  state_of_incorporation: string | null
  is_individual_petitioner: boolean | null
  ssn_individual_petitioner: string | null
  created_at: string
  updated_at: string
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

export function EmployerDashboard({ user, userProfile }: EmployerDashboardProps) {
  const [employerData, setEmployerData] = useState<EmployerData | null>(null)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [contactData, setContactData] = useState<ContactData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOrganizationForm, setShowOrganizationForm] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-case' | 'settings'>('dashboard')
  const [caseStats, setCaseStats] = useState({ active: 0, total: 0 })
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false)

  useEffect(() => {
    checkEmployerData()
  }, [user])

  const checkEmployerData = async () => {
    try {
      const supabase = createClient()
      
      console.log('Checking employer data for user:', user.id)
      
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Employer data result:', { data, error })

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching employer data:', error)
        return
      }

      setEmployerData(data)
      
      // If no employer data exists, show the organization form
      if (!data) {
        setShowOrganizationForm(true)
      } else {
        // Load related data and check completeness
        await loadRelatedData(data.id)
        checkProfileCompleteness(data)
        // Load case statistics
        loadCaseStats(data.id)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRelatedData = async (employerId: string) => {
    try {
      const supabase = createClient()

      // Load financial data
      const { data: finances, error: financesError } = await supabase
        .from('employer_finances')
        .select('*')
        .eq('employer_id', employerId)
        .single()

      if (!financesError) {
        setFinancialData(finances)
      }

      // Load contact data
      const { data: contact, error: contactError } = await supabase
        .from('employer_contacts')
        .select('*')
        .eq('employer_id', employerId)
        .single()

      if (!contactError) {
        setContactData(contact)
      }
    } catch (error) {
      console.error('Error loading related data:', error)
    }
  }

  const checkProfileCompleteness = (employer: EmployerData) => {
    // Check if essential I-129 fields are missing
    const missingFields = []

    if (!employer.country_of_incorporation) {
      missingFields.push('Country of Incorporation')
    }

    if (employer.country_of_incorporation === 'United States' && !employer.state_of_incorporation) {
      missingFields.push('State of Incorporation')
    }

    if (employer.is_individual_petitioner && !employer.ssn_individual_petitioner) {
      missingFields.push('SSN for Individual Petitioner')
    }

    // Check if financial data exists
    if (!financialData) {
      missingFields.push('Financial Information')
    }

    // Check if contact data exists
    if (!contactData) {
      missingFields.push('Contact Information')
    }

    setIsProfileIncomplete(missingFields.length > 0)
  }

  const loadCaseStats = async (employerId: string) => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('cases')
        .select('case_status')
        .eq('employer_id', employerId)

      if (error) {
        console.error('Error loading case stats:', error)
        return
      }

      const activeCases = data?.filter(c => 
        ['questionnaires_assigned', 'in_progress', 'under_review'].includes(c.case_status)
      ).length || 0
      
      setCaseStats({
        active: activeCases,
        total: data?.length || 0
      })
    } catch (error) {
      console.error('Unexpected error loading case stats:', error)
    }
  }

  const handleOrganizationCreated = () => {
    setShowOrganizationForm(false)
    checkEmployerData() // Refresh the data
  }

  const handleAddCase = () => {
    setCurrentView('add-case')
  }

  const handleCaseAdded = () => {
    setCurrentView('dashboard')
    // Refresh case stats
    if (employerData) {
      loadCaseStats(employerData.id)
    }
  }

  const handleSettings = () => {
    setCurrentView('settings')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    // Refresh data when coming back from settings
    checkEmployerData()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show organization form for new employers
  if (showOrganizationForm || !employerData) {
    return (
      <OrganizationForm 
        onSuccess={handleOrganizationCreated}
        userId={user.id}
      />
    )
  }

  // Show add case form
  if (currentView === 'add-case') {
    return (
      <AddCaseForm
        employerId={employerData.id}
        onBack={handleBackToDashboard}
        onSuccess={handleCaseAdded}
      />
    )
  }

  // Show settings
  if (currentView === 'settings') {
    return (
      <Settings
        user={user}
        onBack={handleBackToDashboard}
      />
    )
  }

  // Show main dashboard for existing employers
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {employerData.legal_business_name}
              </h1>
              <p className="text-gray-600">
                Employer Dashboard - H1-B Petition Management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleAddCase}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Case
              </Button>
              <UserProfileMenu 
                user={user}
                userProfile={userProfile}
                onSettingsClick={handleSettings}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Completion Alert */}
        {isProfileIncomplete && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Complete your organization profile</strong>
                  <p className="mt-1">
                    Your profile is missing some information required for H1-B petitions. 
                    Complete your profile to ensure smooth petition processing.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSettings}
                  className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Complete Profile
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Organization Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Your organization information for H1-B petitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Legal Business Name</label>
                <p className="text-sm text-gray-900">{employerData.legal_business_name}</p>
              </div>
              {employerData.trade_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Trade Name</label>
                  <p className="text-sm text-gray-900">{employerData.trade_name}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Federal Employer ID</label>
                <p className="text-sm text-gray-900">{employerData.federal_employer_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Address</label>
                <p className="text-sm text-gray-900">
                  {employerData.address}
                  {employerData.suite_floor_unit && `, ${employerData.suite_floor_unit}`}
                  <br />
                  {employerData.postal_code}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Year Established</label>
                <p className="text-sm text-gray-900">{employerData.year_established}</p>
              </div>
              {employerData.country_of_incorporation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Country of Incorporation</label>
                  <p className="text-sm text-gray-900">{employerData.country_of_incorporation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleAddCase} className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add New H1-B Case
              </Button>
              <Button variant="outline" onClick={handleSettings} className="w-full justify-start">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Organization Settings
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <FileText className="h-4 w-4 mr-2" />
                Generate Reports (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>
              Your H1-B petition cases and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CasesTable employerId={employerData.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 