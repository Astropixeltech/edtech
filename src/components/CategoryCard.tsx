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
      className="group mx-auto flex h-full w-full max-w-[300px] flex-col items-center justify-center rounded-2xl border border-border/80 dark:border-border/60 bg-card dark:bg-card/95 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 dark:hover:border-primary/50 transition-all duration-200 relative overflow-hidden"
    >
      <div
        className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200 shrink-0 shadow-none`}
      >
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>

      <h3 className="mt-3.5 text-xs sm:text-sm md:text-base font-bold text-center text-foreground group-hover:text-primary transition-colors leading-snug">
        {title}
      </h3>

      {count !== undefined && (
        <span className="text-[11px] font-medium text-muted-foreground mt-1 px-2.5 py-0.5 rounded-full bg-secondary/80 border border-border/40 group-hover:border-primary/30 transition-colors">
          {count} টি কোর্স
        </span>
      )}
    </Link>
  );
};

export default CategoryCard;
