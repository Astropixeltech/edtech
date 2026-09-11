import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import SecureVideoPlayer from '@/components/SecureVideoPlayer';
import LessonComments from '@/components/student/LessonComments';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Play, Lock, CheckCircle, ArrowLeft, ArrowRight, ChevronLeft,
  FileText, StickyNote, File, Clock, PlayCircle, Maximize2, Minimize2,
  Download, ExternalLink, ThumbsUp, ThumbsDown, Award, Sparkles, X,
  AlertCircle, Edit3, Save
} from 'lucide-react';
import { CourseWithProgress, VideoWithProgress, VideoMaterial } from '@/types/lms';
import { useStudentCourses, useVideoProgress } from '@/hooks/useCourses';
import { INITIAL_REAL_YOUTUBE_COURSES } from '@/lib/seedCourses';
import { getAllLocalProgressForUser, saveLocalCourseCompletion } from '@/lib/localStorageData';

export default function CourseViewerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const { courses, refetch } = useStudentCourses();
  const isMobile = useIsMobile();

  const [course, setCourse] = useState<CourseWithProgress | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithProgress | null>(null);
  const [videoMaterials, setVideoMaterials] = useState<VideoMaterial[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [watchThresholdMet, setWatchThresholdMet] = useState(false);
  const [dailyClassCount, setDailyClassCount] = useState(0);
  const [autoCompleting, setAutoCompleting] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Auto-advance, Daily Limit, Gamification & Notes states
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [autoAdvanceTarget, setAutoAdvanceTarget] = useState<VideoWithProgress | null>(null);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [earnedCertId, setEarnedCertId] = useState<string | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [timeToMidnight, setTimeToMidnight] = useState('');

  const effectiveUserId = user?.id || 'demo-student-001';

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousBodyOverflow || '';
      document.documentElement.style.overflow = previousHtmlOverflow || '';
    };
  }, []);

  // Course resolution with immediate fallback to INITIAL_REAL_YOUTUBE_COURSES
  useEffect(() => {
    if (!courseId) return;

    let found = courses.find(c => c.id === courseId || (c as any).landing_slug === courseId);
    if (!found) {
      const fallback = INITIAL_REAL_YOUTUBE_COURSES.find(
        c => c.id === courseId || c.title.toLowerCase().includes(courseId.toLowerCase())
      );
      if (fallback) {
        const localProgress = getAllLocalProgressForUser(effectiveUserId);
        const videosWithProg: VideoWithProgress[] = fallback.videos.map((v, i) => {
          const lp = localProgress[v.id];
          return {
            ...v,
            progress: lp ? {
              id: `local-${v.id}`,
              user_id: effectiveUserId,
              video_id: v.id,
              watched_seconds: lp.watched_seconds,
              last_position: lp.last_position,
              progress_percent: lp.progress_percent,
              is_completed: lp.is_completed,
              created_at: lp.last_watched_at,
              last_watched_at: lp.last_watched_at,
            } : undefined,
            is_locked: i === 0 ? false : !localProgress[fallback.videos[i - 1]?.id]?.is_completed,
          };
        });

        const completedCount = videosWithProg.filter(v => v.progress?.is_completed).length;
        found = {
          ...fallback,
          videos: videosWithProg,
          total_videos: videosWithProg.length,
          completed_videos: completedCount,
          progress_percent: Math.round((completedCount / (videosWithProg.length || 1)) * 100),
          is_completed: completedCount === videosWithProg.length,
        };
      }
    }

    if (found) {
      setCourse(found);
      if (!selectedVideo || selectedVideo.course_id !== found.id) {
        const firstUnwatched = found.videos.find(v => !v.progress?.is_completed && !v.is_locked);
        setSelectedVideo(firstUnwatched || found.videos[0] || null);
      }
    }
  }, [courses, courseId, effectiveUserId]);

  useEffect(() => {
    if (!user || user.id.startsWith('demo-')) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    supabase
      .from('video_progress')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .gte('last_watched_at', today.toISOString())
      .then(({ count }) => setDailyClassCount(count || 0));
  }, [user]);

  useEffect(() => {
    if (selectedVideo) {
      supabase
        .from('video_materials')
        .select('*')
        .eq('video_id', selectedVideo.id)
        .order('order_index', { ascending: true })
        .then(({ data }) => setVideoMaterials((data || []) as VideoMaterial[]));
      setWatchThresholdMet(false);
    }
  }, [selectedVideo?.id]);

  const { updateProgress } = useVideoProgress(selectedVideo?.id || '');

  const handleVideoComplete = useCallback(() => {
    setWatchThresholdMet(true);
  }, []);

  // Auto mark complete when threshold met
  useEffect(() => {
    if (watchThresholdMet && !autoCompleting && selectedVideo && !selectedVideo.progress?.is_completed) {
      setAutoCompleting(true);
      markComplete().finally(() => setAutoCompleting(false));
    }
  }, [watchThresholdMet]);

  // Midnight countdown calculator for daily limits
  useEffect(() => {
    const updateMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = Math.max(0, midnight.getTime() - now.getTime());
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeToMidnight(`${hrs}h ${mins}m ${secs}s`);
    };
    updateMidnight();
    const interval = setInterval(updateMidnight, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load student note for active video
  useEffect(() => {
    if (course && selectedVideo) {
      const saved = localStorage.getItem(`ap_note_${course.id}_${selectedVideo.id}`) || '';
      setStudentNote(saved);
      setNoteSaved(false);
    }
  }, [course?.id, selectedVideo?.id]);

  // Handle saving personal note
  const handleSaveNote = () => {
    if (!course || !selectedVideo) return;
    localStorage.setItem(`ap_note_${course.id}_${selectedVideo.id}`, studentNote);
    setNoteSaved(true);
    toast.success(language === 'bn' ? 'নোট সফলভাবে সংরক্ষণ করা হয়েছে' : 'Note saved successfully');
    setTimeout(() => setNoteSaved(false), 2500);
  };

  // Cancelable Auto-Advance Countdown
  useEffect(() => {
    if (autoAdvanceCountdown === null) return;
    if (autoAdvanceCountdown <= 0) {
      if (autoAdvanceTarget) {
        setSelectedVideo(autoAdvanceTarget);
      }
      setAutoAdvanceCountdown(null);
      setAutoAdvanceTarget(null);
      return;
    }
    const timer = setTimeout(() => {
      setAutoAdvanceCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoAdvanceCountdown, autoAdvanceTarget]);

  const cancelAutoAdvance = () => {
    setAutoAdvanceCountdown(null);
    setAutoAdvanceTarget(null);
    toast.info(language === 'bn' ? 'পরবর্তী ক্লাসে যাওয়া বাতিল করা হয়েছে' : 'Auto-advance cancelled');
  };

  const triggerAutoAdvanceNow = () => {
    if (autoAdvanceTarget) {
      setSelectedVideo(autoAdvanceTarget);
    }
    setAutoAdvanceCountdown(null);
    setAutoAdvanceTarget(null);
  };

  const markComplete = async () => {
    if (!selectedVideo || !course) return;
    if (dailyClassCount >= 5) {
      setShowDailyLimitModal(true);
      return;
    }
    const result = await updateProgress(100);
    if (result?.error) {
      toast.error('Progress save failed');
      return;
    }
    toast.success('✅ ক্লাস সম্পন্ন!');
    setDailyClassCount(prev => prev + 1);

    const completedCount = course.videos.filter(v => v.progress?.is_completed || v.id === selectedVideo.id).length;
    if (completedCount === course.total_videos) {
      const certId = `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setEarnedCertId(certId);
      setShowCompletionModal(true);
      saveLocalCourseCompletion(effectiveUserId, course.id, certId, profile?.full_name || 'Student');

      if (user && !user.id.startsWith('demo-')) {
        try {
          const { data: existingCert } = await supabase
            .from('certificates')
            .select('certificate_id')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .maybeSingle();
          if (!existingCert) {
            await supabase.from('certificates').insert({
              certificate_id: certId, user_id: user.id, course_id: course.id,
              student_name: profile?.full_name || '', course_name: course.title,
            });
            await supabase.from('course_completions').insert({
              user_id: user.id, course_id: course.id, certificate_id: certId,
            });
          }
        } catch {}
      }
      toast.success('🎉 অভিনন্দন! কোর্স সম্পন্ন হয়েছে ও সার্টিফিকেট তৈরি হয়েছে');
    }
    refetch();
    const currentIdx = course.videos.findIndex(v => v.id === selectedVideo.id);
    if (currentIdx < course.videos.length - 1) {
      const nextVid = course.videos[currentIdx + 1];
      if (!nextVid.is_locked) {
        setAutoAdvanceTarget(nextVid);
        setAutoAdvanceCountdown(5);
      }
    }
  };

  const goToVideo = (video: VideoWithProgress) => {
    if (video.is_locked) {
      toast.error('আগের ক্লাসটি সম্পন্ন করুন');
      return;
    }
    setSelectedVideo(video);
  };

  const handleBack = () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/courses');
    }
  };

  const currentIndex = course?.videos.findIndex(v => v.id === selectedVideo?.id) ?? -1;
  const nextVideo = course?.videos[currentIndex + 1];
  const prevVideo = currentIndex > 0 ? course?.videos[currentIndex - 1] : null;
  const videoFrameHeight = isMobile
    ? 'min(56.25vw, 42dvh)'
    : 'min(calc((100vw - 20rem) * 0.5625), calc(100dvh - 11rem))';

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc': return <File className="w-4 h-4 text-blue-500" />;
      case 'note': return <StickyNote className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs text-muted-foreground">কোর্স লোড হচ্ছে...</p>
        <Button variant="outline" size="sm" onClick={handleBack} className="mt-2 text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> ফিরে যান
        </Button>
      </div>
    );
  }

  const LessonList = () => (
    <div className="divide-y divide-white/5" role="list">
      {course.videos.map((video, index) => {
        const isActive = video.id === selectedVideo?.id;
        const isComplete = video.progress?.is_completed;
        const isLocked = video.is_locked;
        return (
          <button
            key={video.id}
            onClick={() => goToVideo(video)}
            disabled={isLocked}
            role="listitem"
            aria-current={isActive ? 'true' : undefined}
            aria-label={`${video.title} - ${isComplete ? 'Completed' : isLocked ? 'Locked' : 'Available'}`}
            className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
              isActive ? 'bg-primary/10 border-l-2 border-primary'
              : isComplete ? 'hover:bg-emerald-500/5'
              : isLocked ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-white/5'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isActive ? 'bg-primary text-primary-foreground'
              : isComplete ? 'bg-emerald-500/20 text-emerald-400'
              : isLocked ? 'bg-white/10 text-white/30'
              : 'bg-white/10 text-white/60'
            }`}>
              {isLocked ? <Lock className="w-3.5 h-3.5" />
              : isComplete ? <CheckCircle className="w-3.5 h-3.5" />
              : isActive ? <Play className="w-3.5 h-3.5 fill-current" />
              : <PlayCircle className="w-3.5 h-3.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium leading-snug break-words whitespace-normal line-clamp-2 ${isActive ? 'text-primary' : isComplete ? 'text-emerald-400' : ''}`}>
                {video.title}
              </p>
              {video.duration_seconds > 0 && (
                <p className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {Math.floor(video.duration_seconds / 60)} min
                </p>
              )}
            </div>
            {isComplete && <Badge className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0 shrink-0">✓</Badge>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`fixed inset-0 h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 text-white flex flex-col ${language === 'bn' ? 'font-bengali' : ''}`}>
      {/* Top Bar - always visible */}
      <header className="h-12 md:h-14 border-b border-white/10 flex items-center px-3 md:px-4 gap-2 md:gap-3 shrink-0 bg-slate-900/80 backdrop-blur-sm z-30">
        <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 shrink-0 w-8 h-8 md:w-9 md:h-9" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-semibold truncate">{course.title}</p>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Badge variant="outline" className="text-[9px] md:text-[10px] border-white/20 text-white/60 px-1.5 md:px-2">
            {course.completed_videos}/{course.total_videos}
          </Badge>
          <Progress value={course.progress_percent} className="w-12 md:w-20 h-1.5" />
          <span className="text-[10px] md:text-xs font-bold text-emerald-400">{Math.round(course.progress_percent)}%</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Video Player - fixed, does not scroll */}
          <div
            className="relative w-full bg-black shrink-0 overflow-hidden [&>div]:!h-full [&>div]:!aspect-auto [&>div]:!rounded-none"
            style={{ height: videoFrameHeight }}
          >
            {selectedVideo && (
              <SecureVideoPlayer
                videoUrl={selectedVideo.video_url}
                videoType={selectedVideo.video_type}
                videoId={selectedVideo.id}
                userId={effectiveUserId}
                onComplete={handleVideoComplete}
                initialPosition={selectedVideo.progress?.last_position || 0}
                maxWatchedSeconds={selectedVideo.progress?.watched_seconds || 0}
                isLessonCompleted={!!selectedVideo.progress?.is_completed}
                posterUrl={course.thumbnail_url || undefined}
                autoPlay={false}
                onThresholdMet={() => setWatchThresholdMet(true)}
              />
            )}

            {!isMobile && (
              <Button
                variant="ghost" size="icon"
                className="absolute top-3 right-3 z-20 text-white/50 hover:text-white hover:bg-white/10"
                onClick={() => { setFocusMode(!focusMode); if (!focusMode) setSidebarOpen(false); else setSidebarOpen(true); }}
              >
                {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
          </div>

          {/* Below Video Content - scrolls independently */}
          <div className={`shrink-0 overflow-hidden p-3 md:p-6 space-y-3 md:space-y-4 bg-slate-950 ${focusMode && !isMobile ? 'hidden' : ''}`}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs text-white/40 mb-0.5">Class {currentIndex + 1} of {course.total_videos}</p>
                <h2 className="text-sm md:text-lg font-bold line-clamp-1">{selectedVideo?.title}</h2>
              </div>
              {selectedVideo?.progress?.is_completed && (
                <Badge className="bg-emerald-600 text-white gap-1 shrink-0">
                  <CheckCircle className="w-3 h-3" /> সম্পন্ন
                </Badge>
              )}
              {autoCompleting && (
                <Badge className="bg-primary/20 text-primary gap-1 shrink-0 animate-pulse">
                  <CheckCircle className="w-3 h-3" /> সেভ হচ্ছে...
                </Badge>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                  disabled={!prevVideo} onClick={() => prevVideo && goToVideo(prevVideo)}
                  title={prevVideo ? `Previous: ${prevVideo.title}` : 'No previous class'}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                  disabled={!nextVideo || nextVideo.is_locked} onClick={() => nextVideo && goToVideo(nextVideo)}
                  title={nextVideo ? `Next: ${nextVideo.title}` : 'No next class'}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {/* Lesson Feedback Thumbs */}
                <div className="flex items-center gap-0.5 border-l border-white/10 pl-1.5 ml-1">
                  <Button
                    variant="ghost" size="icon"
                    className={`h-7 w-7 hover:bg-white/10 ${feedback === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/40 hover:text-white'}`}
                    onClick={() => {
                      setFeedback('up');
                      toast.success(language === 'bn' ? 'ক্লাসটি পছন্দ করার জন্য ধন্যবাদ!' : 'Glad you enjoyed this class!');
                    }}
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className={`h-7 w-7 hover:bg-white/10 ${feedback === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-white/40 hover:text-white'}`}
                    onClick={() => {
                      setFeedback('down');
                      toast.info(language === 'bn' ? 'মতামত গৃহীত হয়েছে, আমরা মান উন্নত করার চেষ্টা করব।' : 'Feedback received.');
                    }}
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>


            {isMobile && (
              <Accordion type="single" collapsible className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                <AccordionItem value="syllabus" className="border-0">
                  <AccordionTrigger className="px-3 py-3 text-xs font-bold hover:no-underline hover:bg-white/5 text-white">
                    <span className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-primary" />
                      কোর্স সিলেবাস ({course.total_videos}টি ক্লাস)
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0 max-h-[calc(100dvh-360px)] overflow-y-auto">
                    <LessonList />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {videoMaterials.length > 0 && (
              <Accordion type="single" collapsible className="border border-white/10 rounded-xl overflow-hidden">
                <AccordionItem value="materials" className="border-0">
                  <AccordionTrigger className="px-3 md:px-4 py-3 text-xs md:text-sm font-semibold hover:no-underline hover:bg-white/5 text-white">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Materials ({videoMaterials.length})
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 space-y-2">
                    {videoMaterials.map((mat) => (
                      <div key={mat.id} className="flex items-center gap-3 p-2.5 md:p-3 bg-white/5 rounded-lg border border-white/10">
                        {getMaterialIcon(mat.material_type)}
                        <span className="text-xs md:text-sm flex-1 truncate">{mat.title}</span>
                        {mat.material_type === 'note' && mat.note_content ? (
                          <span className="text-xs text-white/50">Note</span>
                        ) : mat.material_url ? (
                          <div className="flex gap-2">
                            <a href={mat.material_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <a href={mat.material_url} download className="text-white/50 hover:text-white">
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {selectedVideo && (
              <Accordion type="single" collapsible className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                <AccordionItem value="comments" className="border-0">
                  <AccordionTrigger className="px-3 md:px-4 py-3 text-xs md:text-sm font-semibold hover:no-underline hover:bg-white/5 text-white">
                    <span className="flex items-center gap-2">
                      Discussion / আলোচনা
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4">
                    <LessonComments
                      videoId={selectedVideo.id}
                      courseId={course.id}
                      userId={effectiveUserId}
                      userName={profile?.full_name || user?.email?.split('@')[0] || 'Student'}
                      userAvatar={profile?.avatar_url || ''}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Personal Notes Scratchpad */}
            {selectedVideo && (
              <Accordion type="single" collapsible className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/50">
                <AccordionItem value="notes" className="border-0">
                  <AccordionTrigger className="px-3 md:px-4 py-3 text-xs md:text-sm font-semibold hover:no-underline hover:bg-white/5 text-white">
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-400" />
                      Study Notes / ব্যক্তিগত নোট
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 md:px-4 pb-3 md:pb-4 space-y-3">
                    <textarea
                      value={studentNote}
                      onChange={(e) => setStudentNote(e.target.value)}
                      placeholder={language === 'bn' ? 'এই ক্লাসের গুরুত্বপূর্ণ সূত্র, নোট ও পয়েন্ট এখানে লিখে রাখুন...' : 'Write your study notes and formulas for this lesson here...'}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-xs md:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 transition-colors resize-y"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/40">
                        {noteSaved ? '✓ সংরক্ষিত' : 'আপনার নোট ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকে'}
                      </span>
                      <Button
                        size="sm"
                        onClick={handleSaveNote}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 h-8"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {language === 'bn' ? 'নোট সংরক্ষণ করুন' : 'Save Note'}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        </div>


        {/* Right Sidebar - Desktop Only */}
        {!isMobile && !focusMode && (
          <aside className={`bg-slate-900 border-l border-white/10 transition-all duration-300 shrink-0 ${sidebarOpen ? 'w-72 md:w-80' : 'w-0 overflow-hidden'}`}>
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-sm font-bold">কোর্স সিলেবাস</h3>
                  <p className="text-[10px] text-white/40">{course.total_videos}টি ক্লাস</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400">{Math.round(course.progress_percent)}%</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white">
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
              <ScrollArea className="flex-1 min-h-0">
                <LessonList />
              </ScrollArea>
            </div>
          </aside>
        )}

        {/* Sidebar Toggle (desktop, collapsed) */}
        {!isMobile && !sidebarOpen && !focusMode && (
          <button onClick={() => setSidebarOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-slate-800 border border-white/10 rounded-l-lg p-2 text-white/60 hover:text-white hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cancelable Auto-Advance Floating Banner */}
      {autoAdvanceCountdown !== null && autoAdvanceTarget && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-primary/40 shadow-2xl backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 max-w-md w-[92vw] text-white animate-in slide-in-from-bottom duration-300">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            {autoAdvanceCountdown}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-primary font-semibold">
              {language === 'bn' ? 'পরবর্তী ক্লাস শুরু হচ্ছে...' : 'Next lesson starting...'}
            </p>
            <p className="text-xs font-bold truncate text-white">{autoAdvanceTarget.title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={triggerAutoAdvanceNow}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3"
            >
              {language === 'bn' ? 'এখনই দেখুন' : 'Play Now'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelAutoAdvance}
              className="border-white/20 text-white hover:bg-white/10 text-xs h-8 px-2.5"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {/* Daily Class Limit Modal */}
      {showDailyLimitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-white">
              {language === 'bn' ? 'আজকের জন্য ক্লাস লিমিট শেষ' : 'Daily Class Limit Reached'}
            </h3>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed">
              {language === 'bn'
                ? 'মানসম্মত শিক্ষা ও গভীর মনোযোগ নিশ্চিত করতে প্রতিদিন সর্বোচ্চ ৫টি ক্লাস সম্পন্ন করার নিয়ম রাখা হয়েছে। অতিরিক্ত চাপের পরিবর্তে নিয়মিত রিভিশন দিন।'
                : 'To ensure deep retention, the limit is 5 completed classes per day. Review your completed notes while waiting for tomorrow.'}
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[11px] text-white/50 block mb-1">
                {language === 'bn' ? 'পরবর্তী ক্লাস আনলক হতে বাকি' : 'Next classes unlock in'}
              </span>
              <span className="text-base font-mono font-bold text-emerald-400 tracking-wider">
                {timeToMidnight}
              </span>
            </div>
            <Button
              onClick={() => setShowDailyLimitModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9"
            >
              {language === 'bn' ? 'বুঝেছি / ঠিক আছে' : 'Got it'}
            </Button>
          </div>
        </div>
      )}

      {/* Course Completion Celebration Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-primary/20 rounded-full blur-3xl" />
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30 animate-pulse">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 100% Completed
              </span>
              <h3 className="text-lg md:text-xl font-serif font-bold text-white">
                {language === 'bn' ? 'দারুণ অর্জন! অভিনন্দন!' : 'Outstanding Achievement!'}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-white/70 leading-relaxed">
              {language === 'bn'
                ? `আপনি সফলভাবে "${course.title}" কোর্সটির সমস্ত ক্লাস সম্পন্ন করেছেন। আপনার প্রশংসাপত্র প্রস্তুত!`
                : `You have successfully finished all classes in "${course.title}". Your official certificate is ready!`}
            </p>
            {earnedCertId && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-white/40 block">Certificate ID</span>
                <span className="text-xs font-mono font-bold text-white">{earnedCertId}</span>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => {
                  setShowCompletionModal(false);
                  navigate('/student/certificates');
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9"
              >
                {language === 'bn' ? 'সার্টিফিকেট দেখুন' : 'View Certificate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCompletionModal(false)}
                className="border-white/20 text-white hover:bg-white/10 text-xs h-9"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
