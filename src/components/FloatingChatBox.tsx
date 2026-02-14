import { useState, useEffect, useCallback, useRef } from "react";
import { 
  MessageCircle, X, Send, Bell, HelpCircle, 
  ChevronDown, Play, Pause, ThumbsUp, ThumbsDown,
  CheckCheck, Circle, Users, AlertTriangle, Sparkles, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { persianNumbers, toJalali } from "@/lib/jalali";
import { 
  allCouncilMembers, 
  type CouncilMember 
} from "@/lib/councilOfGeniuses";
import { useCouncilChat } from "@/hooks/useCouncilChat";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useNudges } from "@/hooks/useNudges";
import { useContextualQuestions } from "@/hooks/useContextualQuestions";

const councilMembers = allCouncilMembers;

const typeStyles: Record<string, string> = {
  pursuit: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
  supervision: 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  guidance: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
  question: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
  celebration: 'bg-pink-500/10 border-pink-500/30 text-pink-600',
  info: 'bg-primary/10 border-primary/30 text-primary',
  warning: 'bg-destructive/10 border-destructive/30 text-destructive',
};

const typeLabels: Record<string, string> = {
  pursuit: 'پیگیری',
  supervision: 'نظارت',
  guidance: 'راهنمایی',
  question: 'سوال',
  celebration: 'تبریک',
  info: 'اطلاع',
  warning: 'هشدار',
};

function getCouncilMemberById(id: string | null): CouncilMember | undefined {
  if (!id) return undefined;
  return councilMembers.find(m => m.id === id);
}

