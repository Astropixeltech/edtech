import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  Sun,
  Moon,
  BookOpen,
  BadgeCheck,
  ListChecks,
  User,
  LogOut,
  GraduationCap,
  Search,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;
import MobileSidebar from "./MobileSidebar";
import CourseSearchModal from "./CourseSearchModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const CoursesNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, profile, role, signOut } = useAuth();

  const isBn = language === "bn";

  useEffect(() => {
    setMounted(true);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const isAdmissionActive = location.pathname === "/courses" && location.search.includes("category=admission");
  const isCoursesActive = location.pathname === "/courses" && !location.search.includes("category=admission");
  const isToolsActive = ["/free-resources", "/eligibility-calculator", "/syllabus-calculator"].some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* 10 Minute School-Style Full-Width Sticky Navbar */}
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-border/80 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto h-16 sm:h-[72px] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Brand Logo & Course Search Bar */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 max-w-xl">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center shrink-0 group">
              <div
                aria-label="Astropixel Learn"
                className="h-9 sm:h-10 w-32 sm:w-40 transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(90deg, #10b981, #059669, #047857)`,
                  WebkitMaskImage: `url(${learnLogo})`,
                  maskImage: `url(${learnLogo})`,
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "left center",
                  maskPosition: "left center",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                }}
              />
            </Link>

            {/* Course-Only Search Trigger Bar */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="hidden sm:flex items-center relative flex-1 max-w-sm h-10 pl-3.5 pr-3 text-xs sm:text-sm font-medium rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/60 text-slate-500 dark:text-slate-400 transition-all text-left group cursor-pointer"
            >
              <Search className="w-4 h-4 mr-2.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
              <span className="flex-1 truncate">
                {isBn ? "কোর্স খুঁজুন..." : "Search courses..."}
              </span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Middle: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {/* Courses / সকল কোর্স */}
            <Link
              to="/courses"
              className={`px-3.5 py-2 text-xs xl:text-sm font-bold rounded-xl transition-colors ${
                isCoursesActive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isBn ? "সকল কোর্স" : "All Courses"}
            </Link>

            {/* Admission / ভর্তি পরীক্ষা */}
            <Link
              to="/courses?category=admission"
              className={`px-3.5 py-2 text-xs xl:text-sm font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                isAdmissionActive
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{isBn ? "ভর্তি পরীক্ষা" : "Admission"}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            </Link>

            {/* Free Resources / ফ্রি রিসোর্স */}
            <Link
              to="/free-resources"
              className={`px-3.5 py-2 text-xs xl:text-sm font-bold rounded-xl transition-colors ${
                location.pathname === "/free-resources"
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {isBn ? "ফ্রি রিসোর্স" : "Free Resources"}
            </Link>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-1 px-3.5 py-2 text-xs xl:text-sm font-bold rounded-xl outline-none transition-colors ${
                    isToolsActive
                      ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                      : "text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{isBn ? "টুলস ও ফিচার" : "Tools"}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 shadow-xl border border-border rounded-xl p-1.5">
                <DropdownMenuItem asChild>
                  <Link to="/eligibility-calculator" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200">
                    <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? "ভর্তি যোগ্যতা যাচাই" : "Eligibility Calculator"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/syllabus-calculator" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200">
                    <ListChecks className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? "সিলেবাস ট্র্যাকার" : "Syllabus Tracker"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-certificates" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200">
                    <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isBn ? "আমার সার্টিফিকেটসমূহ" : "My Certificates"}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right: Search (Mobile), Language, Theme & Auth Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Search Trigger Icon */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              aria-label="Search courses"
              className="flex sm:hidden items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
              aria-label="Toggle Language"
              title={isBn ? "Switch language to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">{isBn ? "EN" : "বাং"}</span>
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>
            )}

            {/* User Profile or 10MS Green Login CTA Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-1 pr-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all outline-none"
                  >
                    <Avatar className="h-8 w-8 border border-emerald-500/40">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">
                        {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-bold text-slate-900 dark:text-white">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900 shadow-xl border border-border rounded-xl p-2 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {profile?.full_name || user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {role || "student"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      to={role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student"}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isBn ? "ড্যাশবোর্ড" : "Dashboard"}</span>
                    </Link>
                  </DropdownMenuItem>

                  {role === "student" && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/student"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{isBn ? "আমার কোর্সসমূহ" : "My Courses"}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isBn ? "লগআউট" : "Log Out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 text-white bg-emerald-600 hover:bg-emerald-700 px-4 sm:px-6 py-2.5 shadow-sm active:scale-95">
                  <User className="h-4 w-4" />
                  <span>{isBn ? "লগইন" : "Login"}</span>
                </button>
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              aria-label="Open Navigation Menu"
              onClick={() => setIsMobileOpen(true)}
              className="flex lg:hidden items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <MobileSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Course-Only Search Modal */}
      <CourseSearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default CoursesNavbar;
