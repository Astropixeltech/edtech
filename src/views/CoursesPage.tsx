import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Star, Sparkles, Loader2, ArrowRight, CheckCircle2, 
  Code, Palette, Video, Camera, TrendingUp, Monitor, Bot, Wrench, Clock, Users,
  GraduationCap, Award, ShieldCheck, Play, ChevronLeft, ChevronRight,
  Atom, FlaskConical, Calculator, Compass, Stethoscope, Trophy
} from "lucide-react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { usePageContent } from "@/hooks/usePageContent";
import CourseEnrollmentModal from "@/components/student/CourseEnrollmentModal";
import { Course } from "@/types/lms";
import { supabase } from "@/integrations/supabase/client";

const toBengaliDigits = (val: number | string): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(val).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
};

import StatCard from "@/components/StatCard";
import CategoryCard from "@/components/CategoryCard";
import EdgeCourseCard from "@/components/EdgeCourseCard";
import HorizontalScroller from "@/components/ui/HorizontalScroller";
import HomePageSkeleton from "@/components/skeletons/HomePageSkeleton";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { TeamSection } from "@/components/ui/team";
import { DEFAULT_HERO_SLIDES, HeroSlide } from "@/types/banners";

export default function CoursesPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { user } = useAuth();
  const location = useLocation();

  const { getContent } = usePageContent("courses", "learn");
  const { courses, isLoading: coursesLoading } = usePublicCourses();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Dynamic instructors and teacher count synchronization with Admin Panel
  const [instructorsList, setInstructorsList] = useState<any[]>([]);
  const [teacherCount, setTeacherCount] = useState<number>(0);

  const instructorTeamMembers = useMemo(() => {
    return instructorsList.map((t) => ({
      image: t.image || t.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
      name: t.name,
      role: isBn ? (t.qualificationBn || t.roleTag || t.role) : (t.qualificationEn || t.roleTag || t.role),
    }));
  }, [instructorsList, isBn]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // 1. Fetch custom instructors from page_content (instructors_list_json) or localStorage
        let customInstructors: any[] | null = null;
        const { data: pageData } = await supabase
          .from('page_content')
          .select('content_en')
          .eq('page_name', 'home')
          .eq('content_key', 'instructors_list_json')
          .maybeSingle();

        if (pageData?.content_en) {
          try {
            const parsed = JSON.parse(pageData.content_en);
            if (Array.isArray(parsed) && parsed.length > 0) customInstructors = parsed;
          } catch {}
        }

        if (!customInstructors && typeof window !== 'undefined') {
          const local = localStorage.getItem('instructors_list_json');
          if (local) {
            try {
              const parsed = JSON.parse(local);
              if (Array.isArray(parsed) && parsed.length > 0) customInstructors = parsed;
            } catch {}
          }
        }

        // 2. Query total teachers count from profiles (is_teacher = true) to match Admin Panel
        const { count: dbTeacherCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('is_teacher', true);

        if (!alive) return;

        if (customInstructors && customInstructors.length > 0) {
          setInstructorsList(customInstructors);
        } else {
          setInstructorsList([]);
        }

        // Synchronize count: matching the teachers registered/approved in Admin Panel or configured list
        const total = Math.max(dbTeacherCount || 0, customInstructors?.length || 0);
        setTeacherCount(total);
      } catch (e) {
        console.warn('Teacher sync info:', e);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Dynamic banner slides loaded from Admin Panel / CMS / LocalStorage with full real-time control
  const [bannerSlides, setBannerSlides] = useState<HeroSlide[]>(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("hero_banners_json");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_HERO_SLIDES;
  });

  useEffect(() => {
    let alive = true;
    const fetchBanners = async () => {
      try {
        // 1. Check Supabase page_content
        const { data } = await supabase
          .from('page_content')
          .select('content_en')
          .eq('content_key', 'hero_banners_json')
          .maybeSingle();

        if (data?.content_en && alive) {
          const parsed = JSON.parse(data.content_en);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBannerSlides(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Error fetching hero banners from DB:', e);
      }

      // 2. Check localStorage
      if (typeof window !== 'undefined') {
        const local = localStorage.getItem('hero_banners_json');
        if (local && alive) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBannerSlides(parsed);
              return;
            }
          } catch {}
        }
      }

      // 3. Default to initial admin slides
      if (alive) {
        setBannerSlides(DEFAULT_HERO_SLIDES);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('hero_banners_json', JSON.stringify(DEFAULT_HERO_SLIDES));
          } catch {}
        }
      }
    };

    fetchBanners();

    // Listen for real-time changes from Admin Panel
    const handleBannerUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail) && e.detail.length > 0) {
        setBannerSlides(e.detail);
      } else {
        fetchBanners();
      }
    };

    window.addEventListener('hero-banners-updated', handleBannerUpdate);
    window.addEventListener('storage', fetchBanners);

    return () => {
      alive = false;
      window.removeEventListener('hero-banners-updated', handleBannerUpdate);
      window.removeEventListener('storage', fetchBanners);
    };
  }, []);

  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Dynamic reviews loaded from database / CMS
  const studentReviews = useMemo(() => {
    const cmsReviews = getContent("student_reviews_json");
    if (cmsReviews) {
      try {
        const parsed = JSON.parse(cmsReviews);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const local = typeof window !== "undefined" ? localStorage.getItem("ap_homepage_testimonials") : null;
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  }, [getContent]);

  // Auto-rotate hero banner slider every 7 seconds, pausing on hover
  useEffect(() => {
    if (!bannerSlides || bannerSlides.length <= 1 || isSliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [bannerSlides, isSliderPaused]);

  const currentHero = bannerSlides && bannerSlides.length > 0 
    ? (bannerSlides[currentSlide % bannerSlides.length] || bannerSlides[0]) 
    : null;

  const categories = useMemo(() => [
    { id: "all", label: isBn ? "সব কোর্স" : "All Courses", match: null },
    { id: "hsc", label: isBn ? "এইচএসসি বিজ্ঞান" : "HSC Science", match: /hsc|এইচএসসি|পদার্থ|রসায়ন|উচ্চতর গণিত|বিজ্ঞান|science|physics|chemistry|math/i },
    { id: "admission", label: isBn ? "বিশ্ববিদ্যালয় ভর্তি" : "Varsity Admission", match: /admission|ভর্তি|buet|বুয়েট|মেডিকেল|medical|varsity|ভার্সিটি|ইঞ্জিনিয়ারিং|engineering/i },
    { id: "ssc", label: isBn ? "এসএসসি ৯-১০" : "SSC 9-10", match: /ssc|এসএসসি|class 9|class 10|৯ম|১০ম|মাধ্যমিক/i },
    { id: "olympiad", label: isBn ? "অলিম্পিয়াড ও স্পেশাল" : "Olympiads & Special", match: /olympiad|অলিম্পিয়াড|math olympiad|physics olympiad|biology/i },
    { id: "ict_english", label: isBn ? "আইসিটি ও ইংরেজি" : "ICT & English", match: /ict|আইসিটি|english|ইংরেজি|grammar|communication/i },
  ], [isBn]);

  const filteredCourses = useMemo(() => {
    const cat = categories.find((c) => c.id === activeCategory);
    if (!cat || !cat.match) return courses;
    return courses.filter((c) => {
      const title = `${c.title || ""} ${(c as any).titleBn || ""} ${(c as any).titleEn || ""}`;
      return cat.match!.test(title);
    });
  }, [courses, activeCategory, categories]);

  const handleEnrollClick = (course: Course) => {
    if (!user) {
      toast.info(isBn ? "এনরোল করতে আগে লগইন করুন" : "Please login first to enroll");
      window.location.href = "/login";
      return;
    }
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  if (coursesLoading && (!courses || courses.length === 0)) {
    return (
      <Layout flushTop={true}>
        <HomePageSkeleton />
      </Layout>
    );
  }

  return (
    <Layout flushTop={true}>
      <Helmet>
        <title>{isBn ? "Astropixel Learn — সেরা অনলাইন লার্নিং প্ল্যাটফর্ম" : "Astropixel Learn — Premier Online Learning Platform"}</title>
        <meta
          name="description"
          content={
            isBn
              ? "Astropixel Learn — স্কুল, কলেজ, স্কিল ও ভর্তি পরীক্ষার সম্পূর্ণ প্রস্তুতি এক জায়গায়।"
              : "Astropixel Learn — School, College, Skills, and Admission preparation in one platform."
          }
        />
      </Helmet>

      <div className="container-fluid-2k bg-white dark:bg-background overflow-hidden">
        
        {/* 1. HERO BANNER SECTION (Full Dynamic CMS / Admin Control) */}
        {bannerSlides && bannerSlides.length > 0 && currentHero ? (
          <section 
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
            className="relative w-full h-[240px] sm:h-[380px] md:h-[480px] lg:h-[540px] xl:h-[580px] overflow-hidden bg-slate-950 group rounded-none shadow-xs select-none"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentHero.id || currentSlide}
                initial={{ opacity: 0, scale: 1.01 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Clean Image Rendering with fallback */}
                <img
                  src={currentHero.image}
                  alt={isBn ? (currentHero.title1Bn || "হিরো ব্যানার") : (currentHero.title1En || "Hero Banner")}
                  className="w-full h-full object-cover object-center pointer-events-none"
                  loading="eager"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://res.cloudinary.com/de348sqlb/image/upload/v1784725007/alphazero-assets/courses-hero-bg.png";
                  }}
                />

                {/* Text and Button Overlay: Rendered only if any promotional text exists */}
                {(currentHero.title1Bn || currentHero.title1En || currentHero.subtitleBn || currentHero.subtitleEn || currentHero.ctaBn || currentHero.ctaEn) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex items-end">
                    <div className="max-w-6xl mx-auto w-full pb-8 sm:pb-14 px-4 sm:px-6 lg:px-8 text-white">
                      {(currentHero.eyebrowBn || currentHero.eyebrowEn) && (
                        <span className="inline-block px-3 py-1 rounded-sm bg-emerald-600 text-white text-[11px] sm:text-xs font-bold mb-2 shadow-xs">
                          {isBn ? (currentHero.eyebrowBn || currentHero.eyebrowEn) : (currentHero.eyebrowEn || currentHero.eyebrowBn)}
                        </span>
                      )}
                      {(currentHero.title1Bn || currentHero.title1En || currentHero.title2Bn || currentHero.title2En) && (
                        <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold max-w-2xl leading-tight drop-shadow-md">
                          {isBn 
                            ? `${currentHero.title1Bn || ""} ${currentHero.title2Bn || ""}`.trim()
                            : `${currentHero.title1En || ""} ${currentHero.title2En || ""}`.trim()}
                        </h1>
                      )}
                      {(currentHero.subtitleBn || currentHero.subtitleEn) && (
                        <p className="text-xs sm:text-sm md:text-base text-gray-200 mt-2 max-w-xl line-clamp-2 drop-shadow-xs">
                          {isBn ? (currentHero.subtitleBn || currentHero.subtitleEn) : (currentHero.subtitleEn || currentHero.subtitleBn)}
                        </p>
                      )}
                      {(currentHero.ctaBn || currentHero.ctaEn) && (
                        <div className="mt-4">
                          <a
                            href={currentHero.ctaHref || "#courses"}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
                          >
                            <span>{isBn ? (currentHero.ctaBn || currentHero.ctaEn) : (currentHero.ctaEn || currentHero.ctaBn)}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Slide Counter Badge */}
            {bannerSlides.length > 1 && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                {(currentSlide % bannerSlides.length) + 1} / {bannerSlides.length}
              </div>
            )}

            {/* Slider Prev / Next Buttons */}
            {bannerSlides.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
                  aria-label="Previous slide"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-75 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
                  aria-label="Next slide"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-75 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Slider Indicators */}
            {bannerSlides.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {bannerSlides.map((slide: any, idx: number) => (
                  <button
                    key={slide.id || idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      (currentSlide % bannerSlides.length) === idx
                        ? "w-8 h-2 bg-emerald-500 shadow-sm"
                        : "w-2 h-2 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-background text-white px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-bold shadow-xs">
                {isBn ? "স্মার্ট অনলাইন লার্নিং প্ল্যাটফর্ম" : "Smart Online Learning Platform"}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                {isBn ? "আপনার সাফল্যের নতুন যাত্রা শুরু হোক এখান থেকেই" : "Empower Your Learning Journey"}
              </h1>
              <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {isBn 
                  ? "স্কুল, কলেজ, বিশ্ববিদ্যালয় ভর্তি ও প্রফেশনাল স্কিল ডেভেলপমেন্টের জন্য মানসম্মত অনলাইন কোর্স।"
                  : "Comprehensive courses designed for school, college, university admission prep, and industry skills."
                }
              </p>
            </div>
          </section>
        )}

        {/* 2. STAT CARDS ROW (Balanced spacing under hero banner with subtle rounded top corners) */}
        <section className="relative -mt-6 sm:-mt-8 z-10 rounded-t-3xl sm:rounded-t-[32px] bg-white dark:bg-background border-b border-gray-100 dark:border-border/40 py-8 sm:py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 lg:grid-cols-4">
            <StatCard
              icon={Users}
              value={isBn ? "১০,০০০+" : "10,000+"}
              label={isBn ? "নিবন্ধিত শিক্ষার্থী" : "Active Students"}
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
              iconColor="text-brand-600 dark:text-brand-400"
            />
            <StatCard
              icon={BookOpen}
              value={courses.length > 0 ? (isBn ? `${toBengaliDigits(courses.length)}+` : `${courses.length}+`) : (isBn ? "০" : "0")}
              label={isBn ? "প্র্যাক্টিক্যাল কোর্স" : "Online Courses"}
              iconBgColor="bg-blue-50 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              icon={GraduationCap}
              value={teacherCount > 0 ? (isBn ? `${toBengaliDigits(teacherCount)}+` : `${teacherCount}+`) : (isBn ? "০" : "0")}
              label={isBn ? "অভিজ্ঞ প্রশিক্ষক" : "Expert Instructors"}
              iconBgColor="bg-amber-50 dark:bg-amber-900/20"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            <StatCard
              icon={Award}
              value={isBn ? "৯৮%" : "98%"}
              label={isBn ? "ক্যারিয়ার সাকসেস" : "Success Rate"}
              iconBgColor="bg-purple-50 dark:bg-purple-900/20"
              iconColor="text-purple-600 dark:text-purple-400"
            />
          </div>
        </section>

        {/* 3. CATEGORY GRID (8 academic-based cards with normalized padding) */}
        <section className="bg-white dark:bg-background py-12 md:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-2 text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isBn ? "কোর্স ক্যাটাগরি বেছে নিন" : "Explore Course Categories"}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold max-w-md">
                {isBn ? "এইচএসসি, ভর্তি ও মাধ্যমিকের সেরা একাডেমিক প্রস্তুতি" : "Top academic preparation for HSC, Admissions & Board Exams"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              <CategoryCard
                icon={Atom}
                title={isBn ? "HSC পদার্থবিজ্ঞান" : "HSC Physics"}
                count={8}
                to="/courses?category=hsc&q=physics"
                color="text-blue-600"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <CategoryCard
                icon={FlaskConical}
                title={isBn ? "HSC রসায়ন" : "HSC Chemistry"}
                count={7}
                to="/courses?category=hsc&q=chemistry"
                color="text-emerald-600"
                bgColor="bg-emerald-50 dark:bg-emerald-900/20"
              />
              <CategoryCard
                icon={Calculator}
                title={isBn ? "উচ্চতর গণিত" : "Higher Mathematics"}
                count={6}
                to="/courses?category=hsc&q=math"
                color="text-purple-600"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
              />
              <CategoryCard
                icon={Compass}
                title={isBn ? "BUET ও ইঞ্জিনিয়ারিং" : "BUET & Engineering"}
                count={9}
                to="/courses?category=admission&unit=buet"
                color="text-amber-600"
                bgColor="bg-amber-50 dark:bg-amber-900/20"
              />
              <CategoryCard
                icon={Stethoscope}
                title={isBn ? "মেডিকেল এডমিশন" : "Medical Admission"}
                count={6}
                to="/courses?category=admission&unit=medical"
                color="text-rose-600"
                bgColor="bg-rose-50 dark:bg-rose-900/20"
              />
              <CategoryCard
                icon={GraduationCap}
                title={isBn ? "ঢাবি 'ক' ইউনিট" : "Varsity 'A' Unit"}
                count={5}
                to="/courses?category=admission&unit=varsity"
                color="text-indigo-600"
                bgColor="bg-indigo-50 dark:bg-indigo-900/20"
              />
              <CategoryCard
                icon={BookOpen}
                title={isBn ? "এসএসসি বিজ্ঞান ৯-১০" : "SSC Science (9-10)"}
                count={8}
                to="/courses?category=ssc"
                color="text-teal-600"
                bgColor="bg-teal-50 dark:bg-teal-900/20"
              />
              <CategoryCard
                icon={Trophy}
                title={isBn ? "আইসিটি ও অলিম্পিয়াড" : "ICT & Olympiads"}
                count={4}
                to="/courses?category=olympiad"
                color="text-orange-600"
                bgColor="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>
          </div>
        </section>

        {/* 4. POPULAR COURSES (Horizontal Scroller Section) */}
        <section id="courses" className="py-12 md:py-14 bg-background/50 border-t border-gray-100 dark:border-border/40 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isBn ? "জনপ্রিয় কোর্সসমূহ" : "Popular Courses"}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                {isBn ? "হাতে-কলমে প্রজেক্ট করে শেখার সেরা মাধ্যম" : "Hands-on, practical skill-building courses"}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    activeCategory === cat.id
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Horizontal Course Scroller */}
            <HorizontalScroller>
              {filteredCourses.map((course) => (
                <EdgeCourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </HorizontalScroller>

            <div className="flex justify-center pt-4">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
              >
                <span>{isBn ? "সকল কোর্স দেখুন" : "View all courses"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. DARK PROMO BANNER — Academic HSC & Admission Focus with Rounded Radius Edge */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="max-w-6xl mx-auto rounded-[32px] sm:rounded-[40px] bg-[#0b1d33] text-white p-8 sm:p-12 md:p-16 border border-slate-800/80 shadow-2xl overflow-hidden relative">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12 relative z-10">
              
              {/* Text & CTA */}
              <div className="order-2 space-y-5 md:order-1">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/30 text-emerald-300 text-xs font-bold border border-primary/30 tracking-wide uppercase">
                  {isBn ? "বিশেষ প্রোগ্রাম" : "Special Program"}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                  {isBn
                    ? "বুয়েট, মেডিকেল ও ঢাবি — সঠিক গাইডেন্সেই সফলতা"
                    : "BUET, Medical & DU — Succeed with the Right Guidance"}
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {isBn
                    ? "অভিজ্ঞ মেন্টরদের সাথে কনসেপ্ট বেসড প্রস্তুতি। পদার্থ, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞানে সম্পূর্ণ মাস্টারি অর্জন করুন এবং ভর্তি পরীক্ষায় শীর্ষ স্থান নিশ্চিত করুন।"
                    : "Concept-based preparation with experienced mentors. Master Physics, Chemistry, Higher Math, and Biology to secure your seat at top universities."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <Link
                    to="/courses?category=admission"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-sm bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    <span>{isBn ? "এডমিশন কোর্স দেখুন" : "Explore Admission Courses"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-sm bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20"
                  >
                    <span>{isBn ? "সব কোর্স দেখুন" : "Browse All Courses"}</span>
                  </Link>
                </div>
              </div>

              {/* Feature highlight cards */}
              <div className="order-1 md:order-2 grid grid-cols-2 gap-3">
                {[
                  { icon: Atom, label: isBn ? "পদার্থবিজ্ঞান" : "Physics", sub: isBn ? "কনসেপ্ট + প্র্যাক্টিস" : "Concept + Practice" },
                  { icon: FlaskConical, label: isBn ? "রসায়ন" : "Chemistry", sub: isBn ? "পরীক্ষামূলক ও তাত্ত্বিক" : "Lab + Theory" },
                  { icon: Calculator, label: isBn ? "উচ্চতর গণিত" : "Higher Math", sub: isBn ? "বোর্ড ও ভর্তি" : "Board & Admission" },
                  { icon: Stethoscope, label: isBn ? "জীববিজ্ঞান" : "Biology", sub: isBn ? "মেডিকেল প্রস্তুতি" : "Medical Prep" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 6. EXPERT INSTRUCTORS (TeamSection Marquee Layout with Full Color Images) */}
        {instructorTeamMembers && instructorTeamMembers.length > 0 && (
          <TeamSection members={instructorTeamMembers} isBn={isBn} />
        )}

        {/* 7. STUDENT TESTIMONIALS (Curated Institutional Hall of Fame Grid) */}
        {studentReviews && studentReviews.length > 0 && (
          <section className="bg-background py-12 md:py-14 px-4 sm:px-6 lg:px-8 border-t border-border/60">
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex flex-col items-center gap-2 text-center max-w-xl mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  {isBn ? "সফলতার গল্প" : "Success Stories"}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isBn ? "শিক্ষার্থীদের সাফল্যের অভিজ্ঞতা" : "What Our Rankers Say"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold">
                  {isBn ? "বুয়েট, মেডিকেল ও ঢাবিতে চান্সপ্রাপ্ত শিক্ষার্থীদের বাস্তব প্রতিক্রিয়া" : "Verified testimonials from students admitted into premier universities"}
                </p>
              </div>

              {/* Curated Grid of Verified Reviews using TestimonialCard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 justify-items-center">
                {studentReviews.map((rev: any, idx: number) => (
                  <TestimonialCard
                    key={rev.id || idx}
                    author={{
                      name: isBn ? (rev.nameBn || rev.name) : (rev.nameEn || rev.name),
                      handle: isBn ? `${rev.roleBn || rev.role} (${rev.handleBn || rev.handle || ''})` : `${rev.roleEn || rev.role} (${rev.handleEn || rev.handle || ''})`,
                      avatar: rev.avatar || rev.image,
                    }}
                    text={isBn ? (rev.quoteBn || rev.quote) : (rev.quoteEn || rev.quote)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* Course Enrollment Modal (Preserved 100% Intact) */}
      {selectedCourse && (
        <CourseEnrollmentModal
          isOpen={isEnrollModalOpen}
          onClose={() => {
            setIsEnrollModalOpen(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          onSuccess={() => {
            setIsEnrollModalOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </Layout>
  );
}
