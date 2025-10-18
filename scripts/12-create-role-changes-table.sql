-- Create role_changes audit table to track admin role promotions/demotions
CREATE TABLE IF NOT EXISTS public.role_changes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  old_role TEXT NOT NULL,
  new_role TEXT NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookups by admin or target user
CREATE INDEX IF NOT EXISTS idx_role_changes_admin_id ON public.role_changes(admin_id);
CREATE INDEX IF NOT EXISTS idx_role_changes_target_user_id ON public.role_changes(target_user_id);
