-- Check the current state of the database
-- Run this to see what policies exist

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as command,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'users';

-- Check user count
SELECT COUNT(*) as total_users FROM auth.users;
SELECT COUNT(*) as total_user_profiles FROM public.users;
