import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherStats, TeacherCourse, RevenueRecord, PaidWork, StudentProgress, SupportTicket, WithdrawalRequest } from '@/types/teacher';

export function useTeacherStats() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      // Fetch teacher's courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, course_type, price')
        .eq('teacher_id', profile.id);

      if (coursesError) throw coursesError;

      // Fetch revenue records
      const { data: revenue, error: revenueError } = await supabase
        .from('revenue_records')
        .select('*')
        .eq('teacher_id', profile.id)
        .eq('status', 'approved');

      if (revenueError) throw revenueError;

      // Fetch withdrawal requests
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('teacher_id', profile.id);

      if (withdrawalsError) throw withdrawalsError;

      // Fetch enrolled students count for teacher's courses
      const courseIds = courses?.map(c => c.id) || [];
      let totalStudents = 0;

      if (courseIds.length > 0) {
        const { count } = await supabase
          .from('student_courses')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds)
          .eq('is_active', true);
        totalStudents = count || 0;
      }

      // Calculate stats
      const recordedCourses = courses?.filter(c => c.course_type === 'recorded').length || 0;
      const liveCourses = courses?.filter(c => c.course_type === 'live').length || 0;
      const freeCourses = courses?.filter(c => c.course_type === 'free').length || 0;

      const recordedEarnings = revenue
        ?.filter(r => r.revenue_type === 'recorded_course')
        .reduce((sum, r) => sum + (r.teacher_share || 0), 0) || 0;

      const liveEarnings = revenue
        ?.filter(r => r.revenue_type === 'live_class')
        .reduce((sum, r) => sum + (r.teacher_share || 0), 0) || 0;

      const paidWorkEarnings = revenue
        ?.filter(r => r.revenue_type === 'paid_work')
        .reduce((sum, r) => sum + (r.teacher_share || 0), 0) || 0;

      const totalEarnings = recordedEarnings + liveEarnings + paidWorkEarnings;

      const paidWithdrawals = withdrawals
        ?.filter(w => w.status === 'paid')
        .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      const pendingWithdrawal = withdrawals
        ?.filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;

      const availableBalance = totalEarnings - paidWithdrawals - pendingWithdrawal;

      setStats({
        totalCourses: courses?.length || 0,
        recordedCourses,
        liveCourses,
        freeCourses,
        totalStudents,
        recordedEarnings,
        liveEarnings,
        paidWorkEarnings,
        totalEarnings,
        pendingWithdrawal,
        availableBalance,
      });
    } catch (err) {
      console.error('Error fetching teacher stats:', err);
      setError('Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export function useTeacherCourses() {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      // Also include courses where this teacher is a co-instructor (course_instructors)
      let coInstructorCourseIds: string[] = [];
      if (profile.linked_team_member_id) {
        const { data: ciRows } = await supabase
          .from('course_instructors')
          .select('course_id')
          .eq('instructor_id', profile.linked_team_member_id);
        coInstructorCourseIds = (ciRows || []).map((r: any) => r.course_id);
      }

      const orFilter = coInstructorCourseIds.length
        ? `teacher_id.eq.${profile.id},id.in.(${coInstructorCourseIds.join(',')})`
        : `teacher_id.eq.${profile.id}`;

      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          *,
          videos:videos(id)
        `)
        .or(orFilter)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;


      // Get enrolled students count for each course
      const coursesWithStats = await Promise.all(
        (data || []).map(async (course) => {
          const { count } = await supabase
            .from('student_courses')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('is_active', true);

          const { data: revenueData } = await supabase
            .from('revenue_records')
            .select('teacher_share')
            .eq('course_id', course.id)
            .eq('teacher_id', profile.id)
            .eq('status', 'approved');

          const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.teacher_share || 0), 0) || 0;

          return {
            ...course,
            course_type: course.course_type || 'recorded',
            is_approved: course.is_approved || false,
            enrolled_students: count || 0,
            total_revenue: totalRevenue,
          } as TeacherCourse;
        })
      );

      setCourses(coursesWithStats);
    } catch (err) {
      console.error('Error fetching teacher courses:', err);
      setError('Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, isLoading, error, refetch: fetchCourses };
}

export function useTeacherStudents() {
  const { user, profile } = useAuth();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      // Get teacher's course IDs
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, title_en')
        .eq('teacher_id', profile.id);

      if (!courses || courses.length === 0) {
        setStudents([]);
        return;
      }

      const courseIds = courses.map(c => c.id);

      // Get student course assignments
      const { data: studentAssignments } = await supabase
        .from('student_courses')
        .select('course_id, user_id')
        .in('course_id', courseIds)
        .eq('is_active', true);

      if (!studentAssignments || studentAssignments.length === 0) {
        setStudents([]);
        return;
      }

      // Get unique student user_ids
      const studentUserIds = [...new Set(studentAssignments.map(sa => sa.user_id))];

      // Fetch profiles for these students
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', studentUserIds);

      if (!studentProfiles) {
        setStudents([]);
        return;
      }

      // Build student progress list
      const studentProgressList: StudentProgress[] = [];

      for (const sa of studentAssignments) {
        const student = studentProfiles.find(p => p.user_id === sa.user_id);
        if (!student) continue;

        const course = courses.find(c => c.id === sa.course_id);
        if (!course) continue;

        // Get video count for course
        const { count: totalVideos } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', sa.course_id);

        // Get completed videos for this student
        const { data: progress } = await supabase
          .from('video_progress')
          .select('video_id, is_completed, last_watched_at')
          .eq('user_id', student.user_id)
          .in('video_id', (await supabase.from('videos').select('id').eq('course_id', sa.course_id)).data?.map(v => v.id) || []);

        const completedVideos = progress?.filter(p => p.is_completed).length || 0;
        const progressPercent = totalVideos ? Math.round((completedVideos / totalVideos) * 100) : 0;
        const lastWatched = progress?.sort((a, b) => 
          new Date(b.last_watched_at || 0).getTime() - new Date(a.last_watched_at || 0).getTime()
        )[0]?.last_watched_at || null;

        studentProgressList.push({
          student,
          course: course as any,
          progress_percent: progressPercent,
          last_watched_at: lastWatched,
          is_completed: progressPercent === 100,
          videos_completed: completedVideos,
          total_videos: totalVideos || 0,
        });
      }

      setStudents(studentProgressList);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, isLoading, error, refetch: fetchStudents };
}

export function useTeacherRevenue() {
  const { user, profile } = useAuth();
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('revenue_records')
        .select(`
          *,
          course:courses(*),
          student:profiles!revenue_records_student_id_fkey(*)
        `)
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRevenue(data as RevenueRecord[] || []);
    } catch (err) {
      console.error('Error fetching revenue:', err);
      setError('Failed to fetch revenue');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return { revenue, isLoading, error, refetch: fetchRevenue };
}

export function useTeacherPaidWorks() {
  const { user, profile } = useAuth();
  const [works, setWorks] = useState<PaidWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('paid_works')
        .select('*')
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setWorks(data as PaidWork[] || []);
    } catch (err) {
      console.error('Error fetching paid works:', err);
      setError('Failed to fetch paid works');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const updateWorkStatus = async (workId: string, status: PaidWork['status']) => {
    try {
      const updates: Partial<PaidWork> = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('paid_works')
        .update(updates)
        .eq('id', workId);

      if (error) throw error;
      await fetchWorks();
      return { error: null };
    } catch (err) {
      console.error('Error updating work status:', err);
      return { error: err };
    }
  };

  return { works, isLoading, error, refetch: fetchWorks, updateWorkStatus };
}

export function useTeacherTickets() {
  const { user, profile } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          student:profiles!support_tickets_student_id_fkey(*),
          course:courses(*)
        `)
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTickets(data as SupportTicket[] || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateTicketStatus = async (ticketId: string, status: SupportTicket['status']) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;
      await fetchTickets();
      return { error: null };
    } catch (err) {
      console.error('Error updating ticket status:', err);
      return { error: err };
    }
  };

  const sendMessage = async (ticketId: string, message: string) => {
    if (!profile) return { error: 'No profile' };

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: profile.id,
          message,
        });

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error sending message:', err);
      return { error: err };
    }
  };

  return { tickets, isLoading, error, refetch: fetchTickets, updateTicketStatus, sendMessage };
}

export function useWithdrawals() {
  const { user, profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    if (!user || !profile) return;

    try {
      setIsLoading(true);

      const { data, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setWithdrawals(data as WithdrawalRequest[] || []);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setError('Failed to fetch withdrawals');
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const createWithdrawal = async (
    amount: number, 
    paymentMethod: 'bkash' | 'nagad' | 'bank',
    paymentDetails: Record<string, any>
  ) => {
    if (!profile) return { error: 'No profile' };

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          teacher_id: profile.id,
          amount,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
        });

      if (error) throw error;
      await fetchWithdrawals();
      return { error: null };
    } catch (err) {
      console.error('Error creating withdrawal:', err);
      return { error: err };
    }
  };

  return { withdrawals, isLoading, error, refetch: fetchWithdrawals, createWithdrawal };
}
