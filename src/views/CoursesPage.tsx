import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

import StatCard from "@/components/StatCard";
import CategoryCard from "@/components/CategoryCard";
import EdgeCourseCard from "@/components/EdgeCourseCard";
import HorizontalScroller from "@/components/ui/HorizontalScroller";
import HomePageSkeleton from "@/components/skeletons/HomePageSkeleton";

import instructorHH from "@/assets/instructors/hh.png.asset.json";
import instructorNayeem from "@/assets/instructors/nayeem.png.asset.json";
import instructorAtik from "@/assets/instructors/Atik.png.asset.json";
import instructorShafiul from "@/assets/instructors/shafiul.png.asset.json";
import instructorPapiya from "@/assets/instructors/papiya.png.asset.json";
import instructorPrantik from "@/assets/instructors/prantik.png.asset.json";

// Academic Mentors & Instructors mapping
const trainers = {
  tanvir: {
    name: "Engr. Tanvir Ahmed",
    qualificationEn: "BUET (EEE), Senior Physics & Math Mentor",
    qualificationBn: "বুয়েট (ইইই), সিনিয়র পদার্থ ও গণিত প্রশিক্ষক",
    image: instructorAtik.url,
  },
  sajid: {
    name: "Dr. Sajid Hasan",
    qualificationEn: "Dhaka Medical College (DMC), Biology Lead",
    qualificationBn: "ঢাকা মেডিকেল কলেজ (DMC), জীববিজ্ঞান প্রধান",
    image: instructorHH.url,
  },
  fahim: {
    name: "Fahim Shahriar",
    qualificationEn: "DU (Physics), Higher Math Specialist",
    qualificationBn: "ঢাবি (পদার্থবিজ্ঞান), উচ্চতর গণিত বিশেষজ্ঞ",
    image: instructorNayeem.url,
  },
  tahmid: {
    name: "Tahmid Chowdhury",
    qualificationEn: "BUET (CSE), ICT & Olympiad Lead",
    qualificationBn: "বুয়েট (সিএসই), আইসিটি ও অলিম্পিয়াড প্রধান",
    image: instructorShafiul.url,
  },
  papiya: {
    name: "Dr. Sumaiya Farhana",
    qualificationEn: "SSMC, Chemistry & Zoology Faculty",
    qualificationBn: "সলিমুল্লাহ মেডিকেল কলেজ, রসায়ন ও প্রাণিবিজ্ঞান ফ্যাকাল্টি",
    image: instructorPapiya.url,
  },
  prantik: {
    name: "Prantik Saha",
    qualificationEn: "RUET, Engineering Mechanics & Science Mentor",
    qualificationBn: "রুয়েট, ইঞ্জিনিয়ারিং মেকানিক্স ও বিজ্ঞান মেন্টর",
    image: instructorPrantik.url,
  },
};

