-- Create storage bucket for beer images
-- Run this in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('beer-images', 'beer-images', true);

-- Create storage policies for the bucket
CREATE POLICY "Allow public read access to beer images" ON storage.objects
FOR SELECT USING (bucket_id = 'beer-images');

CREATE POLICY "Allow authenticated users to upload beer images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'beer-images' 
  AND auth.role() = 'authenticated'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

CREATE POLICY "Allow admins to update beer images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'beer-images' 
  AND auth.role() = 'authenticated'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

CREATE POLICY "Allow admins to delete beer images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'beer-images' 
  AND auth.role() = 'authenticated'
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
