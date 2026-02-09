/**
 * Deep Behavioral Tracking Hook
 * Monitors user behavior passively and stores in database
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type EventType = 
  | 'page_view'
  | 'task_created' | 'task_completed' | 'task_deferred' | 'task_deleted' | 'task_updated'
  | 'goal_created' | 'goal_updated' | 'goal_completed' | 'goal_abandoned'
  | 'idea_created' | 'idea_updated'
  | 'session_start' | 'session_end'
  | 'nudge_read' | 'nudge_dismissed' | 'nudge_action'
  | 'question_answered' | 'question_skipped'
  | 'message_sent'
  | 'energy_reported' | 'mood_reported'
  | 'long_gap_detected' | 'productivity_drop' | 'pattern_detected';

interface TrackEventOptions {
  importance?: number;
  chainImpact?: number;
  pageContext?: string;
}

export function useBehaviorTracker() {
  const location = useLocation();
  const sessionId = useRef<string>(Date.now().toString());
  const lastPageView = useRef<string>('');
  const lastEventTime = useRef<Date>(new Date());

  // Track page views
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== lastPageView.current) {
      lastPageView.current = currentPath;
      trackEvent('page_view', { path: currentPath }, { pageContext: currentPath });
    }
  }, [location.pathname]);

  // Detect long gaps (3+ hours without activity)
  useEffect(() => {
    const checkGap = () => {
      const now = new Date();
      const gapHours = (now.getTime() - lastEventTime.current.getTime()) / (1000 * 60 * 60);
      if (gapHours >= 3) {
        trackEvent('long_gap_detected', { gapHours }, { importance: 40 });
      }
    };

    const interval = setInterval(checkGap, 30 * 60 * 1000); // Check every 30 min
    return () => clearInterval(interval);
  }, []);

  // Track event to database
  const trackEvent = useCallback(async (
    eventType: EventType,
    data: Record<string, unknown> = {},
    options: TrackEventOptions = {}
  ) => {
    lastEventTime.current = new Date();

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return; // Only track for logged-in users

      await supabase.from('behavior_events').insert([{
        user_id: userData.user.id,
        event_type: eventType,
        event_data: JSON.parse(JSON.stringify(data)) as Record<string, never>,
        importance: options.importance ?? 50,
        chain_impact: options.chainImpact ?? 0,
        page_context: options.pageContext ?? location.pathname,
        session_id: sessionId.current,
      }]);

      // Auto-analyze patterns after significant events
      if (['task_deferred', 'goal_abandoned', 'productivity_drop'].includes(eventType)) {
        analyzePatterns(userData.user.id);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }, [location.pathname]);

  // Analyze patterns from recent behavior
  const analyzePatterns = useCallback(async (userId: string) => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentEvents } = await supabase
        .from('behavior_events')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });

      if (!recentEvents || recentEvents.length < 3) return;

      // Pattern detection: Procrastination
      const deferrals = recentEvents.filter(e => e.event_type === 'task_deferred');
      if (deferrals.length >= 3) {
        const confidence = Math.min(95, 50 + deferrals.length * 10);
        await createHypothesis(userId, 'procrastination', confidence, 
          deferrals.map(d => `وظیفه "${(d.event_data as Record<string, unknown>)?.title || 'بدون عنوان'}" به تعویق افتاد`),
          'شروع با یک کار کوچک ۲ دقیقه‌ای می‌تواند کمک کند',
          'psych'
        );
      }

      // Pattern detection: Overwhelm
      const created = recentEvents.filter(e => e.event_type === 'task_created');
      const completed = recentEvents.filter(e => e.event_type === 'task_completed');
      if (created.length > 5 && completed.length < 2) {
        await createHypothesis(userId, 'overwhelm', 70,
          [`${created.length} وظیفه جدید ایجاد شد`, `فقط ${completed.length} وظیفه تکمیل شد`],
          'پیشنهاد می‌کنم ۳ وظیفه مهم امروز را انتخاب کنید',
          'strategist'
        );
      }

      // Pattern detection: Low Energy (long gaps)
      const longGaps = recentEvents.filter(e => e.event_type === 'long_gap_detected');
      if (longGaps.length >= 2) {
        await createHypothesis(userId, 'low_energy', 60,
          [`${longGaps.length} بازه طولانی بدون فعالیت شناسایی شد`],
          'استراحت کوتاه و تمرین کششی می‌تواند انرژی را بازگرداند',
          'health'
        );
      }

      // Update perception model based on patterns
      await updatePerceptionModel(userId, deferrals.length, longGaps.length, created.length, completed.length);

    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }
  }, []);

  // Create behavioral hypothesis
  const createHypothesis = async (
    userId: string,
    pattern: string,
    confidence: number,
    evidence: string[],
    suggestedAction: string,
    councilMember: string
  ) => {
    // Check if similar hypothesis exists in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('behavioral_hypotheses')
      .select('id')
      .eq('user_id', userId)
      .eq('pattern', pattern)
      .gte('created_at', oneDayAgo)
      .limit(1);

    if (existing && existing.length > 0) return; // Avoid duplicate hypotheses

    await supabase.from('behavioral_hypotheses').insert({
      user_id: userId,
      pattern,
      confidence,
      evidence,
      suggested_action: suggestedAction,
      council_member: councilMember,
    });

    // Create nudge for high-confidence patterns
    if (confidence >= 60) {
      await supabase.from('nudges').insert({
        user_id: userId,
        nudge_type: 'supervision',
        content: `👁️ نظارت: الگوی ${getPatternLabel(pattern)} شناسایی شد. ${suggestedAction}`,
        importance: confidence,
        council_member: councilMember,
        auto_open: confidence >= 80,
      });
    }
  };

  // Update perception model
  const updatePerceptionModel = async (
    userId: string,
    deferralsCount: number,
    lowEnergyGaps: number,
    tasksCreated: number,
    tasksCompleted: number
  ) => {
    const { data: currentPerception } = await supabase
      .from('perception_models')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!currentPerception) return;

    const updates: Record<string, number> = {};

    // Adjust procrastination score
    if (deferralsCount >= 3) {
      updates.procrastination = Math.min(100, currentPerception.procrastination + 5);
    } else if (deferralsCount === 0) {
      updates.procrastination = Math.max(0, currentPerception.procrastination - 2);
    }

    // Adjust energy level
    if (lowEnergyGaps >= 2) {
      updates.energy_level = Math.max(0, currentPerception.energy_level - 10);
    }

    // Adjust overwhelm
    if (tasksCreated > 5 && tasksCompleted < 2) {
      updates.overwhelm = Math.min(100, currentPerception.overwhelm + 10);
    } else if (tasksCompleted >= tasksCreated) {
      updates.overwhelm = Math.max(0, currentPerception.overwhelm - 5);
    }

    // Adjust motivation based on completion rate
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 50;
    if (completionRate > 70) {
      updates.motivation = Math.min(100, currentPerception.motivation + 5);
    } else if (completionRate < 30) {
      updates.motivation = Math.max(0, currentPerception.motivation - 5);
    }

    if (Object.keys(updates).length > 0) {
      updates.last_analysis_at = Date.now();
      await supabase
        .from('perception_models')
        .update(updates)
        .eq('user_id', userId);
    }
  };

  // Get pattern label in Persian
  const getPatternLabel = (pattern: string): string => {
    const labels: Record<string, string> = {
      procrastination: 'تعلل',
      overwhelm: 'غرق شدن در کارها',
      low_energy: 'کمبود انرژی',
      perfectionism: 'کمال‌گرایی',
    };
    return labels[pattern] || pattern;
  };

  // Calculate importance score based on formula
  const calculateImportance = useCallback((
    userPriority: number,
    repetitionCount: number,
    goalMatchScore: number,
    chainImpact: number
  ): number => {
    const maxRepetitions = 10;
    const score = 
      (userPriority * 0.4) + 
      (Math.min(repetitionCount / maxRepetitions, 1) * 100 * 0.3) + 
      (goalMatchScore * 0.2) + 
      (Math.min(chainImpact * 20, 100) * 0.1);
    
    return Math.round(Math.min(100, Math.max(0, score)));
  }, []);

  return {
    trackEvent,
    calculateImportance,
  };
}

export default useBehaviorTracker;