const DEFAULT_BANNER_SLIDES = [
  {
    id: "1",
    image: "https://nid.edu.bd/wp-content/uploads/2024/05/BBA-web-slider-01-01-01-scaled-e1753431207269.jpg",
    eyebrowBn: "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি একাডেমি",
    eyebrowEn: "HSC & University Admission Academy",
    title1Bn: "স্বপ্ন যেখানে",
    title1En: "Where dreams",
    title2Bn: "বুয়েট, মেডিকেল ও ঢাবিতে।",
    title2En: "meet university excellence.",
    title3Bn: "শীর্ষ শিক্ষকদের সাথে প্রস্তুতি।",
    title3En: "Learn with top rankers.",
    subtitleBn: "পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞানের গভীর কনসেপ্ট ক্লিয়ারিং এবং বোর্ড ও এডমিশনের পূর্ণাঙ্গ প্রস্তুতি।",
    subtitleEn: "From HSC Science to Engineering, Medical, and Varsity admission programs — achieve peak academic mastery.",
    ctaBn: "একাডেমিক কোর্স দেখুন",
    ctaEn: "Explore Academic Courses",
    ctaHref: "#courses",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop",
    eyebrowBn: "বুয়েট ও ইঞ্জিনিয়ারিং এডমিশন স্পেশাল",
    eyebrowEn: "BUET & Engineering Admission",
    title1Bn: "কনসেপ্ট ক্লিয়ার",
    title1En: "Concept First",
    title2Bn: "উচ্চতর সমস্যা সমাধান।",
    title2En: "Advanced Problem Solving.",
    title3Bn: "টপ র‍্যাঙ্কারদের মেন্টরশিপ।",
    title3En: "Mentored by BUETians.",
    subtitleBn: "পদার্থবিজ্ঞান ও উচ্চতর গণিতের জটিল গাণিতিক সমস্যা সমাধান এবং বুয়েট বিগত ১০ বছরের প্রশ্নব্যাংক অ্যানালাইসিস।",
    subtitleEn: "Master complex physics and higher mathematics with deep conceptual clarity, question bank analysis, and structured mock tests.",
    ctaBn: "ইঞ্জিনিয়ারিং কোর্স",
    ctaEn: "Engineering Courses",
    ctaHref: "/catalog?category=admission",
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
    eyebrowBn: "মেডিকেল ও ডেন্টাল এডমিশন স্পেশাল",
    eyebrowEn: "Medical & Dental Admission Special",
    title1Bn: "লক্ষ্য যখন",
    title1En: "Target",
    title2Bn: "সাদা অ্যাপ্রোন ও স্টেথোস্কোপ।",
    title2En: "White Apron & Stethoscope.",
    title3Bn: "ডিএমসি মেন্টরদের গাইডলাইন।",
    title3En: "DMC Mentors Guidance.",
    subtitleBn: "উদ্ভিদবিজ্ঞান, প্রাণিবিজ্ঞান, রসায়ন ও সাধারণ জ্ঞানের ১০০% নির্ভুল বোর্ড বই লাইন-বাই-লাইন বিশ্লেষণ ও ডেইলি এক্সাম।",
    subtitleEn: "High-yield medical biology and chemistry line-by-line revision with daily topic-wise mock tests.",
    ctaBn: "মেডিকেল কোর্স",
    ctaEn: "Medical Courses",
    ctaHref: "/catalog?category=admission",
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
    eyebrowBn: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ও বিজ্ঞান প্রস্তুতি",
    eyebrowEn: "Dhaka University 'A' Unit Prep",
    title1Bn: "ঢাবি 'ক' ইউনিট",
    title1En: "DU 'A' Unit",
    title2Bn: "বিজ্ঞান অনুষদের শীর্ষ প্রস্তুতি।",
    title2En: "Science Faculty Preparation.",
    title3Bn: "এমসিকিউ ও রিটেন সমন্বিত।",
    title3En: "Integrated MCQ & Written.",
    subtitleBn: "ঢাবি ক ইউনিট সহ সকল সাধারণ ও বিজ্ঞান বিশ্ববিদ্যালয়ের জন্য পদার্থ, রসায়ন, গণিত ও জীববিজ্ঞানের রিটেন স্পেশাল ট্রিকস।",
    subtitleEn: "Comprehensive written and MCQ techniques for DU A-Unit and leading science university admissions.",
    ctaBn: "ভার্সিটি কোর্স",
    ctaEn: "Varsity Courses",
    ctaHref: "/catalog?category=admission",
  },
];

