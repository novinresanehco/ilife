-- Fix function search path security issue
ALTER FUNCTION public.update_updated_at() SET search_path = public;