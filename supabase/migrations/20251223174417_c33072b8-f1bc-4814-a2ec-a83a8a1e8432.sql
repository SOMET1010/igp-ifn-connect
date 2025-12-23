-- Create agent_requests table for registration workflow
CREATE TABLE public.agent_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    phone text NOT NULL,
    organization text NOT NULL DEFAULT 'DGE',
    preferred_zone text,
    motivation text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by uuid,
    reviewed_at timestamptz,
    rejection_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.agent_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own request
CREATE POLICY "Users can view own request"
ON public.agent_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own request (one per user enforced by UNIQUE constraint)
CREATE POLICY "Users can create own request"
ON public.agent_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending request (to cancel or modify)
CREATE POLICY "Users can update own pending request"
ON public.agent_requests
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.agent_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update any request (approve/reject)
CREATE POLICY "Admins can update requests"
ON public.agent_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_agent_requests_updated_at
BEFORE UPDATE ON public.agent_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();