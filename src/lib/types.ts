// Shared types for frontend and backend
export type UserRole = 'employer' | 'employee' | 'attorney'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export interface EmployerData {
  id: string
  user_id: string
  legal_business_name: string
  trade_name: string | null
  federal_employer_id: string
  address: string
  suite_floor_unit: string | null
  postal_code: string
  year_established: number
  total_us_employees: number
  telephone_number: string | null
  nature_of_business: string
  created_at: string
  updated_at: string
}

export interface FinancialData {
  id: string
  employer_id: string
  gross_annual_income: number
  net_annual_income: number
  financial_documents_url: string
  created_at: string
  updated_at: string
}

export interface ContactData {
  id: string
  employer_id: string
  first_name: string
  last_name: string
  middle_name: string | null
  job_title: string
  telephone_number: string
  email_address: string
  created_at: string
  updated_at: string
}

export interface CaseData {
  id: string
  employer_id: string
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  case_type: 'h1b_petition' | 'h1b_extension' | 'h1b_transfer'
  case_status: 'questionnaires_assigned' | 'in_progress' | 'under_review' | 'approved' | 'denied' | 'withdrawn'
  job_title: string
  job_description: string
  annual_salary: number
  start_date: string
  assigned_attorney: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// API Request/Response types
export interface SignupRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
}

export interface SigninRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: UserProfile
  session: any
}

export interface CreateOrganizationRequest {
  legal_business_name: string
  trade_name?: string
  federal_employer_id: string
  business_location: {
    address: string
    suite_floor_unit?: string
    postal_code: string
  }
  business_details: {
    year_established: string
    total_us_employees: string
    telephone_number?: string
    nature_of_business: string
  }
  financial_info: {
    gross_annual_income: string
    net_annual_income: string
    financial_documents_url: string
  }
  contact_info: {
    first_name: string
    last_name: string
    middle_name?: string
    job_title: string
    telephone_number: string
    email_address: string
  }
  notes?: string
}

export interface CreateCaseRequest {
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  case_type: CaseData['case_type']
  job_title: string
  job_description: string
  annual_salary: number
  start_date: string
  notes?: string
}

export interface UpdateEmployerRequest {
  legal_business_name?: string
  trade_name?: string
  federal_employer_id?: string
  address?: string
  suite_floor_unit?: string
  postal_code?: string
  year_established?: number
  total_us_employees?: number
  telephone_number?: string
  nature_of_business?: string
}

export interface UpdateFinancialRequest {
  gross_annual_income?: number
  net_annual_income?: number
  financial_documents_url?: string
}

export interface UpdateContactRequest {
  first_name?: string
  last_name?: string
  middle_name?: string
  job_title?: string
  telephone_number?: string
  email_address?: string
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  email?: string
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
} 