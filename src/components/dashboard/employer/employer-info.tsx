'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil } from "lucide-react"



interface EmployerInfoProps {
  employer: {
    id: string
    name: string
    ein: string
    address: string
    city: string
    state: string
    zip: string
  }
  onEdit: () => void
}

export function EmployerInfo({ employer, onEdit }: EmployerInfoProps) {
  

  if (!employer) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Employer Information</CardTitle>
          <CardDescription>Loading employer details...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Employer Information</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Employer Info
          </Button>
        </div>
        <CardDescription className="text-gray-500">
          Review and update your organization&apos;s details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-gray-700 mb-1">Organization Name</p>
            <p className="text-gray-900 font-semibold">{employer.name}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">EIN</p>
            <p className="text-gray-900 font-semibold">{employer.ein}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Address</p>
            <p className="text-gray-900">{employer.address}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Location</p>
            <p className="text-gray-900">{`${employer.city}, ${employer.state} ${employer.zip}`}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
