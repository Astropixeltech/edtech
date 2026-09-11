import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  GraduationCap,
  Loader2,
  CheckCircle2,
  BookOpen,
  Clock,
  Video,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Course } from '@/types/lms';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { enrollLocalCourse } from '@/lib/localStorageData';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  userId?: string;
  userEmail?: string;
  userName?: string;
  onSuccess?: () => void;
  language?: 'en' | 'bn';
}

const translations = {
  en: {
    processing: 'Processing...',
    success: 'Enrollment successful! Welcome to the course.',
    error: 'Failed to complete enrollment.',
    free: 'Free',
    courseFee: 'Course Fee',
    enrollFree: 'Start Free Course Now',
    payNow: 'Proceed to Payment (Pay ৳',
    viewFullSyllabus: 'View Full Roadmap & Udemy Curriculum',
    curriculumOverview: 'Course Curriculum & Modules',
    instantAccessBypass: 'Start Instant Access (Testing / Direct Mode)',
    instantAccessDesc: 'If online payment gateway is currently in test mode or unavailable, you can start directly without delay.',
    lectures: 'Lessons',
    hours: 'Hours',
    guarantee: 'Full Lifetime Access • Practical Projects • Verified Certificate',
  },
  bn: {
    processing: 'প্রসেসিং...',
    success: 'এনরোলমেন্ট সফল হয়েছে! ক্লাসে আপনাকে স্বাগতম।',
    error: 'এনরোল সম্পন্ন করতে ব্যর্থ।',
    free: 'ফ্রি',
    courseFee: 'কোর্স ফি',
    enrollFree: 'এখনই ফ্রি কোর্স শুরু করুন',
    payNow: 'অনলাইনে ভর্তি নিশ্চিত করুন (৳',
    viewFullSyllabus: 'পূর্ণাঙ্গ রোডম্যাপ ও Udemy সিলেবাস দেখুন',
    curriculumOverview: 'কোর্স মডিউল ও সিলেবাস রূপরেখা',
    instantAccessBypass: 'সরাসরি ক্লাসরুমে প্রবেশ করুন (টেস্টিং মোড)',
    instantAccessDesc: 'অনলাইন পেমেন্ট গেটওয়ে টেস্ট মোডে থাকলে বা এরর দেখা দিলে কোনো বাধা ছাড়াই সরাসরি ক্লাস শুরু করুন।',
    lectures: 'টি লেকচার',
    hours: 'ঘন্টা',
    guarantee: 'লাইফটাইম অ্যাক্সেস • হ্যান্ডস-অন প্রজেক্ট • ভেরিফায়েড সার্টিফিকেট',
  }
};

