import { useState, useEffect, useRef } from "react";
import { Bell, MessageCircle, Archive, Send, Play, Pause, CheckCheck, Circle, HelpCircle, ThumbsUp, ThumbsDown, Mic, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toJalali, persianNumbers } from "@/lib/jalali";
import { useCouncilChat } from "@/hooks/useCouncilChat";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { usePodcast } from "@/hooks/usePodcast";

interface Notification {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  important: boolean;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  content: string;
  fromSystem: boolean;
  timestamp: Date;
}

interface InteractiveQuestion {
  id: string;
  text: string;
  type: 'likert' | 'radio' | 'descriptive' | 'yesno' | 'scale';
  options?: string[];
  answered: boolean;
  answer?: string | number;
  category: string;
}

// Mock notifications (will be replaced by nudges from DB later)
const mockNotifications: Notification[] = [
  { id: '1', content: 'وظیفه «تکمیل گزارش» به تأخیر افتاده است. پیشنهاد: زمان‌بندی مجدد', type: 'warning', read: false, important: true, timestamp: new Date() },
  { id: '2', content: 'هدف «یادگیری React» به ۸۰٪ پیشرفت رسید. آفرین!', type: 'success', read: false, important: false, timestamp: new Date() },
  { id: '3', content: 'جلسه تیم در ۳۰ دقیقه آینده شروع می‌شود', type: 'info', read: true, important: true, timestamp: new Date() },
];

const typeStyles = {
  info: 'bg-primary/10 border-primary/30 text-primary',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
};

const defaultQuestions: InteractiveQuestion[] = [
  { id: 'q1', text: 'چقدر از پیشرفت این هفته خود راضی هستید؟', type: 'likert', answered: false, category: 'بازخورد هفتگی' },
  { id: 'q2', text: 'کدام حوزه نیاز به تمرکز بیشتری دارد؟', type: 'radio', options: ['کار', 'سلامت', 'روابط', 'مالی', 'یادگیری'], answered: false, category: 'اولویت‌بندی' },
  { id: 'q3', text: 'بزرگ‌ترین چالش امروز چه بود؟', type: 'descriptive', answered: false, category: 'بازتاب روزانه' },
  { id: 'q4', text: 'آیا به هدف روزانه خود رسیدید؟', type: 'yesno', answered: false, category: 'بررسی روزانه' },
  { id: 'q5', text: 'سطح انرژی خود را چگونه ارزیابی می‌کنید؟', type: 'scale', answered: false, category: 'وضعیت سلامت' },
];

