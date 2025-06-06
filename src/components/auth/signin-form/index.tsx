import { useState } from "react";
import type { FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { SigninFormProps, FormData, FormErrors } from "./types";
import { validateForm } from "./validation";
import { signinFormStyles } from "./styles";

export function SigninForm({ onSuccess }: SigninFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formErrors = validateForm(formData);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      onSuccess?.();
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while signing in';
      setErrors({
        email: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className={signinFormStyles.container.base}>
          <div className={errors.email ? signinFormStyles.container.error : ''}>
            <Label className={errors.email ? signinFormStyles.label.error : signinFormStyles.label.base}>
              Email
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? signinFormStyles.input.error : signinFormStyles.input.base}
              placeholder="Enter your email"
            />
            {errors.email && <p className={signinFormStyles.errorText}>{errors.email}</p>}
          </div>

          <div className={errors.password ? signinFormStyles.container.error : ''}>
            <div className="relative">
              <Label className={errors.password ? signinFormStyles.label.error : signinFormStyles.label.base}>
                Password
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? signinFormStyles.input.error : signinFormStyles.input.base}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className={signinFormStyles.errorText}>{errors.password}</p>}
          </div>

          <Button
            type="submit"
            className={signinFormStyles.button.base}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/signup" className={signinFormStyles.link}>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
