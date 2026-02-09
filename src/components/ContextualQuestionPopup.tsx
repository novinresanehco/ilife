/**
 * Contextual Question Popup Component
 * Shows context-aware questions without being intrusive
 */

import { useState, useEffect } from 'react';
import { X, HelpCircle, Send, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useContextualQuestions, type ContextualQuestion } from '@/hooks/useContextualQuestions';
import { allCouncilMembers } from '@/lib/councilOfGeniuses';
import { persianNumbers } from '@/lib/jalali';

export function ContextualQuestionPopup() {
  const { currentQuestion, answerQuestion, skipQuestion, setCurrentQuestion } = useContextualQuestions();
  const [answer, setAnswer] = useState<string>('');
  const [scaleValue, setScaleValue] = useState([5]);
  const [isVisible, setIsVisible] = useState(false);

  // Show popup with animation when question arrives
  useEffect(() => {
    if (currentQuestion) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [currentQuestion]);

  if (!currentQuestion) return null;

  const councilMember = allCouncilMembers.find(m => m.id === currentQuestion.council_member);

  const handleSubmit = () => {
    let finalAnswer = answer;
    if (currentQuestion.question_type === 'scale') {
      finalAnswer = scaleValue[0].toString();
    }
    if (finalAnswer || currentQuestion.question_type === 'scale') {
      answerQuestion({ questionId: currentQuestion.id, answer: finalAnswer || scaleValue[0].toString() });
      setAnswer('');
      setScaleValue([5]);
    }
  };

  const handleSkip = () => {
    skipQuestion(currentQuestion.id);
    setAnswer('');
    setScaleValue([5]);
  };

  const handleClose = () => {
    setCurrentQuestion(null);
    setAnswer('');
    setScaleValue([5]);
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.question_type) {
      case 'likert':
        return (
          <RadioGroup 
            value={answer}
            onValueChange={setAnswer}
            className="flex gap-2 flex-wrap justify-center"
          >
            {['کاملاً مخالف', 'مخالف', 'متوسط', 'موافق', 'کاملاً موافق'].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <RadioGroupItem value={String(i + 1)} id={`likert-${i}`} className="h-5 w-5" />
                <Label htmlFor={`likert-${i}`} className="text-xs text-center max-w-16">{label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'yesno':
        return (
          <div className="flex gap-4 justify-center">
            <Button 
              variant={answer === 'yes' ? 'default' : 'outline'}
              onClick={() => setAnswer('yes')}
              className="flex-1 max-w-32"
            >
              بله
            </Button>
            <Button 
              variant={answer === 'no' ? 'default' : 'outline'}
              onClick={() => setAnswer('no')}
              className="flex-1 max-w-32"
            >
              خیر
            </Button>
          </div>
        );

      case 'scale':
        return (
          <div className="space-y-3 px-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>پایین</span>
              <span className="font-bold text-primary text-lg">{persianNumbers(scaleValue[0])}</span>
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
          </div>
        );

      case 'radio':
        const options = currentQuestion.options as string[] | null;
        return (
          <RadioGroup 
            value={answer}
            onValueChange={setAnswer}
            className="space-y-2"
          >
            {options?.map((option) => (
              <div key={option} className="flex items-center gap-3 bg-accent/50 rounded-lg p-2">
                <RadioGroupItem value={option} id={`radio-${option}`} />
                <Label htmlFor={`radio-${option}`} className="flex-1 cursor-pointer">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'descriptive':
        return (
          <Textarea
            placeholder="پاسخ شما..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[80px]"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)]",
      "transition-all duration-300 ease-out",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    )}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {councilMember ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                    {councilMember.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{councilMember.name}</p>
                    <p className="text-xs text-muted-foreground">{councilMember.role}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-sm">سوال از LifeOS</p>
                </>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Question */}
        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed">{currentQuestion.question_text}</p>
          
          {renderQuestionInput()}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSubmit} 
              className="flex-1 gap-2"
              disabled={!answer && currentQuestion.question_type !== 'scale'}
            >
              <Send className="w-4 h-4" />
              ثبت پاسخ
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="gap-1 text-muted-foreground"
            >
              <SkipForward className="w-4 h-4" />
              رد کردن
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContextualQuestionPopup;
