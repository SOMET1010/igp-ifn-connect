-- Fix function search_path security warnings
CREATE OR REPLACE FUNCTION generate_validation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION expire_old_validations()
RETURNS void AS $$
BEGIN
  UPDATE public.trust_validations 
  SET result = 'expired' 
  WHERE result = 'pending' 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;