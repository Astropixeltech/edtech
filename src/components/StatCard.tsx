import React, { useState, useEffect, useRef } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
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
  iconBgColor = "bg-emerald-50 dark:bg-emerald-900/20",
  iconColor = "text-emerald-600 dark:text-emerald-400",
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

  return (
    <div
      ref={cardRef}
      className="group mx-auto grid w-full max-w-[300px] grid-cols-[48px_1fr] md:grid-cols-[56px_1fr] items-center gap-3.5 sm:gap-4 rounded-2xl border border-border/80 dark:border-border/60 bg-card dark:bg-card/95 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200 cursor-default"
    >
      <div
        className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-none`}
      >
        <Icon className="h-6 w-6 md:h-7 md:w-7" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums group-hover:text-primary transition-colors">
          {formattedCount}
        </span>
        <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold truncate">
          {label}
        </span>
      </div>
    </div>
  );
};

export default StatCard;
