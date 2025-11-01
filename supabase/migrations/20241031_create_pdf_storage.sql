-- Create storage bucket for PDF conversions
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-conversions', 'pdf-conversions', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Allow public uploads to pdf-conversions"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'pdf-conversions');

CREATE POLICY "Allow public downloads from pdf-conversions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pdf-conversions');

CREATE POLICY "Allow public deletes from pdf-conversions"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'pdf-conversions');
