import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, X, BookOpen, Sparkles, ArrowRight, CornerDownLeft, 
  GraduationCap, Atom, Trophy, Code, Layers 
} from "lucide-react";
import { usePublicCourses } from "@/hooks/usePublicCourses";
import { useLanguage } from "@/contexts/LanguageContext";
import { Course } from "@/types/lms";

interface CourseSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourseSearchModal: React.FC<CourseSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { courses } = usePublicCourses();
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Focus input whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key & Ctrl+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Strict Course-Only Search Filtering
  const filteredCourses = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const title = (c.title || "").toLowerCase();
      const titleBn = ((c as any).titleBn || "").toLowerCase();
      const titleEn = ((c as any).titleEn || "").toLowerCase();
      const category = (c.category || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();

      return (
        title.includes(q) ||
        titleBn.includes(q) ||
        titleEn.includes(q) ||
        category.includes(q) ||
        desc.includes(q)
      );
    }).slice(0, 8); // Top 8 relevant course matches
  }, [courses, query]);

  // Recommended popular courses when query is empty
  const popularCourses = useMemo(() => {
    return (courses || []).slice(0, 4);
  }, [courses]);

  const displayedList = query.trim() ? filteredCourses : popularCourses;

  // Handle keyboard navigation in list
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, displayedList.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayedList.length) % Math.max(1, displayedList.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (displayedList[selectedIndex]) {
        handleSelectCourse(displayedList[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  const handleSelectCourse = (course: Course) => {
    onClose();
    const courseSlug = course.landing_slug || (course as any).slug || course.id;
    const targetPath = `/courses/${courseSlug}`;
    navigate(targetPath);
  };

  const handleCategoryClick = (categorySearch: string) => {
    setQuery(categorySearch);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 sm:px-6">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Search Modal Content Card */}
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-border/80 overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in-50 zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Bar Input Row */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-border/60 bg-muted/20">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isBn ? "কোর্সের নাম বা বিষয় লিখে খুঁজুন... (শুধুমাত্র কোর্স)" : "Search courses by title or subject... (Courses only)"}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/80 transition-colors mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground bg-muted border border-border/70 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Quick Category Filters when search query is empty */}
        {!query.trim() && (
          <div className="px-4 py-3 border-b border-border/40 bg-muted/10">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {isBn ? "জনপ্রিয় ক্যাটাগরি" : "Popular Categories"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: isBn ? "এইচএসসি বিজ্ঞান" : "HSC Science", term: "বিজ্ঞান", icon: Atom },
                { label: isBn ? "মেডিকেল ভর্তি" : "Medical Admission", term: "মেডিকেল", icon: GraduationCap },
                { label: isBn ? "ইঞ্জিনিয়ারিং" : "Engineering", term: "ইঞ্জিনিয়ারিং", icon: Layers },
                { label: isBn ? "অলিম্পিয়াড" : "Olympiad", term: "অলিম্পিয়াড", icon: Trophy },
                { label: isBn ? "আইসিটি ও প্রোগ্রামিং" : "ICT & Programming", term: "ICT", icon: Code },
              ].map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCategoryClick(cat.term)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted/60 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 border border-border/50 text-foreground transition-all"
                  >
                    <CatIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Container */}
        <div 
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain p-2 divide-y divide-border/20"
        >
          <div className="px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {query.trim() 
                ? (isBn ? `খুঁজে পাওয়া কোর্সসমূহ (${filteredCourses.length})` : `Course Results (${filteredCourses.length})`)
                : (isBn ? "প্রস্তাবিত কোর্সসমূহ" : "Featured Courses")}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {isBn ? "কোর্স সার্চ ইঞ্জিন" : "Course Search Engine"}
            </span>
          </div>

          {displayedList.length > 0 ? (
            <div className="flex flex-col gap-1 mt-1">
              {displayedList.map((course, idx) => {
                const isSelected = idx === selectedIndex;
                const priceText = course.price === 0 
                  ? (isBn ? "বিনামূল্যে" : "Free") 
                  : (isBn ? `৳${course.price.toLocaleString("bn-BD")}` : `৳${course.price}`);

                return (
                  <div
                    key={course.id}
                    onClick={() => handleSelectCourse(course)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`
                      group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all
                      ${isSelected 
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-foreground" 
                        : "hover:bg-muted/50 text-foreground"}
                    `}
                  >
                    {/* Course Thumbnail Image or Fallback */}
                    <div className="relative h-12 w-16 rounded-lg overflow-hidden shrink-0 bg-muted border border-border/40 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img 
                          src={course.thumbnail_url} 
                          alt={course.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>

                    {/* Course Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                          {course.category || (isBn ? "একাডেমিক" : "Academic")}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {priceText}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {(course as any).titleBn || course.title}
                      </h4>
                    </div>

                    {/* Action Icon */}
                    <div className="shrink-0 flex items-center pr-1 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {isSelected ? (
                        <CornerDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">
                {isBn ? "কোনো কোর্স পাওয়া যায়নি" : "No courses found"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {isBn 
                  ? `"${query}" সম্পর্কিত কোনো কোর্স নেই। সকল কোর্স ব্রাউজ করতে ক্যাটালগে যান।` 
                  : `No courses match "${query}". Try searching with different terms or view the catalog.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/courses");
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <span>{isBn ? "সকল কোর্স ব্রাউজ করুন" : "Browse All Courses"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-muted/40 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold">↓</kbd>
              {isBn ? "নেভিগেট" : "Navigate"}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold">↵</kbd>
              {isBn ? "কোর্স দেখুন" : "Open Course"}
            </span>
          </div>
          <span className="font-semibold">
            {courses.length} {isBn ? "টি উপলব্ধ কোর্স" : "Available Courses"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseSearchModal;
