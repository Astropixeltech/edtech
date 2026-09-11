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
        
        {/* 1. HERO SECTION (Editorial 2-Column with Framed Visual Card & Animation) */}
        <section 
          onMouseEnter={() => setIsSliderPaused(true)}
          onMouseLeave={() => setIsSliderPaused(false)}
          className="relative pt-4 sm:pt-8 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-brand-50/40 via-background to-background dark:from-slate-950/40 dark:via-background dark:to-background border-b border-gray-100 dark:border-border/40"
        >
          {/* Ambient blur glow strictly below navbar */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-transparent blur-3xl -z-10 pointer-events-none rounded-full" />

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
              
              {/* Left Column: Headlines, Target Program Switchers & CTAs */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                
                {/* Live Announcement Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-md text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isBn ? "এইচএসসি ও এডমিশন ২০২৬-২৭ • স্পেশাল মেন্টরশিপ ব্যাচ" : "HSC & Admission 2026-27 • Special Mentorship"}</span>
                </div>

                {/* Primary Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-[1.18]">
                  {isBn ? "স্বপ্ন যেখানে" : "Where Dreams"}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
                    {isBn ? "বুয়েট, মেডিকেল ও ঢাবিতে।" : "Meet University Excellence."}
                  </span>
                  <br />
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/90 mt-1 block">
                    {isBn ? "শীর্ষ শিক্ষকদের সাথে প্রস্তুতি।" : "Mentored by Top Rankers."}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                  {isBn
                    ? "এইচএসসি বিজ্ঞান ও এডমিশন টেস্টের প্রতিটি বিষয়ের গভীর কনসেপ্ট ক্লিয়ারিং, অধ্যায়ভিত্তিক CQ-MCQ ও লিখিত প্রশ্নব্যাংক সমাধানের পূর্ণাঙ্গ একাডেমি।"
                    : "Comprehensive academic mastery for HSC Science, Engineering, and Medical Admission with deep conceptual clarity and mentor guidance."}
                </p>

                {/* Interactive Quick-Target Switcher Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {[
                    { idx: 0, label: isBn ? "এইচএসসি বিজ্ঞান" : "HSC Science", icon: Atom },
                    { idx: 1, label: isBn ? "বুয়েট ইঞ্জিনিয়ারিং" : "BUET Engineering", icon: Compass },
                    { idx: 2, label: isBn ? "মেডিকেল এডমিশন" : "Medical Admission", icon: Stethoscope },
                    { idx: 3, label: isBn ? "ঢাবি 'ক' ইউনিট" : "Varsity 'A' Unit", icon: GraduationCap },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentSlide === tab.idx;
                    return (
                      <button
                        key={tab.idx}
                        onClick={() => setCurrentSlide(tab.idx)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                          isActive
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105"
                            : "bg-white/80 dark:bg-slate-900/60 text-foreground/80 border-border/70 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center flex-wrap gap-3.5 pt-2">
                  <Link
                    to="/catalog?category=admission"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <span>{isBn ? "কোর্সসমূহ দেখুন" : "Explore Courses"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#courses"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full border border-border/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-foreground font-bold text-sm hover:border-emerald-500/60 hover:bg-white dark:hover:bg-slate-900 transition-all duration-300 shadow-sm"
                  >
                    <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span>{isBn ? "ফ্রি ডেমো ক্লাস" : "Free Demo Class"}</span>
                  </a>
                </div>

                {/* Trust Badges Row */}
                <div className="flex items-center flex-wrap gap-4 pt-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {isBn ? "লাইভ + রেকর্ডেড ক্লাস" : "Live & Recorded Classes"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {isBn ? "অধ্যায়ভিত্তিক CQ & MCQ" : "Chapter-wise Tests"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {isBn ? "সার্টিফিকেট সুবিধা" : "Verified Certificate"}
                  </span>
                </div>

              </div>

              {/* Right Column: Framed Visual Card with Ambient Glow and Floating Badges */}
              <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                
                {/* Ambient Glow behind image card */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-emerald-500/25 via-teal-500/15 to-brand-500/20 blur-3xl -z-10 rounded-3xl opacity-75 dark:opacity-60 pointer-events-none" />

                {/* Framed Image Card (strictly contained with zero bleed into navbar) */}
                <div className="relative rounded-3xl overflow-hidden border border-white/70 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] bg-slate-900 aspect-[16/11] sm:aspect-[16/10] group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHero.id || currentSlide}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${currentHero.image})` }}
                    >
                      {/* Gradient Scrim for Content Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-7 text-white">
                        <span className="inline-block px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold w-max mb-2 shadow-sm backdrop-blur-sm">
                          {isBn ? currentHero.eyebrowBn : currentHero.eyebrowEn}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold leading-snug">
                          {isBn ? `${currentHero.title1Bn} ${currentHero.title2Bn}` : `${currentHero.title1En} ${currentHero.title2En}`}
                        </h3>
                        <p className="text-xs text-gray-200 mt-1 line-clamp-2 max-w-sm">
                          {isBn ? currentHero.subtitleBn : currentHero.subtitleEn}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Slide Prev/Next Arrows */}
                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-20">
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
                      aria-label="Previous slide"
                      className="w-7 h-7 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
                      aria-label="Next slide"
                      className="w-7 h-7 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Indicator Dots */}
                  <div className="absolute bottom-3 right-6 flex items-center gap-1.5 z-20">
                    {bannerSlides.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentSlide === idx ? "w-6 bg-emerald-400 shadow-sm" : "w-1.5 bg-white/40 hover:bg-white/80"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Floating Badge 1: Top Floating Metric */}
                <div className="hidden sm:flex absolute -top-4 -left-4 z-20 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl animate-float">
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">বুয়েট ও ঢাবিতে চান্স</p>
                    <p className="text-xs font-extrabold text-foreground">৮৫০+ শিক্ষার্থী</p>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Floating Metric */}
                <div className="hidden sm:flex absolute -bottom-4 -right-3 z-20 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl">
                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shadow-inner">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold">শিক্ষার্থীদের সন্তুষ্টি</p>
                    <p className="text-xs font-extrabold text-foreground">৪.৯/৫ (১০,০০০+ রিভিউ)</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 2. STAT CARDS ROW (Exact 4-column layout aligned to max-w-6xl) */}
        <section className="bg-white dark:bg-background border-b border-gray-100 dark:border-border/40">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 sm:gap-6 pb-10 pt-[20px] lg:grid-cols-4 lg:pt-[20px] px-4 sm:px-6 lg:px-8">
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

        {/* 3. CATEGORY GRID (8 academic-based cards) */}
        <section className="bg-white dark:bg-background py-10 lg:pt-[40px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center gap-2 text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {isBn ? "কোর্স ক্যাটাগরি বেছে নিন" : "Explore Course Categories"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
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
        <section id="courses" className="py-10 bg-background/50 border-t border-gray-100 dark:border-border/40 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {isBn ? "জনপ্রিয় কোর্সসমূহ" : "Popular Courses"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBn ? "হাতে-কলমে প্রজেক্ট করে শেখার সেরা মাধ্যম" : "Hands-on, practical skill-building courses"}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? "bg-brand-500 text-white shadow-sm"
                      : "bg-white dark:bg-card text-foreground border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent"
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
                  onEnroll={handleEnrollClick}
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

        {/* 5. DARK PROMO BANNER (Exact EdgeCourseBD #0b1d33 layout) */}
        <section className="bg-[#0b1d33] text-white py-10 md:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10">
              
              {/* Text & CTA */}
              <div className="order-2 space-y-4 md:order-1">
                <span className="inline-block px-3 py-1 rounded-full bg-brand-500/30 text-brand-300 text-xs font-bold border border-brand-400/30">
                  {isBn ? "ফ্ল্যাগশিপ প্রোগ্রাম" : "Flagship Program"}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                  {isBn
                    ? "কোডিং না জেনেও ফুল-স্ট্যাক অ্যাপ বিল্ড করার ভবিষ্যৎ"
                    : "The Future of Building Full-Stack Apps Without Coding"}
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {isBn
                    ? "আধুনিক AI অ্যাসিস্ট্যান্ট ও প্রম্পট আর্কিটেকচার ব্যবহার করে মাত্র কয়েক মিনিটে প্রোডাকশন-রেডি ওয়েব অ্যাপ ডেভেলপমেন্ট শিখুন।"
                    : "Learn to build and ship production-ready web apps in minutes using cutting-edge AI coding workflows."}
                </p>
                <div className="pt-2">
                  <Link
                    to="/vibe-coding"
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors shadow-md"
                  >
                    <span>{isBn ? "ভাইব কোডিং কোর্স দেখুন" : "Explore Vibe Coding"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Promo Visual */}
              <div className="order-1 mx-auto w-full max-w-[440px] md:order-2 md:ml-auto md:mr-0">
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm relative group">
                  <div className="h-20 w-20 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-10 w-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Astropixel Interactive LMS</h3>
                  <p className="text-xs text-gray-300 max-w-xs">
                    লাইভ সেশন, প্রজেক্ট রিভিউ এবং ভেরিফাইড সার্টিফিকেট সুবিধা।
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
        {/* 6. STUDENT TESTIMONIALS (Sideways Infinite Marquee with Delay & Pause on Hover) */}
        <section className="bg-white dark:bg-background py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-border/40 overflow-hidden">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {isBn ? "শিক্ষার্থীদের মতামত" : "Student Reviews"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBn ? "হাজারো সফল শিক্ষার্থীদের রিভিউ ও অভিজ্ঞতা" : "What our students say about their learning experience"}
              </p>
            </div>

            {/* Moving sideways track with delay and pause on hover */}
            <div className="relative overflow-hidden w-full group-marquee py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
              <div className="animate-marquee-sideways flex gap-5 md:gap-6 py-2">
                {[...studentReviews, ...studentReviews].map((rev, idx) => (
                  <div
                    key={idx}
                    className="w-[300px] sm:w-[350px] shrink-0 space-y-4 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-white/60 dark:border-white/10 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/60 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                        {(isBn ? rev.nameBn : rev.nameEn)[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          {isBn ? rev.nameBn : rev.nameEn}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isBn ? rev.roleBn : rev.roleEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                      "{isBn ? rev.quoteBn : rev.quoteEn}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. EXPERT INSTRUCTORS (Horizontal Scroller with Glassmorphism & Prominent Hover) */}
        <section className="bg-background/40 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-border/40">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {isBn ? "দেশসেরা প্রশিক্ষকদের প্যানেল" : "Expert Instructors"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBn ? "শীর্ষ বিশ্ববিদ্যালয় ও মেডিকেলের অভিজ্ঞ মেন্টরদের সাথে প্রস্তুতি" : "Learn directly from top university & medical mentors"}
              </p>
            </div>

            <HorizontalScroller>
              {Object.entries(trainers).map(([key, t]) => (
                <div
                  key={key}
                  className="group/inst flex w-full min-w-[240px] max-w-[280px] shrink-0 flex-col items-center text-center gap-3 rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-white/60 dark:border-white/10 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-2.5 hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(16,185,129,0.18)] hover:border-emerald-500/60 transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-full p-1 border-2 border-emerald-500/30 group-hover/inst:border-emerald-500/80 transition-colors">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="h-24 w-24 rounded-full object-cover transition-transform duration-500 group-hover/inst:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover/inst:text-emerald-600 dark:group-hover/inst:text-emerald-400 transition-colors">{t.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {isBn ? t.qualificationBn : t.qualificationEn}
                    </p>
                  </div>
                </div>
              ))}
            </HorizontalScroller>
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
