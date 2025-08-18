"use client";

import { Box } from "@chakra-ui/react";
import { Slide } from "../../types";
import { Plus } from "lucide-react";
import Thumbnail from "./thumbnail";

interface ThumbnailItemProps {
  slide?: Slide;
  isActive?: boolean;
  thumbnailWidth: number;
  thumbnailHeight: number;
  onClick: () => void;
  isAddButton?: boolean;
}

export default function ThumbnailItem({
  slide,
  isActive = false,
  thumbnailWidth,
  thumbnailHeight,
  onClick,
  isAddButton = false,
}: ThumbnailItemProps) {
  // “Add slide” button case stays the same
  if (isAddButton) {
    return (
      <Box
        w={`${thumbnailWidth}px`}
        h={`${thumbnailHeight}px`}
        border="1px dashed"
        borderColor={"defaultBorder"}
        borderRadius="xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        onClick={onClick}
      >
        <Plus />
      </Box>
    );
  }

  // Regular thumbnail
  return (
    <Box
      w={`${thumbnailWidth}px`}
      h={`${thumbnailHeight}px`}
      borderWidth={isActive ? "2px" : "1px"}
      borderStyle="solid"
      borderColor={isActive ? "purple.300" : "gray.300"}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      onClick={onClick}
    >
      <Thumbnail slide={slide!} />
    </Box>
  );
}
