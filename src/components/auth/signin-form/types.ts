export interface SigninFormProps {
  onSuccess?: () => void;
}

export interface FormData {
  email: string;
  password: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
}
