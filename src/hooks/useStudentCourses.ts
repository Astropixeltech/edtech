import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Course, Profile } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentWithCourses {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  courses: Course[];
}

export function useStudentCourseManagement() {
  const [students, setStudents] = useState<StudentWithCourses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const fetchStudents = useCallback(async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch all student profiles (users with student role)
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      if (!studentRoles || studentRoles.length === 0) {
        setStudents([]);
        setIsLoading(false);
        return;
      }

      const studentUserIds = studentRoles.map(r => r.user_id);

      // Fetch profiles for students
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentUserIds)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all student_courses assignments
      const { data: assignments, error: assignError } = await supabase
        .from('student_courses')
        .select('user_id, course_id')
        .in('user_id', studentUserIds)
        .eq('is_active', true);

      if (assignError) throw assignError;

      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*');

      if (coursesError) throw coursesError;

      const coursesMap = new Map((coursesData || []).map((c: Course) => [c.id, c]));

      // Build students with courses
      const studentsWithCourses: StudentWithCourses[] = (profiles || []).map((profile: Profile) => {
        const studentAssignments = (assignments || []).filter(
          (a: { user_id: string }) => a.user_id === profile.user_id
        );

        const courses = studentAssignments
          .map((a: { course_id: string }) => coursesMap.get(a.course_id))
          .filter((c: Course | undefined): c is Course => c !== undefined);

        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          email: profile.email,
          phone_number: profile.phone_number,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          courses,
        };
      });

      setStudents(studentsWithCourses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Realtime auto-refresh
  const refreshTimerRef = useRef<number | null>(null);

  const scheduleRefetch = useCallback(() => {
    if (!isAdmin) return;
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = window.setTimeout(() => {
      fetchStudents();
    }, 250);
  }, [fetchStudents, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-students')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_courses' },
        () => scheduleRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => scheduleRefetch()
      )
      .subscribe();

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [isAdmin, scheduleRefetch]);

  const assignCourse = async (userId: string, courseId: string) => {
    const { error } = await supabase
      .from('student_courses')
      .insert({ user_id: userId, course_id: courseId });

    if (!error) {
      await fetchStudents();
    }
    return { error: error?.message };
  };

  const removeCourse = async (userId: string, courseId: string) => {
    const { error } = await supabase
      .from('student_courses')
      .delete()
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (!error) {
      await fetchStudents();
    }
    return { error: error?.message };
  };

  return {
    students,
    isLoading,
    error,
    refetch: fetchStudents,
    assignCourse,
    removeCourse,
  };
}
