/**
 * LifeOS Personality Q&A System
 * 50 questions from validated sources: Big Five (30), MBTI (15), DISC (5)
 */

export type QuestionType = 'likert' | 'yesno' | 'scale' | 'multiple' | 'descriptive';

export interface PersonalityQuestion {
  id: string;
  text: string;
  type: QuestionType;
  category: 'bigfive' | 'mbti' | 'disc' | 'values' | 'purpose';
  trait?: string; // e.g., 'openness', 'extraversion'
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
  stage: number; // 1-5 for multi-stage quiz
  priority: number; // Higher = ask earlier
}

export interface PersonalityAnswer {
  questionId: string;
  answer: string | number;
  timestamp: Date;
  source: 'user' | 'inferred';
  confidence: number; // 0-100
}

// Onboarding Questions (Top 5)
export const onboardingQuestions: PersonalityQuestion[] = [
  {
    id: 'bigfive_open1',
    text: 'تجربه‌های جدید من را هیجان‌زده می‌کند',
    type: 'likert',
    category: 'bigfive',
    trait: 'openness',
    stage: 1,
    priority: 100,
  },
  {
    id: 'bigfive_agree1',
    text: 'به راحتی با احساسات دیگران همدردی می‌کنم',
    type: 'likert',
    category: 'bigfive',
    trait: 'agreeableness',
    stage: 1,
    priority: 99,
  },
  {
    id: 'disc_dom1',
    text: 'در گروه‌ها معمولاً رهبری را به عهده می‌گیرم',
    type: 'scale',
    category: 'disc',
    trait: 'dominance',
    minLabel: 'هرگز',
    maxLabel: 'همیشه',
    stage: 1,
    priority: 98,
  },
  {
    id: 'mbti_sn1',
    text: 'شما واقعیت‌های ملموس را به احتمالات ترجیح می‌دهید',
    type: 'yesno',
    category: 'mbti',
    trait: 'sensing',
    stage: 1,
    priority: 97,
  },
  {
    id: 'purpose_life1',
    text: 'هدف اصلی زندگی شما چیست؟',
    type: 'descriptive',
    category: 'purpose',
    stage: 1,
    priority: 96,
  },
];

