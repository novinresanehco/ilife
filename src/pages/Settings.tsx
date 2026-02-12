import { Bell, Moon, Sun, Globe, Volume2, Palette, Shield, Database, Key, Plus, Trash2, RefreshCw, Lock, Unlock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { persianNumbers } from "@/lib/jalali";
import { useApiKeys } from "@/hooks/useApiKeys";
import { toast } from "sonner";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sensitivity, setSensitivity] = useState([3]);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [newApiKey, setNewApiKey] = useState('');
  const [newApiLabel, setNewApiLabel] = useState('');
  const [addingKey, setAddingKey] = useState(false);

  const { keys, loading: keysLoading, addKey, removeKey, toggleKey, unblockKey } = useApiKeys();

  const handleAddKey = async () => {
    if (!newApiKey.trim()) return;
    setAddingKey(true);
    const result = await addKey(newApiKey.trim(), newApiLabel.trim() || undefined);
    if (result?.error) {
      toast.error('خطا در افزودن کلید');
    } else {
      toast.success('کلید API با موفقیت اضافه شد');
      setNewApiKey('');
      setNewApiLabel('');
    }
    setAddingKey(false);
  };

  const isKeyBlocked = (key: { blocked_until: string | null }) => {
    if (!key.blocked_until) return false;
    return new Date(key.blocked_until) > new Date();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        <p className="text-muted-foreground mt-1">شخصی‌سازی تجربه کاربری</p>
      </div>

      <div className="grid gap-6">
        {/* API Keys Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              کلیدهای API هوش مصنوعی
            </CardTitle>
            <CardDescription>
              کلیدهای Gemini API شخصی خود را اضافه کنید. در صورت محدودیت سرویس اصلی، سیستم به‌طور خودکار از کلیدهای شما استفاده می‌کند. هر کلید محدودشده ۱۴ ساعت مسدود می‌شود.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new key */}
            <div className="flex gap-2">
              <Input 
                placeholder="کلید Gemini API..."
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className="flex-1 font-mono text-xs"
                dir="ltr"
                type="password"
              />
              <Input 
                placeholder="برچسب (اختیاری)"
                value={newApiLabel}
                onChange={(e) => setNewApiLabel(e.target.value)}
                className="w-[140px]"
              />
              <Button onClick={handleAddKey} disabled={!newApiKey.trim() || addingKey} size="icon">
                {addingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>

            {/* Keys list */}
            {keysLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : keys.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                هنوز کلید API اضافه نشده. کلید Gemini از 
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary mx-1 underline">
                  Google AI Studio
                </a>
                دریافت کنید.
              </p>
            ) : (
              <div className="space-y-2">
                {keys.map((key) => (
                  <div 
                    key={key.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isKeyBlocked(key) ? 'border-destructive/30 bg-destructive/5' : 
                      !key.is_active ? 'border-muted bg-muted/5 opacity-60' :
                      'border-border'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {key.label || `کلید ${key.api_key.slice(0, 8)}...`}
                        </span>
                        {isKeyBlocked(key) && (
                          <Badge variant="destructive" className="text-xs">
                            <Lock className="w-3 h-3 ml-1" />
                            مسدود
                          </Badge>
                        )}
                        {!key.is_active && (
                          <Badge variant="secondary" className="text-xs">غیرفعال</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>درخواست: {persianNumbers(key.total_requests || 0)}</span>
                        <span>خطا: {persianNumbers(key.failed_requests || 0)}</span>
                        {key.block_reason && (
                          <span className="text-destructive truncate max-w-[200px]">{key.block_reason}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isKeyBlocked(key) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => unblockKey(key.id)} title="رفع انسداد">
                          <Unlock className="w-4 h-4" />
                        </Button>
                      )}
                      <Switch 
                        checked={key.is_active} 
                        onCheckedChange={(checked) => toggleKey(key.id, checked)}
                        className="scale-75"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => { removeKey(key.id); toast.success('کلید حذف شد'); }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              ظاهر
            </CardTitle>
            <CardDescription>تنظیمات ظاهری اپلیکیشن</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <div>
                  <Label>حالت تاریک</Label>
                  <p className="text-sm text-muted-foreground">تغییر تم رنگی اپلیکیشن</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <div>
                  <Label>زبان</Label>
                  <p className="text-sm text-muted-foreground">انتخاب زبان رابط کاربری</p>
                </div>
              </div>
              <Select defaultValue="fa">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fa">فارسی</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              اعلان‌ها
            </CardTitle>
            <CardDescription>تنظیمات اعلان‌ها و یادآورها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>فعال‌سازی اعلان‌ها</Label>
                <p className="text-sm text-muted-foreground">دریافت اعلان برای وظایف و رویدادها</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>حساسیت اعلان‌ها</Label>
                <span className="text-sm text-muted-foreground">{persianNumbers(sensitivity[0])} از ۵</span>
              </div>
              <Slider 
                value={sensitivity} 
                onValueChange={setSensitivity}
                max={5}
                min={1}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                ۱: فقط روزانه | ۵: اعلان‌های ساعتی برای موارد حیاتی
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              صدا
            </CardTitle>
            <CardDescription>تنظیمات پادکست و صداها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>پخش خودکار پیام‌های مهم</Label>
                <p className="text-sm text-muted-foreground">پخش صوتی برای اعلان‌های با اهمیت بالا</p>
              </div>
              <Switch checked={autoPlayVoice} onCheckedChange={setAutoPlayVoice} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>صدای گوینده</Label>
                <p className="text-sm text-muted-foreground">انتخاب صدا برای پادکست روزانه</p>
              </div>
              <Select defaultValue="zephyr">
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zephyr">زفیر</SelectItem>
                  <SelectItem value="kore">کوره</SelectItem>
                  <SelectItem value="charon">کارون</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              حریم خصوصی
            </CardTitle>
            <CardDescription>تنظیمات امنیت و داده‌ها</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Database className="w-4 h-4" />
              صادرات داده‌ها
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
              حذف تمام داده‌ها
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
