-- Add enrichment fields to leads table
ALTER TABLE public.leads 
ADD COLUMN company_name TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN enriched_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN enrichment_status TEXT DEFAULT 'pending';

-- Add comment for documentation
COMMENT ON COLUMN public.leads.enriched_data IS 'Stores full payload from FullEnrich API';
COMMENT ON COLUMN public.leads.enrichment_status IS 'Status of the enrichment process (pending, completed, failed)';