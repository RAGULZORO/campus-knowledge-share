-- Create resources table for storing resource metadata
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  department TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('question-papers', 'study-materials', 'lab-manuals')),
  uploaded_by TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  downloads INTEGER NOT NULL DEFAULT 0,
  file_size TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Anyone can view resources" 
ON public.resources 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create resources" 
ON public.resources 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update download count" 
ON public.resources 
FOR UPDATE 
USING (true);

-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) VALUES ('resources', 'resources', true);

-- Create storage policies for resource uploads
CREATE POLICY "Anyone can view resource files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'resources');

CREATE POLICY "Anyone can upload resource files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'resources');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better search performance
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_department ON public.resources(department);
CREATE INDEX idx_resources_subject ON public.resources(subject);