import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { useAuth } from "@/contexts/AuthContext";
import CourseEnrollmentModal from "@/components/student/CourseEnrollmentModal";
import { 
  Code, Palette, Bot, TrendingUp, Search, Sparkles, BookOpen, Clock, 
  ArrowRight, CheckCircle2, Star, Monitor, Video, Wrench, Shield, GraduationCap,
  Layers, Stethoscope, Building, Compass, Atom, FlaskConical, Calculator, Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course } from "@/types/lms";
import EdgeCourseCard from "@/components/EdgeCourseCard";
import CourseCardSkeleton from "@/components/skeletons/CourseCardSkeleton";

const categoryList = [
  { id: "all", labelBn: "সব কোর্স", labelEn: "All Courses", icon: BookOpen },
  { id: "hsc", labelBn: "এইচএসসি বিজ্ঞান", labelEn: "HSC Science", icon: Atom, match: /hsc|এইচএসসি|পদার্থ|রসায়ন|উচ্চতর গণিত|বিজ্ঞান|science|physics|chemistry|math/i },
  { id: "admission", labelBn: "বিশ্ববিদ্যালয় ভর্তি", labelEn: "University Admission", icon: GraduationCap, match: /admission|ভর্তি|buet|বুয়েট|মেডিকেল|medical|varsity|ভার্সিটি|ইঞ্জিনিয়ারিং|engineering/i },
  { id: "ssc", labelBn: "এসএসসি ৯-১০", labelEn: "SSC 9-10", icon: BookOpen, match: /ssc|এসএসসি|class 9|class 10|৯ম|১০ম|মাধ্যমিক/i },
  { id: "olympiad", labelBn: "অলিম্পিয়াড ও স্পেশাল", labelEn: "Olympiad & Special", icon: Trophy, match: /olympiad|অলিম্পিয়াড|math olympiad|physics olympiad|biology/i },
  { id: "ict_english", labelBn: "আইসিটি ও ভাষা", labelEn: "ICT & English", icon: Code, match: /ict|আইসিটি|english|ইংরেজি|grammar|communication/i },
];

const admissionUnits = [
  { id: "eng", nameBn: "Engineering (ইঞ্জিনিয়ারিং)", icon: Building, color: "border-blue-500 text-blue-600 bg-blue-50/50" },
  { id: "varsity_a", nameBn: "Varsity A Unit (বিজ্ঞান)", icon: Compass, color: "border-emerald-500 text-emerald-600 bg-emerald-50/50" },
  { id: "medical", nameBn: "Medical (মেডিকেল)", icon: Stethoscope, color: "border-red-500 text-red-600 bg-red-50/50" },
  { id: "varsity_b", nameBn: "Varsity B & D Unit (মানবিক)", icon: BookOpen, color: "border-amber-500 text-amber-600 bg-amber-50/50" },
  { id: "varsity_c", nameBn: "Varsity C Unit (ব্যবসায়)", icon: TrendingUp, color: "border-purple-500 text-purple-600 bg-purple-50/50" },
];

