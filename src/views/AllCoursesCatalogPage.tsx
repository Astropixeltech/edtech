import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { useAuth } from "@/contexts/AuthContext";
import CourseEnrollmentModal from "@/components/student/CourseEnrollmentModal";
import { 
  Code, Palette, Bot, TrendingUp, Sparkles, BookOpen, Clock, 
  ArrowRight, CheckCircle2, Star, Monitor, Video, Wrench, Shield, GraduationCap,
  Layers, Atom, FlaskConical, Calculator, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/lms";
import EdgeCourseCard from "@/components/EdgeCourseCard";
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";
import TargetUnitSelector, { TargetUnit } from "@/components/course/TargetUnitSelector";

const categoryList = [
  { id: "all", labelBn: "সব কোর্স", labelEn: "All Courses", icon: BookOpen },
  { id: "hsc", labelBn: "এইচএসসি বিজ্ঞান", labelEn: "HSC Science", icon: Atom, match: /hsc|এইচএসসি|পদার্থ|রসায়ন|উচ্চতর গণিত|বিজ্ঞান|science|physics|chemistry|math/i },
  { id: "admission", labelBn: "বিশ্ববিদ্যালয় ভর্তি", labelEn: "University Admission", icon: GraduationCap, match: /admission|ভর্তি|buet|বুয়েট|মেডিকেল|medical|varsity|ভার্সিটি|ইঞ্জিনিয়ারিং|engineering/i },
  { id: "ssc", labelBn: "এসএসসি ৯-১০", labelEn: "SSC 9-10", icon: BookOpen, match: /ssc|এসএসসি|class 9|class 10|৯ম|১০ম|মাধ্যমিক/i },
  { id: "olympiad", labelBn: "আইসিটি ও অলিম্পিয়াড", labelEn: "ICT & Olympiad", icon: Trophy, match: /olympiad|অলিম্পিয়াড|math olympiad|physics olympiad|biology|ict|আইসিটি|c-programming|কোডিং/i },
  { id: "ict_english", labelBn: "ভাষা ও দক্ষতা", labelEn: "Skills & English", icon: Code, match: /english|ইংরেজি|grammar|communication|marketing|graphic|design|web/i },
];

const AllCoursesCatalogPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { user, profile } = useAuth();
  const { courses, isLoading: coursesLoading } = usePublicCourses();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [enrollmentCourse, setEnrollmentCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState<boolean>(false);

  // Sync category, q, and unit params from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("q") || searchParams.get("search");
    const unit = searchParams.get("unit");

    if (cat && categoryList.some((c) => c.id === cat)) {
      setActiveCategory(cat);
    } else {
      setActiveCategory("all");
    }

    if (unit) {
      setSelectedUnitId(unit);
      if (unit === "buet") setSearchQuery("বুয়েট");
      else if (unit === "medical") setSearchQuery("মেডিকেল");
      else if (unit === "varsity") setSearchQuery("ঢাকা বিশ্ববিদ্যালয়");
    } else if (q) {
      setSearchQuery(q);
    } else if (!unit && !q) {
      setSearchQuery("");
      setSelectedUnitId(null);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    if (catId !== "admission") {
      setSelectedUnitId(null);
    }
    if (catId === "all") {
      setSearchQuery("");
      setSelectedUnitId(null);
      setPriceFilter("all");
      setSortBy("default");
      searchParams.delete("category");
    } else {
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  const handleUnitSelect = (unit: TargetUnit | null) => {
    if (!unit) {
      setSelectedUnitId(null);
      setSearchQuery("");
    } else {
      setSelectedUnitId(unit.id);
      setSearchQuery(unit.searchTerm);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSelectedUnitId(null);
    setPriceFilter("all");
    setSortBy("default");
    searchParams.delete("category");
    setSearchParams(searchParams);
  };

  // Filter & sort courses based on search query, active category, price, and sort
  const filteredCourses = useMemo(() => {
    const result = courses.filter((c) => {
      const titleBn = (c as any).titleBn || c.title || "";
      const titleEn = (c as any).titleEn || c.title || "";
      const matchesSearch = 
        !searchQuery.trim() || 
        titleBn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        titleEn.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Price filter
      const price = c.price || 0;
      if (priceFilter === "free" && price > 0) return false;
      if (priceFilter === "paid" && price === 0) return false;

      if (activeCategory === "all") return true;

      const catObj = categoryList.find((cat) => cat.id === activeCategory);
      if (!catObj || !catObj.match) return true;

      return catObj.match.test(titleEn) || catObj.match.test(titleBn);
    });

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    return result;
  }, [courses, activeCategory, searchQuery, priceFilter, sortBy]);

  // Group courses by skill category when "all" is active and default sorting
  const groupedCourses = useMemo(() => {
    const cats = categoryList.filter((c) => c.id !== "all");
    const seen = new Set<string>();
    
    return cats.map((cat) => {
      const matchedItems = courses.filter((c) => {
        const titleBn = (c as any).titleBn || c.title || "";
        const titleEn = (c as any).titleEn || c.title || "";
        const matchesCat = cat.match!.test(titleEn) || cat.match!.test(titleBn);
        if (matchesCat && !seen.has(c.id)) {
          seen.add(c.id);
          return true;
        }
        return false;
      });
      return {
        ...cat,
        items: matchedItems,
      };
    }).filter((group) => group.items.length > 0);
  }, [courses]);

  const handleEnrollClick = (course: Course) => {
    setEnrollmentCourse(course);
    setShowEnrollmentModal(true);
  };

  const getHeaderBadgeText = (catId: string, unitId: string | null, isBn: boolean) => {
    if (catId === "admission") {
      if (unitId === "buet") return isBn ? "ইঞ্জিনিয়ারিং ভর্তি প্রোগ্রাম (BUET + CKRUET)" : "Engineering Admission Track (BUET + CKRUET)";
      if (unitId === "varsity-a") return isBn ? "ভার্সিটি ক ইউনিট স্পেশাল (বিজ্ঞান)" : "Varsity A-Unit Program (DU 'Ka' + GST A)";
      if (unitId === "medical") return isBn ? "মেডিকেল ও ডেন্টাল এডমিশন" : "Medical & Dental Admission Track";
      if (unitId === "varsity-b") return isBn ? "ভার্সিটি খ ও ঘ ইউনিট (মানবিক)" : "Varsity B & D Unit Track";
      if (unitId === "varsity-c") return isBn ? "ভার্সিটি গ ইউনিট (ব্যবসায় শিক্ষা)" : "Varsity C Unit (Business + IBA)";
      return isBn ? "বিশ্ববিদ্যালয় ভর্তি স্পেশাল প্রোগ্রাম" : "University Admission Master Programs";
    }
    if (catId === "hsc") return isBn ? "এইচএসসি বিজ্ঞান একাডেমিক" : "HSC Science Academic Masterclasses";
    if (catId === "ssc") return isBn ? "এসএসসি ৯-১০ বোর্ড প্রস্তুতি" : "SSC 9-10 Board Exam Foundation";
    if (catId === "olympiad") return isBn ? "অলিম্পিয়াড ও স্পেশাল ফাউন্ডেশন" : "National Olympiad & Special Courses";
    if (catId === "ict_english") return isBn ? "আইসিটি ও ল্যাঙ্গুয়েজ ডেভেলপমেন্ট" : "ICT & English Language Skills";
    return isBn ? "আমাদের সকল প্ল্যাটফর্ম কোর্সসমূহ" : "All Platform Learning Courses";
  };

  const getHeaderTitleText = (catId: string, unitId: string | null, isBn: boolean) => {
    if (catId === "admission") {
      if (unitId === "buet") return isBn ? "ইঞ্জিনিয়ারিং ভর্তি কোর্সসমূহ" : "Engineering Admission Preparation Courses";
      if (unitId === "varsity-a") return isBn ? "ঢাকা বিশ্ববিদ্যালয় 'ক' ইউনিট ও ভার্সিটি বিজ্ঞান কোর্স" : "DU Varsity A-Unit & Science Admission Courses";
      if (unitId === "medical") return isBn ? "মেডিকেল ও ডেন্টাল এডমিশন প্রস্তুতি কোর্স" : "Medical & Dental College Admission Courses";
      if (unitId === "varsity-b") return isBn ? "মানবিক ও বিভাগ পরিবর্তন ইউনিট ভর্তি কোর্স" : "Humanities & Varsity B Unit Admission Courses";
      if (unitId === "varsity-c") return isBn ? "ব্যবসায় শিক্ষা ও আইবিএ ভর্তি কোর্সসমূহ" : "Business Faculty & IBA Admission Courses";
      return isBn ? "বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি কোর্সসমূহ" : "University Admission Programs";
    }
    if (catId === "hsc") return isBn ? "এইচএসসি বিজ্ঞান বিভাগের সকল একাডেমিক কোর্স" : "HSC Science Academic Courses";
    if (catId === "ssc") return isBn ? "এসএসসি ৯-১০ শ্রেণির বোর্ড প্রস্তুতি কোর্সসমূহ" : "SSC Board Exam Preparation Courses";
    if (catId === "olympiad") return isBn ? "জাতীয় অলিম্পিয়াড ও অ্যাডভান্সড সলভিং কোর্স" : "National Olympiad & Advanced Solving";
    if (catId === "ict_english") return isBn ? "এইচএসসি আইসিটি ও স্পোকেন/রাইটিং ইংলিশ কোর্স" : "HSC ICT & English Skill Courses";
    return isBn ? "আমাদের সকল একাডেমিক ও ভর্তি প্রস্তুতি কোর্স" : "Explore All Academic & Admission Programs";
  };

  const getHeaderSubtitleText = (catId: string, unitId: string | null, isBn: boolean, count: number) => {
    return isBn
      ? `অভিজ্ঞ মেন্টরদের সাথে মোট ${count} টি কোর্স থেকে বেছে নিন আপনার পছন্দের সঠিক প্রস্তুতি প্রোগ্রাম।`
      : `Select from ${count} specialized courses designed by expert mentors for focused learning.`;
  };

  return (
    <Layout>
      <Helmet>
        <title>{isBn ? "সকল কোর্সসমূহ — Astropixel Learn" : "All Courses — Astropixel Learn"}</title>
        <meta name="description" content="ওয়েব ডেভেলপমেন্ট, গ্রাফিক ডিজাইন, ইউআই/ইউএক্স, এআই ও ডিজিটাল মার্কেটিং কোর্সসমূহ।" />
      </Helmet>

      <div className="min-h-screen bg-[#0B1120] pb-24">
        {/* Ultra-Clean Minimal Hero Header */}
        <section className="relative pt-12 pb-16 bg-[#0B1120] text-white">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-3 tracking-tight">
              {activeCategory === "admission"
                ? (isBn ? "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি" : "Admission & HSC Prep")
                : (isBn ? "আমাদের সকল একাডেমিক ও ভর্তি কোর্সসমূহ" : "Explore All Academic & Admission Courses")}
            </h1>

            <p className="text-slate-300 font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-2">
              {activeCategory === "admission"
                ? (isBn ? "স্বপ্নের ক্যাম্পাসে জায়গা করে নিতে বুয়েট, ঢাবি ও মেডিকেলের অভিজ্ঞ মেন্টরদের বিশেষ এডমিশন প্রোগ্রাম।" : "Specialized admission programs designed by BUET, DU & Medical mentors.")
                : (isBn ? "এইচএসসি বিজ্ঞান, বুয়েট-মেডিকেল ভর্তি ও এসএসসি পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি এক প্ল্যাটফর্মে।" : "Comprehensive preparation for HSC Science, BUET/Medical Admission, and SSC board exams.")}
            </p>

          </div>
        </section>

        {/* Main Content Area with Soft Top Curve */}
        <div className="relative -mt-6 sm:-mt-8 z-10 rounded-t-3xl sm:rounded-t-[32px] bg-slate-50 dark:bg-slate-950 min-h-screen pt-6 pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

            {/* Organized Sub-Navigation Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-xs p-2.5 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
              
              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full lg:w-auto py-0.5">
                {categoryList.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Controls: Price Filter, Sort & Count */}
              <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto text-xs pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                {/* Price Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-sm">
                  {(["all", "paid", "free"] as const).map((pf) => (
                    <button
                      key={pf}
                      onClick={() => setPriceFilter(pf)}
                      className={`px-2.5 py-1 rounded-sm font-bold transition-all cursor-pointer ${
                        priceFilter === pf
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      {pf === "all" ? (isBn ? "সব" : "All") : pf === "paid" ? (isBn ? "পেইড" : "Paid") : (isBn ? "ফ্রি" : "Free")}
                    </button>
                  ))}
                </div>

                <span className="text-slate-500 dark:text-slate-400 font-bold hidden sm:inline">
                  {filteredCourses.length} {isBn ? "টি কোর্স" : "courses"}
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 px-2.5 rounded-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="default">{isBn ? "সাধারণ ক্রম" : "Default Sort"}</option>
                  <option value="price_asc">{isBn ? "ফি: কম থেকে বেশি" : "Price: Low to High"}</option>
                  <option value="price_desc">{isBn ? "ফি: বেশি থেকে কম" : "Price: High to Low"}</option>
                  <option value="name_asc">{isBn ? "কোর্সের নাম (A-Z)" : "Name: A to Z"}</option>
                </select>
              </div>
            </div>
          {/* Admission Target Unit Selector Banner (When Admission is active) */}
          {activeCategory === "admission" && (
            <section className="container mx-auto px-4 sm:px-6 pt-2 pb-2 max-w-6xl">
              <TargetUnitSelector
                selectedUnitId={selectedUnitId}
                onSelectUnit={handleUnitSelect}
              />
            </section>
          )}

          {/* Course Catalog Grid View */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Centered Category & Unit Section Header Tagline (Renders for specific category/unit filters) */}
            {!coursesLoading && filteredCourses.length > 0 && activeCategory !== "all" && (
              <div className="text-center max-w-3xl mx-auto pt-4 pb-8 sm:pt-6 sm:pb-10 space-y-2.5">
                <div className="inline-flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{getHeaderBadgeText(activeCategory, selectedUnitId, isBn)}</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {getHeaderTitleText(activeCategory, selectedUnitId, isBn)}
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
                  {getHeaderSubtitleText(activeCategory, selectedUnitId, isBn, filteredCourses.length)}
                </p>
              </div>
            )}
          {coursesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-card max-w-md mx-auto p-8 shadow-sm">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">
                {isBn ? "কোনো কোর্স পাওয়া যায়নি" : "No courses found"}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {isBn ? "অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজে দেখুন অথবা ফিল্টার রিসেট করুন।" : "Try searching with a different keyword or clear all filters."}
              </p>
              <Button onClick={clearAllFilters} variant="outline" className="rounded-full text-xs font-bold border-brand-500/40 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30">
                {isBn ? "সকল ফিল্টার মুছুন" : "Clear All Filters"}
              </Button>
            </div>
          ) : activeCategory !== "all" || searchQuery.trim() || sortBy !== "default" || priceFilter !== "all" ? (
            /* Flattened Filtered Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredCourses.map((c) => (
                <EdgeCourseCard
                  key={c.id}
                  course={c}
                  className="min-w-0 max-w-none"
                />
              ))}
            </div>
          ) : (
            /* Organized Skill-Based Grouped Sections */
            <div className="space-y-12 max-w-7xl mx-auto">
              {groupedCourses.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.id} className="space-y-5">
                    {/* Section Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-border/40 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                          <GroupIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-foreground">
                            {isBn ? group.labelBn : group.labelEn}
                          </h2>
                          <p className="text-xs text-gray-500">
                            {group.items.length} {isBn ? "টি প্র্যাক্টিক্যাল কোর্স" : "courses available"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section Course Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.items.map((c) => (
                        <EdgeCourseCard
                          key={c.id}
                          course={c}
                          className="min-w-0 max-w-none"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
          </div>
        </div>
      </div>

      {/* Direct Enrollment Modal */}
      {enrollmentCourse && (
        <CourseEnrollmentModal
          isOpen={showEnrollmentModal}
          onClose={() => { setShowEnrollmentModal(false); setEnrollmentCourse(null); }}
          course={enrollmentCourse}
          userId={user?.id}
          userEmail={profile?.email}
          userName={profile?.full_name}
          onSuccess={() => { setShowEnrollmentModal(false); setEnrollmentCourse(null); }}
          language={language}
        />
      )}
    </Layout>
  );
};

export default AllCoursesCatalogPage;
