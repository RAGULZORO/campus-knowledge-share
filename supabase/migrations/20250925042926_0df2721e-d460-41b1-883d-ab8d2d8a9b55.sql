-- Fix admin_resources_view to be a regular view without SECURITY DEFINER
DROP VIEW IF EXISTS admin_resources_view;

-- Create a regular view for admin resources
CREATE VIEW admin_resources_view AS
SELECT 
    r.id,
    r.title,
    r.subject,
    r.description,
    r.department,
    r.type,
    r.uploaded_by,
    r.file_size,
    r.file_url,
    r.download_count,
    r.created_at,
    r.updated_at,
    r.user_id,
    r.category_id,
    p.email as uploader_email,
    p.display_name as uploader_display_name,
    p.department as uploader_department
FROM resources r
LEFT JOIN profiles p ON r.user_id = p.id;

-- Update RLS policy for pending_uploads to ensure admins can see all uploads
DROP POLICY IF EXISTS "Admins can view all pending uploads" ON pending_uploads;
CREATE POLICY "Admins can view all pending uploads" 
ON pending_uploads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policy for admin_resources_view access
DROP POLICY IF EXISTS "Admins can view admin resources view" ON resources;
CREATE POLICY "Admins can view admin resources view" 
ON resources 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure admins can insert resources (for approval process)
DROP POLICY IF EXISTS "Admins can insert approved resources" ON resources;
CREATE POLICY "Admins can insert approved resources" 
ON resources 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id) OR (user_id IS NULL));