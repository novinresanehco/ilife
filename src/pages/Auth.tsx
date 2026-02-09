/**
 * Authentication Page for LifeOS
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, Sparkles, Brain, Target, Users } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signIn, signUp } = useAuthContext();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'خطا', description: 'لطفاً ایمیل و رمز عبور را وارد کنید', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast({ title: 'خوش آمدید! 🎉', description: 'با موفقیت وارد شدید' });
      navigate('/');
    } catch (error: any) {
      toast({ 
        title: 'خطا در ورود', 
        description: error.message || 'مشکلی پیش آمد',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'خطا', description: 'لطفاً ایمیل و رمز عبور را وارد کنید', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'خطا', description: 'رمز عبور و تأیید آن یکسان نیستند', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'خطا', description: 'رمز عبور باید حداقل ۶ کاراکتر باشد', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      toast({ 
        title: 'ثبت‌نام موفق! 📧', 
        description: 'لطفاً ایمیل خود را برای تأیید حساب بررسی کنید' 
      });
    } catch (error: any) {
      toast({ 
        title: 'خطا در ثبت‌نام', 
        description: error.message || 'مشکلی پیش آمد',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LifeOS
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            همراه هوشمند شما برای مدیریت زندگی، اهداف و رشد شخصی
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">رصد هوشمند رفتار</h3>
                <p className="text-sm text-muted-foreground">
                  تحلیل عمیق الگوهای رفتاری شما برای شناخت بهتر و پیشنهادات شخصی‌سازی شده
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">پیگیری اهداف</h3>
                <p className="text-sm text-muted-foreground">
                  مدیریت اهداف کوتاه و بلندمدت با نظارت مداوم و راهنمایی‌های کاربردی
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">شورای نابغه‌ها</h3>
                <p className="text-sm text-muted-foreground">
                  ۱۰ متخصص مجازی در زمینه‌های مختلف برای مشاوره و راهنمایی شما
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">شخصیت‌شناسی</h3>
                <p className="text-sm text-muted-foreground">
                  تحلیل شخصیت بر اساس Big Five و سایر مدل‌های معتبر روانشناسی
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">خوش آمدید</CardTitle>
            <CardDescription>
              برای شروع وارد حساب خود شوید یا ثبت‌نام کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">ورود</TabsTrigger>
                <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">ایمیل</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">رمز عبور</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        در حال ورود...
                      </>
                    ) : (
                      'ورود'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">نام نمایشی (اختیاری)</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="نام شما"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">ایمیل</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">رمز عبور</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="حداقل ۶ کاراکتر"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">تأیید رمز عبور</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="تکرار رمز عبور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        در حال ثبت‌نام...
                      </>
                    ) : (
                      'ثبت‌نام'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
