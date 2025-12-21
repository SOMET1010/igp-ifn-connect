-- Create audio storage bucket for pre-recorded voices
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admins to upload audio files
CREATE POLICY "Admins can upload audio recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated admins to update audio files
CREATE POLICY "Admins can update audio recordings"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated admins to delete audio files
CREATE POLICY "Admins can delete audio recordings"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow public read access to audio files (for playback)
CREATE POLICY "Anyone can view audio recordings"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio-recordings');

-- Create a table to track which audio files have been recorded
CREATE TABLE public.audio_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audio_key TEXT NOT NULL,
  language_code TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration_seconds NUMERIC,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(audio_key, language_code)
);

-- Enable RLS
ALTER TABLE public.audio_recordings ENABLE ROW LEVEL SECURITY;

-- Admin can manage all recordings
CREATE POLICY "Admins can manage audio recordings"
ON public.audio_recordings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Anyone can read recordings (for playback check)
CREATE POLICY "Anyone can view audio recordings metadata"
ON public.audio_recordings
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_audio_recordings_updated_at
BEFORE UPDATE ON public.audio_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();