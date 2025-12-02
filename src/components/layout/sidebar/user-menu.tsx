"use client";

import React from "react";
import { Menu, Portal, HStack, Text, Box, Avatar, VStack, Separator, Icon } from "@chakra-ui/react";
import { useColorModeValue, useColorMode } from "@/components/ui/color-mode";
import { ChevronDown, Globe, LogOut, User, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/modules/auth/store";
import { useRouter } from "next/navigation";

export interface UserMenuProps {
  isCollapsed?: boolean;
}

export function UserMenu({ isCollapsed = false }: Readonly<UserMenuProps>) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toggleColorMode, colorMode } = useColorMode();

  const displayName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email
    : "Guest";
  const email = user?.email ?? "";

  const contentBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.800");
  const subtleText = useColorModeValue("gray.500", "gray.400");

  const handleSignOut = () => {
    clearAuth();
    router.push("/signin");
  };

  const handleVisitWebsite = () => {
    if (globalThis.window !== undefined) {
      globalThis.window.open("https://copilotgtm.ai", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <HStack
          as="button"
          px={3}
          py={4}
          mx={isCollapsed ? 2 : 4}
          transitionProperty="all"
          transitionDuration="0.3s"
          _focus={{ boxShadow: "none" }}
          cursor="pointer"
        >
          <Avatar.Root size={"xs"} mr={isCollapsed ? 0 : 2}>
            <Avatar.Fallback name={displayName} />
            {/* <Avatar.Image src="https://bit.ly/sage-adebayo" /> */}
          </Avatar.Root>
          {!isCollapsed && (
            <>
              <Text fontSize="md" fontWeight="medium" lineHeight={"24px"} color={"gray.600"}>
                {displayName}
              </Text>
              <Box display={{ base: "none", md: "flex" }}>
                <ChevronDown strokeWidth={1.5} />
              </Box>
            </>
          )}
        </HStack>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner w={"64"}>
          <Menu.Content
            p={2}
            w={"full"}
            rounded={"md"}
            bg={contentBg}
            borderColor={borderColor}
            boxShadow="md"
          >
            {/* Header */}
            <Box px={3} py={3} rounded="md" bg={useColorModeValue("gray.50", "gray.800")}>
              <HStack align="center" gap={3}>
                <Avatar.Root size={"sm"}>
                  <Avatar.Fallback name={displayName} />
                </Avatar.Root>
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="semibold">{displayName}</Text>
                  {email && (
                    <Text fontSize="xs" color={subtleText} lineClamp={1}>
                      {email}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>

            <Separator my={2} />

            {/* Menu Items */}
            <Menu.Item
              fontSize="sm"
              fontWeight="normal"
              value="profile"
              _hover={{ bg: hoverBg }}
              display="flex"
              alignItems="center"
              gap={2}
              px={3}
              py={2}
              onClick={() => router.push("/profile")}
            >
              <Icon as={User} boxSize={4} /> Profile
            </Menu.Item>

            <Menu.Item
              fontSize="sm"
              fontWeight="normal"
              value="change-theme"
              _hover={{ bg: hoverBg }}
              display="flex"
              alignItems="center"
              gap={2}
              px={3}
              py={2}
              onClick={toggleColorMode}
            >
              <Icon as={colorMode === "dark" ? Sun : Moon} boxSize={4} /> Change theme
            </Menu.Item>

            <Menu.Item
              fontSize="sm"
              fontWeight="normal"
              value="visit-website"
              _hover={{ bg: hoverBg }}
              display="flex"
              alignItems="center"
              gap={2}
              px={3}
              py={2}
              onClick={handleVisitWebsite}
            >
              <Icon as={Globe} boxSize={4} /> Visit Website
            </Menu.Item>

            <Separator my={2} />

            <Menu.Item
              fontSize="sm"
              fontWeight="normal"
              value="sign-out"
              _hover={{ bg: hoverBg }}
              display="flex"
              alignItems="center"
              gap={2}
              px={3}
              py={2}
              color={useColorModeValue("red.600", "red.400")}
              onClick={handleSignOut}
            >
              <Icon as={LogOut} boxSize={4} /> Sign out
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

export default UserMenu;
