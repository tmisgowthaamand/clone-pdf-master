-- Create storage bucket for PDF files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pdfs',
  'pdfs',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']::text[]
);

-- Create policy for anyone to upload PDFs
CREATE POLICY "Anyone can upload PDFs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'pdfs');

-- Create policy for anyone to read PDFs
CREATE POLICY "Anyone can read PDFs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'pdfs');

-- Create policy for anyone to delete their PDFs
CREATE POLICY "Anyone can delete PDFs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'pdfs');