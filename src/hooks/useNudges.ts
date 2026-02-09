/**
 * Nudges/Notifications Hook
 * Manages proactive nudges from the Council
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBehaviorTracker } from './useBehaviorTracker';

export interface Nudge {
  id: string;
  user_id: string;
  nudge_type: 'pursuit' | 'supervision' | 'guidance' | 'question' | 'celebration';
  content: string;
  importance: number;
  council_member: string | null;
  action_type: string | null;
  action_data: Record<string, unknown> | null;
  auto_open: boolean;
  read_at: string | null;
  dismissed_at: string | null;
  related_task_id: string | null;
  related_goal_id: string | null;
  created_at: string;
}

export function useNudges() {
  const { user } = useAuthContext();
  const { trackEvent } = useBehaviorTracker();
  const queryClient = useQueryClient();

  // Fetch all nudges
  const { data: nudges, isLoading } = useQuery({
    queryKey: ['nudges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('nudges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Nudge[];
    },
    enabled: !!user,
  });

  // Get unread nudges
  const unreadNudges = nudges?.filter(n => !n.read_at) ?? [];
  
  // Get nudges that should auto-open
  const autoOpenNudges = unreadNudges.filter(n => n.auto_open);

  // Mark nudge as read
  const markAsReadMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      const { error } = await supabase
        .from('nudges')
        .update({ read_at: new Date().toISOString() })
        .eq('id', nudgeId);

      if (error) throw error;
      return nudgeId;
    },
    onSuccess: (nudgeId) => {
      queryClient.invalidateQueries({ queryKey: ['nudges'] });
      trackEvent('nudge_read', { nudgeId });
    },
  });

  // Dismiss nudge
  const dismissMutation = useMutation({
    mutationFn: async (nudgeId: string) => {
      const { error } = await supabase
        .from('nudges')
        .update({ 
          dismissed_at: new Date().toISOString(),
          read_at: new Date().toISOString(),
        })
        .eq('id', nudgeId);

      if (error) throw error;
      return nudgeId;
    },
    onSuccess: (nudgeId) => {
      queryClient.invalidateQueries({ queryKey: ['nudges'] });
      trackEvent('nudge_dismissed', { nudgeId });
    },
  });

  // Take action on nudge
  const takeActionMutation = useMutation({
    mutationFn: async ({ nudgeId, action }: { nudgeId: string; action: string }) => {
      const { error } = await supabase
        .from('nudges')
        .update({ read_at: new Date().toISOString() })
        .eq('id', nudgeId);

      if (error) throw error;
      return { nudgeId, action };
    },
    onSuccess: ({ nudgeId, action }) => {
      queryClient.invalidateQueries({ queryKey: ['nudges'] });
      trackEvent('nudge_action', { nudgeId, action });
    },
  });

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    await supabase
      .from('nudges')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('read_at', null);

    queryClient.invalidateQueries({ queryKey: ['nudges'] });
  }, [user, queryClient]);

  // Get nudges by type
  const getNudgesByType = useCallback((type: Nudge['nudge_type']) => {
    return nudges?.filter(n => n.nudge_type === type) ?? [];
  }, [nudges]);

  return {
    nudges: nudges ?? [],
    unreadNudges,
    autoOpenNudges,
    unreadCount: unreadNudges.length,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    dismissNudge: dismissMutation.mutate,
    takeAction: takeActionMutation.mutate,
    markAllAsRead,
    getNudgesByType,
  };
}

export default useNudges;
