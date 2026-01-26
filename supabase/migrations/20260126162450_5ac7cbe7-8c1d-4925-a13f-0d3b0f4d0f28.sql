-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('support', 'suggestion')),
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_type ON public.support_tickets(type);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
  ON public.support_tickets FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create support_replies table
CREATE TABLE public.support_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_admin_reply boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for replies
CREATE INDEX idx_support_replies_ticket_id ON public.support_replies(ticket_id);

-- Enable RLS
ALTER TABLE public.support_replies ENABLE ROW LEVEL SECURITY;

-- Users can view replies on their own tickets
CREATE POLICY "Users can view replies on own tickets"
  ON public.support_replies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = support_replies.ticket_id
    AND user_id = auth.uid()
  ));

-- Users can create replies on their own tickets
CREATE POLICY "Users can reply to own tickets"
  ON public.support_replies FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE id = support_replies.ticket_id
    AND user_id = auth.uid()
  ) AND is_admin_reply = false);

-- Admins can view all replies
CREATE POLICY "Admins can view all replies"
  ON public.support_replies FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can create replies
CREATE POLICY "Admins can create replies"
  ON public.support_replies FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();