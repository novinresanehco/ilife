/**
 * LifeOS Deep Behavioral Monitoring System
 * Tracks user behavior, patterns, delays, and generates insights
 */

// Types for behavior tracking
export interface UserEvent {
  id: string;
  type: EventType;
  data: Record<string, unknown>;
  timestamp: Date;
  importance: number;
  chainImpact: number; // Number of linked goals affected
}

export type EventType = 
  | 'task_created' 
  | 'task_deferred' 
  | 'task_completed' 
  | 'task_deleted'
  | 'goal_created'
  | 'goal_progress'
  | 'goal_abandoned'
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'message_sent'
  | 'question_answered'
  | 'question_skipped'
  | 'energy_low'
  | 'productivity_drop'
  | 'pattern_detected';

export interface PerceptionModel {
  // Big Five Traits (1-100)
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  // Behavioral patterns
  patterns: {
    procrastination: number; // 0-100
    perfectionism: number;
    overwhelm: number;
    motivation: number;
    consistency: number;
    energyLevel: number;
  };
  // Detected issues
  hypotheses: BehavioralHypothesis[];
  // Last updated
  lastUpdated: Date;
}

export interface BehavioralHypothesis {
  id: string;
  pattern: string;
  confidence: number; // 0-100
  evidence: string[];
  suggestedAction: string;
  councilMember: string;
  timestamp: Date;
}

export interface NudgeMessage {
  id: string;
  type: 'pursuit' | 'supervision' | 'guidance';
  content: string;
  importance: number;
  councilMember: string;
  action?: {
    label: string;
    action: string;
  };
  autoOpen: boolean;
  timestamp: Date;
}

// Storage keys
const STORAGE_KEYS = {
  events: 'lifeos_events',
  perception: 'lifeos_perception',
  nudges: 'lifeos_nudges',
  lastNudge: 'lifeos_last_nudge',
  questionFrequency: 'lifeos_question_freq',
} as const;

// Default perception model
const defaultPerception: PerceptionModel = {
  bigFive: {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  },
  patterns: {
    procrastination: 30,
    perfectionism: 40,
    overwhelm: 25,
    motivation: 60,
    consistency: 50,
    energyLevel: 70,
  },
  hypotheses: [],
  lastUpdated: new Date(),
};

// Get stored events
export function getStoredEvents(): UserEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.events);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save events
export function saveEvents(events: UserEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events.slice(-500))); // Keep last 500
}

// Track a new event
export function trackEvent(
  type: EventType, 
  data: Record<string, unknown> = {}, 
  importance = 50,
  chainImpact = 0
): UserEvent {
  const event: UserEvent = {
    id: Date.now().toString(),
    type,
    data,
    timestamp: new Date(),
    importance,
    chainImpact,
  };
  
  const events = getStoredEvents();
  events.push(event);
  saveEvents(events);
  
  // Analyze after tracking
  analyzeRecentBehavior();
  
  return event;
}

// Get perception model
export function getPerception(): PerceptionModel {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.perception);
    return stored ? JSON.parse(stored) : defaultPerception;
  } catch {
    return defaultPerception;
  }
}

// Update perception model
export function updatePerception(updates: Partial<PerceptionModel>): void {
  const current = getPerception();
  const updated = { ...current, ...updates, lastUpdated: new Date() };
  localStorage.setItem(STORAGE_KEYS.perception, JSON.stringify(updated));
}

