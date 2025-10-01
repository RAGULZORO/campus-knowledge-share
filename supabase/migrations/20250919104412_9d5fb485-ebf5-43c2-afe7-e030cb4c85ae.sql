-- Fix the security definer view issue by dropping and recreating without SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_resources_view;

-- Create a regular view (without SECURITY DEFINER)
CREATE VIEW public.admin_resources_view AS
SELECT 
    r.*,
    p.email as uploader_email,
    p.display_name as uploader_display_name,
    p.department as uploader_department
FROM public.resources r
LEFT JOIN public.profiles p ON r.user_id = p.id;

-- Create RLS policy for admin access to the view
CREATE POLICY "Admins can view admin resources view"
ON public.resources
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Grant access to admin view
GRANT SELECT ON public.admin_resources_view TO authenticated;