export default function CourseEnrollmentModal({
  isOpen,
  onClose,
  course,
  userId,
  userEmail,
  userName,
  onSuccess,
  language
}: CourseEnrollmentModalProps) {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language: ctxLang } = useLanguage();

  const effectiveLang: 'en' | 'bn' = (language || ctxLang || 'bn') as 'en' | 'bn';
  const effectiveUserId = userId || user?.id || 'demo-student-001';
  const effectiveEmail = userEmail || profile?.email || user?.email || 'student@astropixel.online';
  const effectiveName = userName || profile?.full_name || 'Student';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [gatewayFailed, setGatewayFailed] = useState(false);

  const t = translations[effectiveLang] || translations.bn;
  const isBn = effectiveLang === 'bn';

  if (!course) return null;

  const coursePrice = course.price || 0;
  const isFree = coursePrice === 0;
  const courseKey = (course as any).landing_slug || (course as any).slug || course.id;

  // Fallback module structure if not seeded
  const modules = (course as any).modules || [
    { id: 'm1', title: isBn ? 'মডিউল ০১: প্রাথমিক পরিচিতি ও টুলস সেটআপ' : 'Module 01: Orientation & Setup', lessons_count: 5, duration: '২ ঘন্টা' },
    { id: 'm2', title: isBn ? 'মডিউল ০২: কোর কনসেপ্ট ও রিয়েল-ওয়ার্ল্ড প্রজেক্ট' : 'Module 02: Core Skills & Hands-on Project', lessons_count: 8, duration: '৪ ঘন্টা' },
    { id: 'm3', title: isBn ? 'মডিউল ০৩: অ্যাডভান্সড টেকনিক ও ইন্ডাস্ট্রি ওয়ার্কফ্লো' : 'Module 03: Advanced Industry Workflow', lessons_count: 6, duration: '৩ ঘন্টা' },
    { id: 'm4', title: isBn ? 'মডিউল ০৪: ফাইনাল প্রজেক্ট, পোর্টফোলিও ও সার্টিফিকেট' : 'Module 04: Final Portfolio & Certificate', lessons_count: 5, duration: '২ ঘন্টা' },
  ];

  const outcomes = (course as any).learning_outcomes || [
    isBn ? 'বাস্তব প্রজেক্টভিত্তিক হ্যান্ডস-অন স্কিল' : 'Real-world practical project skills',
    isBn ? 'ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কোডিং ও ডিজাইন রুলস' : 'Industry-standard practices & guidelines',
    isBn ? 'ক্যারিয়ার ও ফ্রিল্যান্সিং পোর্টফোলিও গাইডলাইন' : 'Freelancing & career portfolio guidance',
  ];

  const handleInstantEnroll = async () => {
    setIsSubmitting(true);
    try {
      // 1. Instantly save to local storage
      enrollLocalCourse(effectiveUserId, course.id);

      // 2. If authenticated user, also sync to Supabase student_courses
      if (user?.id && !user.id.startsWith('demo-')) {
        try {
          const { data: existingCourse } = await supabase
            .from('student_courses')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_id', course.id)
            .maybeSingle();

          if (!existingCourse) {
            await supabase.from('student_courses').insert({
              user_id: user.id,
              course_id: course.id,
              is_active: true,
            });
          }
        } catch (dbErr) {
          console.warn('Supabase enrollment sync note:', dbErr);
        }
      }

      toast.success(t.success);
      if (onSuccess) onSuccess();
      onClose();

      // Route immediately into the learning dashboard / player
      navigate(`/student/course/${course.id}`);
    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUddoktaPayCheckout = async () => {
    setIsRedirecting(true);
    setGatewayFailed(false);

    try {
      const baseUrl = window.location.origin;
      const { data, error } = await supabase.functions.invoke('uddoktapay-checkout', {
        body: {
          full_name: effectiveName,
          email: effectiveEmail,
          amount: course.price,
          metadata: {
            course_id: course.id,
            user_id: effectiveUserId,
            student_name: effectiveName,
            student_email: effectiveEmail,
            course_name: course.title,
          },
          redirect_url: `${baseUrl}/payment/callback?type=course`,
          success_url: `${baseUrl}/payment/callback?type=course`,
          fail_url: `${baseUrl}/payment/cancel`,
          cancel_url: `${baseUrl}/payment/cancel`,
        },
      });

      if (error || !data?.success || !data?.payment_url) {
        console.warn('UddoktaPay gateway response:', { error, data });
        setGatewayFailed(true);
        setIsRedirecting(false);
        toast.error(
          isBn 
            ? 'পেমেন্ট গেটওয়ে কনফিগার করা নেই। নিচে টেস্ট মোডে সরাসরি ক্লাস শুরু করুন!'
            : 'Payment gateway unavailable. You can start directly using Instant Access below!'
        );
        return;
      }

      // Redirect to UddoktaPay payment page
      window.location.href = data.payment_url;
    } catch (err) {
      console.error('UddoktaPay checkout error:', err);
      setGatewayFailed(true);
      setIsRedirecting(false);
      toast.error(
        isBn 
          ? 'পেমেন্ট গেটওয়ে এরর। নিচে সরাসরি অ্যাক্সেস অপশন ব্যবহার করুন।' 
          : 'Payment gateway error. Please use instant access below.'
      );
    }
  };

  const handleViewFullRoadmap = () => {
    onClose();
    navigate(`/courses/${courseKey}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 rounded-3xl border border-emerald-500/20 shadow-2xl bg-white dark:bg-slate-950 max-h-[92vh] flex flex-col">
        
        {/* Header: Clean Astropixel Emerald Gradient */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                    {course.category || (isBn ? 'প্রফেশনাল কোর্স' : 'Professional Course')}
                  </span>
                  {(course as any).duration && (
                    <span className="text-[11px] text-white/80 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(course as any).duration}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
                  {course.title}
                </DialogTitle>
                <DialogDescription className="text-white/80 text-xs mt-1">
                  {isBn ? 'ইন্ডাস্ট্রি-স্ট্যান্ডার্ড কারিকুলাম ও রোডম্যাপ ওভারভিউ' : 'Industry-standard curriculum & roadmap overview'}
                </DialogDescription>
              </div>
            </div>

            {/* Price Badge */}
            <div className="text-right shrink-0 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
              <div className="text-[11px] text-white/80 font-medium">{t.courseFee}</div>
              <div className="text-xl font-black text-white">
                {isFree ? t.free : `৳${coursePrice.toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-100">

          {/* Key Outcomes / Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {outcomes.slice(0, 3).map((outcome: string, idx: number) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-medium text-emerald-900 dark:text-emerald-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="line-clamp-2">{outcome}</span>
              </div>
            ))}
          </div>

          {/* Udemy-style Modules Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.curriculumOverview}
                </h4>
              </div>
              <button 
                onClick={handleViewFullRoadmap}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 transition-colors"
              >
                <span>{t.viewFullSyllabus}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-emerald-100/70 dark:divide-emerald-900/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
              {modules.slice(0, 4).map((mod: any, i: number) => (
                <div key={mod.id || i} className="p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">
                        {mod.title}
                      </p>
                      {mod.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
                    {mod.lessons_count && (
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3 text-emerald-500" />
                        {mod.lessons_count} {t.lectures}
                      </span>
                    )}
                    {mod.duration && (
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
                    )}
                    {mod.duration && (
                      <span className="hidden sm:inline">{mod.duration}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFullRoadmap}
              className="w-full h-9 rounded-xl border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold gap-2"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isBn ? "কোর্স রোডম্যাপ, ট্রেইনার ও ভিডিও প্রিভিউ দেখুন (Udemy Layout)" : "Explore Full Udemy Layout & Roadmap"}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Button>
          </div>

          {/* Action / Payment Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {isFree ? (
              /* Free Course Enroll Button */
              <Button
                onClick={handleInstantEnroll}
                disabled={isSubmitting}
                className="w-full h-12 text-sm sm:text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {t.enrollFree}
                  </>
                )}
              </Button>
            ) : (
              /* Paid Course Primary + Fallback Actions */
              <div className="space-y-3">
                {/* Main Online Checkout */}
                <Button
                  onClick={handleUddoktaPayCheckout}
                  disabled={isRedirecting || isSubmitting}
                  className="w-full h-12 text-sm sm:text-base font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {isRedirecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{translations[effectiveLang].redirecting}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-emerald-200" />
                      <span>{t.payNow}{coursePrice.toLocaleString()})</span>
                    </>
                  )}
                </Button>

                {/* Instant Access Bypass Card (Visible anytime, or emphasized if gateway fails) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  gatewayFailed 
                    ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50' 
                    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                        {t.instantAccessBypass}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal mb-2.5">
                        {t.instantAccessDesc}
                      </p>
                      <Button
                        size="sm"
                        onClick={handleInstantEnroll}
                        disabled={isSubmitting}
                        className="h-8 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-bold gap-1.5 shadow-sm"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                        )}
                        <span>{isBn ? "টেস্টিং মোডে সরাসরি ক্লাস শুরু করুন" : "Start Testing Mode Access"}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guarantee Tagline */}
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.guarantee}</span>
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
