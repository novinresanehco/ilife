/**
 * Contextual Questions Hook
 * Generates and manages context-aware questions based on user behavior
 */

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useBehaviorTracker } from './useBehaviorTracker';
import { useLocation } from 'react-router-dom';

export interface ContextualQuestion {
  id: string;
  user_id: string;
  question_text: string;
  question_type: 'likert' | 'yesno' | 'scale' | 'radio' | 'descriptive';
  options: string[] | null;
  category: string | null;
  context_page: string | null;
  council_member: string | null;
  answer: string | null;
  answered_at: string | null;
  skipped: boolean;
  created_at: string;
}

// Questions bank for different contexts
const contextualQuestionsBank: Record<string, { text: string; type: ContextualQuestion['question_type']; options?: string[]; category: string; councilMember: string }[]> = {
  '/tasks': [
    { text: 'امروز چقدر احساس تمرکز می‌کنید؟', type: 'scale', category: 'energy', councilMember: 'health' },
    { text: 'آیا ترتیب اولویت وظایف شما درست است؟', type: 'yesno', category: 'productivity', councilMember: 'strategist' },
    { text: 'بزرگ‌ترین مانع پیشرفت امروز شما چیست؟', type: 'radio', options: ['کمبود زمان', 'کمبود انرژی', 'حواس‌پرتی', 'عدم وضوح', 'موانع خارجی'], category: 'obstacles', councilMember: 'coach' },
  ],
  '/goals': [
    { text: 'آیا اهداف شما با ارزش‌های اصلی زندگی‌تان همراستا هستند؟', type: 'likert', category: 'alignment', councilMember: 'psych' },
    { text: 'چقدر به رسیدن به اهداف خود اطمینان دارید؟', type: 'scale', category: 'confidence', councilMember: 'coach' },
    { text: 'کدام نوع هدف برای شما چالش‌برانگیزتر است؟', type: 'radio', options: ['شغلی', 'سلامت', 'مالی', 'روابط', 'یادگیری'], category: 'challenges', councilMember: 'strategist' },
  ],
  '/kanban': [
    { text: 'آیا تعداد کارهای در حال انجام مناسب است؟', type: 'yesno', category: 'workload', councilMember: 'strategist' },
    { text: 'چه چیزی باعث می‌شود کارها در یک ستون گیر کنند؟', type: 'descriptive', category: 'bottleneck', councilMember: 'coach' },
  ],
  '/ideas': [
    { text: 'از ۱ تا ۱۰، چقدر به خلاقیت خود اطمینان دارید؟', type: 'scale', category: 'creativity', councilMember: 'innovator' },
    { text: 'بهترین زمان برای ایده‌پردازی شما کی است؟', type: 'radio', options: ['صبح زود', 'ظهر', 'عصر', 'شب', 'متفاوت است'], category: 'patterns', councilMember: 'psych' },
  ],
  '/profile': [
    { text: 'تجربه‌های جدید چقدر شما را هیجان‌زده می‌کند؟', type: 'likert', category: 'bigfive_openness', councilMember: 'psych' },
    { text: 'چقدر به برنامه‌ریزی و نظم پایبند هستید؟', type: 'likert', category: 'bigfive_conscientiousness', councilMember: 'psych' },
    { text: 'در جمع‌های اجتماعی، بیشتر انرژی می‌گیرید یا از دست می‌دهید؟', type: 'radio', options: ['انرژی می‌گیرم', 'انرژی از دست می‌دهم', 'بستگی دارد'], category: 'bigfive_extraversion', councilMember: 'psych' },
  ],
  '/': [
    { text: 'امروز چطور احساس می‌کنید؟', type: 'scale', category: 'mood', councilMember: 'health' },
    { text: 'بزرگ‌ترین اولویت امروز شما چیست؟', type: 'descriptive', category: 'focus', councilMember: 'strategist' },
  ],
};

// Question frequency limits (in hours)
const QUESTION_COOLDOWN_HOURS = 2;
const MAX_QUESTIONS_PER_DAY = 5;