export const FloatingChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [newMessage, setNewMessage] = useState('');
  const [scaleValue, setScaleValue] = useState([5]);
  const [descriptiveAnswer, setDescriptiveAnswer] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // AI Chat hook
  const { messages: aiMessages, isLoading: aiLoading, sendMessage: sendAIMessage } = useCouncilChat();
  
  // TTS hook
  const { speak, stop, isSpeaking } = useTextToSpeech();

  // Real nudges from DB
  const { 
    nudges, unreadCount, markAsRead, dismissNudge, autoOpenNudges 
  } = useNudges();

  // Real contextual questions from DB
  const { 
    questions: dbQuestions, answerQuestion: answerDbQuestion, skipQuestion 
  } = useContextualQuestions();

  const unansweredQuestions = dbQuestions?.filter(q => !q.answered_at && !q.skipped)?.length ?? 0;
  const totalBadge = unreadCount + unansweredQuestions;

  // Auto-open for important nudges
  useEffect(() => {
    if (autoOpenNudges.length > 0 && !isOpen) {
      setIsOpen(true);
      setActiveTab('notifications');
    }
  }, [autoOpenNudges.length]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const sendMessage = () => {
    if (!newMessage.trim() || aiLoading) return;
    sendAIMessage(newMessage);
    setNewMessage('');
  };

  const renderQuestionInput = (question: any) => {
    if (question.answered_at) {
      return (
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCheck className="w-4 h-4" />
          <span className="text-sm">پاسخ داده شده: {question.answer}</span>
        </div>
      );
    }

    const qType = question.question_type;
    const options = question.options as string[] | null;

    switch (qType) {
      case 'likert':
        return (
          <RadioGroup 
            onValueChange={(v) => answerDbQuestion({ questionId: question.id, answer: v })}
            className="flex gap-1 flex-wrap"
          >
            {['کاملاً مخالف', 'مخالف', 'متوسط', 'موافق', 'کاملاً موافق'].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={String(i + 1)} id={`${question.id}-${i}`} className="h-4 w-4" />
                <Label htmlFor={`${question.id}-${i}`} className="text-[10px] text-center">{label}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'radio':
        return (
          <RadioGroup 
            onValueChange={(v) => answerDbQuestion({ questionId: question.id, answer: v })}
            className="space-y-1"
          >
            {options?.map((option: string) => (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} className="h-3 w-3" />
                <Label htmlFor={`${question.id}-${option}`} className="text-xs">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'descriptive':
        return (
          <div className="space-y-2">
            <Textarea 
              placeholder="پاسخ شما..."
              value={descriptiveAnswer}
              onChange={(e) => setDescriptiveAnswer(e.target.value)}
              className="min-h-[60px] text-xs"
            />
            <Button 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => {
                if (descriptiveAnswer.trim()) {
                  answerDbQuestion({ questionId: question.id, answer: descriptiveAnswer });
                  setDescriptiveAnswer('');
                }
              }}
            >
              ثبت
            </Button>
          </div>
        );
      
      case 'yesno':
        return (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1 flex-1 h-7 text-xs"
              onClick={() => answerDbQuestion({ questionId: question.id, answer: 'yes' })}
            >
              <ThumbsUp className="w-3 h-3" />
              بله
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1 flex-1 h-7 text-xs"
              onClick={() => answerDbQuestion({ questionId: question.id, answer: 'no' })}
            >
              <ThumbsDown className="w-3 h-3" />
              خیر
            </Button>
          </div>
        );
      
      case 'scale':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>پایین</span>
              <span className="font-bold text-primary">{persianNumbers(scaleValue[0])}</span>
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
              className="h-7 text-xs"
              onClick={() => answerDbQuestion({ questionId: question.id, answer: String(scaleValue[0]) })}
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
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 left-6 z-[100] animate-in zoom-in duration-500">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
            isOpen && "rotate-90"
          )}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
        {totalBadge > 0 && !isOpen && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs"
          >
            {persianNumbers(totalBadge)}
          </Badge>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-[100] w-[380px] max-w-[calc(100vw-48px)] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="bg-primary/5 p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">شورای هوشمند LifeOS</h3>
                    <p className="text-xs text-muted-foreground">۱۰ متخصص آماده کمک</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-none border-b h-10">
                <TabsTrigger value="chat" className="text-xs gap-1 h-9">
                  <MessageCircle className="w-3 h-3" />
                  گفتگو
                </TabsTrigger>
                <TabsTrigger value="questions" className="text-xs gap-1 h-9 relative">
                  <HelpCircle className="w-3 h-3" />
                  سوالات
                  {unansweredQuestions > 0 && (
                    <Badge variant="secondary" className="h-4 w-4 p-0 text-[10px] absolute -top-0.5 -right-0.5">
                      {persianNumbers(unansweredQuestions)}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-xs gap-1 h-9 relative">
                  <Bell className="w-3 h-3" />
                  اعلان‌ها
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="h-4 w-4 p-0 text-[10px] absolute -top-0.5 -right-0.5">
                      {persianNumbers(unreadCount)}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="m-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-3 space-y-3">
                    {aiMessages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">سوال خود را بپرسید تا شورای نوابغ پاسخ دهد</p>
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
                          "max-w-[85%] p-3 rounded-2xl",
                          message.role === 'assistant' 
                            ? "bg-accent text-accent-foreground rounded-tr-sm" 
                            : "bg-primary text-primary-foreground rounded-tl-sm"
                        )}>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          {message.role === 'assistant' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 mt-1"
                              onClick={() => isSpeaking ? stop() : speak(message.content)}
                            >
                              {isSpeaking ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-accent text-accent-foreground p-3 rounded-2xl rounded-tr-sm">
                          <div className="flex gap-1">
                            <span className="animate-bounce text-xs">●</span>
                            <span className="animate-bounce text-xs" style={{ animationDelay: '0.1s' }}>●</span>
                            <span className="animate-bounce text-xs" style={{ animationDelay: '0.2s' }}>●</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="سوال خود را بپرسید..." 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="text-xs h-9"
                      disabled={aiLoading}
                    />
                    <Button onClick={sendMessage} size="icon" className="h-9 w-9 shrink-0" disabled={aiLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Questions Tab - Real DB questions */}
              <TabsContent value="questions" className="m-0">
                <ScrollArea className="h-[340px]">
                  <div className="p-3 space-y-3">
                    {(!dbQuestions || dbQuestions.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">سوال جدیدی وجود ندارد</p>
                      </div>
                    )}
                    {dbQuestions?.map((question) => (
                      <div 
                        key={question.id}
                        className={cn(
                          "bg-accent/50 rounded-xl p-3 border border-border",
                          question.answered_at && "opacity-60"
                        )}
                      >
                        {question.council_member && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">{getCouncilMemberById(question.council_member)?.avatar || '🤖'}</span>
                            <span className="text-xs text-muted-foreground">
                              {getCouncilMemberById(question.council_member)?.name || 'سیستم'}
                            </span>
                            {question.category && (
                              <Badge variant="outline" className="text-[10px] h-5 mr-auto">{question.category}</Badge>
                            )}
                          </div>
                        )}
                        <p className="text-xs font-medium mb-3">{question.question_text}</p>
                        {renderQuestionInput(question)}
                        {!question.answered_at && !question.skipped && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] mt-2"
                            onClick={() => skipQuestion(question.id)}
                          >
                            رد شدن
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Notifications Tab - Real nudges from DB */}
              <TabsContent value="notifications" className="m-0">
                <ScrollArea className="h-[340px]">
                  <div className="p-3 space-y-2">
                    {nudges.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">اعلان جدیدی وجود ندارد</p>
                      </div>
                    )}
                    {nudges.map((nudge) => {
                      const member = getCouncilMemberById(nudge.council_member);
                      const isRead = !!nudge.read_at;
                      const nudgeType = nudge.nudge_type || 'info';
                      
                      return (
                        <div 
                          key={nudge.id}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer",
                            typeStyles[nudgeType] || typeStyles.info,
                            !isRead && "ring-2 ring-offset-1 ring-primary/30"
                          )}
                          onClick={() => !isRead && markAsRead(nudge.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className="mt-0.5">
                              {isRead ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3 fill-current" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {member && (
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-sm">{member.avatar}</span>
                                  <span className="text-[10px] text-muted-foreground">{member.name}</span>
                                </div>
                              )}
                              <p className={cn("text-xs", !isRead && "font-medium")}>
                                {nudge.content}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] opacity-70">
                                  {toJalali(new Date(nudge.created_at))}
                                </span>
                                <Badge variant="outline" className="text-[10px] h-4">
                                  {typeLabels[nudgeType] || nudgeType}
                                </Badge>
                              </div>
                            </div>
                            {!isRead && nudge.importance && nudge.importance >= 70 && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-6 w-6 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speak(nudge.content);
                                }}
                              >
                                <Volume2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
};