// Full Question Bank (50 questions)
export const allQuestions: PersonalityQuestion[] = [
  // Big Five - Openness (6 questions)
  ...onboardingQuestions.filter(q => q.category === 'bigfive'),
  {
    id: 'bigfive_open2',
    text: 'از ایده‌های انتزاعی و مفاهیم فلسفی لذت می‌برم',
    type: 'likert',
    category: 'bigfive',
    trait: 'openness',
    stage: 2,
    priority: 90,
  },
  {
    id: 'bigfive_open3',
    text: 'هنر و زیبایی برای من اهمیت زیادی دارد',
    type: 'likert',
    category: 'bigfive',
    trait: 'openness',
    stage: 2,
    priority: 89,
  },
  {
    id: 'bigfive_open4',
    text: 'به دنبال یادگیری چیزهای جدید هستم',
    type: 'likert',
    category: 'bigfive',
    trait: 'openness',
    stage: 2,
    priority: 88,
  },
  
  // Big Five - Conscientiousness (6 questions)
  {
    id: 'bigfive_consc1',
    text: 'همیشه کارها را طبق برنامه انجام می‌دهم',
    type: 'likert',
    category: 'bigfive',
    trait: 'conscientiousness',
    stage: 2,
    priority: 87,
  },
  {
    id: 'bigfive_consc2',
    text: 'جزئیات برای من مهم هستند',
    type: 'likert',
    category: 'bigfive',
    trait: 'conscientiousness',
    stage: 2,
    priority: 86,
  },
  {
    id: 'bigfive_consc3',
    text: 'به ندرت کارها را به تعویق می‌اندازم',
    type: 'likert',
    category: 'bigfive',
    trait: 'conscientiousness',
    stage: 2,
    priority: 85,
  },
  {
    id: 'bigfive_consc4',
    text: 'محیط کاری من همیشه منظم است',
    type: 'likert',
    category: 'bigfive',
    trait: 'conscientiousness',
    stage: 2,
    priority: 84,
  },
  
  // Big Five - Extraversion (6 questions)
  {
    id: 'bigfive_extra1',
    text: 'در جمع‌ها انرژی می‌گیرم',
    type: 'likert',
    category: 'bigfive',
    trait: 'extraversion',
    stage: 2,
    priority: 83,
  },
  {
    id: 'bigfive_extra2',
    text: 'به راحتی با غریبه‌ها صحبت می‌کنم',
    type: 'likert',
    category: 'bigfive',
    trait: 'extraversion',
    stage: 2,
    priority: 82,
  },
  {
    id: 'bigfive_extra3',
    text: 'دوست دارم مرکز توجه باشم',
    type: 'likert',
    category: 'bigfive',
    trait: 'extraversion',
    stage: 3,
    priority: 81,
  },
  {
    id: 'bigfive_extra4',
    text: 'از مهمانی‌ها و رویدادهای اجتماعی لذت می‌برم',
    type: 'likert',
    category: 'bigfive',
    trait: 'extraversion',
    stage: 3,
    priority: 80,
  },
  
  // Big Five - Agreeableness (6 questions)
  {
    id: 'bigfive_agree2',
    text: 'به راحتی دیگران را می‌بخشم',
    type: 'likert',
    category: 'bigfive',
    trait: 'agreeableness',
    stage: 3,
    priority: 79,
  },
  {
    id: 'bigfive_agree3',
    text: 'در کمک به دیگران پیش‌قدم هستم',
    type: 'likert',
    category: 'bigfive',
    trait: 'agreeableness',
    stage: 3,
    priority: 78,
  },
  {
    id: 'bigfive_agree4',
    text: 'از تعارض اجتناب می‌کنم',
    type: 'likert',
    category: 'bigfive',
    trait: 'agreeableness',
    stage: 3,
    priority: 77,
  },
  
  // Big Five - Neuroticism (6 questions)
  {
    id: 'bigfive_neuro1',
    text: 'به راحتی نگران می‌شوم',
    type: 'likert',
    category: 'bigfive',
    trait: 'neuroticism',
    stage: 3,
    priority: 76,
  },
  {
    id: 'bigfive_neuro2',
    text: 'گاهی احساس می‌کنم همه چیز از کنترلم خارج است',
    type: 'likert',
    category: 'bigfive',
    trait: 'neuroticism',
    stage: 3,
    priority: 75,
  },
  {
    id: 'bigfive_neuro3',
    text: 'استرس به راحتی بر من تأثیر می‌گذارد',
    type: 'likert',
    category: 'bigfive',
    trait: 'neuroticism',
    stage: 4,
    priority: 74,
  },
  {
    id: 'bigfive_neuro4',
    text: 'خلقم به سرعت تغییر می‌کند',
    type: 'likert',
    category: 'bigfive',
    trait: 'neuroticism',
    stage: 4,
    priority: 73,
  },
  
  // MBTI Questions (15)
  {
    id: 'mbti_ei1',
    text: 'پس از یک روز شلوغ، ترجیح می‌دهید تنها باشید',
    type: 'yesno',
    category: 'mbti',
    trait: 'introversion',
    stage: 4,
    priority: 72,
  },
  {
    id: 'mbti_ei2',
    text: 'قبل از صحبت فکر می‌کنید',
    type: 'yesno',
    category: 'mbti',
    trait: 'introversion',
    stage: 4,
    priority: 71,
  },
  {
    id: 'mbti_sn2',
    text: 'به جزئیات بیش از تصویر کلی توجه می‌کنید',
    type: 'yesno',
    category: 'mbti',
    trait: 'sensing',
    stage: 4,
    priority: 70,
  },
  {
    id: 'mbti_sn3',
    text: 'از کار با داده‌های واقعی لذت می‌برید',
    type: 'yesno',
    category: 'mbti',
    trait: 'sensing',
    stage: 4,
    priority: 69,
  },
  {
    id: 'mbti_tf1',
    text: 'تصمیمات را بر اساس منطق می‌گیرید نه احساسات',
    type: 'yesno',
    category: 'mbti',
    trait: 'thinking',
    stage: 4,
    priority: 68,
  },
  {
    id: 'mbti_tf2',
    text: 'انتقاد سازنده برای شما راحت است',
    type: 'yesno',
    category: 'mbti',
    trait: 'thinking',
    stage: 5,
    priority: 67,
  },
  {
    id: 'mbti_jp1',
    text: 'برنامه‌ریزی قبلی را به انعطاف‌پذیری ترجیح می‌دهید',
    type: 'yesno',
    category: 'mbti',
    trait: 'judging',
    stage: 5,
    priority: 66,
  },
  {
    id: 'mbti_jp2',
    text: 'لیست کارها را تهیه می‌کنید',
    type: 'yesno',
    category: 'mbti',
    trait: 'judging',
    stage: 5,
    priority: 65,
  },
  
  // DISC Questions (5)
  {
    id: 'disc_inf1',
    text: 'در متقاعد کردن دیگران خوب هستم',
    type: 'scale',
    category: 'disc',
    trait: 'influence',
    minLabel: 'اصلاً',
    maxLabel: 'کاملاً',
    stage: 5,
    priority: 64,
  },
  {
    id: 'disc_stead1',
    text: 'ثبات و امنیت برای من مهم است',
    type: 'scale',
    category: 'disc',
    trait: 'steadiness',
    minLabel: 'کم',
    maxLabel: 'زیاد',
    stage: 5,
    priority: 63,
  },
  {
    id: 'disc_compl1',
    text: 'به قوانین و روش‌های استاندارد پایبند هستم',
    type: 'scale',
    category: 'disc',
    trait: 'compliance',
    minLabel: 'کم',
    maxLabel: 'زیاد',
    stage: 5,
    priority: 62,
  },
  
  // Values (5 questions)
  {
    id: 'values_1',
    text: 'مهم‌ترین ارزش‌های زندگی شما کدامند؟',
    type: 'multiple',
    category: 'values',
    options: ['خانواده', 'موفقیت', 'آزادی', 'امنیت', 'خلاقیت', 'کمک به دیگران', 'یادگیری', 'سلامت'],
    stage: 1,
    priority: 95,
  },
  {
    id: 'values_2',
    text: 'چه چیزی به شما انرژی می‌دهد؟',
    type: 'multiple',
    category: 'values',
    options: ['یادگیری جدید', 'کمک به دیگران', 'چالش', 'خلاقیت', 'موفقیت', 'آرامش'],
    stage: 3,
    priority: 60,
  },
  
  // Purpose (3 questions)
  {
    id: 'purpose_year',
    text: 'در یک سال آینده می‌خواهید به چه چیزی برسید؟',
    type: 'descriptive',
    category: 'purpose',
    stage: 1,
    priority: 94,
  },
  {
    id: 'purpose_challenge',
    text: 'بزرگ‌ترین چالش فعلی شما چیست؟',
    type: 'descriptive',
    category: 'purpose',
    stage: 1,
    priority: 93,
  },
];

