import React, { useState, useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  variant?: "default" | "dark" | "glass";
  iconBgColor?: string;
  iconColor?: string;
}

// Helper to convert English digits to Bengali digits
const toBengaliNumber = (num: number | string): string => {
  const bnDigits: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  };
  return num
    .toString()
    .replace(/\d/g, (d) => bnDigits[d] || d);
};

// Helper to parse Bengali/English string to numeric value & suffix
const parseStatValue = (valStr: string) => {
  const bnToEnMap: Record<string, string> = {
    "০": "0", "১": "1", "২": "2", "৩": "3", "৪": "4",
    "৫": "5", "৬": "6", "৭": "7", "৮": "8", "৯": "9",
  };

  const isBengali = /[০-৯]/.test(valStr);
  const normalized = valStr
    .replace(/[০-৯]/g, (d) => bnToEnMap[d] || d)
    .replace(/,/g, "");

  const numericMatch = normalized.match(/\d+/);
  const targetNum = numericMatch ? parseInt(numericMatch[0], 10) : 0;
  
  // Extract suffix like '+' or '%'
  const suffix = valStr.replace(/[0-9০-৯,]/g, "").trim();

  return { targetNum, isBengali, suffix };
};

export const StatCard = ({
  icon: Icon,
  value,
  label,
  variant = "dark",
}: StatCardProps) => {
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { targetNum, isBengali, suffix } = parseStatValue(value);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1800; // 1.8 seconds animation
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic curve
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeOutProgress * targetNum);

            setDisplayCount(currentVal);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayCount(targetNum);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [targetNum, hasAnimated]);

  // Formatted count string
  const formattedCount = React.useMemo(() => {
    if (!hasAnimated) {
      return isBengali ? `০${suffix}` : `0${suffix}`;
    }
    const withCommas = displayCount.toLocaleString("en-US");
    const numString = isBengali ? toBengaliNumber(withCommas) : withCommas;
    return `${numString}${suffix}`;
  }, [displayCount, hasAnimated, isBengali, suffix]);

  if (variant === "dark") {
    return (
      <div
        ref={cardRef}
        className="group relative flex items-center gap-3.5 sm:gap-4.5 rounded-2xl border border-slate-800/80 bg-[#0d1c2e]/90 hover:bg-[#11243b] p-4 sm:p-5 shadow-lg hover:shadow-emerald-950/30 hover:-translate-y-1 hover:border-emerald-500/40 transition-all duration-300 cursor-default overflow-hidden"
      >
        {/* Glow accent highlight on hover */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-500 pointer-events-none" />

        {/* Neon Emerald Icon Container */}
        <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shadow-md">
          <Icon className="h-6 w-6 md:h-7 md:w-7 transition-transform duration-300 group-hover:rotate-6" />
        </div>

        {/* Counter & Description */}
        <div className="flex flex-col gap-0.5 min-w-0 z-10">
          <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight tabular-nums group-hover:text-emerald-400 transition-colors">
            {formattedCount}
          </span>
          <span className="text-xs sm:text-sm text-slate-300 font-semibold truncate">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="group relative flex items-center gap-3.5 sm:gap-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-500/40 dark:hover:border-emerald-500/50 transition-all duration-300 backdrop-blur-sm overflow-hidden cursor-default"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
        <Icon className="h-6 w-6 md:h-7 md:w-7 transition-transform duration-300 group-hover:rotate-6" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {formattedCount}
        </span>
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold truncate">
          {label}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
