/**
 * LifeOS Council of Geniuses System
 * 10 expert members (5 fixed + 5 dynamic) for consultation
 */

import { PerceptionModel, BehavioralHypothesis } from './behaviorMonitor';

export interface CouncilMember {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  specializations: string[];
  avatar: string;
  isFixed: boolean;
  promptTemplate: string;
  personalityFocus: string[];
}

// 5 Fixed Members
export const fixedCouncilMembers: CouncilMember[] = [
  {
    id: 'psychologist',
    name: 'دکتر روانشناس',
    role: 'روانشناس بالینی',
    expertise: ['رفتار', 'احساسات', 'انگیزه', 'اضطراب', 'افسردگی'],
    specializations: ['Big Five', 'CBT', 'رفتاردرمانی'],
    avatar: '🧠',
    isFixed: true,
    promptTemplate: 'به عنوان روانشناس با ۲۰ سال تجربه، تحلیل کن: {context}. ویژگی‌های شخصیتی: {traits}',
    personalityFocus: ['neuroticism', 'openness'],
  },
  {
    id: 'strategist',
    name: 'استراتژیست',
    role: 'مشاور استراتژی و برنامه‌ریزی',
    expertise: ['برنامه‌ریزی', 'اهداف', 'مسیر', 'اولویت‌بندی'],
    specializations: ['OKR', 'تفکر سیستمی', 'تصمیم‌گیری'],
    avatar: '🎯',
    isFixed: true,
    promptTemplate: 'به عنوان استراتژیست، مسیر بهینه را برای {context} بر اساس اهداف {goals} پیشنهاد کن',
    personalityFocus: ['conscientiousness'],
  },
  {
    id: 'career',
    name: 'مشاور شغلی',
    role: 'متخصص توسعه حرفه‌ای',
    expertise: ['کار', 'مسیر شغلی', 'مهارت', 'شبکه‌سازی'],
    specializations: ['رزومه', 'مصاحبه', 'ارتقا'],
    avatar: '💼',
    isFixed: true,
    promptTemplate: 'به عنوان مشاور شغلی، راهنمایی کن برای {context} با توجه به تجربیات {experience}',
    personalityFocus: ['extraversion', 'conscientiousness'],
  },
  {
    id: 'health',
    name: 'متخصص سلامت',
    role: 'مربی سلامت جسم و ذهن',
    expertise: ['سلامت', 'انرژی', 'تعادل', 'خواب', 'تغذیه'],
    specializations: ['ورزش', 'مدیتیشن', 'استرس'],
    avatar: '💪',
    isFixed: true,
    promptTemplate: 'به عنوان مربی سلامت، توصیه کن برای {context} با سطح انرژی {energy}',
    personalityFocus: ['neuroticism', 'conscientiousness'],
  },
  {
    id: 'innovator',
    name: 'نوآور',
    role: 'متخصص خلاقیت و نوآوری',
    expertise: ['ایده', 'خلاقیت', 'نوآوری', 'حل مسئله'],
    specializations: ['طوفان فکری', 'تفکر جانبی', 'پروتوتایپ'],
    avatar: '💡',
    isFixed: true,
    promptTemplate: 'به عنوان متخصص نوآوری، ایده‌های خلاقانه برای {context} پیشنهاد کن',
    personalityFocus: ['openness'],
  },
];

