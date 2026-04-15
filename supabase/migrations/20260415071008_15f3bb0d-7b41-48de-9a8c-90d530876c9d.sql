-- Allow public (anonymous) users to read video_servers so video plays without login
DROP POLICY IF EXISTS "Authenticated users can read video servers" ON public.video_servers;
CREATE POLICY "Video servers are publicly readable" ON public.video_servers FOR SELECT USING (true);

-- Mark some popular titles as featured
UPDATE public.content SET featured = true WHERE title IN (
  'Attack on Titan',
  'Death Note', 
  'Spy x Family',
  'Naruto Shippuden',
  'BLUE LOCK'
);
