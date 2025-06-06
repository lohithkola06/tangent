'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/lib/supabase"
import { Users, Briefcase, Scale } from "lucide-react"
import Link from 'next/link'

interface RoleSelectionProps {
  onRoleSelect: (role: UserRole) => void
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const roles = [
    {
      id: 'employer' as UserRole,
      title: 'Employer',
      description: 'I am a petitioning entity seeking to sponsor foreign workers for H1-B visas and manage organization profiles',
      icon: Briefcase,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'employee' as UserRole,
      title: 'Employee',
      description: 'I am a beneficiary of H1-B petition being sponsored by an employer and need to complete my petition information',
      icon: Users,
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      id: 'attorney' as UserRole,
      title: 'Attorney',
      description: 'I am a legal professional handling H1-B petition preparation, filing, and case management for clients',
      icon: Scale,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
      <div className="flex justify-between mt-4">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Home
        </Link>
        <Link href="/signin" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Sign In
        </Link>
      </div>
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