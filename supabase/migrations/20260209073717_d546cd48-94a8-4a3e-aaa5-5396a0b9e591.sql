-- LifeOS Complete Database Schema

-- User profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'personal' CHECK (role IN ('personal', 'student', 'worker', 'freelancer', 'entrepreneur')),
  timezone TEXT DEFAULT 'Asia/Tehran',
  language TEXT DEFAULT 'fa',
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Perception model for each user (Big Five traits + behavioral patterns)
CREATE TABLE public.perception_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Big Five traits (1-100)
  openness INTEGER DEFAULT 50 CHECK (openness >= 0 AND openness <= 100),
  conscientiousness INTEGER DEFAULT 50 CHECK (conscientiousness >= 0 AND conscientiousness <= 100),
  extraversion INTEGER DEFAULT 50 CHECK (extraversion >= 0 AND extraversion <= 100),
  agreeableness INTEGER DEFAULT 50 CHECK (agreeableness >= 0 AND agreeableness <= 100),
  neuroticism INTEGER DEFAULT 50 CHECK (neuroticism >= 0 AND neuroticism <= 100),
  -- Behavioral patterns (0-100)
  procrastination INTEGER DEFAULT 30 CHECK (procrastination >= 0 AND procrastination <= 100),
  perfectionism INTEGER DEFAULT 40 CHECK (perfectionism >= 0 AND perfectionism <= 100),
  overwhelm INTEGER DEFAULT 25 CHECK (overwhelm >= 0 AND overwhelm <= 100),
  motivation INTEGER DEFAULT 60 CHECK (motivation >= 0 AND motivation <= 100),
  consistency INTEGER DEFAULT 50 CHECK (consistency >= 0 AND consistency <= 100),
  energy_level INTEGER DEFAULT 70 CHECK (energy_level >= 0 AND energy_level <= 100),
  -- Metadata
  confidence_score INTEGER DEFAULT 20 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  last_analysis_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Personality quiz answers
CREATE TABLE public.personality_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('likert', 'yesno', 'scale', 'radio', 'descriptive', 'multiple')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'behavioral', 'contextual', 'onboarding')),
  confidence INTEGER DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- User behavior events
CREATE TABLE public.behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  importance INTEGER DEFAULT 50 CHECK (importance >= 0 AND importance <= 100),
  chain_impact INTEGER DEFAULT 0,
  page_context TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Behavioral hypotheses (patterns detected by AI)
CREATE TABLE public.behavioral_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern TEXT NOT NULL,
  confidence INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  evidence JSONB DEFAULT '[]',
  suggested_action TEXT,
  council_member TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT DEFAULT 'personal' CHECK (goal_type IN ('personal', 'career', 'health', 'financial', 'education', 'relationship', 'spiritual')),
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  hierarchy_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tasks table with subtasks support
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'deferred', 'cancelled')),
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  importance INTEGER DEFAULT 50 CHECK (importance >= 0 AND importance <= 100),
  due_date DATE,
  due_time TIME,
  estimated_minutes INTEGER,
  actual_minutes INTEGER,
  defer_count INTEGER DEFAULT 0,
  subtask_type TEXT CHECK (subtask_type IN ('checkbox', 'radio', 'descriptive')),
  subtask_options JSONB,
  tags TEXT[],
  kanban_column TEXT DEFAULT 'backlog',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Nudges/notifications from Council
CREATE TABLE public.nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('pursuit', 'supervision', 'guidance', 'question', 'celebration')),
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 50 CHECK (importance >= 0 AND importance <= 100),
  council_member TEXT,
  action_type TEXT,
  action_data JSONB,
  auto_open BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  related_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  related_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Contextual questions to ask user
CREATE TABLE public.contextual_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('likert', 'yesno', 'scale', 'radio', 'descriptive')),
  options JSONB,
  category TEXT,
  context_page TEXT,
  council_member TEXT,
  trigger_condition JSONB,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions for behavior tracking
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  pages_visited TEXT[],
  total_events INTEGER DEFAULT 0,
  productive_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat messages in Hub
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  from_system BOOLEAN DEFAULT false,
  council_member TEXT,
  importance INTEGER DEFAULT 50,
  has_voice BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ideas notebook
CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'developing', 'ready', 'archived')),
  linked_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Calendar events
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  color TEXT DEFAULT 'primary',
  linked_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  linked_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  recurrence_rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Projects (for Gantt charts)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  linked_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perception_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personality_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contextual_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (users can only access their own data)

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Perception models policies
CREATE POLICY "Users can view own perception" ON public.perception_models FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own perception" ON public.perception_models FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own perception" ON public.perception_models FOR UPDATE USING (auth.uid() = user_id);

-- Personality answers policies
CREATE POLICY "Users can view own answers" ON public.personality_answers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON public.personality_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.personality_answers FOR UPDATE USING (auth.uid() = user_id);

-- Behavior events policies
CREATE POLICY "Users can view own events" ON public.behavior_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.behavior_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Behavioral hypotheses policies
CREATE POLICY "Users can view own hypotheses" ON public.behavioral_hypotheses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hypotheses" ON public.behavioral_hypotheses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hypotheses" ON public.behavioral_hypotheses FOR UPDATE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Nudges policies
CREATE POLICY "Users can view own nudges" ON public.nudges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nudges" ON public.nudges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nudges" ON public.nudges FOR UPDATE USING (auth.uid() = user_id);

-- Contextual questions policies
CREATE POLICY "Users can view own questions" ON public.contextual_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questions" ON public.contextual_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.contextual_questions FOR UPDATE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ideas policies
CREATE POLICY "Users can view own ideas" ON public.ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ideas" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON public.ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ideas" ON public.ideas FOR DELETE USING (auth.uid() = user_id);

-- Calendar events policies
CREATE POLICY "Users can view own events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_behavior_events_user ON public.behavior_events(user_id, created_at DESC);
CREATE INDEX idx_behavior_events_type ON public.behavior_events(event_type);
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_goal ON public.tasks(goal_id);
CREATE INDEX idx_goals_user ON public.goals(user_id, status);
CREATE INDEX idx_nudges_user_read ON public.nudges(user_id, read_at);
CREATE INDEX idx_calendar_events_user ON public.calendar_events(user_id, start_time);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_perception_updated_at BEFORE UPDATE ON public.perception_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to auto-create profile and perception model on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.perception_models (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();