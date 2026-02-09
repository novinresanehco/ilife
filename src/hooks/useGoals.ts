/**
 * Goals Service Hook
 * CRUD operations for goals with hierarchy support
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBehaviorTracker } from './useBehaviorTracker';
import { useToast } from './use-toast';

export interface Goal {
  id: string;
  user_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  goal_type: 'personal' | 'career' | 'health' | 'financial' | 'education' | 'relationship' | 'spiritual';
  priority: number;
  progress: number;
  target_date: string | null;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  hierarchy_level: number;
  created_at: string;
  updated_at: string;
  children?: Goal[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  goal_type?: Goal['goal_type'];
  parent_id?: string;
  priority?: number;
  target_date?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  status?: Goal['status'];
  progress?: number;
}

export function useGoals() {
  const { user } = useAuthContext();
  const { trackEvent } = useBehaviorTracker();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all goals for current user
  const { data: goals, isLoading, error } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      return data as Goal[];
    },
    enabled: !!user,
  });

  // Build hierarchical tree from flat list
  const buildGoalTree = useCallback((goalsList: Goal[]): Goal[] => {
    const goalMap = new Map<string, Goal>();
    const rootGoals: Goal[] = [];

    // First pass: create map
    goalsList.forEach(goal => {
      goalMap.set(goal.id, { ...goal, children: [] });
    });

    // Second pass: build tree
    goalsList.forEach(goal => {
      const goalWithChildren = goalMap.get(goal.id)!;
      if (goal.parent_id && goalMap.has(goal.parent_id)) {
        goalMap.get(goal.parent_id)!.children!.push(goalWithChildren);
      } else {
        rootGoals.push(goalWithChildren);
      }
    });

    return rootGoals;
  }, []);

  // Create goal
  const createMutation = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate hierarchy level
      let hierarchyLevel = 0;
      if (input.parent_id) {
        const { data: parent } = await supabase
          .from('goals')
          .select('hierarchy_level')
          .eq('id', input.parent_id)
          .single();
        
        if (parent) {
          hierarchyLevel = parent.hierarchy_level + 1;
        }
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          title: input.title,
          description: input.description,
          goal_type: input.goal_type ?? 'personal',
          parent_id: input.parent_id,
          priority: input.priority ?? 50,
          target_date: input.target_date,
          hierarchy_level: hierarchyLevel,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      trackEvent('goal_created', { 
        goalId: goal.id, 
        title: goal.title,
        type: goal.goal_type,
        hasParent: !!goal.parent_id,
      }, { importance: goal.priority });
      toast({ title: 'هدف ایجاد شد ✓' });
    },
    onError: (error) => {
      toast({ title: 'خطا در ایجاد هدف', description: error.message, variant: 'destructive' });
    },
  });

  // Update goal
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateGoalInput & { id: string }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Goal;
    },
    onSuccess: (goal, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      
      if (variables.status === 'completed') {
        trackEvent('goal_completed', { 
          goalId: goal.id, 
          title: goal.title,
        }, { importance: goal.priority });
        toast({ title: '🎉 تبریک! هدف تکمیل شد' });
      } else if (variables.status === 'abandoned') {
        trackEvent('goal_abandoned', { 
          goalId: goal.id, 
          title: goal.title,
        }, { importance: goal.priority });
      } else {
        trackEvent('goal_updated', { 
          goalId: goal.id, 
          title: goal.title,
          progress: goal.progress,
        });
      }
    },
    onError: (error) => {
      toast({ title: 'خطا در بروزرسانی هدف', description: error.message, variant: 'destructive' });
    },
  });

  // Delete goal
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'هدف حذف شد' });
    },
    onError: (error) => {
      toast({ title: 'خطا در حذف هدف', description: error.message, variant: 'destructive' });
    },
  });

  // Get goals by status
  const getGoalsByStatus = useCallback((status: Goal['status']) => {
    return goals?.filter(g => g.status === status) ?? [];
  }, [goals]);

  // Get goals by type
  const getGoalsByType = useCallback((type: Goal['goal_type']) => {
    return goals?.filter(g => g.goal_type === type) ?? [];
  }, [goals]);

  // Get root goals (no parent)
  const getRootGoals = useCallback(() => {
    return goals?.filter(g => !g.parent_id) ?? [];
  }, [goals]);

  // Get goal tree
  const goalTree = goals ? buildGoalTree(goals) : [];

  return {
    goals: goals ?? [],
    goalTree,
    isLoading,
    error,
    createGoal: createMutation.mutate,
    updateGoal: updateMutation.mutate,
    deleteGoal: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    getGoalsByStatus,
    getGoalsByType,
    getRootGoals,
  };
}

export default useGoals;
