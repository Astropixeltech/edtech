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
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-card/95 border-b border-gray-200 dark:border-border/60 shadow-md backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Course Info */}
        <div className="flex flex-col min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-foreground truncate max-w-lg">
            {title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-3 w-3 fill-current" />
              <span>{rating}</span>
            </span>
            <span>•</span>
            <span className="font-semibold text-brand-600 dark:text-brand-400">
              {price > 0 ? `৳ ${price.toLocaleString()}` : (isBn ? "ফ্রি" : "Free")}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/course/${courseId || ''}`)}
            className="h-10 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <span>{isBn ? "ক্লাসে প্রবেশ করুন" : "Go to Class"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <button
            onClick={onEnroll}
            className="h-10 px-5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
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
