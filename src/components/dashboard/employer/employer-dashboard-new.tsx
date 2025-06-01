'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Users, FileText, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { EmployerData, CaseData } from '@/lib/types'
import { AddCaseForm } from './add-case-form-new'
import { CasesTable } from './cases-table-new'
import { CreateOrganizationForm } from './create-organization-form-new'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export function EmployerDashboard() {
  const [employer, setEmployer] = useState<EmployerData | null>(null)
  const [cases, setCases] = useState<CaseData[]>([])
  const [stats, setStats] = useState({ active: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCase, setShowAddCase] = useState(false)
  const [showCreateOrg, setShowCreateOrg] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load employer data
      const employerData = await apiClient.getEmployer()
      setEmployer(employerData)
      
      if (employerData) {
        // Load cases and stats
        const [casesData, statsData] = await Promise.all([
          apiClient.getCases(),
          apiClient.getCaseStats()
        ])
        
        setCases(casesData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCaseAdded = (newCase: CaseData) => {
    setCases(prev => [newCase, ...prev])
    setStats(prev => ({ 
      active: prev.active + 1, 
      total: prev.total + 1 
    }))
    setShowAddCase(false)
  }

  const handleOrganizationCreated = (newEmployer: EmployerData) => {
    setEmployer(newEmployer)
    setShowCreateOrg(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show organization creation form if no employer data
  if (!employer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Tangent</h1>
            <p className="mt-2 text-gray-600">
              Let's start by setting up your organization profile
            </p>
          </div>
          
          {showCreateOrg ? (
            <CreateOrganizationForm 
              onSuccess={handleOrganizationCreated}
              onCancel={() => setShowCreateOrg(false)}
            />
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <Building className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Create Organization</CardTitle>
                <CardDescription>
                  Set up your organization profile to start managing H1-B petitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowCreateOrg(true)}
                  className="w-full"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {employer.legal_business_name}
            </h1>
            <p className="text-gray-600">
              Employer Dashboard
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAddCase(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Case
            </Button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="secondary">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {employer.federal_employer_id}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Cases</CardTitle>
          <CardDescription>
            Manage your H1-B petition cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CasesTable cases={cases} />
        </CardContent>
      </Card>

      {/* Add Case Overlay */}
      {showAddCase && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mt-8 mb-8">
            <AddCaseForm 
              onSuccess={handleCaseAdded}
              onCancel={() => setShowAddCase(false)}
            />
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
} 