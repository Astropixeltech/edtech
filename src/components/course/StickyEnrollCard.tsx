import React, { useState } from "react";
import {
  Play, Clock, Users, Video, FileText, CheckSquare,
  Layout as LayoutIcon, Calendar, PhoneCall, Share2, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface StickyEnrollCardProps {
  price: number;
  regularPrice?: number;
  thumbnailUrl?: string | null;
  videoId?: string | null;
  totalClasses?: string;
  duration?: string;
  onEnroll: () => void;
  title: string;
  isEnrolled?: boolean;
  courseId?: string;
  enrolledCount?: string | number;
  videoCount?: string | number;
  noteCount?: string | number;
  quizCount?: string | number;
  templateCount?: string | number;
}

export const StickyEnrollCard: React.FC<StickyEnrollCardProps> = ({
  price,
  regularPrice = price ? Math.round(price * 1.4) : 2500,
  thumbnailUrl,
  videoId,
  totalClasses = "৩৯টি",
  duration = "১০ ঘণ্টা",
  onEnroll,
  title,
  isEnrolled = false,
  courseId,
  enrolledCount = "৭৬,৫৪৭",
  videoCount = "৩৯",
  noteCount = "১৪",
  quizCount = "৫",
  templateCount = "৬",
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const discountPercent = regularPrice > price && price > 0
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isBn ? "কোর্স লিংক কপি করা হয়েছে!" : "Course link copied to clipboard!");
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all">
      {/* 1. Video Preview / Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 group">
        {isPlayingPreview && videoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Course Preview"
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-900 to-[#0B1120] flex items-center justify-center p-4">
                <span className="text-white font-bold text-center text-sm">{title}</span>
              </div>
            )}

            {/* Dark overlay with Centered White 10MS Play Button */}
            <div
              onClick={() => setIsPlayingPreview(true)}
              className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/45 transition-colors"
            >
              <div className="h-14 w-14 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-current ml-0.5 text-emerald-600" />
              </div>
              <span className="text-white text-xs font-bold mt-2.5 tracking-wide drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                {isBn ? "কোর্স প্রিভিউ দেখুন" : "Watch Preview"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 10MS Slide Thumbnails / Indicators */}
      <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80">
        {[0, 1, 2, 3].map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              activeSlide === idx
                ? "w-6 bg-emerald-600"
                : "w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Pricing Row */}
        <div className="flex items-baseline justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {price > 0 ? `৳ ${price.toLocaleString()}` : (isBn ? "সম্পূর্ণ ফ্রি" : "Free")}
              </span>
              {regularPrice > price && price > 0 && (
                <span className="text-sm text-slate-400 line-through font-medium">
                  ৳ {regularPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {discountPercent && (
            <span className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-extrabold border border-rose-500/20">
              {discountPercent}% {isBn ? "ছাড়" : "OFF"}
            </span>
          )}
        </div>

        {/* 10MS Green CTA Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/course/${courseId || ''}`)}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>{isBn ? "ক্লাস শুরু করুন" : "Go to Classroom"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onEnroll}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>{price > 0 ? (isBn ? "কোর্সটি কিনুন" : "Enroll Now") : (isBn ? "ফ্রি শুরু করুন" : "Start Free")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* 10MS "এই কোর্সে যা থাকছে" Checklist */}
        <div className="pt-2 space-y-3.5">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {isBn ? "এই কোর্সে যা থাকছে" : "What's in this course"}
          </h4>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 shrink-0">
                <Users className="h-4 w-4" />
              </span>
              <span>{isBn ? `কোর্সটি করছেন ${enrolledCount} জন` : `${enrolledCount} students enrolled`}</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 shrink-0">
                <Clock className="h-4 w-4" />
              </span>
              <span>{isBn ? `সময় লাগবে ${duration}` : `Duration: ${duration}`}</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 shrink-0">
                <Video className="h-4 w-4" />
              </span>
              <span>{isBn ? `${videoCount}টি ভিডিও` : `${videoCount} Videos`}</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 shrink-0">
                <FileText className="h-4 w-4" />
              </span>
              <span>{isBn ? `${noteCount}টি নোট` : `${noteCount} Notes & PDFs`}</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 shrink-0">
                <CheckSquare className="h-4 w-4" />
              </span>
              <span>{isBn ? `${quizCount} সেট কুইজ` : `${quizCount} Quiz Sets`}</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 shrink-0">
                <LayoutIcon className="h-4 w-4" />
              </span>
              <span>{isBn ? `${templateCount}টি টেমপ্লেট` : `${templateCount} Resource Templates`}</span>
            </li>

            <li className="flex items-center gap-3">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 shrink-0">
                <Calendar className="h-4 w-4" />
              </span>
              <span>{isBn ? "কোর্সের মেয়াদ আজীবন" : "Lifetime Course Validity"}</span>
            </li>
          </ul>
        </div>

        {/* 10MS Helpline Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
              {isBn ? "কোর্সটি সম্পর্কে বিস্তারিত জানতে" : "For any queries about this course"}
            </span>
            <a
              href="tel:16910"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold hover:underline"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>{isBn ? "ফোন করুন ১৬৯১০" : "Call 16910"}</span>
            </a>
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500/40 transition-colors"
            title={isBn ? "শেয়ার করুন" : "Share"}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyEnrollCard;
