'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { Loader2, Eye, ArrowRight, Plus } from "lucide-react"

interface CasesTableProps {
  employerId: string
  onAddCase: () => void
}

interface CaseData {
  id: string
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  case_type: string
  case_status: string
  job_title: string
  annual_salary: number
  start_date: string
  assigned_attorney: string
  created_at: string
  updated_at: string
}

const statusColors = {
  'questionnaires_assigned': 'bg-blue-100 text-blue-800',
  'in_progress': 'bg-yellow-100 text-yellow-800',
  'under_review': 'bg-orange-100 text-orange-800',
  'approved': 'bg-green-100 text-green-800',
  'denied': 'bg-red-100 text-red-800',
  'withdrawn': 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  'questionnaires_assigned': 'Questionnaires Assigned',
  'in_progress': 'In Progress',
  'under_review': 'Under Review',
  'approved': 'Approved',
  'denied': 'Denied',
  'withdrawn': 'Withdrawn'
}

const caseTypeLabels = {
  'h1b_petition': 'H1-B Petition',
  'h1b_extension': 'H1-B Extension',
  'h1b_transfer': 'H1-B Transfer'
}

export function CasesTable({ employerId, onAddCase }: CasesTableProps) {
  const [cases, setCases] = useState<CaseData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [employerId])

  const loadCases = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading cases:', error)
        return
      }

      setCases(data || [])
    } catch (error) {
      console.error('Unexpected error loading cases:', error)
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

  const getActionButton = (caseItem: CaseData) => {
    switch (caseItem.case_status) {
      case 'questionnaires_assigned':
        return (
          <Button size="sm" variant="outline">
            Continue H1B Petition Questionnaire
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )
      default:
        return (
          <Button size="sm" variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        )
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Loading cases...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Cases</CardTitle>
              <CardDescription>
                Manage your H1-B petition cases
              </CardDescription>
            </div>
            <Button onClick={onAddCase}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Case
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases yet</h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first H1-B petition case
            </p>
            <Button onClick={onAddCase}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Case
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Cases</CardTitle>
            <CardDescription>
              Manage your H1-B petition cases
            </CardDescription>
          </div>
          <Button onClick={onAddCase}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Case
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Case Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Assigned Attorney</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Case Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Details</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {caseItem.employee_first_name} {caseItem.employee_last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {caseItem.employee_email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge 
                      className={`${statusColors[caseItem.case_status as keyof typeof statusColors]} border-0`}
                    >
                      {statusLabels[caseItem.case_status as keyof typeof statusLabels]}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">
                      {caseItem.assigned_attorney}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-900">
                      {caseTypeLabels[caseItem.case_type as keyof typeof caseTypeLabels]}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">{caseItem.job_title}</div>
                      <div className="text-gray-500">{formatSalary(caseItem.annual_salary)}</div>
                      <div className="text-gray-500">Start: {formatDate(caseItem.start_date)}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getActionButton(caseItem)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 