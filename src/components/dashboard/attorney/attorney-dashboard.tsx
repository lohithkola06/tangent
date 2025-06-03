'use client'

import { type ReactNode } from 'react'
import { DashboardProps } from '@/components/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useState } from 'react'
import {
  Calendar,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Clock,
  LucideIcon,
} from 'lucide-react'

interface StatItem {
  label: string
  value: string
  icon: LucideIcon
  change: string
}

interface Event {
  title: string
  date: string
  time: string
  type: 'consultation' | 'hearing' | 'review'
}

export function AttorneyDashboard({ user, userProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats: StatItem[] = [
    {
      label: 'Active Cases',
      value: '12',
      icon: Briefcase,
      change: '+2 this month',
    },
    {
      label: 'Pending Consultations',
      value: '5',
      icon: Clock,
      change: '3 this week',
    },
    {
      label: 'Total Clients',
      value: '48',
      icon: Users,
      change: '+5 this month',
    },
    {
      label: 'Documents',
      value: '156',
      icon: FileText,
      change: '+12 this week',
    },
  ]

  const upcomingEvents: Event[] = [
    {
      title: 'Client Consultation - John Doe',
      date: '2024-03-20',
      time: '10:00 AM',
      type: 'consultation',
    },
    {
      title: 'Court Hearing - Smith vs. Corp',
      date: '2024-03-22',
      time: '2:30 PM',
      type: 'hearing',
    },
    {
      title: 'Document Review - Johnson Case',
      date: '2024-03-23',
      time: '11:00 AM',
      type: 'review',
    },
  ]

  const dashboardContent: ReactNode = (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.first_name}
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your practice and upcoming schedule
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar and Events */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Events
            </h2>
            <Button variant="outline">View Calendar</Button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {event.date} at {event.time}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              New Case File
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Schedule Consultation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Client Directory
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Time Tracking
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  return <DashboardLayout>{dashboardContent}</DashboardLayout>
} 