// 5 Dynamic Members (adapt based on user profile)
export const dynamicCouncilMembers: CouncilMember[] = [
  {
    id: 'coach',
    name: 'مربی عملکرد',
    role: 'مربی بهره‌وری',
    expertise: ['بهره‌وری', 'عادت', 'تمرکز', 'مدیریت زمان'],
    specializations: ['پومودورو', 'GTD', 'Deep Work'],
    avatar: '⚡',
    isFixed: false,
    promptTemplate: 'به عنوان مربی عملکرد، کمک کن برای {context} با الگوی بهره‌وری {productivity}',
    personalityFocus: ['conscientiousness'],
  },
  {
    id: 'financial',
    name: 'مشاور مالی',
    role: 'برنامه‌ریز مالی',
    expertise: ['مالی', 'سرمایه', 'بودجه', 'پس‌انداز'],
    specializations: ['سرمایه‌گذاری', 'بدهی', 'بازنشستگی'],
    avatar: '💰',
    isFixed: false,
    promptTemplate: 'به عنوان مشاور مالی، راهنمایی کن برای {context} با وضعیت مالی {financial}',
    personalityFocus: ['conscientiousness'],
  },
  {
    id: 'relationship',
    name: 'متخصص روابط',
    role: 'مشاور ارتباطات',
    expertise: ['روابط', 'ارتباط', 'اجتماعی', 'خانواده'],
    specializations: ['گوش دادن فعال', 'حل تعارض', 'همدلی'],
    avatar: '❤️',
    isFixed: false,
    promptTemplate: 'به عنوان متخصص روابط، کمک کن برای {context} با سبک ارتباطی {style}',
    personalityFocus: ['agreeableness', 'extraversion'],
  },
  {
    id: 'learning',
    name: 'مربی یادگیری',
    role: 'متخصص آموزش',
    expertise: ['یادگیری', 'مطالعه', 'مهارت', 'حافظه'],
    specializations: ['یادگیری سریع', 'یادداشت‌برداری', 'تکرار فاصله‌دار'],
    avatar: '📚',
    isFixed: false,
    promptTemplate: 'به عنوان مربی یادگیری، روش بهینه برای {context} با سبک یادگیری {style} پیشنهاد کن',
    personalityFocus: ['openness'],
  },
  {
    id: 'mindfulness',
    name: 'مربی ذهن‌آگاهی',
    role: 'متخصص مدیتیشن و آرامش',
    expertise: ['آرامش', 'ذهن‌آگاهی', 'استرس', 'تمرکز'],
    specializations: ['مدیتیشن', 'تنفس', 'حضور'],
    avatar: '🧘',
    isFixed: false,
    promptTemplate: 'به عنوان مربی ذهن‌آگاهی، تمرین پیشنهاد کن برای {context} با سطح استرس {stress}',
    personalityFocus: ['neuroticism'],
  },
];

// All council members
export const allCouncilMembers = [...fixedCouncilMembers, ...dynamicCouncilMembers];

// Select relevant council members based on context
export function selectCouncilMembers(
  context: string,
  perception: PerceptionModel,
  hypotheses: BehavioralHypothesis[]
): CouncilMember[] {
  // Always include fixed members
  const selected: CouncilMember[] = [...fixedCouncilMembers];
  
  // Select dynamic members based on context and perception
  const keywords = context.toLowerCase();
  
  // Check patterns and select relevant dynamic members
  if (keywords.includes('بهره‌وری') || keywords.includes('تمرکز') || 
      perception.patterns.procrastination > 50) {
    const coach = dynamicCouncilMembers.find(m => m.id === 'coach');
    if (coach) selected.push(coach);
  }
  
  if (keywords.includes('مالی') || keywords.includes('پول') || keywords.includes('سرمایه')) {
    const financial = dynamicCouncilMembers.find(m => m.id === 'financial');
    if (financial) selected.push(financial);
  }
  
  if (keywords.includes('رابطه') || keywords.includes('خانواده') || 
      perception.bigFive.extraversion > 60) {
    const relationship = dynamicCouncilMembers.find(m => m.id === 'relationship');
    if (relationship) selected.push(relationship);
  }
  
  if (keywords.includes('یادگیری') || keywords.includes('مطالعه') ||
      perception.bigFive.openness > 60) {
    const learning = dynamicCouncilMembers.find(m => m.id === 'learning');
    if (learning) selected.push(learning);
  }
  
  if (keywords.includes('استرس') || keywords.includes('اضطراب') ||
      perception.bigFive.neuroticism > 60 || perception.patterns.overwhelm > 50) {
    const mindfulness = dynamicCouncilMembers.find(m => m.id === 'mindfulness');
    if (mindfulness) selected.push(mindfulness);
  }
  
  return selected;
}