const AllCoursesCatalogPage = () => {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const { user, profile } = useAuth();
  const { courses, isLoading: coursesLoading } = usePublicCourses();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [enrollmentCourse, setEnrollmentCourse] = useState<Course | null>(null);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState<boolean>(false);

  // Sync category param from URL
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && categoryList.some((c) => c.id === cat)) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    if (catId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", catId);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
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

  return (
    <Layout>
      <Helmet>
        <title>{isBn ? "সকল কোর্সসমূহ — Astropixel Learn" : "All Courses — Astropixel Learn"}</title>
        <meta name="description" content="ওয়েব ডেভেলপমেন্ট, গ্রাফিক ডিজাইন, ইউআই/ইউএক্স, এআই ও ডিজিটাল মার্কেটিং কোর্সসমূহ।" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Page Hero Header */}
        <section className="relative pt-8 pb-10 border-b border-gray-100 dark:border-border/40 bg-gradient-to-b from-brand-50/40 via-transparent to-transparent">
          <div className="container mx-auto px-4 sm:px-6 text-center max-w-4xl">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-3">
              {activeCategory === "admission"
                ? (isBn ? "এইচএসসি ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি" : "Admission & HSC Prep")
                : (isBn ? "আমাদের সকল একাডেমিক ও ভর্তি কোর্সসমূহ" : "Explore All Academic & Admission Courses")}
            </h1>

            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
              {activeCategory === "admission"
                ? (isBn ? "স্বপ্নের ক্যাম্পাসে জায়গা করে নিতে বুয়েট, ঢাবি ও মেডিকেলের অভিজ্ঞ মেন্টরদের বিশেষ এডমিশন প্রোগ্রাম।" : "Specialized admission programs designed by BUET, DU & Medical mentors.")
                : (isBn ? "এইচএসসি বিজ্ঞান, বুয়েট-মেডিকেল ভর্তি ও এসএসসি পরীক্ষার পূর্ণাঙ্গ প্রস্তুতি এক প্ল্যাটফর্মে।" : "Comprehensive preparation for HSC Science, BUET/Medical Admission, and SSC board exams.")}
            </p>

            {/* Interactive Search Bar */}
            <div className="relative max-w-xl mx-auto mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder={isBn ? "কোর্সের নাম লিখে খুঁজুন..." : "Search courses by keyword..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-10 h-12 rounded-full border-gray-300 dark:border-border bg-white dark:bg-card shadow-sm text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus-visible:ring-brand-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Skill Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none max-w-full py-1 px-2">
              {categoryList.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 transition-all duration-200 border ${
                      isActive
                        ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                        : "bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-accent text-slate-900 dark:text-slate-100 border-gray-300 dark:border-border"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Controls: Price Filter, Sort & Count */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-border/40 max-w-4xl mx-auto px-2 text-xs">
              {/* Price Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-card/80 p-1 rounded-full border border-border/50">
                {(["all", "paid", "free"] as const).map((pf) => (
                  <button
                    key={pf}
                    onClick={() => setPriceFilter(pf)}
                    className={`px-3 py-1 rounded-full font-bold transition-all ${
                      priceFilter === pf
                        ? "bg-white dark:bg-muted text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pf === "all" ? (isBn ? "সব কোর্স" : "All") : pf === "paid" ? (isBn ? "পেইড" : "Paid") : (isBn ? "ফ্রি" : "Free")}
                  </button>
                ))}
              </div>

              {/* Course count & Sort dropdown */}
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-muted-foreground font-medium">
                  {filteredCourses.length} {isBn ? "টি কোর্স" : "courses"}
                </span>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-white dark:bg-card text-foreground font-semibold focus:outline-none focus:border-brand-500"
                >
                  <option value="default">{isBn ? "সাধারণ ক্রম" : "Default Sort"}</option>
                  <option value="price_asc">{isBn ? "ফি: কম থেকে বেশি" : "Price: Low to High"}</option>
                  <option value="price_desc">{isBn ? "ফি: বেশি থেকে কম" : "Price: High to Low"}</option>
                  <option value="name_asc">{isBn ? "কোর্সের নাম (A-Z)" : "Name: A to Z"}</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* Admission Unit Selector Banner (When Admission is active) */}
        {activeCategory === "admission" && (
          <section className="container mx-auto px-4 sm:px-6 pt-6 max-w-6xl">
            <div className="rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-6 shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3 text-center sm:text-left">
                {isBn ? "তোমার ইউনিট বেছে নাও:" : "Select your target unit:"}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {admissionUnits.map((u) => {
                  const Icon = u.icon;
                  return (
                    <div
                      key={u.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSearchQuery(u.nameBn.split(" ")[0])}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSearchQuery(u.nameBn.split(" ")[0]);
                        }
                      }}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${u.color}`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-xs font-bold text-center leading-snug">
                        {u.nameBn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Course Catalog Grid View */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
