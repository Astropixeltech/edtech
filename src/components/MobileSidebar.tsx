import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  LayoutGrid,
  BookOpen,
  BadgeCheck,
  ListChecks,
  GraduationCap,
  Info,
  Phone,
  Building2,
  ChevronDown,
  Languages,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ isOpen, onClose }: MobileSidebarProps) => {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const isBn = language === "bn";
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

  const links = [
    { name: isBn ? "হোম" : "Home", to: "/", icon: Home },
    { name: isBn ? "ক্যাটাগরি" : "Categories", to: "/courses", icon: LayoutGrid },
    { name: isBn ? "ফ্রি রিসোর্স" : "Free Resources", to: "/free-resources", icon: BookOpen },
    { name: isBn ? "যোগ্যতা যাচাই" : "Eligibility Calculator", to: "/eligibility-calculator", icon: BadgeCheck },
    { name: isBn ? "সিলেবাস ক্যালকুলেটর" : "Syllabus Tracker", to: "/syllabus-calculator", icon: ListChecks },
    { name: isBn ? "এডমিশন" : "Admission", to: "/courses", icon: GraduationCap },
  ];

  const companyLinks = [
    { name: isBn ? "আমাদের সম্পর্কে" : "About Us", to: "/about", icon: Info },
    { name: isBn ? "যোগাযোগ" : "Contact", to: "/contact", icon: Phone },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        aria-hidden={!isOpen}
        className={`fixed right-0 top-20 z-50 h-[calc(100vh-5rem)] w-[280px] bg-white dark:bg-card border-l border-border/40 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full w-full flex-col gap-1 overflow-y-auto overscroll-contain p-4">
          {/* Close button */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="mb-2 ml-auto rounded-lg border border-border p-2 text-foreground shadow-sm transition-colors hover:bg-cus-gray-50 dark:hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to + item.name}
                  to={item.to}
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                      : "text-foreground hover:bg-cus-gray-50 dark:hover:bg-accent"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                    />
                  )}
                </Link>
              );
            })}

            {/* Collapsible Company Section */}
            <div>
              <button
                type="button"
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-cus-gray-50 dark:hover:bg-accent"
              >
                <Building2 className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{isBn ? "কোম্পানি" : "Company"}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                    isCompanyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCompanyOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 pl-2 border-l border-border/50">
                  {companyLinks.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = location.pathname === sub.to;
                    return (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                          isSubActive
                            ? "text-brand-600 bg-brand-50 dark:bg-brand-900/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-cus-gray-50 dark:hover:bg-accent"
                        }`}
                      >
                        <SubIcon className="h-4 w-4" />
                        <span>{sub.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Footer Actions: Language toggle & Login */}
          <div className="mt-auto pt-4 border-t border-border/40 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border/80 hover:bg-muted/60 py-2.5 text-xs font-bold text-foreground transition-colors"
            >
              <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isBn ? "Switch to English (EN)" : "বাংলায় পরিবর্তন করুন (বাং)"}</span>
            </button>

            <Link
              to="/login"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 text-sm font-semibold transition-colors shadow-sm"
            >
              {isBn ? "লগইন" : "Login"}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default MobileSidebar;
