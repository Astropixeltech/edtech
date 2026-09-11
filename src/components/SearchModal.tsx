import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Layout, Users, Phone, BookOpen, Info, Sparkles, Loader2, GraduationCap, User, Clock, Calculator, Download, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  path: string;
  icon: React.ElementType;
  keywords: string[];
  category?: string;
}

// Team members data for search
const teamMembers = [
  {
    name: "Sofiullah Ahammad",
    nameBn: "সফিউল্লাহ আহাম্মদ",
    role: "Founder, Graphics Designer, Vibe Coding Expert, Freelance Photographer",
    roleBn: "প্রতিষ্ঠাতা, গ্রাফিক ডিজাইনার, ভাইব কোডিং এক্সপার্ট",
    keywords: ["sofiullah", "ahammad", "atik", "founder", "graphics", "designer", "photographer", "সফিউল্লাহ", "আতিক", "ফাউন্ডার", "ডিজাইনার"]
  },
  {
    name: "Adib Sarkar",
    nameBn: "আদিব সরকার",
    role: "Founder, Lead Designer, Entrepreneur",
    roleBn: "প্রতিষ্ঠাতা, লিড ডিজাইনার, উদ্যোক্তা",
    keywords: ["adib", "sarkar", "founder", "lead", "designer", "entrepreneur", "আদিব", "সরকার", "লিড", "উদ্যোক্তা"]
  },
  {
    name: "Md.Kamrul Hasan",
    nameBn: "মো. কামরুল হাসান",
    role: "Founder, Microsoft Office Expert, Graphics Designer",
    roleBn: "প্রতিষ্ঠাতা, মাইক্রোসফট অফিস এক্সপার্ট, গ্রাফিক ডিজাইনার",
    keywords: ["kamrul", "hasan", "microsoft", "office", "excel", "word", "powerpoint", "কামরুল", "হাসান", "মাইক্রোসফট", "অফিস"]
  },
  {
    name: "Md.Shafiul Haque",
    nameBn: "মো. শফিউল হক",
    role: "Web Designer, Video Editor, Content Creator, Cinematographer",
    roleBn: "ওয়েব ডিজাইনার, ভিডিও এডিটর, কন্টেন্ট ক্রিয়েটর",
    keywords: ["shafiul", "haque", "shaurav", "web", "video", "editor", "cinematographer", "content", "শফিউল", "হক", "ভিডিও", "এডিটর"]
  },
  {
    name: "Prantik Saha",
    nameBn: "প্রান্তিক সাহা",
    role: "Graphics Designer, Microsoft Office Expert, IT Support",
    roleBn: "গ্রাফিক ডিজাইনার, মাইক্রোসফট অফিস এক্সপার্ট, আইটি সাপোর্ট",
    keywords: ["prantik", "saha", "graphics", "it", "support", "প্রান্তিক", "সাহা", "আইটি", "সাপোর্ট"]
  },
];

