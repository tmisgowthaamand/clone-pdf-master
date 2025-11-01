-- Buckets for server-side conversion flow (keep private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('source_files', 'source_files', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('converted_files', 'converted_files', false)
ON CONFLICT (id) DO NOTHING;
