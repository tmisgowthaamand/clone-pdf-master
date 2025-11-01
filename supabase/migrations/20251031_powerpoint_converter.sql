-- PowerPoint to PDF Converter Database Schema

-- Create conversions table to track all conversion jobs
CREATE TABLE IF NOT EXISTS public.conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    source_path TEXT NOT NULL,
    converted_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    conversion_started_at TIMESTAMPTZ,
    conversion_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversions_user_id ON public.conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_status ON public.conversions(status);
CREATE INDEX IF NOT EXISTS idx_conversions_expires_at ON public.conversions(expires_at);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON public.conversions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to view their own conversions
CREATE POLICY "Users can view own conversions"
    ON public.conversions
    FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to insert their own conversions
CREATE POLICY "Users can insert own conversions"
    ON public.conversions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own conversions
CREATE POLICY "Users can update own conversions"
    ON public.conversions
    FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete their own conversions
CREATE POLICY "Users can delete own conversions"
    ON public.conversions
    FOR DELETE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_conversions_updated_at ON public.conversions;
CREATE TRIGGER update_conversions_updated_at
    BEFORE UPDATE ON public.conversions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup expired conversions
CREATE OR REPLACE FUNCTION cleanup_expired_conversions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.conversions
    WHERE expires_at < NOW()
    AND status IN ('completed', 'failed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage buckets (run these via Supabase Dashboard or API)
-- Storage bucket policies will be set via Supabase Dashboard

-- Comments
COMMENT ON TABLE public.conversions IS 'Tracks PowerPoint to PDF conversion jobs';
COMMENT ON COLUMN public.conversions.status IS 'Conversion status: pending, processing, completed, failed';
COMMENT ON COLUMN public.conversions.source_path IS 'Path to source PowerPoint file in Supabase storage';
COMMENT ON COLUMN public.conversions.converted_path IS 'Path to converted PDF file in Supabase storage';
COMMENT ON COLUMN public.conversions.expires_at IS 'When the conversion files will be automatically deleted';
COMMENT ON COLUMN public.conversions.metadata IS 'Additional metadata like slide count, conversion time, etc.';
