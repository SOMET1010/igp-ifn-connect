-- Add UNIQUE constraint on actor_key column
ALTER TABLE public.vivriers_members 
ADD CONSTRAINT vivriers_members_actor_key_unique UNIQUE (actor_key);