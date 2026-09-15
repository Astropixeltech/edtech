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
