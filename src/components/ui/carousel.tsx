"use client";

import { ReactNode, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  itemWidth: number;
  gap?: number;
  height?: string | number;
}

export default function Carousel({ children, itemWidth, gap = 8, height = "auto", className, ...props }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmount = itemWidth + gap;

  const scrollBy = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("relative flex w-full items-center gap-2 overflow-hidden", className)} style={{ height }} {...props}>
      <Button type="button" aria-label="Scroll left" size="icon-xs" variant="outline" onClick={() => scrollBy("left")}>
        <ChevronLeft />
      </Button>
      <div ref={scrollRef} className="min-w-0 flex-1 overflow-hidden">
        <div className="flex w-full items-center overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{children}</div>
      </div>
      <Button type="button" aria-label="Scroll right" size="icon-xs" variant="outline" onClick={() => scrollBy("right")}>
        <ChevronRight />
      </Button>
    </div>
  );
}