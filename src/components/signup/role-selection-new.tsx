'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, User, Scale } from "lucide-react"
import { UserRole } from "@/lib/types"

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const roles = [
    {
      id: 'employer' as UserRole,
      title: 'Employer',
      description: 'Petitioning entity seeking to sponsor foreign workers for H1-B visas. Manage organization profiles, upload documents, handle payments, and track petition progress.',
      icon: Building,
      color: 'hover:border-blue-300 hover:bg-blue-50'
    },
    {
      id: 'employee' as UserRole,
      title: 'Employee',
      description: 'H1-B beneficiary completing personal and professional information. Upload required documents, track petition status, and communicate with attorneys.',
      icon: User,
      color: 'hover:border-green-300 hover:bg-green-50'
    },
    {
      id: 'attorney' as UserRole,
      title: 'Attorney',
      description: 'Legal professional handling H1-B petition preparation and filing. Manage case workflows, USCIS communications, and client relationships.',
      icon: Scale,
      color: 'hover:border-purple-300 hover:bg-purple-50'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Join the H1-B Petition Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your role to get started with H1-B visa petition management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all duration-200 ${role.color} hover:shadow-lg`}
                onClick={() => onRoleSelect(role.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {role.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600 mb-4">
                    {role.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRoleSelect(role.id)
                    }}
                  >
                    Continue as {role.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
} 