// Generate council response
export function generateCouncilResponse(
  member: CouncilMember,
  context: string,
  perception: PerceptionModel
): string {
  // Simulate different response styles based on member
  const responses: Record<string, string[]> = {
    psychologist: [
      `بر اساس الگوی رفتاری شما، به نظر می‌رسد ${context}. پیشنهاد می‌کنم روی دلایل زیربنایی تمرکز کنید.`,
      `تحلیل من نشان می‌دهد که احتمالاً ${context} به دلیل نیازهای عمیق‌تری است. بیایید با هم بررسی کنیم.`,
    ],
    strategist: [
      `از نظر استراتژیک، بهترین مسیر برای ${context} این است که اول اولویت‌بندی کنید.`,
      `برای رسیدن به ${context}، پیشنهاد می‌کنم یک برنامه ۹۰ روزه تنظیم کنید.`,
    ],
    career: [
      `در حوزه حرفه‌ای، ${context} نیاز به توسعه مهارت‌های کلیدی دارد.`,
      `برای پیشرفت در ${context}، شبکه‌سازی و یادگیری مداوم ضروری است.`,
    ],
    health: [
      `سلامت شما در اولویت است. برای ${context}، ابتدا سطح انرژی را بهبود دهید.`,
      `پیشنهاد می‌کنم برای ${context}، روی خواب کافی و تغذیه سالم تمرکز کنید.`,
    ],
    innovator: [
      `برای ${context}، بیایید از زاویه متفاوتی نگاه کنیم. چطور است که...`,
      `ایده خلاقانه: برای ${context}، سعی کنید محدودیت‌ها را چالش بکشید.`,
    ],
    coach: [
      `برای افزایش بهره‌وری در ${context}، تکنیک پومودورو را امتحان کنید.`,
      `کلید موفقیت در ${context}، ایجاد عادت‌های کوچک و پایدار است.`,
    ],
    financial: [
      `از نظر مالی، ${context} نیاز به برنامه‌ریزی دقیق دارد.`,
      `پیشنهاد می‌کنم برای ${context}، ابتدا یک بودجه تنظیم کنید.`,
    ],
    relationship: [
      `در روابط، ${context} نیاز به ارتباط صادقانه و گوش دادن فعال دارد.`,
      `برای بهبود ${context}، همدلی و درک متقابل کلیدی است.`,
    ],
    learning: [
      `برای یادگیری ${context}، روش تکرار فاصله‌دار بسیار مؤثر است.`,
      `پیشنهاد می‌کنم برای ${context}، هر روز ۲۵ دقیقه تمرین کنید.`,
    ],
    mindfulness: [
      `برای مدیریت ${context}، ۵ دقیقه تنفس عمیق انجام دهید.`,
      `ذهن‌آگاهی در ${context} کمک می‌کند. حال حاضر را بپذیرید.`,
    ],
  };
  
  const memberResponses = responses[member.id] || [`نظر من درباره ${context}...`];
  return memberResponses[Math.floor(Math.random() * memberResponses.length)];
}

// Get council consultation
export interface CouncilConsultation {
  question: string;
  responses: {
    member: CouncilMember;
    response: string;
    confidence: number;
  }[];
  consensus: string;
  recommendedAction: string;
}

export function getCouncilConsultation(
  question: string,
  perception: PerceptionModel,
  hypotheses: BehavioralHypothesis[] = []
): CouncilConsultation {
  const members = selectCouncilMembers(question, perception, hypotheses);
  
  const responses = members.slice(0, 5).map(member => ({
    member,
    response: generateCouncilResponse(member, question, perception),
    confidence: 60 + Math.floor(Math.random() * 30),
  }));
  
  // Generate consensus
  const consensus = `بر اساس نظرات شورا، توصیه می‌کنیم ${question} را با یک رویکرد متعادل و گام‌به‌گام دنبال کنید.`;
  
  // Recommended action based on highest confidence
  const topResponse = responses.sort((a, b) => b.confidence - a.confidence)[0];
  const recommendedAction = `پیشنهاد ${topResponse.member.name}: ${topResponse.response}`;
  
  return {
    question,
    responses,
    consensus,
    recommendedAction,
  };
}

// Get member by ID
export function getCouncilMember(id: string): CouncilMember | undefined {
  return allCouncilMembers.find(m => m.id === id);
}
