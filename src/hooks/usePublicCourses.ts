import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/lms';
import { useEffect } from 'react';

export function usePublicCourses() {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('courses-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['public-courses'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: dbCourses, isLoading, error, refetch } = useQuery({
    queryKey: ['public-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Course[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    refetchOnWindowFocus: false,
  });

  const courses = dbCourses || [];

  return { 
    courses, 
    isLoading, 
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null, 
    refetch 
  };
}