const studentReviews = [
  {
    nameBn: "আসিফ ইকবাল",
    nameEn: "Asif Iqbal",
    roleBn: "বুয়েট '২৩ ব্যাচ (সিভিল)",
    roleEn: "BUET '23 (Civil)",
    quoteBn: "অ্যাস্ট্রোপিক্সেলের ইঞ্জিনিয়ারিং ফিজিক্স ও হায়ার ম্যাথ ক্লাসগুলো আমার বুয়েট ভর্তির স্বপ্ন পূরণ করেছে। কনসেপ্টগুলো এতো সহজে বোঝানো হয়!",
    quoteEn: "The engineering physics and higher math masterclasses made all the difference in my BUET admission success.",
  },
  {
    nameBn: "সাদিয়া তাসনিম",
    nameEn: "Sadia Tasnim",
    roleBn: "ঢাকা মেডিকেল কলেজ (DMC '২৪)",
    roleEn: "Dhaka Medical College (DMC '24)",
    quoteBn: "মেডিকেল বায়োলজি ও কেমিস্ট্রি ক্লাসের শর্ট টেকনিক ও সাপ্তাহিক এক্সামগুলো আমাকে ডিএমসিতে চান্স পেতে সবচেয়ে বেশি সাহায্য করেছে।",
    quoteEn: "The high-yield medical biology and chemistry modules, along with weekly mocks, helped me secure my dream seat at DMC.",
  },
  {
    nameBn: "তানভীর হাসান",
    nameEn: "Tanvir Hasan",
    roleBn: "এইচএসসি বিজ্ঞান (GPA-5.00)",
    roleEn: "HSC Science (GPA 5.00)",
    quoteBn: "পদার্থবিজ্ঞান ও উচ্চতর গণিতে আমার আগে অনেক ভীতি ছিল। এখানকার ক্লাস ও নোটস দেখে টেস্ট ও বোর্ডে সর্বোচ্চ নম্বর পেয়েছি।",
    quoteEn: "I used to struggle with Physics and Higher Math. The structured lessons and chapter notes completely changed my confidence.",
  },
  {
    nameBn: "মেহজাবিন চৌধুরী",
    nameEn: "Mehjabin Chowdhury",
    roleBn: "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট",
    roleEn: "Dhaka University 'A' Unit",
    quoteBn: "ঢাবি ক ইউনিটের প্রশ্নব্যাংক সলভিং আর ম্যাথ শর্ট ট্রিকসের ক্লাসগুলো ছিল এক কথায় অনবদ্য। প্রতিটি কনসেপ্ট পানির মতো পরিষ্কার!",
    quoteEn: "The DU A-Unit question bank solving sessions were masterclasses in speed and conceptual depth.",
  },
  {
    nameBn: "রাকিবুল ইসলাম",
    nameEn: "Rakibul Islam",
    roleBn: "বুয়েট '২৩ ব্যাচ (সিএসই)",
    roleEn: "BUET '23 (CSE)",
    quoteBn: "ম্যাথ ও ফিজিক্সের অ্যানালাইসিস ক্লাসগুলো আমার ক্যালকুলেশন স্পিড দ্বিগুণ করে দিয়েছিল। বুয়েট ভর্তি পরীক্ষায় এটাই পার্থক্য গড়ে দিয়েছে।",
    quoteEn: "The analytical problem solving sessions doubled my calculation speed and confidence for the engineering admission test.",
  },
  {
    nameBn: "সামিয়া আক্তার",
    nameEn: "Samia Akter",
    roleBn: "এসএসসি বিজ্ঞান (গোল্ডেন GPA-5)",
    roleEn: "SSC Science (Golden GPA 5)",
    quoteBn: "ক্লাস ৯-১০ এর বিজ্ঞান ও গণিত ক্লাসগুলো এতটাই গোছানো যে বোর্ড পরীক্ষার আগে কোনো বাড়তি কোচিং এর প্রয়োজনই হয়নি।",
    quoteEn: "The SSC foundational classes were so well organized that I never needed any outside coaching to score Golden GPA 5.",
  },
];

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

  // Dynamic banner slides
  const bannerSlides = useMemo(() => {
    const cmsBanners = getContent("hero_banners_json");
    if (cmsBanners) {
      try {
        const parsed = JSON.parse(cmsBanners);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const local = typeof window !== "undefined" ? localStorage.getItem("hero_banners_json") : null;
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_BANNER_SLIDES;
  }, [getContent]);

  const [isSliderPaused, setIsSliderPaused] = useState(false);

  // Auto-rotate hero banner slider every 8 seconds, pausing on hover
  useEffect(() => {
    if (!bannerSlides || bannerSlides.length <= 1 || isSliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [bannerSlides.length, isSliderPaused]);

  const currentHero = bannerSlides[currentSlide] || DEFAULT_BANNER_SLIDES[0];

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
        
        {/* 1. HERO BANNER SECTION (Recovered EdgeCourseBD responsive heights, aligned to max-w-6xl) */}
        <section 
          onMouseEnter={() => setIsSliderPaused(true)}
          onMouseLeave={() => setIsSliderPaused(false)}
          className="relative w-full h-[250px] sm:h-[400px] md:h-[550px] 4xl:h-[700px] overflow-hidden bg-black group"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHero.id || currentSlide}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${currentHero.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end">
                <div className="max-w-6xl mx-auto w-full pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 text-white">
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-500 text-white text-xs font-bold mb-2 shadow-sm">
                    {isBn ? currentHero.eyebrowBn : currentHero.eyebrowEn}
                  </span>
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold max-w-2xl leading-tight">
                    {isBn ? `${currentHero.title1Bn} ${currentHero.title2Bn}` : `${currentHero.title1En} ${currentHero.title2En}`}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 mt-2 max-w-xl line-clamp-2">
                    {isBn ? currentHero.subtitleBn : currentHero.subtitleEn}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Prev / Next Buttons */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {bannerSlides.map((slide: any, idx: number) => (
              <button
                key={slide.id || idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? "w-8 h-2 bg-brand-500 shadow-sm"
                    : "w-2 h-2 bg-white/50 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        </section>

        {/* 2. STAT CARDS ROW (Balanced spacing under hero banner) */}
        <section className="bg-white dark:bg-background border-b border-gray-100 dark:border-border/40 py-8 sm:py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8 lg:grid-cols-4">
            <StatCard
              icon={Users}
              value="১০,০০০+"
              label={isBn ? "নিবন্ধিত শিক্ষার্থী" : "Active Students"}
              iconBgColor="bg-emerald-50 dark:bg-emerald-900/20"
              iconColor="text-brand-600 dark:text-brand-400"
            />
            <StatCard
              icon={BookOpen}
              value="২৫+"
              label={isBn ? "প্র্যাক্টিক্যাল কোর্স" : "Online Courses"}
              iconBgColor="bg-blue-50 dark:bg-blue-900/20"
              iconColor="text-blue-600 dark:text-blue-400"
            />
            <StatCard
              icon={GraduationCap}
              value="১৫+"
              label={isBn ? "অভিজ্ঞ প্রশিক্ষক" : "Expert Instructors"}
              iconBgColor="bg-amber-50 dark:bg-amber-900/20"
              iconColor="text-amber-600 dark:text-amber-400"
            />
            <StatCard
              icon={Award}
              value="৯৮%"
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
                to="/catalog?category=hsc"
                color="text-blue-600"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <CategoryCard
                icon={FlaskConical}
                title={isBn ? "HSC রসায়ন" : "HSC Chemistry"}
                count={7}
                to="/catalog?category=hsc"
                color="text-emerald-600"
                bgColor="bg-emerald-50 dark:bg-emerald-900/20"
              />
              <CategoryCard
                icon={Calculator}
                title={isBn ? "উচ্চতর গণিত" : "Higher Mathematics"}
                count={6}
                to="/catalog?category=hsc"
                color="text-purple-600"
                bgColor="bg-purple-50 dark:bg-purple-900/20"
              />
              <CategoryCard
                icon={Compass}
                title={isBn ? "BUET ও ইঞ্জিনিয়ারিং" : "BUET & Engineering"}
                count={9}
                to="/catalog?category=admission"
                color="text-amber-600"
                bgColor="bg-amber-50 dark:bg-amber-900/20"
              />
              <CategoryCard
                icon={Stethoscope}
                title={isBn ? "মেডিকেল এডমিশন" : "Medical Admission"}
                count={6}
                to="/catalog?category=admission"
                color="text-rose-600"
                bgColor="bg-rose-50 dark:bg-rose-900/20"
              />
              <CategoryCard
                icon={GraduationCap}
                title={isBn ? "ঢাবি 'ক' ইউনিট" : "Varsity 'A' Unit"}
                count={5}
                to="/catalog?category=admission"
                color="text-indigo-600"
                bgColor="bg-indigo-50 dark:bg-indigo-900/20"
              />
              <CategoryCard
                icon={BookOpen}
                title={isBn ? "এসএসসি বিজ্ঞান ৯-১০" : "SSC Science (9-10)"}
                count={8}
                to="/catalog?category=ssc"
                color="text-teal-600"
                bgColor="bg-teal-50 dark:bg-teal-900/20"
              />
              <CategoryCard
                icon={Trophy}
                title={isBn ? "আইসিটি ও অলিম্পিয়াড" : "ICT & Olympiads"}
                count={4}
                to="/catalog?category=olympiad"
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
                to="/catalog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 hover:underline"
              >
                <span>{isBn ? "সকল কোর্স দেখুন" : "View all courses"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. DARK PROMO BANNER — Academic HSC & Admission Focus */}
        <section className="bg-[#0b1d33] text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
              
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
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    <span>{isBn ? "এডমিশন কোর্স দেখুন" : "Explore Admission Courses"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors border border-white/20"
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
                  <div key={label} className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col gap-2 hover:bg-white/10 transition-colors">
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
        {/* 6. EXPERT INSTRUCTORS (Continuous Infinite Loop with Square Images) */}
        <section className="bg-background/50 py-12 md:py-14 px-4 sm:px-6 lg:px-8 border-t border-border/60">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col items-center gap-2 text-center max-w-xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                {isBn ? "শীর্ষ ফ্যাকাল্টি" : "Top Faculty"}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isBn ? "দেশসেরা প্রশিক্ষকদের প্যানেল" : "Expert Instructors"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                {isBn ? "বুয়েট, মেডিকেল ও শীর্ষ বিশ্ববিদ্যালয়ের অভিজ্ঞ মেন্টরদের সাথে সরাসরি প্রস্তুতি" : "Learn directly from top engineering & medical mentors"}
              </p>
            </div>

            {/* Continuous Infinite Marquee Scroller */}
            <div className="relative w-full overflow-hidden group/scroller py-2">
              <div className="flex gap-4 sm:gap-6 animate-marquee-sideways hover:[animation-play-state:paused]">
                {[...Object.entries(trainers), ...Object.entries(trainers)].map(([key, t], idx) => (
                  <div
                    key={`${key}-${idx}`}
                    className="group/inst flex w-[240px] sm:w-[260px] shrink-0 flex-col items-center text-center gap-3.5 rounded-2xl bg-card dark:bg-card/95 border border-border/80 dark:border-border/60 p-5 shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-primary/50 transition-all duration-200"
                  >
                    {/* Square Image with Rounded Corners */}
                    <div className="relative w-full aspect-square max-w-[180px] overflow-hidden rounded-xl border border-border/70 bg-muted/20 group-hover/inst:border-primary/50 transition-colors shadow-xs">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover/inst:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="w-full space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover/inst:text-primary transition-colors">
                        {t.name}
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold line-clamp-2 leading-relaxed">
                        {isBn ? t.qualificationBn : t.qualificationEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. STUDENT TESTIMONIALS (Curated Institutional Hall of Fame Grid) */}
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

            {/* Curated Grid of Verified Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {studentReviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="space-y-4 rounded-2xl bg-card dark:bg-card/95 border border-border/80 dark:border-border/60 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shrink-0 shadow-none">
                      {(isBn ? rev.nameBn : rev.nameEn)[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {isBn ? rev.nameBn : rev.nameEn}
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {isBn ? rev.roleBn : rev.roleEn}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed italic flex-1">
                    "{isBn ? rev.quoteBn : rev.quoteEn}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isBn ? "ভেরিফাইড রিভিউ" : "Verified Student"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

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
