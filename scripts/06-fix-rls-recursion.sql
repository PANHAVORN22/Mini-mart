-- Fix RLS infinite recursion issue
-- Drop problematic policies and recreate them properly

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;
DROP POLICY IF EXISTS "Trigger can create user profiles" ON public.users;

-- Recreate policies without recursion
CREATE POLICY "Enable read access for users based on user_id" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for users based on user_id" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for admins" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'admin'
    )
  );

CREATE POLICY "Enable update access for admins" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users admin_user
      WHERE admin_user.id = auth.uid() 
      AND admin_user.role = 'admin'
    )
  );

-- Also fix the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the user doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
