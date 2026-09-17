import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Course, Video, CourseWithVideos, CourseWithProgress, VideoWithProgress, VideoProgress } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { INITIAL_REAL_YOUTUBE_COURSES, seedRealCoursesToDatabase } from '@/lib/seedCourses';
import {
  getLocalVideoProgress,
  getAllLocalProgressForUser,
  saveLocalVideoProgress,
  getLocalEnrolledCourses,
  enrollLocalCourse,
  getLocalCourseCompletions,
} from '@/lib/localStorageData';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      try { await seedRealCoursesToDatabase(); } catch {}

      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
      
      if (!isAdmin) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      if (data && data.length > 0) {
        setCourses(data as Course[]);
      } else {
        setCourses(INITIAL_REAL_YOUTUBE_COURSES as Course[]);
      }
    } catch (err: unknown) {
      setCourses(INITIAL_REAL_YOUTUBE_COURSES as Course[]);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [isAdmin]);

  return { courses, isLoading, error, refetch: fetchCourses };
}

export function useCourseWithVideos(courseId: string) {
  const [course, setCourse] = useState<CourseWithVideos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      try { await seedRealCoursesToDatabase(); } catch {}

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (courseData) {
        setCourse({
          ...(courseData as Course),
          videos: (videosData || []) as Video[],
        });
      } else {
        // Fallback to INITIAL_REAL_YOUTUBE_COURSES with normalized ID matching
        const normId = (courseId || '').replace(/_/g, '-');
        const found = INITIAL_REAL_YOUTUBE_COURSES.find(c => c.id === courseId || c.id.replace(/_/g, '-') === normId);
        if (found) {
          setCourse(found);
        } else {
          throw new Error('Course not found');
        }
      }
    } catch (err: unknown) {
      const normId = (courseId || '').replace(/_/g, '-');
      const found = INITIAL_REAL_YOUTUBE_COURSES.find(c => c.id === courseId || c.id.replace(/_/g, '-') === normId);
      if (found) {
        setCourse(found);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  return { course, isLoading, error, refetch: fetchCourse };
}

export function useStudentCourses() {
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const effectiveUserId = user?.id || 'demo-student-001';

  const fetchStudentCourses = async () => {
    setIsLoading(true);
    try {
      try { await seedRealCoursesToDatabase(); } catch {}

      // 1. Fetch published courses from Supabase or fallback
      let publishedList = INITIAL_REAL_YOUTUBE_COURSES as Course[];
      try {
        const { data: allPublishedCourses } = await supabase
          .from('courses')
          .select('*')
          .eq('is_published', true);
        if (allPublishedCourses && allPublishedCourses.length > 0) {
          publishedList = allPublishedCourses as Course[];
        }
      } catch {}

      // 2. Fetch student enrollment records
      let courseIds: string[] = [];
      if (user?.id && !user.id.startsWith('demo-')) {
        try {
          const { data: studentCourseData } = await supabase
            .from('student_courses')
            .select('course_id')
            .eq('user_id', user.id)
            .eq('is_active', true);
          if (studentCourseData) {
            courseIds = studentCourseData.map(sc => sc.course_id);
          }
        } catch {}
      }

      // Merge with local device enrollments
      const localEnrolled = getLocalEnrolledCourses(effectiveUserId);
      const allEnrolledIds = Array.from(new Set([...courseIds, ...localEnrolled]));

      // Auto-enroll in all published courses if none
      publishedList.forEach(c => {
        enrollLocalCourse(effectiveUserId, c.id);
      });
      const activeCourseIds = publishedList.map(c => c.id);

      // 3. Fetch videos from DB or fallback
      let dbVideos: Video[] = [];
      try {
        const { data: vData } = await supabase
          .from('videos')
          .select('*')
          .in('course_id', activeCourseIds)
          .order('order_index', { ascending: true });
        if (vData) dbVideos = vData as Video[];
      } catch {}

      // 4. Fetch remote video progress
      let remoteProgress: VideoProgress[] = [];
      if (user?.id && !user.id.startsWith('demo-')) {
        try {
          const { data: pData } = await supabase
            .from('video_progress')
            .select('*')
            .eq('user_id', user.id);
          if (pData) remoteProgress = pData as VideoProgress[];
        } catch {}
      }

      // Merge with local device progress
      const localProgressMap = getAllLocalProgressForUser(effectiveUserId);
      const progressMap = new Map<string, VideoProgress>();

      // Put remote progress first
      remoteProgress.forEach(p => progressMap.set(p.video_id, p));

      // Overlay local progress (local is always live on current device)
      Object.entries(localProgressMap).forEach(([vid, lp]) => {
        const existing = progressMap.get(vid);
        progressMap.set(vid, {
          id: existing?.id || `local-${vid}`,
          user_id: effectiveUserId,
          video_id: vid,
          watched_seconds: Math.max(existing?.watched_seconds || 0, lp.watched_seconds || 0),
          last_position: lp.last_position || existing?.last_position || 0,
          progress_percent: Math.max(existing?.progress_percent || 0, lp.progress_percent || 0),
          is_completed: (existing?.is_completed || false) || (lp.is_completed || false),
          created_at: existing?.created_at || lp.last_watched_at,
          last_watched_at: lp.last_watched_at || existing?.last_watched_at || new Date().toISOString(),
        });
      });

      // 5. Course completions
      const completionSet = new Set<string>();
      if (user?.id && !user.id.startsWith('demo-')) {
        try {
          const { data: compData } = await supabase
            .from('course_completions')
            .select('*')
            .eq('user_id', user.id);
          if (compData) compData.forEach(c => completionSet.add(c.course_id));
        } catch {}
      }
      const localComps = getLocalCourseCompletions(effectiveUserId);
      Object.keys(localComps).forEach(cid => completionSet.add(cid));

      // 6. Build courses with progress
      const coursesWithProgress: CourseWithProgress[] = publishedList.map((course: Course) => {
        const fallbackCourse = INITIAL_REAL_YOUTUBE_COURSES.find(ic => ic.id === course.id);
        const courseVideos = (dbVideos.filter((v: Video) => v.course_id === course.id).length > 0)
          ? dbVideos.filter((v: Video) => v.course_id === course.id)
          : (fallbackCourse?.videos || []);

        const videosWithProgress: VideoWithProgress[] = courseVideos.map((video: Video) => {
          const progress = progressMap.get(video.id);
          return {
            ...video,
            progress,
            is_locked: false,
          };
        });

        const completedCount = videosWithProgress.filter(v => v.progress?.is_completed).length;
        const totalVideos = videosWithProgress.length;
        const progressPercent = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0;

        return {
          ...course,
          videos: videosWithProgress,
          total_videos: totalVideos,
          completed_videos: completedCount,
          progress_percent: progressPercent,
          is_completed: completionSet.has(course.id) || (totalVideos > 0 && completedCount === totalVideos),
        };
      });

      setCourses(coursesWithProgress);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // If error occurs, fallback to static courses with local progress
      const fallbackList = INITIAL_REAL_YOUTUBE_COURSES.map(c => ({
        ...c,
        completed_videos: 0,
        progress_percent: 0,
        is_completed: false,
        total_videos: c.videos.length,
        videos: c.videos.map((v) => ({ ...v, is_locked: false })),
      }));
      setCourses(fallbackList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentCourses();
  }, [user]);

  return { courses, isLoading, error, refetch: fetchStudentCourses };
}

export function useVideoProgress(videoId: string) {
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const effectiveUserId = user?.id || 'demo-student-001';

  const fetchProgress = async () => {
    if (!videoId) {
      setIsLoading(false);
      return;
    }

    // 1. Instantly check local device storage
    const local = getLocalVideoProgress(effectiveUserId, videoId);
    if (local) {
      setProgress({
        id: `local-${videoId}`,
        user_id: effectiveUserId,
        video_id: videoId,
        watched_seconds: local.watched_seconds,
        last_position: local.last_position,
        progress_percent: local.progress_percent,
        is_completed: local.is_completed,
        created_at: local.last_watched_at,
        last_watched_at: local.last_watched_at,
      });
    }

    // 2. If real user, fetch from Supabase
    if (user?.id && !user.id.startsWith('demo-')) {
      try {
        const { data } = await supabase
          .from('video_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', videoId)
          .maybeSingle();

        if (data) {
          setProgress(prev => {
            if (!prev) return data as VideoProgress;
            return {
              ...data,
              watched_seconds: Math.max(data.watched_seconds || 0, prev.watched_seconds || 0),
              progress_percent: Math.max(data.progress_percent || 0, prev.progress_percent || 0),
              is_completed: data.is_completed || prev.is_completed,
            } as VideoProgress;
          });
        }
      } catch (e) {
        console.error('Error fetching remote video progress:', e);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, [user, videoId]);

  const updateProgress = async (percent: number = 100, isCompleted: boolean = true) => {
    if (!videoId) return { error: new Error('Video ID required') };

    // 1. Immediately save to device local storage
    const savedLocal = saveLocalVideoProgress(effectiveUserId, videoId, {
      progress_percent: Math.min(percent, 100),
      is_completed: isCompleted,
    });

    const updatedObj: VideoProgress = {
      id: `local-${videoId}`,
      user_id: effectiveUserId,
      video_id: videoId,
      watched_seconds: savedLocal.watched_seconds,
      last_position: savedLocal.last_position,
      progress_percent: savedLocal.progress_percent,
      is_completed: savedLocal.is_completed,
      created_at: savedLocal.last_watched_at,
      last_watched_at: savedLocal.last_watched_at,
    };
    setProgress(updatedObj);

    // 2. If real remote user, sync to Supabase (ignore failures silently)
    if (user?.id && !user.id.startsWith('demo-')) {
      try {
        await supabase.from('video_progress').upsert({
          user_id: user.id,
          video_id: videoId,
          progress_percent: Math.min(percent, 100),
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
          watched_seconds: savedLocal.watched_seconds,
          last_position: savedLocal.last_position,
        }, { onConflict: 'user_id,video_id' });
      } catch (e) {
        console.warn('Supabase remote progress sync failed, saved locally:', e);
      }
    }

    return { data: updatedObj, error: null };
  };

  return { progress, isLoading, updateProgress, refetch: fetchProgress };
}
