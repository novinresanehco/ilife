import { useState } from "react";
import { Plus, Search, Lightbulb, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toJalali } from "@/lib/jalali";

interface Idea {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  expanded?: boolean;
}

const initialIdeas: Idea[] = [
  { 
    id: '1', 
    title: 'اپلیکیشن مدیریت زمان', 
    content: 'یک اپلیکیشن هوشمند که بر اساس عادات کاربر، بهترین زمان برای انجام کارها را پیشنهاد دهد. می‌تواند با تقویم یکپارچه شود و یادآورهای هوشمند داشته باشد.', 
    tags: ['نوآوری', 'تکنولوژی'], 
    createdAt: new Date('2024-01-15') 
  },
  { 
    id: '2', 
    title: 'کسب‌وکار آنلاین', 
    content: 'راه‌اندازی فروشگاه آنلاین محصولات دست‌ساز ایرانی. تمرکز بر صنایع دستی و هنرهای سنتی با بسته‌بندی مدرن.', 
    tags: ['کسب‌وکار', 'شخصی'], 
    createdAt: new Date('2024-02-20') 
  },
  { 
    id: '3', 
    title: 'دوره آموزشی برنامه‌نویسی', 
    content: 'تهیه یک دوره آموزشی جامع برنامه‌نویسی وب به زبان فارسی. شامل پروژه‌های عملی و پشتیبانی آنلاین.', 
    tags: ['آموزش', 'تکنولوژی'], 
    createdAt: new Date('2024-03-10') 
  },
];

const tagColors: Record<string, string> = {
  'نوآوری': 'bg-purple-500/10 text-purple-600',
  'تکنولوژی': 'bg-blue-500/10 text-blue-600',
  'کسب‌وکار': 'bg-emerald-500/10 text-emerald-600',
  'شخصی': 'bg-amber-500/10 text-amber-600',
  'آموزش': 'bg-pink-500/10 text-pink-600',
};

const Ideas = () => {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', content: '', tags: [] as string[] });

  const filteredIdeas = ideas.filter(idea => 
    idea.title.includes(searchQuery) || idea.content.includes(searchQuery)
  );

  const toggleExpand = (id: string) => {
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, expanded: !idea.expanded } : idea
    ));
  };

  const addIdea = () => {
    if (!newIdea.title.trim()) return;
    
    setIdeas([{
      id: Date.now().toString(),
      title: newIdea.title,
      content: newIdea.content,
      tags: newIdea.tags,
      createdAt: new Date(),
    }, ...ideas]);
    
    setNewIdea({ title: '', content: '', tags: [] });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ایده‌ها</h1>
          <p className="text-muted-foreground mt-1">یادداشت و پرورش ایده‌های خلاقانه</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          ایده جدید
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="جستجو در ایده‌ها..." 
          className="pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isAdding && (
        <div className="bg-card rounded-xl p-5 border border-primary shadow-lg animate-in slide-in-from-top-2">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            ایده جدید
          </h3>
          <div className="space-y-4">
            <Input 
              placeholder="عنوان ایده..." 
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
            />
            <Textarea 
              placeholder="توضیحات ایده خود را بنویسید..." 
              rows={4}
              value={newIdea.content}
              onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
            />
            <div className="flex items-center gap-2 flex-wrap">
              {Object.keys(tagColors).map(tag => (
                <Badge 
                  key={tag}
                  variant="outline"
                  className={cn(
                    "cursor-pointer transition-all",
                    newIdea.tags.includes(tag) ? tagColors[tag] : "hover:bg-accent"
                  )}
                  onClick={() => {
                    if (newIdea.tags.includes(tag)) {
                      setNewIdea({ ...newIdea, tags: newIdea.tags.filter(t => t !== tag) });
                    } else {
                      setNewIdea({ ...newIdea, tags: [...newIdea.tags, tag] });
                    }
                  }}
                >
                  <Tag className="w-3 h-3 ml-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={addIdea}>ذخیره ایده</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>انصراف</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => (
          <div 
            key={idea.id}
            className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all cursor-pointer"
            onClick={() => toggleExpand(idea.id)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{idea.title}</h3>
                <p className="text-xs text-muted-foreground">{toJalali(idea.createdAt)}</p>
              </div>
            </div>
            
            <p className={cn(
              "text-sm text-muted-foreground mb-3",
              !idea.expanded && "line-clamp-3"
            )}>
              {idea.content}
            </p>
            
            <div className="flex items-center gap-2 flex-wrap">
              {idea.tags.map(tag => (
                <Badge key={tag} variant="secondary" className={tagColors[tag]}>
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ideas;
