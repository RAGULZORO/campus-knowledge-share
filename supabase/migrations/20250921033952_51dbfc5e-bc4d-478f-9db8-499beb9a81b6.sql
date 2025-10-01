-- Create a temporary file storage table for pending uploads
CREATE TABLE public.pending_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_data BYTEA NOT NULL,
  file_size TEXT NOT NULL,
  user_id UUID,
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on pending_uploads
ALTER TABLE public.pending_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for pending_uploads
CREATE POLICY "Users can insert their own pending uploads" 
ON public.pending_uploads 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Admins can view all pending uploads" 
ON public.pending_uploads 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete pending uploads" 
ON public.pending_uploads 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates on pending_uploads
CREATE TRIGGER update_pending_uploads_updated_at
BEFORE UPDATE ON public.pending_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();