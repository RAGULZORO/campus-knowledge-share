-- Remove AI analysis column from pending_uploads table
ALTER TABLE public.pending_uploads DROP COLUMN IF EXISTS ai_analysis;

-- Remove AI analysis column from resources table
ALTER TABLE public.resources DROP COLUMN IF EXISTS ai_analysis;