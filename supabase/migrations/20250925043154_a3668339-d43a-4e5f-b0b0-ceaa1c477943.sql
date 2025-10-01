-- Test if the has_role function works correctly and fix any RLS issues
-- Make sure the pending_uploads table has proper RLS policies

-- Drop and recreate the RLS policy for pending uploads to ensure it works
DROP POLICY IF EXISTS "Admins can view all pending uploads" ON pending_uploads;
CREATE POLICY "Admins can view all pending uploads" 
ON pending_uploads 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also ensure admins can delete from pending_uploads 
DROP POLICY IF EXISTS "Admins can delete pending uploads" ON pending_uploads;
CREATE POLICY "Admins can delete pending uploads" 
ON pending_uploads 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));