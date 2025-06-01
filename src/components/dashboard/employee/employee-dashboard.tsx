'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UserProfile } from '@/lib/types'
import { EmployeeAssignment } from '@/lib/services/employee.service'
import { Loader2, FileText, Calendar, Building, User, Clock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface EmployeeDashboardProps {
  user: UserProfile
}

const statusColors = {
  'pending': 'bg-gray-100 text-gray-800',
  'sent': 'bg-blue-100 text-blue-800',
  'opened': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'expired': 'bg-red-100 text-red-800'
}

const statusLabels = {
  'pending': 'Pending',
  'sent': 'Assigned',
  'opened': 'In Progress',
  'completed': 'Completed',
  'expired': 'Expired'
}

const statusIcons = {
  'pending': Clock,
  'sent': FileText,
  'opened': User,
  'completed': CheckCircle,
  'expired': AlertCircle
}

const caseTypeLabels = {
  'h1b_petition': 'H1-B Petition',
  'h1b_extension': 'H1-B Extension',
  'h1b_transfer': 'H1-B Transfer'
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/employee/assignments')
      
      if (!response.ok) {
        throw new Error('Failed to load assignments')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to load assignments')
      }

      setAssignments(result.data || [])
    } catch (error: any) {
      console.error('Error loading assignments:', error)
      setError(error.message || 'Failed to load assignments')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary)
  }

  const getProgressPercentage = (assignment: EmployeeAssignment) => {
    if (!assignment.response) return 0
    return assignment.response.completion_percentage || 0
  }

  const getStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock
    return <IconComponent className="h-4 w-4" />
  }

  const isAssignmentExpired = (assignment: EmployeeAssignment) => {
    return new Date(assignment.invitation.expires_at) < new Date()
  }

  const canAccessQuestionnaire = (assignment: EmployeeAssignment) => {
    return !isAssignmentExpired(assignment) && assignment.invitation.status !== 'expired'
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading your assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user.first_name} {user.last_name}
          </h1>
          <p className="text-gray-600">
            Complete your H1-B petition questionnaires below
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Assignments */}
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments</h3>
              <p className="text-gray-600">
                You don't have any H1-B questionnaire assignments yet. Check back later or contact your employer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <Card key={assignment.invitation.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-600" />
                        {caseTypeLabels[assignment.case.case_type as keyof typeof caseTypeLabels]}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {assignment.case.job_title} • {formatSalary(assignment.case.annual_salary)}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={`${statusColors[assignment.invitation.status]} border-0`}>
                        {getStatusIcon(assignment.invitation.status)}
                        <span className="ml-1">{statusLabels[assignment.invitation.status]}</span>
                      </Badge>
                      {assignment.invitation.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Case Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-500">Start Date</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(assignment.case.start_date)}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Due Date</label>
                      <p className={`text-gray-900 flex items-center ${isAssignmentExpired(assignment) ? 'text-red-600' : ''}`}>
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(assignment.invitation.expires_at)}
                        {isAssignmentExpired(assignment) && ' (Expired)'}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  {assignment.response && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-medium text-gray-500">Progress</label>
                        <span className="text-sm text-gray-600">
                          {getProgressPercentage(assignment)}% Complete
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(assignment)} className="h-2" />
                    </div>
                  )}

                  {/* Job Description */}
                  <div>
                    <label className="font-medium text-gray-500">Position Details</label>
                    <p className="text-gray-900 text-sm mt-1 line-clamp-2">
                      {assignment.case.job_description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t">
                    {canAccessQuestionnaire(assignment) ? (
                      <Button asChild className="w-full">
                        <a href={`/employee/questionnaire/${assignment.invitation.id}`}>
                          {assignment.invitation.status === 'completed' ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Review Submission
                            </>
                          ) : assignment.response ? (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Continue Questionnaire
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Start Questionnaire
                            </>
                          )}
                        </a>
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {assignment.invitation.status === 'expired' ? 'Expired' : 'Not Available'}
                      </Button>
                    )}
                  </div>

                  {/* Assignment Info */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Assigned: {formatDate(assignment.invitation.created_at)}</span>
                      {assignment.invitation.opened_at && (
                        <span>Started: {formatDate(assignment.invitation.opened_at)}</span>
                      )}
                      {assignment.invitation.completed_at && (
                        <span>Completed: {formatDate(assignment.invitation.completed_at)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 