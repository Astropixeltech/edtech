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
  demoVideoId?: string | null;
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
  learningOutcomes?: string[];
}

export const StickyEnrollCard: React.FC<StickyEnrollCardProps> = ({
  price,
  regularPrice = price ? Math.round(price * 1.4) : 2500,
  thumbnailUrl,
  videoId,
  demoVideoId,
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
  learningOutcomes = [],
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
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

  const activeVideoId = activeSlide === 2 ? (demoVideoId || videoId) : videoId;

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden transition-all">
      {/* 1. Interactive 4-Slide Media Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950 group select-none">
        {/* SLIDE 0: Course Intro Video Trailer */}
        {activeSlide === 0 && (
          <>
            {isPlayingPreview && activeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="Course Trailer"
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

                <div
                  onClick={() => setIsPlayingPreview(true)}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/50 transition-colors"
                >
                  <div className="h-14 w-14 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 fill-current ml-0.5 text-emerald-600" />
                  </div>
                  <span className="text-white text-xs font-bold mt-2.5 tracking-wide drop-shadow-md bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                    {isBn ? "কোর্স ট্রেলার দেখুন" : "Watch Trailer"}
                  </span>
                </div>
              </>
            )}
          </>
        )}

        {/* SLIDE 1: Course Outcomes / What You'll Learn Infographic */}
        {activeSlide === 1 && (
          <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-4 sm:p-5 flex flex-col justify-between text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                {isBn ? "কোর্স হাইলাইটস" : "Course Highlights"}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Astropixel Verified</span>
            </div>
            <div className="space-y-2 py-1">
              {(learningOutcomes.length > 0 ? learningOutcomes.slice(0, 3) : [
                isBn ? "বাস্তব প্রজেক্ট ভিত্তিক প্র্যাক্টিক্যাল শিক্ষা" : "Real-world project-based practical mastery",
                isBn ? "ইন্ডাস্ট্রি-স্ট্যান্ডার্ড ওয়ার্কফ্লো ও টুলস" : "Industry-standard workflows and tools",
                isBn ? "আন্তর্জাতিক ক্লায়েন্ট ও ক্যারিয়ার গাইডলাইন" : "International client and career guidelines",
              ]).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="line-clamp-2 leading-tight">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/10">
              <span>{videoCount} {isBn ? "টি ভিডিও" : "videos"}</span>
              <span>{totalClasses}</span>
              <span className="text-emerald-400 font-bold">{isBn ? "লাইফটাইম মেয়াদ" : "Lifetime"}</span>
            </div>
          </div>
        )}

        {/* SLIDE 2: Free Sample Demo Class Video */}
        {activeSlide === 2 && (
          <>
            {isPlayingDemo && activeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="Demo Class"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                onClick={() => setIsPlayingDemo(true)}
                className="h-full w-full bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 cursor-pointer group"
              >
                <div className="h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 fill-current ml-0.5 text-white" />
                </div>
                <h5 className="text-white text-xs sm:text-sm font-black mt-3 text-center drop-shadow-md">
                  {isBn ? "ফ্রি ডেমো ক্লাস ১ দেখুন" : "Watch Free Demo Class 1"}
                </h5>
                <span className="text-emerald-300 text-[11px] font-semibold mt-1">
                  {isBn ? "কোনো খরচ ছাড়াই সম্পূর্ণ ফ্রি ক্লাস" : "100% Free Full HD Demo Lesson"}
                </span>
              </div>
            )}
          </>
        )}

        {/* SLIDE 3: Verified Digital Certificate Mockup */}
        {activeSlide === 3 && (
          <div className="h-full w-full bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 p-4 flex flex-col items-center justify-center text-center text-white relative">
            <div className="w-full max-w-[280px] rounded-xl border border-amber-500/40 bg-slate-900/90 p-3 shadow-2xl space-y-1.5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500" />
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">
                Certificate of Completion
              </span>
              <h6 className="text-xs font-black text-white truncate">{title}</h6>
              <p className="text-[10px] text-slate-300 font-medium">
                {isBn ? "যাচাইযোগ্য ডিজিটাল সার্টিফিকেট" : "Verified Digital Credential"}
              </p>
              <div className="pt-1 flex items-center justify-center gap-2 text-[9px] text-emerald-400 font-bold">
                <span>✓ Verified</span>
                <span>•</span>
                <span>Astropixel Learn</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 font-medium">
              {isBn ? "কোর্স সম্পন্ন করে ভেরিফাইড সার্টিফিকেট অর্জন করুন" : "Earn an official certificate upon course completion"}
            </span>
          </div>
        )}

        {/* Slide Carousel Navigation Overlays */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveSlide((prev) => (prev > 0 ? prev - 1 : 3));
            setIsPlayingPreview(false);
            setIsPlayingDemo(false);
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          aria-label="Previous Slide"
        >
          ‹
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveSlide((prev) => (prev < 3 ? prev + 1 : 0));
            setIsPlayingPreview(false);
            setIsPlayingDemo(false);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          aria-label="Next Slide"
        >
          ›
        </button>
      </div>

      {/* 10MS 4-Slide Interactive Selector Strip */}
      <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800/80 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold">
        {[
          { labelBn: "ট্রেলার", labelEn: "Trailer", icon: "📹" },
          { labelBn: "আউটকাম", labelEn: "Highlights", icon: "🎯" },
          { labelBn: "ডেমো ক্লাস", labelEn: "Demo", icon: "🎬" },
          { labelBn: "সার্টিফিকেট", labelEn: "Certificate", icon: "🎓" },
        ].map((slide, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setActiveSlide(idx);
              setIsPlayingPreview(false);
              setIsPlayingDemo(false);
            }}
            className={`py-2 px-1 text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
              activeSlide === idx
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-black shadow-xs border-b-2 border-emerald-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>{slide.icon}</span>
            <span className="truncate max-w-full text-[10px] sm:text-[11px]">
              {isBn ? slide.labelBn : slide.labelEn}
            </span>
          </button>
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
