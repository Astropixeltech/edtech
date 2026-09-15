import React, { useEffect, useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

import { useNavigate } from "react-router-dom";

interface CourseStickyBarProps {
  title: string;
  price: number;
  rating?: number;
  onEnroll: () => void;
  isEnrolled?: boolean;
  courseId?: string;
}

export const CourseStickyBar: React.FC<CourseStickyBarProps> = ({
  title,
  price,
  rating = 4.9,
  onEnroll,
  isEnrolled = false,
  courseId,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed sm:top-16 bottom-0 sm:bottom-auto left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t sm:border-t-0 sm:border-b border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in lg:hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Course Info */}
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-lg">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-bold">
            <span className="flex items-center gap-1 text-amber-500 font-black">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{rating}</span>
            </span>
            <span>•</span>
            <span className="font-black text-brand-600 dark:text-brand-400">
              {price > 0 ? `৳ ${price.toLocaleString()}` : (isBn ? "ফ্রি" : "Free")}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/course/${courseId || ''}`)}
            className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <span>{isBn ? "ক্লাসে প্রবেশ করুন" : "Go to Class"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={onEnroll}
            className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <span>{price > 0 ? (isBn ? "এখনই ভর্তি হন" : "Enroll Now") : (isBn ? "ফ্রি শুরু করুন" : "Start Free")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseStickyBar;
