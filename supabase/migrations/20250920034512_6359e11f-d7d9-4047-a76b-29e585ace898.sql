-- Add status column to resources table to track flagged files
ALTER TABLE public.resources 
ADD COLUMN status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending_review', 'rejected'));

-- Add review fields for admin actions
ALTER TABLE public.resources 
ADD COLUMN reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN review_notes TEXT,
ADD COLUMN ai_analysis TEXT;

-- Create index for better performance on status queries
CREATE INDEX idx_resources_status ON public.resources(status);

-- Create RLS policy for pending review files (admin only)
CREATE POLICY "Admins can view pending review resources" 
ON public.resources 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) AND status = 'pending_review');

-- Update existing policy to only show approved resources to regular users
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
CREATE POLICY "Approved resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (status = 'approved' OR has_role(auth.uid(), 'admin'::app_role));