export function useContextualQuestions() {
  const { user, perception } = useAuthContext();
  const { trackEvent } = useBehaviorTracker();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [currentQuestion, setCurrentQuestion] = useState<ContextualQuestion | null>(null);

  // Fetch pending questions
  const { data: questions, isLoading } = useQuery({
    queryKey: ['contextual_questions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contextual_questions')
        .select('*')
        .eq('user_id', user.id)
        .is('answered_at', null)
        .eq('skipped', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContextualQuestion[];
    },
    enabled: !!user,
  });

  // Check if we can ask a question
  const canAskQuestion = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    // Check cooldown
    const cooldownTime = new Date(Date.now() - QUESTION_COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from('contextual_questions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', cooldownTime);

    if (recent && recent.length > 0) return false;

    // Check daily limit
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: todayQuestions } = await supabase
      .from('contextual_questions')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString());

    if (todayQuestions && todayQuestions.length >= MAX_QUESTIONS_PER_DAY) return false;

    return true;
  }, [user]);

  // Generate contextual question based on current page and perception
  const generateQuestion = useCallback(async () => {
    if (!user) return null;
    
    const canAsk = await canAskQuestion();
    if (!canAsk) return null;

    const pageQuestions = contextualQuestionsBank[location.pathname] || contextualQuestionsBank['/'];
    if (!pageQuestions || pageQuestions.length === 0) return null;

    // Select question based on perception (prioritize weak areas)
    let selectedQuestion = pageQuestions[Math.floor(Math.random() * pageQuestions.length)];

    // If perception shows low areas, prioritize related questions
    if (perception) {
      if (perception.motivation < 50 && pageQuestions.some(q => q.category === 'obstacles')) {
        selectedQuestion = pageQuestions.find(q => q.category === 'obstacles') || selectedQuestion;
      }
      if (perception.overwhelm > 60 && pageQuestions.some(q => q.category === 'workload')) {
        selectedQuestion = pageQuestions.find(q => q.category === 'workload') || selectedQuestion;
      }
    }

    // Insert question
    const { data, error } = await supabase
      .from('contextual_questions')
      .insert([{
        user_id: user.id,
        question_text: selectedQuestion.text,
        question_type: selectedQuestion.type,
        options: selectedQuestion.options || null,
        category: selectedQuestion.category,
        context_page: location.pathname,
        council_member: selectedQuestion.councilMember,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return null;
    }

    return data as ContextualQuestion;
  }, [user, perception, location.pathname, canAskQuestion]);

  // Answer question
  const answerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      const { data, error } = await supabase
        .from('contextual_questions')
        .update({
          answer,
          answered_at: new Date().toISOString(),
        })
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      return data as ContextualQuestion;
    },
    onSuccess: (question) => {
      queryClient.invalidateQueries({ queryKey: ['contextual_questions'] });
      trackEvent('question_answered', {
        questionId: question.id,
        category: question.category,
        councilMember: question.council_member,
      });
      setCurrentQuestion(null);
    },
  });

  // Skip question
  const skipMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('contextual_questions')
        .update({ skipped: true })
        .eq('id', questionId);

      if (error) throw error;
      return questionId;
    },
    onSuccess: (questionId) => {
      queryClient.invalidateQueries({ queryKey: ['contextual_questions'] });
      trackEvent('question_skipped', { questionId });
      setCurrentQuestion(null);
    },
  });

  // Auto-generate question on page change (with probability)
  useEffect(() => {
    const shouldAsk = Math.random() < 0.15; // 15% chance on page load
    
    if (shouldAsk && user && !currentQuestion) {
      const timeoutId = setTimeout(async () => {
        const question = await generateQuestion();
        if (question) {
          setCurrentQuestion(question);
        }
      }, 10000); // Wait 10 seconds before showing

      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, user, generateQuestion, currentQuestion]);

  return {
    questions: questions ?? [],
    currentQuestion,
    isLoading,
    generateQuestion,
    answerQuestion: answerMutation.mutate,
    skipQuestion: skipMutation.mutate,
    isAnswering: answerMutation.isPending,
    setCurrentQuestion,
  };
}

export default useContextualQuestions;
