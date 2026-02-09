/**
 * Authentication Hook for LifeOS
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  timezone: string;
  language: string;
  onboarding_completed: boolean;
}

interface PerceptionModel {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  procrastination: number;
  perfectionism: number;
  overwhelm: number;
  motivation: number;
  consistency: number;
  energy_level: number;
  confidence_score: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [perception, setPerception] = useState<PerceptionModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  // Fetch perception model
  const fetchPerception = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perception_models')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setPerception(data);
      return data;
    } catch (error) {
      console.error('Error fetching perception:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchPerception(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setPerception(null);
        }
        
        setLoading(false);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPerception(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, fetchPerception]);

  // Sign up with email
  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;
    return data;
  }, []);

  // Sign in with email
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setPerception(null);
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  }, [user]);

  // Update perception model
  const updatePerception = useCallback(async (updates: Partial<PerceptionModel>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('perception_models')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setPerception(data);
    return data;
  }, [user]);

  return {
    user,
    session,
    profile,
    perception,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePerception,
    refetchProfile: user ? () => fetchProfile(user.id) : undefined,
    refetchPerception: user ? () => fetchPerception(user.id) : undefined,
  };
}

export default useAuth;