const Hub = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');
  const [questions, setQuestions] = useState<InteractiveQuestion[]>(defaultQuestions);
  const [descriptiveAnswer, setDescriptiveAnswer] = useState('');
  const [scaleValue, setScaleValue] = useState([5]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI hooks
  const { messages: aiMessages, isLoading: aiLoading, sendMessage: sendAIMessage } = useCouncilChat();
  const { speak, stop, isSpeaking, isLoading: ttsLoading } = useTextToSpeech();
  const { podcastText, isGenerating: podcastGenerating, generatePodcast } = usePodcast();

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || aiLoading) return;
    sendAIMessage(newMessage);
    setNewMessage('');
  };

  const handlePodcastPlay = async () => {
    if (podcastText) {
      if (isSpeaking) {
        stop();
      } else {
        speak(podcastText);
      }
    } else {
      const text = await generatePodcast();
      if (text) speak(text);
    }
  };

  const answerQuestion = (questionId: string, answer: string | number) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, answered: true, answer } : q
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unansweredCount = questions.filter(q => !q.answered).length;

  const renderQuestionInput = (question: InteractiveQuestion) => {
    if (question.answered) {
      return (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCheck className="w-4 h-4" />
          <span className="text-sm">پاسخ داده شده</span>
        </div>
      );
    }

    switch (question.type) {
      case 'likert':
        return (
          <RadioGroup 
            onValueChange={(v) => answerQuestion(question.id, v)}
            className="flex gap-2 flex-wrap"
          >
            {['کاملاً ناراضی', 'ناراضی', 'متوسط', 'راضی', 'کاملاً راضی'].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={String(i + 1)} id={`${question.id}-${i}`} />
                <Label htmlFor={`${question.id}-${i}`} className="text-xs text-center">{label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'radio':
        return (
          <RadioGroup 
            onValueChange={(v) => answerQuestion(question.id, v)}
            className="space-y-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'descriptive':
        return (
          <div className="space-y-2">
            <Textarea 
              placeholder="پاسخ خود را بنویسید..."
              value={descriptiveAnswer}
              onChange={(e) => setDescriptiveAnswer(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              size="sm" 
              onClick={() => {
                if (descriptiveAnswer.trim()) {
                  answerQuestion(question.id, descriptiveAnswer);
                  setDescriptiveAnswer('');
                }
              }}
            >
              ثبت پاسخ
            </Button>
          </div>
        );
      
      case 'yesno':
        return (
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="gap-2 flex-1"
              onClick={() => answerQuestion(question.id, 'yes')}
            >
              <ThumbsUp className="w-4 h-4" />
              بله
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 flex-1"
              onClick={() => answerQuestion(question.id, 'no')}
            >
              <ThumbsDown className="w-4 h-4" />
              خیر
            </Button>
          </div>
        );
      
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>پایین</span>
              <span className="font-bold text-lg text-primary">{persianNumbers(scaleValue[0])}</span>
              <span>بالا</span>
            </div>
            <Slider
              value={scaleValue}
              onValueChange={setScaleValue}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
            <Button 
              size="sm" 
              onClick={() => answerQuestion(question.id, scaleValue[0])}
            >
              ثبت
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">هاب ارتباطی</h1>
        <p className="text-muted-foreground mt-1">مرکز اعلان‌ها، پیام‌ها و ارتباط با سیستم</p>
      </div>

      {/* Daily Podcast Section */}
      <div className="bg-gradient-to-l from-primary/10 to-primary/5 rounded-xl p-5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">پادکست روزانه</h3>
              <p className="text-sm text-muted-foreground">
                {podcastText ? 'پادکست آماده پخش است' : 'خلاصه فعالیت‌ها و برنامه امروز'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              size="icon" 
              className="rounded-full h-10 w-10"
              onClick={handlePodcastPlay}
              disabled={podcastGenerating || ttsLoading}
            >
              {podcastGenerating || ttsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSpeaking ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
        {podcastText && (
          <div className="mt-3 pt-3 border-t border-primary/10">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">{podcastText}</p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            اعلان‌ها
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {persianNumbers(unreadCount)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            سوالات
            {unansweredCount > 0 && (
              <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {persianNumbers(unansweredCount)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            گفتگو با شورا
          </TabsTrigger>
          <TabsTrigger value="archive" className="gap-2">
            <Archive className="w-4 h-4" />
            آرشیو
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <div className="space-y-3">
            {notifications.filter(n => !n.read || n.important).map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer",
                  typeStyles[notification.type],
                  !notification.read && "ring-2 ring-offset-2 ring-primary/30"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {notification.read ? (
                      <CheckCheck className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4 fill-current" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm", !notification.read && "font-medium")}>
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70">{toJalali(notification.timestamp)}</span>
                      {notification.important && (
                        <Badge variant="outline" className="text-xs">مهم</Badge>
                      )}
                    </div>
                  </div>
                  {notification.important && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="shrink-0"
                      onClick={(e) => { e.stopPropagation(); speak(notification.content); }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <div className="space-y-4">
            {questions.map((question) => (
              <div 
                key={question.id}
                className={cn(
                  "bg-card rounded-xl p-5 border border-border",
                  question.answered && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2 text-xs">{question.category}</Badge>
                    <p className="font-medium">{question.text}</p>
                  </div>
                </div>
                {renderQuestionInput(question)}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {aiMessages.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>سوال خود را بپرسید تا شورای نوابغ پاسخ دهد</p>
                  <p className="text-xs mt-1">۱۰ متخصص آماده کمک به شما هستند</p>
                </div>
              )}
              {aiMessages.map((message, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "flex",
                    message.role === 'assistant' ? "justify-start" : "justify-end"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl",
                    message.role === 'assistant' 
                      ? "bg-accent text-accent-foreground rounded-tr-sm" 
                      : "bg-primary text-primary-foreground rounded-tl-sm"
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 mt-1"
                        onClick={() => isSpeaking ? stop() : speak(message.content)}
                      >
                        {isSpeaking ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && aiMessages[aiMessages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-accent p-3 rounded-2xl rounded-tr-sm">
                    <div className="flex gap-1">
                      <span className="animate-bounce text-sm">●</span>
                      <span className="animate-bounce text-sm" style={{ animationDelay: '0.1s' }}>●</span>
                      <span className="animate-bounce text-sm" style={{ animationDelay: '0.2s' }}>●</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input 
                  placeholder="سوال خود را از شورای نوابغ بپرسید..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={aiLoading}
                />
                <Button onClick={sendMessage} disabled={aiLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="p-4 rounded-xl border border-border bg-card"
              >
                <p className="text-sm text-muted-foreground">{notification.content}</p>
                <p className="text-xs text-muted-foreground/70 mt-2">{toJalali(notification.timestamp)}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Hub;