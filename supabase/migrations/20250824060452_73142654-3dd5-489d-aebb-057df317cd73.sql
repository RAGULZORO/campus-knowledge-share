-- Add unit column to resources table
ALTER TABLE public.resources 
ADD COLUMN unit text;

-- Update RLS policy to allow deletion
CREATE POLICY "Anyone can delete resources" 
ON public.resources 
FOR DELETE 
USING (true);