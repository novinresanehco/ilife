import { Bell, Moon, Sun, Globe, Volume2, Palette, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { persianNumbers } from "@/lib/jalali";

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sensitivity, setSensitivity] = useState([3]);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تنظیمات</h1>
        <p className="text-muted-foreground mt-1">شخصی‌سازی تجربه کاربری</p>
      </div>

      <div className="grid gap-6">
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