// Static pages data with updated routes
const staticPages: SearchItem[] = [
  {
    title: "Home",
    titleBn: "হোম",
    description: "Welcome to Astropixel Learn - Premier Online Learning",
    descriptionBn: "Astropixel Learn-এ স্বাগতম - আধুনিক অনলাইন লার্নিং প্ল্যাটফর্ম",
    path: "/",
    icon: Layout,
    keywords: ["home", "main", "landing", "welcome", "astropixel", "learn", "হোম", "প্রধান", "স্বাগতম"],
    category: "page"
  },
  {
    title: "All Courses Catalog",
    titleBn: "সকল কোর্স ক্যাটালগ",
    description: "Browse all engineering, university and HSC admission preparation courses",
    descriptionBn: "ইঞ্জিনিয়ারিং, বিশ্ববিদ্যালয় এবং এইচএসসি প্রস্তুতিমূলক সকল কোর্স ব্রাউজ করুন",
    path: "/catalog",
    icon: BookOpen,
    keywords: ["courses", "course", "catalog", "engineering", "buet", "admission", "medical", "hsc", "academic", "কোর্স", "ক্যাটালগ", "ভর্তি"],
    category: "course"
  },
  {
    title: "Free Resources & Study Guides",
    titleBn: "বিনামূল্যে রিসোর্স ও স্টাডি গাইড",
    description: "Download free formula sheets, mock tests, and admission question banks",
    descriptionBn: "বিনামূল্যে সূত্র তালিকা, মক টেস্ট এবং ভর্তি প্রশ্নব্যাংক ডাউনলোড করুন",
    path: "/free-resources",
    icon: Download,
    keywords: ["free", "resources", "download", "pdf", "sheet", "formula", "bank", "questions", "ফ্রি", "রিসোর্স", "ডাউনলোড", "পিডিএফ", "প্রশ্নব্যাংক"],
    category: "page"
  },
  {
    title: "Syllabus Progress Tracker",
    titleBn: "সিলেবাস অগ্রগতি ট্র্যাকার",
    description: "Track your admission and academic chapter completion progress live",
    descriptionBn: "আপনার ভর্তি ও একাডেমিক অধ্যায় সম্পন্ন করার লাইভ অগ্রগতি ট্র্যাক করুন",
    path: "/syllabus-calculator",
    icon: Compass,
    keywords: ["syllabus", "tracker", "calculator", "progress", "chapters", "hsc", "admission", "সিলেবাস", "ট্র্যাকার", "অগ্রগতি", "অধ্যায়"],
    category: "tool"
  },
  {
    title: "Admission Eligibility Calculator",
    titleBn: "ভর্তি যোগ্যতা ক্যালকুলেটর",
    description: "Check BUET, Medical, DU and Engineering eligibility based on your GPA",
    descriptionBn: "আপনার জিপিএ দিয়ে বুয়েট, মেডিকেল, ঢাবি ও ইঞ্জিনিয়ারিং ভর্তি যোগ্যতা যাচাই করুন",
    path: "/eligibility-calculator",
    icon: Calculator,
    keywords: ["eligibility", "calculator", "buet", "du", "gpa", "ssc", "hsc", "মেডিকেল", "বুয়েট", "যোগ্যতা", "ক্যালকুলেটর"],
    category: "tool"
  },
  {
    title: "About Us",
    titleBn: "আমাদের সম্পর্কে",
    description: "Learn about Astropixel Learn's mission, instructors and vision",
    descriptionBn: "Astropixel Learn-এর মিশন, শিক্ষকবৃন্দ এবং ভিশন সম্পর্কে জানুন",
    path: "/about",
    icon: Info,
    keywords: ["about", "story", "values", "mission", "vision", "instructors", "আমাদের", "সম্পর্কে", "মিশন"],
    category: "page"
  },
  {
    title: "Our Instructors & Mentors",
    titleBn: "আমাদের প্রশিক্ষক ও মেন্টর",
    description: "Meet our top engineering and university instructors",
    descriptionBn: "শীর্ষ ইঞ্জিনিয়ারিং ও বিশ্ববিদ্যালয়ের অভিজ্ঞ শিক্ষকদের সাথে পরিচিত হন",
    path: "/about#team",
    icon: Users,
    keywords: ["team", "mentors", "teachers", "instructors", "faculty", "শিক্ষক", "মেন্টর"],
    category: "page"
  },
  {
    title: "Student Portal Login",
    titleBn: "শিক্ষার্থী পোর্টাল লগইন",
    description: "Login to access your enrolled courses, classes and progress",
    descriptionBn: "আপনার ভর্তি হওয়া কোর্স ও ক্লাস দেখার জন্য শিক্ষার্থী পোর্টালে লগইন করুন",
    path: "/student/login",
    icon: GraduationCap,
    keywords: ["student", "login", "portal", "dashboard", "enrolled", "my courses", "লগইন", "শিক্ষার্থী", "পোর্টাল"],
    category: "page"
  },
  {
    title: "Verify Certificate",
    titleBn: "সার্টিফিকেট যাচাই",
    description: "Verify your Astropixel course completion certificate authenticity",
    descriptionBn: "আপনার Astropixel কোর্স সমাপ্তি সার্টিফিকেটের সত্যতা যাচাই করুন",
    path: "/verify-certificate",
    icon: BookOpen,
    keywords: ["verify", "certificate", "check", "authenticity", "সার্টিফিকেট", "যাচাই", "ভেরিফাই"],
    category: "page"
  },
  {
    title: "Contact & Student Support",
    titleBn: "যোগাযোগ ও শিক্ষার্থী সহায়তা",
    description: "24/7 student support, hotline and live query desk",
    descriptionBn: "২৪/৭ শিক্ষার্থী সহায়তা ডেস্ক, হটলাইন ও সাপোর্ট টিকিট",
    path: "/contact",
    icon: Phone,
    keywords: ["contact", "support", "help", "hotline", "ticket", "যোগাযোগ", "সাহায্য", "সাপোর্ট"],
    category: "page"
  },
];

