'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye, Mail } from 'lucide-react'
import { CaseData } from '@/lib/types'

interface CasesTableProps {
  cases: CaseData[]
}

export function CasesTable({ cases }: CasesTableProps) {
  const getStatusBadge = (status: CaseData['case_status']) => {
    const statusConfig = {
      'questionnaires_assigned': { label: 'Questionnaires Assigned', variant: 'secondary' as const },
      'in_progress': { label: 'In Progress', variant: 'default' as const },
      'under_review': { label: 'Under Review', variant: 'outline' as const },
      'approved': { label: 'Approved', variant: 'default' as const },
      'denied': { label: 'Denied', variant: 'destructive' as const },
      'withdrawn': { label: 'Withdrawn', variant: 'secondary' as const }
    }

    const config = statusConfig[status] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getCaseTypeBadge = (type: CaseData['case_type']) => {
    const typeConfig = {
      'h1b_petition': { label: 'H1-B Petition', color: 'bg-blue-100 text-blue-800' },
      'h1b_extension': { label: 'H1-B Extension', color: 'bg-green-100 text-green-800' },
      'h1b_transfer': { label: 'H1-B Transfer', color: 'bg-purple-100 text-purple-800' }
    }

    const config = typeConfig[type] || { label: type, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
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

  if (cases.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cases found. Create your first case to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Case Type</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Attorney</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {caseItem.employee_first_name} {caseItem.employee_last_name}
                  </div>
                  <div className="text-sm text-gray-500">{caseItem.employee_email}</div>
                </div>
              </TableCell>
              <TableCell>
                {getCaseTypeBadge(caseItem.case_type)}
              </TableCell>
              <TableCell>
                <div className="font-medium">{caseItem.job_title}</div>
              </TableCell>
              <TableCell>
                {getStatusBadge(caseItem.case_status)}
              </TableCell>
              <TableCell>
                {formatSalary(caseItem.annual_salary)}
              </TableCell>
              <TableCell>
                {formatDate(caseItem.start_date)}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {caseItem.assigned_attorney || 'Not assigned'}
                </div>
              </TableCell>
              <TableCell>
                {formatDate(caseItem.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 