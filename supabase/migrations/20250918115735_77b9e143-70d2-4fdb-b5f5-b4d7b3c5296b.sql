-- Create storage bucket for resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true);

-- Create storage policies for the resources bucket
CREATE POLICY "Anyone can view files in resources bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'resources');

CREATE POLICY "Authenticated users can upload files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'resources' AND auth.uid()::text = (storage.foldername(name))[1]);