/**
 * Tasks Service Hook
 * CRUD operations for tasks with behavior tracking integration
 */

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBehaviorTracker } from './useBehaviorTracker';
import { useToast } from './use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done' | 'deferred' | 'cancelled';
  priority: number;
  importance: number;
  due_date: string | null;
  due_time: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  defer_count: number;
  subtask_type: 'checkbox' | 'radio' | 'descriptive' | null;
  subtask_options: Json;
  tags: string[] | null;
  kanban_column: string;
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  goal_id?: string;
  parent_task_id?: string;
  priority?: number;
  importance?: number;
  due_date?: string;
  due_time?: string;
  estimated_minutes?: number;
  tags?: string[];
  kanban_column?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: Task['status'];
  actual_minutes?: number;
  order_index?: number;
}

export function useTasks() {
  const { user } = useAuthContext();
  const { trackEvent, calculateImportance } = useBehaviorTracker();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tasks for current user
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Create task
  const createMutation = useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      if (!user) throw new Error('User not authenticated');

      // Calculate importance based on goal linkage
      let chainImpact = 0;
      if (input.goal_id) {
        const { data: goal } = await supabase
          .from('goals')
          .select('priority')
          .eq('id', input.goal_id)
          .single();
        
        if (goal) {
          chainImpact = 1;
        }
      }

      const importance = calculateImportance(
        input.priority ?? 50,
        0, // repetition count
        input.goal_id ? 80 : 50, // goal match score
        chainImpact
      );

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title: input.title,
          description: input.description,
          goal_id: input.goal_id,
          parent_task_id: input.parent_task_id,
          priority: input.priority ?? 50,
          importance,
          due_date: input.due_date,
          due_time: input.due_time,
          estimated_minutes: input.estimated_minutes,
          tags: input.tags,
          kanban_column: input.kanban_column ?? 'backlog',
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      trackEvent('task_created', { 
        taskId: task.id, 
        title: task.title,
        hasGoal: !!task.goal_id,
        priority: task.priority,
      }, { importance: task.importance, chainImpact: task.goal_id ? 1 : 0 });
      toast({ title: 'وظیفه ایجاد شد ✓' });
    },
    onError: (error) => {
      toast({ title: 'خطا در ایجاد وظیفه', description: error.message, variant: 'destructive' });
    },
  });

  // Update task
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskInput & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      
      // Handle status change to done
      if (updates.status === 'done') {
        updateData.completed_at = new Date().toISOString();
      }
      
      // Handle defer
      if (updates.status === 'deferred') {
        const { data: current } = await supabase
          .from('tasks')
          .select('defer_count')
          .eq('id', id)
          .single();
        
        if (current) {
          updateData.defer_count = (current.defer_count || 0) + 1;
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (task, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Track status changes
      if (variables.status === 'done') {
        trackEvent('task_completed', { 
          taskId: task.id, 
          title: task.title,
          deferCount: task.defer_count,
        }, { importance: task.importance });
      } else if (variables.status === 'deferred') {
        trackEvent('task_deferred', { 
          taskId: task.id, 
          title: task.title,
          deferCount: task.defer_count,
        }, { importance: task.importance + 10 }); // Increase importance for deferrals
      } else {
        trackEvent('task_updated', { 
          taskId: task.id, 
          title: task.title,
        });
      }
    },
    onError: (error) => {
      toast({ title: 'خطا در بروزرسانی وظیفه', description: error.message, variant: 'destructive' });
    },
  });

  // Delete task
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get task before deleting for tracking
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return task as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      trackEvent('task_deleted', { 
        taskId: task?.id, 
        title: task?.title,
        wasCompleted: task?.status === 'done',
      });
      toast({ title: 'وظیفه حذف شد' });
    },
    onError: (error) => {
      toast({ title: 'خطا در حذف وظیفه', description: error.message, variant: 'destructive' });
    },
  });

  // Filter tasks by status
  const getTasksByStatus = useCallback((status: Task['status']) => {
    return tasks?.filter(t => t.status === status) ?? [];
  }, [tasks]);

  // Filter tasks by kanban column
  const getTasksByColumn = useCallback((column: string) => {
    return tasks?.filter(t => t.kanban_column === column) ?? [];
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks?.filter(t => 
      t.due_date && 
      t.due_date < today && 
      t.status !== 'done' && 
      t.status !== 'cancelled'
    ) ?? [];
  }, [tasks]);

  // Get tasks for today
  const getTodayTasks = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks?.filter(t => t.due_date === today) ?? [];
  }, [tasks]);

  return {
    tasks: tasks ?? [],
    isLoading,
    error,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    getTasksByStatus,
    getTasksByColumn,
    getOverdueTasks,
    getTodayTasks,
  };
}

export default useTasks;
