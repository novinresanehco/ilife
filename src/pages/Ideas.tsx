import { useState } from "react";
import { Plus, Search, Lightbulb, Sparkles, Tag, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toJalali } from "@/lib/jalali";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const tagColors: Record<string, string> = {
  'نوآوری': 'bg-purple-500/10 text-purple-600',
  'تکنولوژی': 'bg-blue-500/10 text-blue-600',
  'کسب‌وکار': 'bg-emerald-500/10 text-emerald-600',
  'شخصی': 'bg-amber-500/10 text-amber-600',
  'آموزش': 'bg-pink-500/10 text-pink-600',
};

const Ideas = () => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', content: '', tags: [] as string[] });

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['ideas', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (input: { title: string; content: string; tags: string[] }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('ideas')
        .insert([{
          user_id: user.id,
          title: input.title || null,
          content: input.content,
          tags: input.tags.length > 0 ? input.tags : null,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast({ title: 'ایده ذخیره شد ✓' });
    },
    onError: (error) => {
      toast({ title: 'خطا', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ideas').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast({ title: 'ایده حذف شد' });
    },
  });

  const filteredIdeas = ideas.filter(idea => 
    (idea.title?.includes(searchQuery) ?? false) || idea.content.includes(searchQuery)
  );

  const addIdea = () => {
    if (!newIdea.content.trim()) return;
    createMutation.mutate(newIdea, {
      onSuccess: () => {
        setNewIdea({ title: '', content: '', tags: [] });
        setIsAdding(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <Button onClick={addIdea} disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ذخیره ایده'}
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>انصراف</Button>
            </div>
          </div>
        </div>
      )}

      {filteredIdeas.length === 0 && !isAdding ? (
        <div className="text-center py-12 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>هنوز ایده‌ای ثبت نشده است</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <div 
              key={idea.id}
              className="bg-card rounded-xl p-5 border border-border hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{idea.title || 'بدون عنوان'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {idea.created_at ? toJalali(new Date(idea.created_at)) : ''}
                  </p>
                </div>
                <button 
                  onClick={() => deleteMutation.mutate(idea.id)}
                  className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                {idea.content}
              </p>
              
              <div className="flex items-center gap-2 flex-wrap">
                {idea.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className={tagColors[tag] || ''}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Ideas;
