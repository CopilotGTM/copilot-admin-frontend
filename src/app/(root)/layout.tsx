"use client";
import { Box, Flex } from "@chakra-ui/react";
import RestQueryClientProvider from "../../components/HOC/restQueryClientProvider/RestQueryClientProvider";
import CollapsibleSidebar from "../../components/sidebar";
import SidebarConversations from "../../components/sidebar-conversations";
import { useState } from "react";
import { usePanelStore } from "../stores/use-panel-store";

export default function GTMRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMainSidebarCollapsed, setIsMainSidebarCollapsed] =
    useState<boolean>(true);
  const [isConversationsSidebarCollapsed, setIsConversationsSidebarCollapsed] =
    useState<boolean>(false);

  const { isPanelOpen } = usePanelStore();

  // Calculate the left margin for content area based on sidebar widths
  const conversationSidebarWidth = isConversationsSidebarCollapsed ? 80 : 280;
  const mainSidebarWidth = isMainSidebarCollapsed ? 64 : 240;
  //const overlapAmount = 20;
  const totalSidebarWidth =
    mainSidebarWidth ; //- overlapAmount;

  return (
    <>
      <RestQueryClientProvider>
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
              //w={`calc(100% - ${totalSidebarWidth}px)`}
              flex={"1"}
              h="100vh"
              overflow={"hidden"}
            >
              {children}
            </Box>
          </Flex>
      </RestQueryClientProvider>
    </>
  );
}
