"use client";
import { Box, Flex } from "@chakra-ui/react";
import { QueryProvider } from "@/core/providers";
import { CollapsibleSidebar } from "@/components/layout/sidebar";
import { useState } from "react";

export default function GTMRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] =
    useState<boolean>(true);

  // Calculate the left margin for content area based on sidebar widths
  const mainSidebarWidth = isMainSidebarCollapsed ? 64 : 240;
  const totalSidebarWidth = mainSidebarWidth;

  return (
    <QueryProvider>
      <Flex
        position={"relative"}
        flexDirection="row"
        w={"100vw"}
        gap={0}
        h={"100vh"}
        bg={"white"}
        overflow="hidden"
      >
        {/* Main navigation sidebar */}
        <Box position="fixed" zIndex="20" height="100vh">
          <CollapsibleSidebar
            isCollapsed={isMainSidebarCollapsed}
            setIsCollapsed={setIsMainSidebarCollapsed}
          />
        </Box>

        <Box
          ml={`${totalSidebarWidth}px`}
          flex={"1"}
          h="100vh"
          overflow={"hidden"}
        >
          {children}
        </Box>
      </Flex>
    </QueryProvider>
  );
}
