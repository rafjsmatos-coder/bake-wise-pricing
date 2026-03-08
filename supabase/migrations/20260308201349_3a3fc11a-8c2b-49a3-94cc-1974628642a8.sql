-- Add DELETE policy for user_settings table
CREATE POLICY "Users can delete their own settings"
  ON public.user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add CASCADE foreign key so settings auto-delete when user is deleted
ALTER TABLE public.user_settings
  ADD CONSTRAINT user_settings_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;