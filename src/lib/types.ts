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

// Petition Types
export interface PetitionData {
  id: string
  employer_id: string
  employee_id?: string
  petition_type: 'h1b_initial' | 'h1b_extension' | 'h1b_transfer' | 'h1b_amendment'
  petition_status: 'draft' | 'submitted' | 'approved' | 'denied' | 'withdrawn' | 'rfe_issued' | 'rfe_responded'
  priority_date?: string
  receipt_number?: string
  employee_email?: string
  employee_first_name?: string
  employee_last_name?: string
  employee_middle_name?: string
  classification_sought: string
  is_new_employment: boolean
  is_extension: boolean
  is_amendment: boolean
  is_transfer: boolean
  original_validity_from?: string
  original_validity_to?: string
  extension_reason?: string
  previous_employer_name?: string
  previous_employer_ein?: string
  previous_petition_receipt_number?: string
  job_title: string
  job_description: string
  supervisor_name?: string
  supervisor_title?: string
  employment_start_date: string
  employment_end_date: string
  is_full_time: boolean
  hours_per_week?: number
  work_address: string
  work_city: string
  work_state: string
  work_zip_code: string
  work_country: string
  annual_salary: number
  salary_currency: string
  pay_frequency: string
  assigned_attorney?: string
  notes?: string
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

export interface CreatePetitionRequest {
  employee_email: string
  employee_first_name: string
  employee_last_name: string
  employee_middle_name?: string
  petition_type?: PetitionData['petition_type']
  job_title: string
  job_description: string
  employment_start_date: string
  employment_end_date: string
  is_full_time?: boolean
  hours_per_week?: number
  annual_salary: number
  supervisor_name?: string
  supervisor_title?: string
  assigned_attorney?: string
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