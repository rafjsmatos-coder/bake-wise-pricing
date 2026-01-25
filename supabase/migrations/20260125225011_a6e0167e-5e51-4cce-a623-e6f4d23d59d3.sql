-- Add DELETE policy for profiles table to allow users to delete their own profile data
-- This addresses GDPR/privacy compliance by enabling users to remove their personal information

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);