import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HorizontalScrollerProps {
  children: React.ReactNode;
  className?: string;
  showControls?: boolean;
}

export const HorizontalScroller = ({
  children,
  className = "",
  showControls = true,
}: HorizontalScrollerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group/scroller w-full">
      {/* Scroll Arrows */}
      {showControls && (
        <>
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-card border border-border shadow-md flex items-center justify-center text-foreground opacity-0 group-hover/scroller:opacity-100 hover:bg-cus-gray-50 dark:hover:bg-accent transition-all duration-200 hidden sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white dark:bg-card border border-border shadow-md flex items-center justify-center text-foreground opacity-0 group-hover/scroller:opacity-100 hover:bg-cus-gray-50 dark:hover:bg-accent transition-all duration-200 hidden sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Scroller Area */}
      <div
        ref={scrollRef}
        className={`flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 px-1 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default HorizontalScroller;
