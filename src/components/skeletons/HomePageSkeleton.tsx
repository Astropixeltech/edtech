import React from "react";
import CourseCardSkeleton from "./CourseCardSkeleton";

export const HomePageSkeleton = () => {
  return (
    <div className="container-fluid-2k bg-white dark:bg-background">
      {/* Hero Banner Skeleton */}
      <div className="relative h-[250px] w-full sm:h-[400px] md:h-[550px] 4xl:h-[700px]">
        <div className="animate-pulse bg-gray-200 dark:bg-muted h-full w-full rounded-none" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="container grid grid-cols-2 gap-6 pb-10 pt-[20px] lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="mx-auto grid w-full max-w-[300px] grid-cols-[48px_1fr] md:grid-cols-[64px_1fr] items-center gap-4 rounded-2xl border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-4 shadow-sm"
          >
            <div className="animate-pulse bg-gray-200 dark:bg-muted h-12 w-12 md:h-16 md:w-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <div className="animate-pulse bg-gray-200 dark:bg-muted h-6 w-20 rounded" />
              <div className="animate-pulse bg-gray-200 dark:bg-muted h-4 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Category Grid Skeleton */}
      <div className="container pb-10 pt-[20px] lg:pt-[40px]">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="animate-pulse bg-gray-200 dark:bg-muted h-8 w-64 rounded-xl md:w-80" />
          <div className="animate-pulse bg-gray-200 dark:bg-muted h-4 w-48 md:w-60 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="mx-auto flex h-full w-full max-w-[300px] flex-col items-center justify-center rounded-lg border border-gray-100 dark:border-border/50 bg-white dark:bg-card p-4 shadow-sm md:rounded-2xl"
            >
              <div className="animate-pulse bg-gray-200 dark:bg-muted h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 rounded-full" />
              <div className="animate-pulse bg-gray-200 dark:bg-muted mt-4 h-5 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Course Scroller Skeleton Section */}
      <div className="py-10 bg-background/50">
        <div className="container space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-pulse bg-gray-200 dark:bg-muted h-8 w-64 rounded-xl md:w-80" />
            <div className="animate-pulse bg-gray-200 dark:bg-muted h-4 w-48 md:w-60 rounded" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageSkeleton;
