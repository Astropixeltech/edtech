import React from "react";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  count?: number;
  to: string;
  color?: string;
  bgColor?: string;
}

export const CategoryCard = ({
  icon: Icon,
  title,
  count,
  to,
  color = "text-emerald-600 dark:text-emerald-400",
  bgColor = "bg-emerald-50 dark:bg-emerald-900/25",
}: CategoryCardProps) => {
  return (
    <Link
      to={to}
      className="group mx-auto flex h-full w-full max-w-[300px] flex-col items-center justify-center rounded-2xl border border-white/60 dark:border-white/10 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:-translate-y-2.5 hover:scale-[1.04] hover:shadow-[0_22px_45px_rgba(16,185,129,0.22)] dark:hover:shadow-[0_22px_45px_rgba(16,185,129,0.3)] hover:border-emerald-500/70 dark:hover:border-emerald-400/60 transition-all duration-300 relative overflow-hidden"
    >
      {/* Glow highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div
        className={`flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl ${bgColor} ${color} group-hover:scale-115 group-hover:rotate-6 transition-transform duration-300 shrink-0 shadow-sm`}
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
      </div>

      <h3 className="mt-4 text-xs sm:text-sm md:text-base font-bold text-center text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
        {title}
      </h3>

      {count !== undefined && (
        <span className="text-[11px] font-medium text-muted-foreground mt-1 px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-border/40 group-hover:border-emerald-500/30 transition-colors">
          {count} টি কোর্স
        </span>
      )}
    </Link>
  );
};

export default CategoryCard;
