import { useState } from "react";
import { Bell, MessageCircle, Archive, Send, Play, CheckCheck, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toJalali, persianNumbers } from "@/lib/jalali";

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

const mockNotifications: Notification[] = [
  { id: '1', content: 'وظیفه «تکمیل گزارش» به تأخیر افتاده است. پیشنهاد: زمان‌بندی مجدد', type: 'warning', read: false, important: true, timestamp: new Date() },
  { id: '2', content: 'هدف «یادگیری React» به ۸۰٪ پیشرفت رسید. آفرین!', type: 'success', read: false, important: false, timestamp: new Date() },
  { id: '3', content: 'جلسه تیم در ۳۰ دقیقه آینده شروع می‌شود', type: 'info', read: true, important: true, timestamp: new Date() },
  { id: '4', content: 'پادکست روزانه آماده شد. گوش دهید!', type: 'info', read: true, important: false, timestamp: new Date() },
];

const mockChat: ChatMessage[] = [
  { id: '1', content: 'سلام! من دستیار شخصی شما هستم. چطور می‌تونم کمکتون کنم؟', fromSystem: true, timestamp: new Date() },
  { id: '2', content: 'چرا وظیفه گزارش به تأخیر افتاده؟', fromSystem: false, timestamp: new Date() },
  { id: '3', content: 'بر اساس تحلیل رفتار شما، به نظر می‌رسد این وظیفه با چند هدف دیگر در تضاد زمانی است. پیشنهاد می‌کنم آن را به ۳ بخش کوچک‌تر تقسیم کنید.', fromSystem: true, timestamp: new Date() },
];

const typeStyles = {
  info: 'bg-primary/10 border-primary/30 text-primary',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
};

const Hub = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [chat, setChat] = useState<ChatMessage[]>(mockChat);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    setChat([...chat, {
      id: Date.now().toString(),
      content: newMessage,
      fromSystem: false,
      timestamp: new Date(),
    }]);
    setNewMessage('');
    
    // Simulate system response
    setTimeout(() => {
      setChat(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: 'متوجه شدم. در حال تحلیل درخواست شما هستم...',
        fromSystem: true,
        timestamp: new Date(),
      }]);
    }, 1000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">هاب ارتباطی</h1>
        <p className="text-muted-foreground mt-1">مرکز اعلان‌ها، پیام‌ها و ارتباط با سیستم</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            اعلان‌ها
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {persianNumbers(unreadCount)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            گفتگو
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
                    <Button size="sm" variant="ghost" className="shrink-0">
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
              {chat.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex",
                    message.fromSystem ? "justify-start" : "justify-end"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl",
                    message.fromSystem 
                      ? "bg-accent text-accent-foreground rounded-tr-sm" 
                      : "bg-primary text-primary-foreground rounded-tl-sm"
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.fromSystem ? "text-muted-foreground" : "text-primary-foreground/70"
                    )}>
                      {toJalali(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input 
                  placeholder="پیام خود را بنویسید..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage}>
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
