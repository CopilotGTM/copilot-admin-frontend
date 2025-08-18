import { Box, BoxProps } from "@chakra-ui/react";
import React, { forwardRef } from "react";

interface CustomScrollbarProps extends BoxProps {
  scrollbarWidth?: string;
  scrollbarTrackColor?: string;
  scrollbarThumbColor?: string;
  scrollbarThumbHoverColor?: string;
  scrollbarMargin?: string | number;
}

export const CustomScrollbar = forwardRef<HTMLDivElement, CustomScrollbarProps>(
  (
    {
      children,
      scrollbarWidth = "10px",
      scrollbarTrackColor = "gray.100",
      scrollbarThumbColor = "purple.200",
      scrollbarThumbHoverColor = "gray.500",
      scrollbarMargin = "10px",
      ...rest
    },
    ref,
  ) => {
    const scrollbarStyles = {
      "&::-webkit-scrollbar": {
        width: scrollbarWidth,
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: scrollbarTrackColor,
        borderRadius: "20px",
      },
      "&::-webkit-scrollbar-track-piece": {
        backgroundColor: "#f1f1f1",
        borderRadius: "5px",
        margin: scrollbarMargin,
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: scrollbarThumbColor,
        borderRadius: "20px",
        "&:hover": {
          backgroundColor: scrollbarThumbHoverColor,
        },
      },
      scrollbarWidth: "thin", // Firefox
      scrollbarGutter: "stable", // Keeps layout from shifting
    };

    return (
      <Box overflowY="auto" css={scrollbarStyles} ref={ref} {...rest}>
        {children}
      </Box>
    );
  },
);

CustomScrollbar.displayName = "CustomScrollbar";
