import React from "react";
import { Link } from "react-router-dom";
import { Users, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface EdgeCourseCardProps {
  course: {
    id: string;
    title: string;
    title_bn?: string;
    description?: string;
    thumbnail_url?: string;
    price?: number;
    sale_price?: number;
    total_enrolled?: number;
    category?: string;
    duration?: string;
    instructor_name?: string;
    slug?: string;
  };
  onEnroll?: (course: any) => void;
  className?: string;
}

export const EdgeCourseCard = ({ course, onEnroll, className }: EdgeCourseCardProps) => {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const displayTitle = (isBn && course.title_bn) ? course.title_bn : course.title;
  const price = course.sale_price !== undefined && course.sale_price !== null 
    ? course.sale_price 
    : (course.price || 0);

  const courseKey = (course as any).landing_slug || course.slug || course.id;
  const targetLink = `/courses/${courseKey}`;

  return (
    <div
      className={`group w-full shrink-0 overflow-hidden rounded-2xl border border-border/80 dark:border-border/60 bg-card dark:bg-card/95 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200 snap-start flex flex-col justify-between ${className || "min-w-[260px] max-w-[320px]"}`}
    >
      {/* Thumbnail */}
      <Link to={targetLink} className="relative block h-[180px] w-full overflow-hidden bg-gray-100 dark:bg-accent rounded-t-2xl">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={displayTitle}
            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center p-4 text-center text-white">
            <span className="font-bold text-sm line-clamp-2">{displayTitle}</span>
          </div>
        )}
        {course.category && (
          <span className="absolute top-3 left-3 bg-black/65 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
            {course.category}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between p-4.5 space-y-3">
        <div className="space-y-2">
          <Link to={targetLink} className="block">
            <h4 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
              {displayTitle}
            </h4>
          </Link>

          {course.instructor_name && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {isBn ? "প্রশিক্ষক: " : "Instructor: "}
              <span className="font-medium text-foreground">{course.instructor_name}</span>
            </p>
          )}

          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
            {course.total_enrolled !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3 text-emerald-500" />
                <span>{course.total_enrolled} {isBn ? "জন" : "students"}</span>
              </span>
            )}
            {course.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-emerald-500" />
                <span>{course.duration}</span>
              </span>
            )}
          </div>
        </div>

        {/* Footer Row: Price and Enroll CTA */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border/60 mt-auto">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">{isBn ? "কোর্স ফি" : "Fee"}</span>
            <span className="text-base font-extrabold text-primary">
              {price > 0 ? `৳ ${price.toLocaleString()}` : (isBn ? "ফ্রি" : "Free")}
            </span>
          </div>

          {onEnroll ? (
            <button
              onClick={() => onEnroll(course)}
              className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span>{isBn ? "বিস্তারিত দেখুন" : "View Details"}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <Link
              to={targetLink}
              className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              <span>{isBn ? "বিস্তারিত দেখুন" : "View Details"}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EdgeCourseCard;
