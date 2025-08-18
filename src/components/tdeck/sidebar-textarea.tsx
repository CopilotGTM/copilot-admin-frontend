"use client";

import React from "react";
import {
  Box,
  Flex,
  Text,
  Icon,
  useBreakpointValue,
  BoxProps,
  useDisclosure,
  Drawer,
  Portal,
  Button,
  Image,
} from "@chakra-ui/react";
import { PanelLeft } from "lucide-react";
import { useColorModeValue } from "../ui/color-mode";
import { FloatingTextAreaV2 } from "./floating-textarea-v2";

interface SidebarConversationsProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarTextarea({
  isCollapsed,
  setIsCollapsed,
}: SidebarConversationsProps) {
  const { open: isSidebarOpen } = useDisclosure();

  // useBreakpointValue returns a value based on the current breakpoint
  const defaultIsCollapsed =
    useBreakpointValue({ base: true, md: true, lg: false }) ?? false;

  React.useEffect(() => {
    setIsCollapsed(defaultIsCollapsed);
  }, [defaultIsCollapsed, setIsCollapsed]);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  return (
    <Box minH="full" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <Drawer.Root open={isSidebarOpen}>
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <SidebarContent
                isCollapsed={isCollapsed}
                onToggleCollapse={handleToggleCollapse}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SidebarContent = ({
  isCollapsed,
  onToggleCollapse,
  ...rest
}: SidebarProps) => {
  return (
    <Box
      bg={isCollapsed ? "transparent" : "white"}
      borderRight={isCollapsed ? "none" : "1px solid"}
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={"360px"}
      display={isCollapsed ? "none" : "block"}
      h="full"
      pt={"10px"}
      transitionProperty="width"
      transitionDuration="0.2s"
      {...rest}
    >
      <Flex minH={"full"} w={"full"} flexDirection={"column"} px={"10px"}>
        <Flex
          direction={"column"}
          alignItems="center"
          gap={4}
          justifyContent={"start"}
        >
          {/* Header */}
          <Flex w={"full"} justify="space-between" align="center" gap={4}>
            <Button
              onClick={onToggleCollapse}
              aria-label="Toggle sidebar"
              variant="ghost"
              color={"gray.500"}
              gap={"10px"}
            >
              <Icon size={"md"}>
                <PanelLeft />
              </Icon>

              <Text
                fontSize="sm"
                fontWeight="medium"
                color={"gray.600"}
                lineHeight="20px"
              >
                Hide sidebar
              </Text>
            </Button>
          </Flex>
        </Flex>
        {/* <Separator /> */}
        {/* {!isCollapsed && (
          <CustomScrollbar
            width="full"
            height="full"
            px={4}
            borderRight="1px"
            borderRightColor={"gray.200"}
          >
            {isLoading ? (
              <Flex justify="center" align="center" h="full">
                <Spinner color="gray.500" size="lg" />
              </Flex>
            ) : error ? (
              <Flex justify="center" align="center" h="full">
                <Text color="red.500" fontSize="sm">
                  Failed to load conversations.
                </Text>
              </Flex>
            ) : (
              <>
                {renderSection("TODAY", today)}
                {renderSection("LAST 7 DAYS", last7)}
                {renderSection("LAST 30 DAYS", last30)}
              </>
            )}
          </CustomScrollbar>
        )} */}

        <Flex
          w={"full"}
          flexDirection={"column"}
          h="full"
          flex={"1"}
          position={"relative"}
        >
          <Flex
            w={"full"}
            h={"full"}
            justifyContent={"center"}
            flex={"1"}
            alignItems={"center"}
            px={10}
            gap={8}
            flexDirection={"column"}
            mb={40}
            //my={"auto"}
          >
            <Image src="/thinking-dog.svg" alt="" />
            <Box textAlign={"center"} spaceY={"4px"}>
              <Text fontSize={"sm"} lineHeight={"20px"} color={"gray.500"}>
                Don’t like what you see?
              </Text>
              <Text
                fontSize={"md"}
                lineHeight={"24px"}
                fontWeight={"semibold"}
                color={"gray.800"}
              >
                Modify as you want
              </Text>
              <Text
                fontSize={"sm"}
                lineHeight={"20px"}
                color={"gray.500"}
                py={2}
              >
                or
              </Text>
              <Text fontSize={"sm"} lineHeight={"20px"} color={"gray.500"}>
                Get answers from your{" "}
              </Text>
              <Text
                fontSize={"md"}
                lineHeight={"24px"}
                fontWeight={"semibold"}
                color={"gray.800"}
              >
                ORGANISATION
              </Text>
            </Box>
          </Flex>
          {/* Chat Area */}
          {/* <VStack
            w={"full"}
            gap="4"
            h={"full"}
            overflowY="auto"
            alignItems="center"
            justifyContent="flex-start"
            pt={10}
            pb={40}
            mb={20}
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
            css={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {isChatLoading ? (
          <DynamicChatSkeleton />
        ) : (
          messages.map((msg) => <ChatMessage key={msg.message_id} msg={msg} />)
        )}

            {loading && (
          <Box
            m={2}
            color="purple.400"
            alignSelf="flex-start"
            display="flex"
            alignItems="center"
            fontSize="sm"
            position="relative"
            w="24px"
            h="24px"
          >
            <Box
              as="span"
              position="absolute"
              top="0"
              left="8px"
              w="8px"
              h="8px"
              bg="purple.400"
              borderRadius="full"
              animation={`${pulse} 1.2s infinite ease-in-out`}
            />
            <Box
              as="span"
              position="absolute"
              bottom="4px"
              left="0"
              w="8px"
              h="8px"
              bg="purple.500"
              borderRadius="full"
              animation={`${pulse} 1.2s infinite ease-in-out 0.2s`}
            />
            <Box
              as="span"
              position="absolute"
              bottom="4px"
              right="0"
              w="8px"
              h="8px"
              bg="purple.600"
              borderRadius="full"
              animation={`${pulse} 1.2s infinite ease-in-out 0.4s`}
            />
          </Box>
        )}

            <Box ref={messagesEndRef} />
          </VStack> */}

          {/* Input Area */}
          <FloatingTextAreaV2
            isValid={false} //isValid
            isLoading={false} //isSubmitting || loading
            handleSubmit={() => {}} //handleSubmit(onSubmit)
            //{...sendMessageForm("content")}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
