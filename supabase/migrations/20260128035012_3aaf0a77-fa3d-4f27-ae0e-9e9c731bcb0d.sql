-- Drop the subscriptions table (this will also drop any RLS policies on it)
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Drop the create_trial_subscription function
DROP FUNCTION IF EXISTS public.create_trial_subscription() CASCADE;