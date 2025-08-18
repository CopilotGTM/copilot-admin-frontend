import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ToolSidebarCloseProps extends IconButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export const SidebarClose = ({
  isCollapsed,
  onClick,
  ...rest
}: ToolSidebarCloseProps) => {
  return (
    <IconButton
      onClick={onClick}
      aria-label="Close sidebar"
      position="absolute"
      right="-0.80rem"
      bottom="3"
      bg="white"
      size={"2xs"}
      variant={"outline"}
      rounded="md"
      p={1}
      _groupHover={{
        opacity: 0.75,
      }}
      transition="opacity 0.2s"
      {...rest}
    >
      {isCollapsed ? (
        <ChevronRight color="black" />
      ) : (
        <ChevronLeft color="black" />
      )}
    </IconButton>
  );
};
