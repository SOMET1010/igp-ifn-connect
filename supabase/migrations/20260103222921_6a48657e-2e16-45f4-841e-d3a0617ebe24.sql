-- Create a public bucket for mascot images
INSERT INTO storage.buckets (id, name, public)
VALUES ('mascots', 'mascots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to mascot images
CREATE POLICY "Mascots are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'mascots');

-- Allow authenticated users to upload mascots (admin only in practice)
CREATE POLICY "Admins can upload mascots"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mascots' AND auth.role() = 'authenticated');