import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useStudentCourses } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  BookOpen, CheckCircle, LogOut, Award, PlayCircle, User, Sun, Moon, Languages,
  GraduationCap, Sparkles, CreditCard, IdCard, TrendingUp, Home, Search, Calendar, Clock, Lock, Play, Bell,
  Flame, Star
} from 'lucide-react';
import { CourseWithProgress, Course } from '@/types/lms';
import { useTheme } from 'next-themes';
import StudentIDCard from '@/components/student/StudentIDCard';
import ProfilePhotoUpload from '@/components/student/ProfilePhotoUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CourseEnrollmentModal from '@/components/student/CourseEnrollmentModal';
import StudentLiveClassesTab from '@/components/student/StudentLiveClassesTab';
import { Video as VideoIcon } from 'lucide-react';
import learnLogoAssetJson from '@/assets/learn-with-alphazero-logo.png.asset.json';
const learnLogo = learnLogoAssetJson.url;
import StudentNoticesTab from '@/components/student/StudentNoticesTab';
import StudentRecordedClassesTab from '@/components/student/StudentRecordedClassesTab';
import { Folder } from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile, signOut, isLoading: authLoading, refreshProfile } = useAuth();
  const { courses, isLoading, refetch } = useStudentCourses();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('courses');
  const [profileName, setProfileName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [enrollmentRequests, setEnrollmentRequests] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedEnrollCourse, setSelectedEnrollCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  // Gamification: Streak and XP
  const [learningStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('ap_learning_streak') || '4', 10);
    } catch {
      return 4;
    }
  });

  const totalCompletedClasses = courses.reduce((acc, c) => acc + (c.completed_videos || 0), 0);
  const totalCompletedCourses = courses.filter(c => c.is_completed).length;
  const totalXp = (totalCompletedClasses * 15) + (totalCompletedCourses * 150) + 120;
  const studentLevel = totalXp > 600
    ? (language === 'bn' ? 'লেভেল ৩ • স্কলার' : 'Level 3 • Scholar')
    : totalXp > 250
    ? (language === 'bn' ? 'লেভেল ২ • লার্নার' : 'Level 2 • Apprentice')
    : (language === 'bn' ? 'লেভেল ১ • শিক্ষার্থী' : 'Level 1 • Novice');

  useEffect(() => {
    if (!authLoading && !user) { navigate('/student/login'); return; }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) { setProfileName(profile.full_name); }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'explore' && user) { fetchAllCourses(); fetchEnrollmentRequests(); }
  }, [activeTab, user]);

  const fetchAllCourses = async () => {
    setLoadingCourses(true);
    const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('title');
    setAllCourses((data || []) as Course[]);
    setLoadingCourses(false);
  };

  const fetchEnrollmentRequests = async () => {
    if (!user) return;
    const { data } = await supabase.from('enrollment_requests').select('*').eq('user_id', user.id);
    setEnrollmentRequests(data || []);
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  const openCourseViewer = (course: CourseWithProgress) => {
    navigate(`/student/course/${course.id}`);
  };

  const updateProfile = async () => {
    if (!user || !profile) return;
    setUpdatingProfile(true);
    const { error } = await supabase.from('profiles').update({ full_name: profileName }).eq('id', profile.id);
    if (!error) { toast.success(t('profile.updateSuccess')); await refreshProfile(); }
    else toast.error('Error updating profile');
    setUpdatingProfile(false);
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) { toast.error(t('profile.passwordMismatch')); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) { toast.success(t('profile.passwordSuccess')); setNewPassword(''); setConfirmPassword(''); }
    else toast.error(error.message);
  };

  const isEnrolled = (courseId: string) => courses.some(c => c.id === courseId);
  const getEnrollmentStatus = (courseId: string) => enrollmentRequests.find(r => r.course_id === courseId)?.status;

  // Overall progress
  const overallProgress = courses.length > 0
    ? Math.round(courses.reduce((a, c) => a + c.progress_percent, 0) / courses.length)
    : 0;

  // Continue watching - last active course that's not completed
  const continueWatching = courses.find(c => !c.is_completed && c.progress_percent > 0);

  const navItems = [
    { id: 'courses', icon: BookOpen, label: language === 'bn' ? 'আমার কোর্স' : 'My Courses' },
    { id: 'live', icon: VideoIcon, label: language === 'bn' ? 'লাইভ ক্লাস' : 'Live Class' },
    { id: 'notices', icon: Bell, label: language === 'bn' ? 'নোটিশ' : 'Notices' },
    { id: 'recorded', icon: Folder, label: language === 'bn' ? 'রেকর্ডেড' : 'Recorded' },
    { id: 'explore', icon: Search, label: language === 'bn' ? 'নতুন কোর্স ব্রাউজ' : 'Browse New Courses' },
    { id: 'certificates', icon: Award, label: language === 'bn' ? 'সনদ' : 'Certificates' },
    { id: 'id-card', icon: IdCard, label: language === 'bn' ? 'আইডি' : 'ID Card' },
    { id: 'profile', icon: User, label: language === 'bn' ? 'প্রোফাইল' : 'Profile' },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${language === 'bn' ? 'font-bengali' : ''}`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-3 top-3 bottom-3 md:w-52 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 shadow-xl shadow-black/5 z-50 flex-col overflow-hidden">
        <div className="p-3 border-b border-border/50 space-y-3">
          <div className="flex items-center gap-2">
            <img src={learnLogo} alt="Learn with Astropixel" className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
            <div>
              <p className="text-[10px] text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-cyan-600 text-white text-[10px] font-bold">{profile?.full_name?.charAt(0) || 'S'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile?.full_name}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Student
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'certificates') navigate('/my-certificates');
                else setActiveTab(item.id);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-primary to-cyan-600 text-white shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/80'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === item.id ? '' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.id === 'live' && (
                <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-auto" />
              )}
              {item.id === 'notices' && (
                <span className="inline-flex text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold ml-auto">
                  New
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-2 border-t border-border/50 space-y-1.5">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium bg-secondary hover:bg-secondary/80 text-muted-foreground">
            <Home className="w-4 h-4" /><span>Home</span>
          </button>

          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24 md:pl-60 md:pr-6 md:py-6 min-h-screen">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Mobile Top Header */}
          <div className="md:hidden flex items-center justify-between pb-3 mb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <img src={learnLogo} alt="Learn with Astropixel" className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold">{profile?.full_name?.split(' ')[0]}</span>
              <Avatar className="w-8 h-8 border border-primary/20 cursor-pointer" onClick={() => setActiveTab('profile')}>
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-[10px] bg-primary text-white">{profile?.full_name?.charAt(0) || 'S'}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Tab: My Courses */}
          {activeTab === 'courses' && (
            <>
              {/* Gamification & Streak Banner */}
              <div className="bg-gradient-to-r from-primary/10 via-amber-500/10 to-cyan-500/10 border border-primary/25 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5 fill-current animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm">{learningStreak} Day Study Streak</span>
                      <span className="text-xs">🔥</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {language === 'bn' ? 'প্রতিদিনের নিয়মিত পড়াশোনা চালিয়ে যান!' : 'Keep up the daily study streak to build deep mastery!'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-border/60">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{totalXp} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-border/60">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    <span>{studentLevel}</span>
                  </div>
                </div>
              </div>

              {/* Overall Progress + Continue Watching Hero */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Progress Ring */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-5 shadow-lg shadow-black/5 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                      <circle
                        cx="60" cy="60" r="52" fill="none" strokeWidth="8"
                        strokeLinecap="round"
                        className="text-primary"
                        strokeDasharray={`${(overallProgress / 100) * 327} 327`}
                        style={{ transition: 'stroke-dasharray 0.8s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{overallProgress}%</span>
                      <span className="text-[10px] text-muted-foreground">Overall</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{courses.filter(c => c.is_completed).length}/{courses.length} courses done</p>
                </div>

                {/* Continue Watching */}
                {continueWatching ? (
                  <div
                    className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-black/5 cursor-pointer group hover:border-primary/30 transition-all"
                    onClick={() => openCourseViewer(continueWatching)}
                  >
                    <div className="flex h-full">
                      <div className="w-40 md:w-56 shrink-0 relative overflow-hidden">
                        {continueWatching.thumbnail_url ? (
                          <img src={continueWatching.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 p-5 flex flex-col justify-center">
                        <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-1">▶ Continue Watching</p>
                        <h3 className="text-lg font-bold line-clamp-1 mb-1">{continueWatching.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {continueWatching.completed_videos}/{continueWatching.total_videos} classes done
                        </p>
                        <Progress value={continueWatching.progress_percent} className="h-2" />
                        <p className="text-right text-xs font-bold text-primary mt-1">{Math.round(continueWatching.progress_percent)}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-8 shadow-lg shadow-black/5 flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary/30 mb-2" />
                    <p className="text-sm font-semibold">Ready to learn?</p>
                    <p className="text-xs text-muted-foreground">Start a course to see your progress here</p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Enrolled', value: courses.length, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Completed', value: courses.filter(c => c.is_completed).length, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
                  { label: 'Classes', value: courses.reduce((a, c) => a + c.total_videos, 0), icon: PlayCircle, color: 'from-orange-500 to-amber-500' },
                  { label: 'Certificates', value: courses.filter(c => c.is_completed).length, icon: Award, color: 'from-purple-500 to-pink-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-4 shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Courses Header & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {language === 'bn' ? 'আমার কোর্সসমূহ' : 'My Enrolled Courses'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {courses.length} {language === 'bn' ? 'টি কোর্সে অন্তর্ভুক্ত' : 'active courses'}
                  </p>
                </div>

                {courses.length > 0 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={language === 'bn' ? 'কোর্স খুঁজুন...' : 'Search courses...'}
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      className="h-9 pl-9 pr-8 text-xs rounded-full bg-white dark:bg-slate-900 border-border/50 shadow-sm"
                    />
                    {courseSearch && (
                      <button
                        onClick={() => setCourseSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Courses Grid */}
              {courses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-border p-12 text-center">
                  <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{t('student.noCourses')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('student.noCoursesDesc')}</p>
                  <Button size="sm" onClick={() => setActiveTab('explore')} className="gap-2">
                    <Search className="w-4 h-4" /> Browse Courses
                  </Button>
                </div>
              ) : courses.filter(c => !courseSearch.trim() || c.title.toLowerCase().includes(courseSearch.toLowerCase())).length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-border p-8 text-center">
                  <p className="text-sm font-semibold mb-1">
                    {language === 'bn' ? 'কোনো কোর্স মেলেনি' : 'No matching courses found'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    "{courseSearch}" {language === 'bn' ? 'এর জন্য কোনো কোর্স নেই' : 'did not match any of your courses'}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setCourseSearch('')} className="rounded-full text-xs">
                    {language === 'bn' ? 'ফিল্টার মুছুন' : 'Clear Search'}
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses
                    .filter(c => !courseSearch.trim() || c.title.toLowerCase().includes(courseSearch.toLowerCase()))
                    .map((course) => (
                    <div
                      key={course.id}
                      onClick={() => openCourseViewer(course)}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="aspect-video bg-secondary relative overflow-hidden">
                        {course.thumbnail_url ? (
                          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {course.is_completed && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-emerald-500 text-white text-[10px]">
                              <CheckCircle className="w-3 h-3 mr-1" /> Done
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center justify-between">
                            <span className="text-[10px] text-white">{course.completed_videos}/{course.total_videos}</span>
                            <span className="text-[10px] font-bold text-white">{Math.round(course.progress_percent)}%</span>
                          </div>
                        </div>
                        {/* Hover play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1 mb-2">{course.title}</h3>
                        <Progress value={course.progress_percent} className="h-1.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: Explore */}
          {activeTab === 'explore' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-5 shadow-lg shadow-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold">{t('enroll.title')}</h2>
                    <p className="text-xs text-muted-foreground">{t('enroll.desc')}</p>
                  </div>
                </div>
              </div>

              {loadingCourses ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
              ) : allCourses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-border p-12 text-center">
                  <GraduationCap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t('enroll.noCourses')}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {allCourses.map((course) => {
                    const enrolled = isEnrolled(course.id);
                    const status = getEnrollmentStatus(course.id);
                    return (
                      <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-black/5">
                        <div className="aspect-video bg-secondary relative">
                          {course.thumbnail_url ? (
                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-semibold text-sm line-clamp-1">{course.title}</h3>
                          {course.description && <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>}
                          {enrolled ? (
                            <Badge variant="outline" className="w-full justify-center text-xs py-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20">
                              <CheckCircle className="w-3 h-3 mr-1" /> Enrolled
                            </Badge>
                          ) : status === 'pending' ? (
                            <Badge variant="secondary" className="w-full justify-center text-xs py-1.5">
                              <Clock className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                          ) : (
                            <Button size="sm" className="w-full text-xs h-8 gap-1" onClick={() => { setSelectedEnrollCourse(course); setShowEnrollmentModal(true); }}>
                              <CreditCard className="w-3 h-3" />
                              {language === 'bn' ? 'এনরোল করুন' : 'Enroll Now'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Live Class */}
          {activeTab === 'live' && (
            <StudentLiveClassesTab language={language as 'en' | 'bn'} />
          )}

          {/* Tab: ID Card */}
          {activeTab === 'id-card' && profile && (
            <div className="max-w-lg mx-auto">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-5 shadow-lg shadow-black/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center">
                    <IdCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold">Student ID Card</h2>
                    <p className="text-xs text-muted-foreground">Download your official ID</p>
                  </div>
                </div>
                <StudentIDCard profile={profile} />
              </div>
            </div>
          )}

          {/* Tab: Notices */}
          {activeTab === 'notices' && (
            <div className="max-w-4xl mx-auto">
              <StudentNoticesTab language={language as 'en' | 'bn'} />
            </div>
          )}

          {/* Tab: Recorded Classes */}
          {activeTab === 'recorded' && (
            <div className="max-w-5xl mx-auto">
              <StudentRecordedClassesTab language={language as 'en' | 'bn'} />
            </div>
          )}

          {/* Tab: Profile */}
          {activeTab === 'profile' && profile && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 overflow-hidden shadow-lg shadow-black/5">
                <div className="h-20 bg-gradient-to-r from-primary via-cyan-600 to-primary" />
                <div className="px-5 pb-5 -mt-10">
                  <ProfilePhotoUpload profile={profile} onPhotoUpdated={() => refreshProfile()} />
                  <div className="text-center mt-3">
                    <h2 className="font-bold text-lg">{profile.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-4 shadow-lg shadow-black/5 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Edit Profile</h3>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('profile.fullName')}</Label>
                    <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('profile.email')}</Label>
                    <Input value={profile.email || ''} disabled className="h-9 text-sm" />
                  </div>
                  <Button size="sm" className="w-full" onClick={updateProfile} disabled={updatingProfile}>{t('profile.updateProfile')}</Button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-4 shadow-lg shadow-black/5 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> {t('profile.changePassword')}</h3>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('profile.newPassword')}</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('profile.confirmPassword')}</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-9 text-sm" />
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={changePassword} disabled={!newPassword || !confirmPassword}>{t('profile.changePassword')}</Button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border/50 p-4 shadow-lg shadow-black/5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-primary" /> Your Progress</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Enrolled', value: courses.length },
                    { label: 'Completed', value: courses.filter(c => c.is_completed).length },
                    { label: 'Watched', value: courses.reduce((a, c) => a + c.completed_videos, 0) },
                    { label: 'Certs', value: courses.filter(c => c.is_completed).length },
                  ].map((s) => (
                    <div key={s.label} className="text-center p-2 bg-secondary rounded-xl">
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                {profile.created_at && (
                  <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-2 left-2 right-2 z-50 bg-white/95 dark:bg-slate-900/95 border border-border/60 rounded-2xl p-1 shadow-2xl backdrop-blur-xl flex items-center justify-around">
        {[
          { id: 'courses', icon: BookOpen, label: language === 'bn' ? 'কোর্স' : 'Courses' },
          { id: 'live', icon: VideoIcon, label: language === 'bn' ? 'লাইভ' : 'Live', badge: 'dot' },
          { id: 'explore', icon: Search, label: language === 'bn' ? 'ব্রাউজ' : 'Explore' },
          { id: 'notices', icon: Bell, label: language === 'bn' ? 'নোটিশ' : 'Notices', badge: 'new' },
          { id: 'profile', icon: User, label: language === 'bn' ? 'প্রোফাইল' : 'Profile' },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <item.icon className="w-4 h-4" />
                {item.badge === 'dot' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {item.badge === 'new' && (
                  <span className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Course Enrollment Modal */}
      <CourseEnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => { setShowEnrollmentModal(false); setSelectedEnrollCourse(null); }}
        course={selectedEnrollCourse}
        userId={user?.id || ''}
        userEmail={profile?.email || ''}
        userName={profile?.full_name || ''}
        onSuccess={() => fetchEnrollmentRequests()}
        language={language as 'en' | 'bn'}
      />
    </div>
  );
}