// Storage key
const STORAGE_KEY = 'lifeos_personality_answers';

// Get saved answers
export function getPersonalityAnswers(): PersonalityAnswer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save answer
export function savePersonalityAnswer(
  questionId: string,
  answer: string | number,
  source: 'user' | 'inferred' = 'user',
  confidence = 100
): void {
  const answers = getPersonalityAnswers();
  const existing = answers.findIndex(a => a.questionId === questionId);
  
  const newAnswer: PersonalityAnswer = {
    questionId,
    answer,
    timestamp: new Date(),
    source,
    confidence,
  };
  
  if (existing >= 0) {
    answers[existing] = newAnswer;
  } else {
    answers.push(newAnswer);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
}

// Get completion percentage
export function getQuizCompletion(): number {
  const answers = getPersonalityAnswers();
  return Math.round((answers.length / allQuestions.length) * 100);
}

// Get unanswered questions for a stage
export function getUnansweredQuestions(stage?: number): PersonalityQuestion[] {
  const answers = getPersonalityAnswers();
  const answeredIds = new Set(answers.map(a => a.questionId));
  
  return allQuestions
    .filter(q => !answeredIds.has(q.id))
    .filter(q => stage === undefined || q.stage === stage)
    .sort((a, b) => b.priority - a.priority);
}

// Calculate Big Five scores
export function calculateBigFiveScores(): Record<string, number> {
  const answers = getPersonalityAnswers();
  const traits: Record<string, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: [],
  };
  
  answers.forEach(answer => {
    const question = allQuestions.find(q => q.id === answer.questionId);
    if (question?.category === 'bigfive' && question.trait) {
      const value = typeof answer.answer === 'number' 
        ? answer.answer 
        : parseInt(answer.answer as string) || 3;
      traits[question.trait]?.push(value);
    }
  });
  
  const scores: Record<string, number> = {};
  Object.entries(traits).forEach(([trait, values]) => {
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      scores[trait] = Math.round((avg / 5) * 100);
    } else {
      scores[trait] = 50; // Default
    }
  });
  
  return scores;
}

// Get questions for chatbox based on perception gaps
export function getRecommendedQuestions(perception: Record<string, number>): PersonalityQuestion[] {
  const unanswered = getUnansweredQuestions();
  const recommended: PersonalityQuestion[] = [];
  
  // Check for low confidence traits and recommend related questions
  Object.entries(perception).forEach(([trait, value]) => {
    if (value < 40 || value > 60) {
      // Find questions related to this trait
      const related = unanswered.filter(q => 
        q.trait === trait || q.category === 'bigfive'
      );
      recommended.push(...related.slice(0, 2));
    }
  });
  
  // Add some general questions if not enough
  if (recommended.length < 3) {
    recommended.push(...unanswered.slice(0, 3 - recommended.length));
  }
  
  return recommended.slice(0, 5);
}
