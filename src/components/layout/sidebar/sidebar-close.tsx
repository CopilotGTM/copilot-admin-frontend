import React from "react";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";

interface SidebarCloseProps extends IconButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export function SidebarClose({
  isCollapsed,
  onClick,
  ...rest
}: Readonly<SidebarCloseProps>) {
  const bg = useColorModeValue("white", "gray.800");
  const chevronColor = useColorModeValue("gray.600", "gray.300");

  return (
    <IconButton
      onClick={onClick}
      aria-label="Close sidebar"
      position="absolute"
      right="-0.80rem"
      bottom="3"
      bg={bg}
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
        <ChevronRight color={chevronColor} />
      ) : (
        <ChevronLeft color={chevronColor} />
      )}
    </IconButton>
  );
}

export default SidebarClose;
