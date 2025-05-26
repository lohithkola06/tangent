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
import { Building, Users, FileText, Plus, Loader2 } from "lucide-react"

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
  created_at: string
  updated_at: string
}

export function EmployerDashboard({ user, userProfile }: EmployerDashboardProps) {
  const [employerData, setEmployerData] = useState<EmployerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showOrganizationForm, setShowOrganizationForm] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'add-case' | 'settings'>('dashboard')
  const [caseStats, setCaseStats] = useState({ active: 0, total: 0 })

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
        // Load case statistics
        loadCaseStats(data.id)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    } finally {
      setIsLoading(false)
    }
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Petitions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{caseStats.active}</div>
              <p className="text-xs text-muted-foreground">
                {caseStats.active === 0 ? 'No active petitions yet' : 'Active petitions in progress'}
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
                {caseStats.total === 0 ? 'No cases created yet' : 'Total H1-B petition cases'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total US Employees</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employerData.total_us_employees}</div>
              <p className="text-xs text-muted-foreground">
                As of {new Date(employerData.updated_at).toLocaleDateString()}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Additional details about your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nature of Business</label>
                <p className="text-sm text-gray-900">{employerData.nature_of_business}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total US Employees</label>
                <p className="text-sm text-gray-900">{employerData.total_us_employees}</p>
              </div>
              {employerData.telephone_number && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Telephone</label>
                  <p className="text-sm text-gray-900">{employerData.telephone_number}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cases Table */}
        <CasesTable 
          employerId={employerData.id}
          onAddCase={handleAddCase}
        />
      </div>
    </div>
  )
} 