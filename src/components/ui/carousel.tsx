"use client";

import { ReactNode, useRef } from "react";
import { Flex, Box, IconButton, FlexProps } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps extends FlexProps {
  children: ReactNode;
  itemWidth: number;
  gap?: number;
  height?: string | number;
}

export default function Carousel({
  children,
  itemWidth,
  gap = 2,
  height = "auto",
  ...props
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAmount = itemWidth + gap;

  const scrollBy = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <Flex
      align="center"
      h={height}
      position="relative"
      px={2}
      {...props}
      overflow={"hidden"}
      w="full"
    >
      <IconButton
        aria-label="Scroll left"
        size="2xs"
        onClick={() => scrollBy("left")}
        variant={"outline"}
      >
        <ChevronLeft />
      </IconButton>
      <Box ref={scrollRef} flex="1" overflow="hidden">
        <Flex
          align="center"
          w="full"
          overflow={"auto"}
          css={{
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
          }}
        >
          {children}
        </Flex>
      </Box>
      <IconButton
        aria-label="Scroll right"
        size="2xs"
        onClick={() => scrollBy("right")}
        variant={"outline"}
      >
        <ChevronRight />
      </IconButton>
    </Flex>
  );
}
