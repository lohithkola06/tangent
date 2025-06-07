import { 
  SignupRequest, 
  SigninRequest, 
  AuthResponse, 
  UserProfile, 
  CaseData, 
  CreateOrganizationRequest, 
  CreateCaseRequest, 
  UpdateProfileRequest,
  ApiResponse 
} from './types'

class ApiClient {
  private baseUrl: string

  constructor() {
    if (typeof window !== 'undefined') {
      // Client-side
      this.baseUrl = window.location.origin
    } else {
      // Server-side
      this.baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3000'
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/api${endpoint}`
    const accessToken = localStorage.getItem('accessToken')
    console.log('Access token in Request:', accessToken)
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...(typeof window !== 'undefined' && 
        window.supabase?.auth?.getSession?.() && 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      ),
      credentials: 'include', // Include cookies for authentication
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error: any) {
      console.error(`API request failed: ${endpoint}`, error)
      throw new Error(error.message || 'Network error occurred')
    }
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async signin(data: SigninRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    console.log('Signin response:', response)
    return response.data!
  }

  async signout(): Promise<void> {
    await this.request('/auth/signout', {
      method: 'POST',
    })
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      console.log('Getting current user...')
      console.log('Supabase session:', window.supabase.auth.getSession().session) 
      console.log('Supabase access token:', window.supabase.auth.getSession().session?.access_token) 
      const response = await this.request<UserProfile>('/auth/me')
      console.log('Current user:', response)
      return response.data!
    } catch (error: any) {
      if (error.message.includes('Not authenticated')) {
        return null
      }
      throw error
    }
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; message: string; user: UserProfile }> {
    const response = await this.request<{ success: boolean; message: string; user: UserProfile }>('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  // Employer endpoints
  async getEmployer(): Promise<EmployerData | null> {
    const response = await this.request<EmployerData>('/employer')
    return response.data!
  }

  async createOrganization(data: CreateOrganizationRequest): Promise<EmployerData> {
    const response = await this.request<EmployerData>('/employer', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async getEmployerDetails(): Promise<{
    employer: EmployerData
    finances: FinancialData | null
    contact: ContactData | null
  }> {
    const response = await this.request<{
      employer: EmployerData
      finances: FinancialData | null
      contact: ContactData | null
    }>('/employer/details')
    return response.data!
  }

  async updateBusinessInfo(data: Partial<EmployerData>): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('/employer/update?type=business', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async updateFinancialInfo(data: Partial<FinancialData>): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('/employer/update?type=financial', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async updateContactInfo(data: Partial<ContactData>): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>('/employer/update?type=contact', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  // Case endpoints
  async getCases(): Promise<CaseData[]> {
    const response = await this.request<CaseData[]>('/cases')
    return response.data!
  }

  async createCase(data: CreateCaseRequest): Promise<CaseData> {
    const response = await this.request<CaseData>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.data!
  }

  async getCaseStats(): Promise<{ active: number; total: number }> {
    const response = await this.request<{ active: number; total: number }>('/cases/stats')
    return response.data!
  }
}

export const apiClient = new ApiClient() 