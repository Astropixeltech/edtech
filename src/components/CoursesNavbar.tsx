import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  ChevronDown,
  Building2,
  Phone,
  Info,
  Sun,
  Moon,
  BookOpen,
  BadgeCheck,
  ListChecks,
  Sparkles,
  User,
  LogOut,
  GraduationCap,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import learnLogoAssetJson from "@/assets/learn-with-alphazero-logo.png.asset.json";
const learnLogo = learnLogoAssetJson.url;
import MobileSidebar from "./MobileSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CoursesNavbar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { user, profile, role, signOut } = useAuth();

  const isBn = language === "bn";

  useEffect(() => {
    setMounted(true);

    const onScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmissionActive = location.pathname === "/courses" && location.search.includes("category=admission");
  const isCoursesActive = location.pathname === "/courses" && !location.search.includes("category=admission");
  const isToolsActive = ["/free-resources", "/eligibility-calculator", "/syllabus-calculator"].some(p => location.pathname.startsWith(p));
  const isCompanyActive = ["/about", "/contact"].some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* Floating Glassmorphism Navbar Container (Permanently Pinned on Scroll) */}
      <header className="fixed top-0 left-0 right-0 z-[100] w-full px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none transition-all duration-300">
        <div className={`pointer-events-auto mx-auto max-w-6xl h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between rounded-2xl md:rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ${isScrolled ? "shadow-xl shadow-black/10 border-emerald-500/20" : ""}`}>
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center group">
              <div
                aria-label="Astropixel Learn"
                className="h-9 sm:h-11 w-32 sm:w-40 md:w-48 transition-transform duration-200 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(90deg, #1d931d, #167a16, #116111)`,
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
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            
            {/* Home */}
            <Link
              to="/"
              className={`relative px-3.5 py-1.5 text-xs lg:text-sm font-bold rounded-full transition-colors ${
                location.pathname === "/"
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-900/30"
                  : "text-foreground/80 hover:text-brand-600 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {isBn ? "হোম" : "Home"}
            </Link>

            {/* Courses */}
            <Link
              to="/courses"
              className={`relative px-3.5 py-1.5 text-xs lg:text-sm font-bold rounded-full transition-colors ${
                isCoursesActive
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-900/30"
                  : "text-foreground/80 hover:text-brand-600 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {isBn ? "কোর্সসমূহ" : "Courses"}
            </Link>

            {/* Admission */}
            <Link
              to="/courses?category=admission"
              className={`relative px-3.5 py-1.5 text-xs lg:text-sm font-bold rounded-full transition-colors ${
                isAdmissionActive
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-900/30"
                  : "text-foreground/80 hover:text-brand-600 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-1">
                <span>{isBn ? "এডমিশন" : "Admission"}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              </span>
            </Link>

            {/* Tools & Resources Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`group relative flex items-center gap-1 px-3.5 py-1.5 text-xs lg:text-sm font-bold rounded-full outline-none transition-colors ${
                    isToolsActive
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-900/30"
                      : "text-foreground/80 hover:text-brand-600 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{isBn ? "টুলস ও রিসোর্স" : "Tools & Free"}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-xl border border-border/50 rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95">
                <DropdownMenuItem asChild>
                  <Link to="/free-resources" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer">
                    <BookOpen className="h-4 w-4 text-brand-500" />
                    <span>{isBn ? "ফ্রি রিসোর্স ও নোটস" : "Free Resources & Notes"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/eligibility-calculator" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer">
                    <BadgeCheck className="h-4 w-4 text-brand-500" />
                    <span>{isBn ? "যোগ্যতা যাচাই ক্যালকুলেটর" : "Eligibility Calculator"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/syllabus-calculator" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer">
                    <ListChecks className="h-4 w-4 text-brand-500" />
                    <span>{isBn ? "সিলেবাস শেষ হইসে ট্র্যাকার" : "Syllabus Tracker"}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Company Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`group relative flex items-center gap-1 px-3.5 py-1.5 text-xs lg:text-sm font-bold rounded-full outline-none transition-colors ${
                    isCompanyActive
                      ? "text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-900/30"
                      : "text-foreground/80 hover:text-brand-600 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{isBn ? "কোম্পানি" : "Company"}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-xl border border-border/50 rounded-2xl p-1.5 animate-in fade-in-50 zoom-in-95">
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer">
                    <Info className="h-4 w-4 text-brand-500" />
                    <span>{isBn ? "আমাদের সম্পর্কে" : "About Us"}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/contact" className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer">
                    <Phone className="h-4 w-4 text-brand-500" />
                    <span>{isBn ? "যোগাযোগ" : "Contact"}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden sm:flex items-center justify-center h-8 w-8 rounded-full border border-border/60 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
              </button>
            )}

            {/* Auth Button or User Profile Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-border/60 hover:bg-black/5 dark:hover:bg-white/5 transition-all outline-none"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-brand-500/30">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-brand-500 text-white text-xs font-bold">
                        {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block max-w-[90px] truncate text-xs font-bold text-foreground">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-card/95 backdrop-blur-xl shadow-xl border border-border/50 rounded-2xl p-2 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2.5 py-2 border-b border-border/40 mb-1">
                    <p className="text-xs font-bold text-foreground truncate">
                      {profile?.full_name || user.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded uppercase bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        {role || "student"}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      to={role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student"}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4 text-brand-500" />
                      <span>{isBn ? "আমার ড্যাশবোর্ড" : "My Dashboard"}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      to="/my-certificates"
                      className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer"
                    >
                      <Award className="h-4 w-4 text-brand-500" />
                      <span>{isBn ? "সার্টিফিকেটসমূহ" : "My Certificates"}</span>
                    </Link>
                  </DropdownMenuItem>

                  {role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4 text-brand-500" />
                        <span>{isBn ? "অ্যাডমিন প্যানেল" : "Admin Panel"}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1 border-border/40" />

                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-semibold rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isBn ? "লগআউট" : "Log Out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <button className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full text-xs font-bold transition-all duration-200 text-white bg-brand-500 hover:bg-brand-600 px-4 sm:px-5 py-2 shadow-sm hover:shadow active:scale-95">
                  <User className="h-3.5 w-3.5" />
                  <span>{isBn ? "লগইন" : "Login"}</span>
                </button>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setIsMobileOpen(true)}
              className="block cursor-pointer lg:hidden text-foreground/80 hover:text-brand-600 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      <MobileSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
};

export default CoursesNavbar;
