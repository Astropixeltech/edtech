import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/lms';
import { useEffect } from 'react';
import { INITIAL_REAL_YOUTUBE_COURSES, seedRealCoursesToDatabase } from '@/lib/seedCourses';

export function usePublicCourses() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Run seed non-blockingly once per browser session in the background
    if (typeof window !== 'undefined') {
      const alreadySeeded = sessionStorage.getItem('ap_courses_seeded');
      if (!alreadySeeded) {
        sessionStorage.setItem('ap_courses_seeded', 'true');
        setTimeout(async () => {
          try {
            await seedRealCoursesToDatabase();
            queryClient.invalidateQueries({ queryKey: ['public-courses'] });
          } catch {}
        }, 1500);
      }
    }
  }, [queryClient]);

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
    initialData: INITIAL_REAL_YOUTUBE_COURSES as Course[],
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    refetchOnWindowFocus: false,
  });

  const courses = (dbCourses && dbCourses.length > 0) 
    ? dbCourses 
    : (INITIAL_REAL_YOUTUBE_COURSES as Course[]);

  return { 
    courses, 
    isLoading: false, // Instantaneous rendering with initialData
    error: error ? (error instanceof Error ? error.message : 'An error occurred') : null, 
    refetch 
  };
}