// Analyze recent behavior for patterns
export function analyzeRecentBehavior(): BehavioralHypothesis[] {
  const events = getStoredEvents();
  const perception = getPerception();
  const hypotheses: BehavioralHypothesis[] = [];
  
  // Get last 24 hours events
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(e => new Date(e.timestamp) > oneDayAgo);
  
  // Pattern: Task Deferral (Procrastination)
  const deferrals = recentEvents.filter(e => e.type === 'task_deferred');
  if (deferrals.length >= 3) {
    const confidence = Math.min(95, 50 + deferrals.length * 10);
    hypotheses.push({
      id: `proc_${Date.now()}`,
      pattern: 'procrastination',
      confidence,
      evidence: deferrals.map(d => `وظیفه "${d.data.title}" به تعویق افتاد`),
      suggestedAction: 'شروع با یک کار کوچک ۲ دقیقه‌ای می‌تواند کمک کند',
      councilMember: 'psych',
      timestamp: new Date(),
    });
    
    // Update perception
    updatePerception({
      patterns: {
        ...perception.patterns,
        procrastination: Math.min(100, perception.patterns.procrastination + 5),
      }
    });
  }
  
  // Pattern: Overwhelm (too many tasks created)
  const created = recentEvents.filter(e => e.type === 'task_created');
  const completed = recentEvents.filter(e => e.type === 'task_completed');
  if (created.length > 5 && completed.length < 2) {
    hypotheses.push({
      id: `over_${Date.now()}`,
      pattern: 'overwhelm',
      confidence: 70,
      evidence: [
        `${created.length} وظیفه جدید ایجاد شد`,
        `فقط ${completed.length} وظیفه تکمیل شد`
      ],
      suggestedAction: 'پیشنهاد می‌کنم ۳ وظیفه مهم امروز را انتخاب کنید',
      councilMember: 'strategist',
      timestamp: new Date(),
    });
    
    updatePerception({
      patterns: {
        ...perception.patterns,
        overwhelm: Math.min(100, perception.patterns.overwhelm + 10),
      }
    });
  }
  
  // Pattern: Low Energy (long gaps between actions)
  if (recentEvents.length > 0) {
    let longGaps = 0;
    for (let i = 1; i < recentEvents.length; i++) {
      const gap = new Date(recentEvents[i].timestamp).getTime() - 
                  new Date(recentEvents[i-1].timestamp).getTime();
      if (gap > 3 * 60 * 60 * 1000) longGaps++; // 3 hour gap
    }
    if (longGaps >= 2) {
      hypotheses.push({
        id: `energy_${Date.now()}`,
        pattern: 'low_energy',
        confidence: 60,
        evidence: [`${longGaps} بازه طولانی بدون فعالیت شناسایی شد`],
        suggestedAction: 'استراحت کوتاه و تمرین کششی می‌تواند انرژی را بازگرداند',
        councilMember: 'health',
        timestamp: new Date(),
      });
    }
  }
  
  // Pattern: Perfectionism (editing same task multiple times)
  const taskEdits: Record<string, number> = {};
  recentEvents.forEach(e => {
    if (e.data.taskId && (e.type === 'task_created' || e.type === 'task_deferred')) {
      const id = e.data.taskId as string;
      taskEdits[id] = (taskEdits[id] || 0) + 1;
    }
  });
  const perfectionismTasks = Object.values(taskEdits).filter(c => c >= 3);
  if (perfectionismTasks.length > 0) {
    hypotheses.push({
      id: `perf_${Date.now()}`,
      pattern: 'perfectionism',
      confidence: 65,
      evidence: [`${perfectionismTasks.length} وظیفه چندین بار ویرایش شد`],
      suggestedAction: '"انجام شده بهتر از کامل است" - اجازه دهید کار پیش برود',
      councilMember: 'coach',
      timestamp: new Date(),
    });
  }
  
  // Save hypotheses
  if (hypotheses.length > 0) {
    const perception = getPerception();
    updatePerception({
      hypotheses: [...perception.hypotheses.slice(-10), ...hypotheses]
    });
  }
  
  return hypotheses;
}

