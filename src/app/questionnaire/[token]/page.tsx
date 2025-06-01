'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { EmployeeInvitation, CaseData, QuestionnaireResponse } from '@/lib/types'

interface QuestionnaireData {
  invitation: EmployeeInvitation
  case: CaseData
  response: QuestionnaireResponse | null
}

const SECTIONS = [
  { id: 'personal_info', title: 'Personal Information', fields: 8 },
  { id: 'contact_info', title: 'Contact Information', fields: 3 },
  { id: 'immigration_status', title: 'Immigration Status', fields: 9 },
  { id: 'previous_history', title: 'Previous US History', fields: 4 },
  { id: 'education', title: 'Education', fields: 6 },
  { id: 'work_experience', title: 'Work Experience', fields: 6 },
  { id: 'family_info', title: 'Family Information', fields: 5 },
  { id: 'additional_info', title: 'Additional Information', fields: 3 }
]

export default function QuestionnairePage() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<QuestionnaireData | null>(null)
  const [formData, setFormData] = useState<Partial<QuestionnaireResponse>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadQuestionnaire()
  }, [token])

  useEffect(() => {
    if (data?.response) {
      setFormData(data.response)
      const sectionIndex = SECTIONS.findIndex(s => s.id === data.response?.current_section)
      if (sectionIndex !== -1) {
        setCurrentSection(sectionIndex)
      }
    }
  }, [data])

  const loadQuestionnaire = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/questionnaire/${token}`)
      
      if (!response.ok) {
        throw new Error('Failed to load questionnaire')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to load questionnaire')
      }

      setData(result.data)
    } catch (error: any) {
      console.error('Error loading questionnaire:', error)
      setError(error.message || 'Failed to load questionnaire')
    } finally {
      setIsLoading(false)
    }
  }

  const saveProgress = async (isComplete: boolean = false) => {
    try {
      setIsSaving(true)
      setError(null)

      const completedFields = Object.keys(formData).filter(key => 
        formData[key] !== undefined && formData[key] !== null && formData[key] !== ''
      ).length

      const totalFields = SECTIONS.reduce((sum, section) => sum + section.fields, 0)
      const completionPercentage = Math.round((completedFields / totalFields) * 100)

      const payload = {
        ...formData,
        current_section: SECTIONS[currentSection].id,
        completion_percentage: completionPercentage,
        is_complete: isComplete
      }

      const response = await fetch(`/api/questionnaire/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Failed to save progress')
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to save progress')
      }

      setSuccess(isComplete ? 'Questionnaire completed successfully!' : 'Progress saved successfully')
      setTimeout(() => setSuccess(null), 3000)

      if (isComplete) {
        // Redirect to a thank you page or show completion message
      }

    } catch (error: any) {
      console.error('Error saving progress:', error)
      setError(error.message || 'Failed to save progress')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const nextSection = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1)
      saveProgress()
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
      saveProgress()
    }
  }

  const renderCurrentSection = () => {
    const section = SECTIONS[currentSection]
    
    switch (section.id) {
      case 'personal_info':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_first_name">First Name *</Label>
                <Input
                  id="employee_first_name"
                  value={formData.employee_first_name || ''}
                  onChange={(e) => handleInputChange('employee_first_name', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="employee_last_name">Last Name *</Label>
                <Input
                  id="employee_last_name"
                  value={formData.employee_last_name || ''}
                  onChange={(e) => handleInputChange('employee_last_name', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="employee_middle_name">Middle Name</Label>
              <Input
                id="employee_middle_name"
                value={formData.employee_middle_name || ''}
                onChange={(e) => handleInputChange('employee_middle_name', e.target.value)}
                placeholder="Enter your middle name (if any)"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth || ''}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="place_of_birth">Place of Birth *</Label>
                <Input
                  id="place_of_birth"
                  value={formData.place_of_birth || ''}
                  onChange={(e) => handleInputChange('place_of_birth', e.target.value)}
                  placeholder="City, State/Province"
                />
              </div>
              <div>
                <Label htmlFor="country_of_birth">Country of Birth *</Label>
                <Input
                  id="country_of_birth"
                  value={formData.country_of_birth || ''}
                  onChange={(e) => handleInputChange('country_of_birth', e.target.value)}
                  placeholder="Enter country of birth"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country_of_citizenship">Country of Citizenship *</Label>
                <Input
                  id="country_of_citizenship"
                  value={formData.country_of_citizenship || ''}
                  onChange={(e) => handleInputChange('country_of_citizenship', e.target.value)}
                  placeholder="Enter country of citizenship"
                />
              </div>
              <div>
                <Label htmlFor="marital_status">Marital Status *</Label>
                <select
                  id="marital_status"
                  value={formData.marital_status || ''}
                  onChange={(e) => handleInputChange('marital_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select marital status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 'contact_info':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="current_address">Current Address *</Label>
              <Textarea
                id="current_address"
                value={formData.current_address || ''}
                onChange={(e) => handleInputChange('current_address', e.target.value)}
                placeholder="Enter your complete current address"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number || ''}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="email_address">Email Address *</Label>
                <Input
                  id="email_address"
                  type="email"
                  value={formData.email_address || ''}
                  onChange={(e) => handleInputChange('email_address', e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
            </div>
          </div>
        )

      // Add more sections as needed...
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Section content coming soon...</p>
          </div>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadQuestionnaire} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const currentSectionInfo = SECTIONS[currentSection]
  const completionPercentage = Math.round((currentSection / (SECTIONS.length - 1)) * 100)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            H1-B Petition Questionnaire
          </h1>
          <p className="text-gray-600">
            Complete this questionnaire for your H1-B petition case with {data.case.job_title}
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <Badge variant="outline">
              Case: {data.case.case_type.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline">
              Expires: {new Date(data.invitation.expires_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress</CardTitle>
              <Badge>{completionPercentage}% Complete</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="mb-4" />
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((section, index) => (
                <Button
                  key={section.id}
                  variant={index === currentSection ? 'default' : index < currentSection ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSection(index)}
                  className="text-xs"
                >
                  {index < currentSection && <CheckCircle className="h-3 w-3 mr-1" />}
                  {section.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Section */}
        <Card>
          <CardHeader>
            <CardTitle>{currentSectionInfo.title}</CardTitle>
            <CardDescription>
              Section {currentSection + 1} of {SECTIONS.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentSection()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevSection}
            disabled={currentSection === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => saveProgress()}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Progress'
              )}
            </Button>

            {currentSection === SECTIONS.length - 1 ? (
              <Button
                onClick={() => saveProgress(true)}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Questionnaire
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={nextSection}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 