// Highlight matching text
const highlightMatch = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  try {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/40 text-foreground font-semibold rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  } catch {
    return text;
  }
};

const RECENT_SEARCHES_KEY = "ap_recent_searches";

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [dynamicData, setDynamicData] = useState<SearchItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const navigate = useNavigate();
  const { language } = useLanguage();

  // Load courses from database and combine with team members
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const { data: courses } = await supabase
          .from('courses')
          .select('id, title, description')
          .eq('is_published', true);

        const dynamicItems: SearchItem[] = [];

        // Add courses
        if (courses) {
          courses.forEach(course => {
            dynamicItems.push({
              title: course.title,
              titleBn: course.title,
              description: course.description || "Comprehensive course by Astropixel Learn",
              descriptionBn: course.description || "Astropixel Learn-এর সাথে পূর্ণাঙ্গ প্রস্তুতি",
              path: `/courses/${course.id}`,
              icon: GraduationCap,
              keywords: [course.title.toLowerCase(), "course", "কোর্স", "training", "প্রস্তুতি"],
              category: "course"
            });
          });
        }

        // Add team members
        teamMembers.forEach(member => {
          dynamicItems.push({
            title: member.name,
            titleBn: member.nameBn,
            description: member.role,
            descriptionBn: member.roleBn,
            path: "/about#team",
            icon: User,
            keywords: [...member.keywords, "team", "member", "trainer", "টিম", "শিক্ষক", "মেন্টর"],
            category: "team"
          });
        });

        setDynamicData(dynamicItems);
      } catch (error) {
        console.error('Error loading dynamic data:', error);
      }
    };

    if (isOpen) {
      loadDynamicData();
    }
  }, [isOpen]);

  // Combined search data
  const allSearchData = useMemo(() => [...staticPages, ...dynamicData], [dynamicData]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return staticPages.slice(0, 6);
    
    const searchTerm = query.toLowerCase().trim();
    const terms = searchTerm.split(/\s+/);
    
    return allSearchData.filter(item => {
      const searchableText = [
        item.title.toLowerCase(),
        item.titleBn.toLowerCase(),
        item.description.toLowerCase(),
        item.descriptionBn.toLowerCase(),
        ...item.keywords.map(k => k.toLowerCase())
      ].join(' ');
      
      return terms.every(term => searchableText.includes(term));
    }).slice(0, 10);
  }, [query, allSearchData]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filteredResults.length]);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const updated = [trimmed, ...prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent searches", e);
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const handleSelect = (path: string, searchTitle?: string) => {
    if (searchTitle) {
      saveRecentSearch(searchTitle);
    } else if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    navigate(path);
    onClose();
    setQuery("");
    setAiSuggestion(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedItem = filteredResults[selectedIndex];
      if (selectedItem) {
        handleSelect(selectedItem.path, language === "bn" ? selectedItem.titleBn : selectedItem.title);
      }
    }
  };

  // AI-powered search suggestion
  const getAiSuggestion = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setAiSuggestion(null);
      return;
    }

    setIsAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: `User is searching for "${searchQuery}" on Astropixel Learn. We offer university admission prep, HSC prep, syllabus calculators, eligibility tools, and certificates.
Suggest which page they should visit in 1 short sentence. Available: All Courses (/catalog), Free Resources (/free-resources), Syllabus Tracker (/syllabus-calculator), Eligibility Calculator (/eligibility-calculator), Student Portal (/student/login), About (/about), Contact (/contact).
Reply in ${language === 'bn' ? 'Bengali' : 'English'} only under 15 words.`
        }
      });

      if (error) throw error;
      setAiSuggestion(data?.response || null);
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestion(null);
    } finally {
      setIsAiLoading(false);
    }
  }, [language]);

  // Debounced AI suggestion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 3 && filteredResults.length === 0) {
        getAiSuggestion(query);
      } else {
        setAiSuggestion(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, filteredResults.length, getAiSuggestion]);

  // Modal lifecycle & Escape / Ctrl+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleGlobalKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setAiSuggestion(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] backdrop-blur-xl bg-background/60"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="fixed inset-x-4 top-[10%] md:left-1/2 md:-translate-x-1/2 md:inset-x-auto z-[101] w-auto md:w-full md:max-w-xl"
          >
            <div className="bg-background border border-border/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* Search Input Bar */}
              <div className="flex items-center gap-3 p-4 border-b border-border/60 bg-secondary/20">
                <div className="relative">
                  <Search size={20} className="text-primary" />
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-primary animate-pulse" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={language === "bn" ? "কোর্স, পেইজ, শিক্ষক বা টুল খুঁজুন... (↑↓ দিয়ে ব্রাউজ করুন)" : "Search courses, pages, tools... (Use ↑↓ to navigate)"}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                  autoFocus
                  aria-label="Search"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear search text"
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-muted-foreground bg-secondary border border-border rounded">
                  Esc
                </kbd>
                <button
                  onClick={onClose}
                  aria-label="Close search"
                  className="w-8 h-8 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>

              {/* AI Suggestion Banner */}
              <AnimatePresence>
                {(isAiLoading || aiSuggestion) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-primary/10 border-b border-primary/20 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-4 py-2.5">
                      {isAiLoading ? (
                        <>
                          <Loader2 size={16} className="text-primary animate-spin" />
                          <span className="text-sm text-primary">
                            {language === "bn" ? "AI ভাবছে..." : "AI thinking..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-primary shrink-0" />
                          <span className="text-sm text-foreground">{aiSuggestion}</span>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent Searches Pills (When Query is Empty) */}
              {!query.trim() && recentSearches.length > 0 && (
                <div className="px-4 pt-3 pb-2 border-b border-border/40 bg-secondary/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Clock size={12} />
                      <span>{language === "bn" ? "সাম্প্রতিক অনুসন্ধান" : "Recent Searches"}</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      {language === "bn" ? "মুছে ফেলুন" : "Clear"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="px-2.5 py-1 rounded-md text-xs bg-secondary/80 hover:bg-primary/20 hover:text-primary transition-colors border border-border/60 text-foreground flex items-center gap-1"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results / Navigation List */}
              <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
                {query.trim() && (
                  <div className="px-3 py-1 text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      {language === "bn" 
                        ? `"${query}" এর জন্য ${filteredResults.length}টি ফলাফল` 
                        : `${filteredResults.length} results for "${query}"`}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">Press Enter ↵ to open</span>
                  </div>
                )}
                
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={`${item.path}-${index}`}
                        onClick={() => handleSelect(item.path, language === "bn" ? item.titleBn : item.title)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left group ${
                          isSelected 
                            ? "bg-primary/15 ring-1 ring-primary/40 text-foreground" 
                            : "hover:bg-secondary/60 text-foreground"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                        }`}>
                          <item.icon size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {highlightMatch(language === "bn" ? item.titleBn : item.title, query)}
                            </h4>
                            {item.category === "course" && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full shrink-0 font-medium">
                                {language === "bn" ? "কোর্স" : "Course"}
                              </span>
                            )}
                            {item.category === "tool" && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-500 rounded-full shrink-0 font-medium">
                                {language === "bn" ? "টুল" : "Tool"}
                              </span>
                            )}
                            {item.category === "team" && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-500 rounded-full shrink-0 font-medium">
                                {language === "bn" ? "টিম" : "Team"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {highlightMatch(language === "bn" ? item.descriptionBn : item.description, query)}
                          </p>
                        </div>
                        <ArrowRight size={15} className={`transition-all shrink-0 ${
                          isSelected ? "opacity-100 translate-x-1 text-primary" : "opacity-0 text-muted-foreground"
                        }`} />
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{language === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found"}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {language === "bn" ? "অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করুন" : "Try searching for courses, tools, or syllabus"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="p-3 border-t border-border/60 bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-primary" />
                  <span>Astropixel Learn Search</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span><kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">↑↓</kbd> Navigate</span>
                  <span><kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">↵</kbd> Select</span>
                  <span><kbd className="font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">Esc</kbd> Close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;