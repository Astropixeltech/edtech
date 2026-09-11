import React, { useState } from "react";
import { Play, PlayCircle, Clock, Award, Smartphone, FileDown, CheckCircle2, ShieldCheck, Share2, Sparkles, ArrowRight } from "lucide-react";
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
}

export const StickyEnrollCard: React.FC<StickyEnrollCardProps> = ({
  price,
  regularPrice = price ? Math.round(price * 1.5) : 3500,
  thumbnailUrl,
  videoId,
  totalClasses = "২৪+",
  duration = "১২ ঘন্টা",
  onEnroll,
  title,
  isEnrolled = false,
  courseId,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isBn = language === "bn";
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [includeBooks, setIncludeBooks] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  const discountPercent = regularPrice > price && price > 0
    ? Math.round(((regularPrice - price) / regularPrice) * 100)
    : null;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === "ASTROPIXEL" || code === "HAPPYHULK" || code === "LEARN20" || code === "EDTECH") {
      setCouponApplied(true);
      const discount = Math.round(price * 0.2);
      setDiscountAmount(discount);
      toast.success(isBn ? `কুপন কোড সফলভাবে যোগ হয়েছে! ৳ ${discount.toLocaleString()} ছাড় পেয়েছেন।` : `Coupon applied! You saved ৳ ${discount.toLocaleString()}.`);
    } else if (code === "SAVE500") {
      setCouponApplied(true);
      const discount = Math.min(500, price);
      setDiscountAmount(discount);
      toast.success(isBn ? `কুপন সফল! ৳ ${discount.toLocaleString()} ছাড় পেয়েছেন।` : `Coupon applied! ৳ ${discount.toLocaleString()} discount.`);
    } else {
      toast.error(isBn ? "ভুল কুপন কোড। অনুগ্রহ করে সঠিক কোড দিন (যেমন: ASTROPIXEL)" : "Invalid coupon code. Try: ASTROPIXEL");
    }
  };

  const finalPrice = Math.max(0, price - discountAmount + (includeBooks ? 450 : 0));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isBn ? "কোর্স লিংক কপি করা হয়েছে!" : "Course link copied to clipboard!");
    }
  };

  return (
    <div className="w-full rounded-2xl border border-cus-gray-200 dark:border-border/60 bg-white dark:bg-card shadow-lg overflow-hidden transition-all">
      {/* 1. Video Preview / Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950 group">
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
              <div className="h-full w-full bg-gradient-to-br from-brand-700 to-emerald-950 flex items-center justify-center p-4">
                <span className="text-white font-bold text-center text-sm">{title}</span>
              </div>
            )}

            {/* Dark overlay with glowing Play Button */}
            <div
              onClick={() => setIsPlayingPreview(true)}
              className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center cursor-pointer group-hover:bg-black/45 transition-colors"
            >
              <div className="h-14 w-14 rounded-full bg-white text-brand-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play className="h-6 w-6 fill-current ml-0.5 text-brand-500" />
              </div>
              <span className="text-white text-xs font-bold mt-2.5 tracking-wide drop-shadow-md">
                {isBn ? "কোর্স প্রিভিউ ভিডিও দেখুন" : "Preview this course"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 2. EdgeCourseBD 3-Col Stats Counter Block */}
      <div className="flex items-stretch divide-x divide-gray-100 dark:divide-border/40 border-b border-gray-100 dark:border-border/40 bg-gray-50/50 dark:bg-slate-900/30">
        <div className="flex flex-1 flex-col items-center justify-center py-3 px-2 text-center">
          <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
            <PlayCircle className="h-4 w-4 shrink-0" />
            <span className="text-base font-bold leading-none text-slate-900 dark:text-white">
              {totalClasses.replace(/[^0-9+]/g, '') || "২৪+"}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {isBn ? "টোটাল ক্লাস" : "Total Class"}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-3 px-2 text-center">
          <div className="flex items-center gap-1.5 text-amber-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-base font-bold leading-none text-slate-900 dark:text-white">
              ১০+
            </span>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {isBn ? "মক এক্সামস" : "Total Exam"}
          </span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-3 px-2 text-center">
          <div className="flex items-center gap-1.5 text-sky-600">
            <FileDown className="h-4 w-4 shrink-0" />
            <span className="text-base font-bold leading-none text-slate-900 dark:text-white">
              ৫+
            </span>
          </div>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {isBn ? "রিসোর্স মেটেরিয়াল" : "Materials"}
          </span>
        </div>
      </div>

      {/* 3. EdgeCourseBD Book Addon Section with animated glow border */}
      <div className="p-4 space-y-4">
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold leading-tight text-slate-900 dark:text-white">
                  {isBn ? "কোর্সের সাথে প্র্যাক্টিস বুক যুক্ত করো" : "Add Practice Books with Course"}
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                  {isBn ? "কোর্সের হ্যান্ডনোট ও প্রিন্টেড বুক (+৳ ৪৫০)" : "Handwritten notes & printed materials (+৳ 450)"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIncludeBooks(!includeBooks)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                includeBooks
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-border hover:border-brand-400"
              }`}
            >
              {includeBooks ? (isBn ? "✓ যুক্ত হয়েছে" : "✓ Added") : (isBn ? "+ যুক্ত করুন" : "+ Add Books")}
            </button>
          </div>
        </div>

        {/* 4. EdgeCourseBD Promo Coupon Banner */}
        <div className="rounded-xl border border-rose-100 dark:border-rose-900/40 bg-[#FFF7F6] dark:bg-rose-950/20 p-2.5 flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-300 text-[11px]">
            {isBn ? "কুপন কোড ব্যবহার করুন:" : "Use Coupon:"}{" "}
            <span className="font-bold text-[#F04438]">&quot;ASTROPIXEL&quot;</span>
          </span>
          <span className="font-bold text-[#F04438] text-[11px]">২০% ছাড়</span>
        </div>

        {/* Pricing Block */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">{isBn ? "টোটাল কোর্স ফি" : "Total Fee"}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400">
                {finalPrice > 0 ? `৳ ${finalPrice.toLocaleString()}` : (isBn ? "সম্পূর্ণ ফ্রি" : "Free")}
              </span>
              {regularPrice > finalPrice && finalPrice > 0 && (
                <span className="text-xs text-gray-400 line-through">
                  ৳ {regularPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Promo code input toggle */}
          {!couponApplied && (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder={isBn ? "প্রোমো কোড" : "Promo code"}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-24 h-7 text-[11px] px-2 rounded-lg border border-gray-200 dark:border-border bg-white dark:bg-slate-900 uppercase font-medium"
              />
              <button
                onClick={handleApplyCoupon}
                className="h-7 px-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-bold"
              >
                {isBn ? "প্রয়োগ" : "Apply"}
              </button>
            </div>
          )}
        </div>

        {/* EdgeCourseBD Primary "Buy Now" / "Go to Class" Button */}
        {isEnrolled ? (
          <button
            onClick={() => navigate(`/student/course/${courseId || ''}`)}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>{isBn ? "ক্লাসে প্রবেশ করুন (Go to Classroom)" : "Go to Classroom"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onEnroll}
            className="w-full h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>{finalPrice > 0 ? (isBn ? "এখনই ভর্তি হন (Buy Now)" : "Buy Now") : (isBn ? "ফ্রি শুরু করুন" : "Start Free")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        {/* Guarantee Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck className="h-4 w-4 text-brand-500 shrink-0" />
          <span>{isBn ? "১০০% ভেরিফাইড কোর্স ও লাইফটাইম অ্যাক্সেস" : "100% Verified Course with Lifetime Access"}</span>
        </div>

        {/* Feature List */}
        <div className="pt-3 border-t border-gray-100 dark:border-border/40 space-y-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <span>{duration} {isBn ? "অন-ডিমান্ড ফুল HD ক্লাস" : "on-demand HD video lessons"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <span>{isBn ? "কোর্স সম্পন্ন করে সার্টিফিকেট অর্জন" : "Official verified certificate"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <span>{isBn ? "মোবাইল ও পিসি যেকোনো ডিভাইসে লাইফটাইম অ্যাক্সেস" : "Lifetime access on web & mobile"}</span>
          </div>
        </div>

        {/* Share Button */}
        <div className="pt-2 border-t border-gray-100 dark:border-border/40 flex items-center justify-between text-xs text-gray-500">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 hover:text-brand-600 transition-colors font-semibold"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{isBn ? "বন্ধুদের সাথে শেয়ার করুন" : "Share this course"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyEnrollCard;
