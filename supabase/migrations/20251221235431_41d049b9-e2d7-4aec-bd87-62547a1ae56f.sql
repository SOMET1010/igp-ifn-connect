-- Add cancellation_reason column to orders table for cooperative order cancellations
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone;