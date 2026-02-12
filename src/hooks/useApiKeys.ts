/**
 * Hook for managing user's AI API keys
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface ApiKey {
  id: string;
  provider: string;
  api_key: string;
  label: string | null;
  is_active: boolean;
  blocked_until: string | null;
  block_reason: string | null;
  total_requests: number;
  failed_requests: number;
  last_used_at: string | null;
  created_at: string;
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  const fetchKeys = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('ai_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setKeys((data as unknown as ApiKey[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const addKey = useCallback(async (apiKey: string, label?: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('ai_api_keys')
      .insert({ user_id: user.id, api_key: apiKey, label: label || null, provider: 'gemini' })
      .select()
      .single();
    if (!error && data) {
      setKeys(prev => [data as unknown as ApiKey, ...prev]);
    }
    return { data, error };
  }, [user]);

  const removeKey = useCallback(async (id: string) => {
    await supabase.from('ai_api_keys').delete().eq('id', id);
    setKeys(prev => prev.filter(k => k.id !== id));
  }, []);

  const toggleKey = useCallback(async (id: string, isActive: boolean) => {
    await supabase.from('ai_api_keys').update({ is_active: isActive }).eq('id', id);
    setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: isActive } : k));
  }, []);

  const unblockKey = useCallback(async (id: string) => {
    await supabase
      .from('ai_api_keys')
      .update({ blocked_until: null, block_reason: null })
      .eq('id', id);
    setKeys(prev => prev.map(k => k.id === id ? { ...k, blocked_until: null, block_reason: null } : k));
  }, []);

  return { keys, loading, addKey, removeKey, toggleKey, unblockKey, refetch: fetchKeys };
}
