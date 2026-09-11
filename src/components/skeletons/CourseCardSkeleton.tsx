import React from "react";

export const CourseCardSkeleton = () => {
  return (
    <div className="w-full min-w-[260px] max-w-[320px] shrink-0 overflow-hidden rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card shadow-sm">
      <div className="animate-pulse bg-gray-200 dark:bg-muted h-[180px] w-full rounded-none rounded-t-2xl" />
      <div className="space-y-3 p-4">
        <div className="animate-pulse bg-gray-200 dark:bg-muted h-5 w-full rounded" />
        <div className="animate-pulse bg-gray-200 dark:bg-muted h-4 w-3/4 rounded" />
        <div className="animate-pulse bg-gray-200 dark:bg-muted h-4 w-1/2 rounded" />
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-border/40">
          <div className="animate-pulse bg-gray-200 dark:bg-muted h-6 w-20 rounded" />
          <div className="animate-pulse bg-gray-200 dark:bg-muted h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default CourseCardSkeleton;
