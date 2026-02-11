/**
 * Hook for generating daily podcast content
 */
import { useState, useCallback } from 'react';

const PODCAST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-podcast`;

export function usePodcast() {
  const [podcastText, setPodcastText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePodcast = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const resp = await fetch(PODCAST_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({}),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `خطا: ${resp.status}`);
      }

      const data = await resp.json();
      setPodcastText(data.text);
      return data.text;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { podcastText, isGenerating, error, generatePodcast, setPodcastText };
}
