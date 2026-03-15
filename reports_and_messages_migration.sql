-- Make doctor_id nullable in reports for AI-generated checkups
ALTER TABLE public.reports ALTER COLUMN doctor_id DROP NOT NULL;

-- Create direct messaging table for Doctor-Patient interaction
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);

-- RLS Policies for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sent/received messages"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert their own messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own received messages (mark as read)"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);