// Generate proactive nudges based on behavior
export function generateNudges(): NudgeMessage[] {
  const perception = getPerception();
  const events = getStoredEvents();
  const nudges: NudgeMessage[] = [];
  
  // Check last nudge time to avoid spam
  const lastNudge = localStorage.getItem(STORAGE_KEYS.lastNudge);
  const lastNudgeTime = lastNudge ? new Date(lastNudge) : new Date(0);
  const hoursSinceNudge = (Date.now() - lastNudgeTime.getTime()) / (1000 * 60 * 60);
  
  // Only generate nudges if enough time has passed
  if (hoursSinceNudge < 1) return [];
  
  // PURSUIT: Follow up on delayed important tasks
  const highImportanceEvents = events.filter(
    e => e.importance >= 80 && 
    e.type === 'task_deferred' &&
    new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  
  if (highImportanceEvents.length > 0) {
    const task = highImportanceEvents[0];
    nudges.push({
      id: `pursuit_${Date.now()}`,
      type: 'pursuit',
      content: `⚡ پیگیری: وظیفه "${task.data.title}" با اهمیت بالا هنوز تکمیل نشده. این کار بر ${task.chainImpact} هدف تأثیر دارد.`,
      importance: 85,
      councilMember: 'strategist',
      action: { label: 'انجام الان', action: 'focus_task' },
      autoOpen: true,
      timestamp: new Date(),
    });
  }
  
  // SUPERVISION: Monitor patterns
  if (perception.patterns.procrastination > 60) {
    nudges.push({
      id: `super_proc_${Date.now()}`,
      type: 'supervision',
      content: `👁️ نظارت: الگوی تعویق در کارها شناسایی شد. آیا موانعی وجود دارد که بتوانم کمک کنم؟`,
      importance: 70,
      councilMember: 'psych',
      autoOpen: false,
      timestamp: new Date(),
    });
  }
  
  if (perception.patterns.overwhelm > 70) {
    nudges.push({
      id: `super_over_${Date.now()}`,
      type: 'supervision',
      content: `👁️ نظارت: به نظر می‌رسد کارهای زیادی در دست دارید. می‌خواهید کمک کنم اولویت‌بندی کنید؟`,
      importance: 75,
      councilMember: 'strategist',
      action: { label: 'اولویت‌بندی', action: 'prioritize' },
      autoOpen: true,
      timestamp: new Date(),
    });
  }
  
  // GUIDANCE: Psychological nudges based on traits
  if (perception.bigFive.conscientiousness < 40) {
    nudges.push({
      id: `guide_consc_${Date.now()}`,
      type: 'guidance',
      content: `🌟 راهنمایی: برای تقویت نظم، امروز فقط روی یک کار کوچک تمرکز کنید. موفقیت‌های کوچک عادت می‌سازند.`,
      importance: 50,
      councilMember: 'coach',
      autoOpen: false,
      timestamp: new Date(),
    });
  }
  
  if (perception.bigFive.neuroticism > 70) {
    nudges.push({
      id: `guide_neuro_${Date.now()}`,
      type: 'guidance',
      content: `🌟 راهنمایی: اگر احساس استرس دارید، ۳ نفس عمیق بکشید. همه چیز قابل مدیریت است.`,
      importance: 60,
      councilMember: 'mindfulness',
      autoOpen: false,
      timestamp: new Date(),
    });
  }
  
  // Update last nudge time
  if (nudges.length > 0) {
    localStorage.setItem(STORAGE_KEYS.lastNudge, new Date().toISOString());
  }
  
  return nudges;
}

// Calculate importance score
export function calculateImportance(
  userPriority: number,
  repetitionCount: number,
  goalMatchScore: number,
  chainImpact: number
): number {
  // Formula from documentation:
  // importance = (user_priority * 0.4) + (repetition_count / max * 0.3) + 
  //              (goal_match * 0.2) + (chain_impact * 0.1)
  const maxRepetitions = 10;
  const score = 
    (userPriority * 0.4) + 
    (Math.min(repetitionCount / maxRepetitions, 1) * 100 * 0.3) + 
    (goalMatchScore * 0.2) + 
    (Math.min(chainImpact * 20, 100) * 0.1);
  
  return Math.round(Math.min(100, Math.max(0, score)));
}

// Check if question frequency is ok
export function canAskQuestion(type: 'long' | 'descriptive'): boolean {
  const freq = JSON.parse(localStorage.getItem(STORAGE_KEYS.questionFrequency) || '{}');
  const now = Date.now();
  
  if (type === 'long') {
    // Long questions: no more than every 3 hours
    const lastLong = freq.lastLong || 0;
    return now - lastLong > 3 * 60 * 60 * 1000;
  } else {
    // Descriptive: no more than once per day
    const lastDesc = freq.lastDescriptive || 0;
    return now - lastDesc > 24 * 60 * 60 * 1000;
  }
}

// Mark question as asked
export function markQuestionAsked(type: 'long' | 'descriptive'): void {
  const freq = JSON.parse(localStorage.getItem(STORAGE_KEYS.questionFrequency) || '{}');
  if (type === 'long') {
    freq.lastLong = Date.now();
  } else {
    freq.lastDescriptive = Date.now();
  }
  localStorage.setItem(STORAGE_KEYS.questionFrequency, JSON.stringify(freq));
}
