import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Target, 
  MessageCircle, 
  Settings,
  Columns,
  Lightbulb,
  User
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: LayoutDashboard, label: 'داشبورد', href: '/' },
  { icon: CheckSquare, label: 'وظایف', href: '/tasks' },
  { icon: Columns, label: 'کانبان', href: '/kanban' },
  { icon: Calendar, label: 'تقویم', href: '/calendar' },
  { icon: Target, label: 'اهداف', href: '/goals' },
  { icon: Lightbulb, label: 'ایده‌ها', href: '/ideas' },
  { icon: MessageCircle, label: 'هاب ارتباطی', href: '/hub' },
  { icon: User, label: 'پروفایل', href: '/profile' },
  { icon: Settings, label: 'تنظیمات', href: '/settings' },
];

export const Sidebar = () => {
  return (
    <aside className="fixed right-0 top-0 h-full w-64 bg-card border-l border-border p-4 flex flex-col z-50">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-primary">LifeOS</h1>
        <p className="text-sm text-muted-foreground">سیستم مدیریت زندگی</p>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">کاربر</p>
            <p className="text-xs text-muted-foreground">حساب شخصی</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
