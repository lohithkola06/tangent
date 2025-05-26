# Signup Flow Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Database Setup

Based on your schema, you should have the following tables:

### 1. Users Table (public.users)

```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employer', 'employee', 'attorney')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Database Trigger (Optional but Recommended)

Create a trigger to automatically create a profile when a user signs up:

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy for inserting new users (for the signup process)
CREATE POLICY "Enable insert for authenticated users only" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### 4. Employers Table (public.employers)

```sql
CREATE TABLE public.employers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  legal_business_name TEXT NOT NULL,
  trade_name TEXT,
  federal_employer_id TEXT NOT NULL,
  address TEXT NOT NULL,
  suite_floor_unit TEXT,
  postal_code TEXT NOT NULL,
  year_established INTEGER NOT NULL,
  total_us_employees INTEGER NOT NULL,
  telephone_number TEXT,
  nature_of_business TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Policies for employers table
CREATE POLICY "Users can view own employer data" ON public.employers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employer data" ON public.employers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employer data" ON public.employers
  FOR UPDATE USING (auth.uid() = user_id);
```

### 5. Employer Finances Table (public.employer_finances)

```sql
CREATE TABLE public.employer_finances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  gross_annual_income DECIMAL(15,2) NOT NULL,
  net_annual_income DECIMAL(15,2) NOT NULL,
  financial_documents_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employer_finances ENABLE ROW LEVEL SECURITY;

-- Policies for employer_finances table
CREATE POLICY "Users can view own employer finances" ON public.employer_finances
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can insert own employer finances" ON public.employer_finances
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can update own employer finances" ON public.employer_finances
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );
```

### 6. Employer Contacts Table (public.employer_contacts)

```sql
CREATE TABLE public.employer_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  middle_name TEXT,
  job_title TEXT NOT NULL,
  telephone_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employer_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for employer_contacts table
CREATE POLICY "Users can view own employer contacts" ON public.employer_contacts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can insert own employer contacts" ON public.employer_contacts
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can update own employer contacts" ON public.employer_contacts
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );
```

### 7. Employer Notes Table (public.employer_notes)

```sql
CREATE TABLE public.employer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employer_notes ENABLE ROW LEVEL SECURITY;

-- Policies for employer_notes table
CREATE POLICY "Users can view own employer notes" ON public.employer_notes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can insert own employer notes" ON public.employer_notes
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can update own employer notes" ON public.employer_notes
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );
```

### 8. Cases Table (public.cases)

```sql
CREATE TABLE public.cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  employee_email TEXT NOT NULL,
  employee_first_name TEXT NOT NULL,
  employee_last_name TEXT NOT NULL,
  case_type TEXT NOT NULL CHECK (case_type IN ('h1b_petition', 'h1b_extension', 'h1b_transfer')),
  case_status TEXT NOT NULL CHECK (case_status IN ('questionnaires_assigned', 'in_progress', 'under_review', 'approved', 'denied', 'withdrawn')),
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  annual_salary DECIMAL(12,2) NOT NULL,
  start_date DATE NOT NULL,
  assigned_attorney TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Policies for cases table
CREATE POLICY "Users can view own cases" ON public.cases
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can insert own cases" ON public.cases
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );

CREATE POLICY "Users can update own cases" ON public.cases
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.employers WHERE id = employer_id
    )
  );
```

## Usage

1. Navigate to `/signup` to access the signup flow
2. Users will first select their role (employer, employee, or attorney)
3. Then fill out the registration form
4. Upon successful signup, they'll see a success message

## Signup Flow

1. **Role Selection**: User chooses between employer, employee, or attorney
2. **Form Submission**: User fills out personal details and creates password
3. **Supabase Auth**: Account created in `auth.users` table
4. **Profile Creation**: Profile automatically created in `public.users` via trigger
5. **Success**: User sees confirmation and can proceed to login/dashboard

## File Structure

```
src/
├── components/
│   └── signup/
│       ├── role-selection.tsx    # Step 1: Role selection
│       ├── signup-form.tsx       # Step 2: Registration form
│       └── signup-success.tsx    # Step 3: Success message
├── lib/
│   ├── supabase.ts              # Client-side Supabase client
│   └── supabase-server.ts       # Server-side Supabase client
└── app/
    └── signup/
        └── page.tsx             # Main signup page orchestrator
```
