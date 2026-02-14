"use client";

import React from "react";
import {
  Box,
  Flex,
  Icon,
  Drawer,
  Portal,
  useDisclosure,
  BoxProps,
  FlexProps,
  Separator,
  useBreakpointValue,
} from "@chakra-ui/react";

import { useColorModeValue } from "@/components/ui/color-mode";
import { SidebarClose } from "./sidebar-close";
import { Bell, Building2, Home, Settings, Users } from "lucide-react";
import UserMenu from "./user-menu";
import { Tooltip } from "@/components/ui/tooltip";
import logo from "@/../public/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface LinkItemProps {
  name: string;
  icon: React.ElementType;
  href: string;
}

const ENABLE_NOTIFICATIONS =
  process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false";
const ENABLE_SETTINGS = process.env.NEXT_PUBLIC_ENABLE_SETTINGS !== "false";

const mainLinkItems: Array<LinkItemProps> = [
  { name: "Organizations", icon: Building2, href: "/organizations" },
  { name: "Users", icon: Users, href: "/users" },
];

const secondaryLinkItems: Array<LinkItemProps> = [
  ...(ENABLE_NOTIFICATIONS
    ? [{ name: "Notifications", icon: Bell, href: "/notifications" }]
    : []),
  ...(ENABLE_SETTINGS
    ? [{ name: "Settings", icon: Settings, href: "/settings" }]
    : []),
];

export interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CollapsibleSidebar({
  isCollapsed,
  setIsCollapsed,
}: Readonly<CollapsibleSidebarProps>) {
  const { open: isSidebarOpen } = useDisclosure();

  // useBreakpointValue returns a value based on the current breakpoint
  const defaultIsCollapsed =
    useBreakpointValue({ base: true, md: true, lg: true }) ?? false;

  React.useEffect(() => {
    setIsCollapsed(defaultIsCollapsed);
  }, [defaultIsCollapsed, setIsCollapsed]);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev: boolean) => !prev);
  };

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
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
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px solid"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: isCollapsed ? "64px" : "240px" }}
      pos="fixed"
      h="full"
      pb={6}
      transitionProperty="width"
      transitionDuration="0.2s"
      {...rest}
    >
      <Flex
        h={"full"}
        w={"full"}
        flexDirection={"column"}
        justifyContent={"space-between"}
      >
        <Box>
          <Flex
            h="20"
            alignItems="center"
            mx={isCollapsed ? 2 : 7}
            gap={4}
            justifyContent={isCollapsed ? "center" : "start"}
          >
            <Link
              href="/organizations"
              style={{
                display: "flex",
                alignItems: "center",
                gap: isCollapsed ? 0 : 12,
                textDecoration: "none",
              }}
              aria-label="Go to Organizations"
            >
              <Image src={logo} alt="Copilot-GTM logo" />
              {!isCollapsed && (
                <Flex alignItems="center" gap={2}>
                  <Icon as={Home} fontSize="24" color="rgba(140, 86, 176, 1)" />
                  <Box
                    fontSize="md"
                    fontWeight="medium"
                    lineHeight={"24px"}
                    color="rgba(140, 86, 176, 1)"
                  >
                    CoPilotGTM
                  </Box>
                </Flex>
              )}
            </Link>
          </Flex>
          {mainLinkItems.map((link) => (
            <Tooltip
              showArrow
              key={link.name}
              content={link.name}
              positioning={{ placement: "right" }}
            >
              <NavItem
                key={link.name}
                icon={link.icon}
                isCollapsed={isCollapsed}
                isActive={
                  pathname === link.href ||
                  pathname?.startsWith(link.href + "/")
                }
                onClick={() => router.push(link.href)}
              >
                {link.name}
              </NavItem>
            </Tooltip>
          ))}
        </Box>
        <Box spaceY={4}>
          {secondaryLinkItems.map((link) => (
            <Tooltip
              showArrow
              key={link.name}
              content={link.name}
              positioning={{ placement: "right" }}
            >
              <NavItem
                key={link.name}
                icon={link.icon}
                isCollapsed={isCollapsed}
                isActive={
                  pathname === link.href ||
                  pathname?.startsWith(link.href + "/")
                }
                onClick={() => router.push(link.href)}
              >
                {link.name}
              </NavItem>
            </Tooltip>
          ))}

          <Separator mx={isCollapsed ? 0 : 4} />

          <UserMenu isCollapsed={isCollapsed} />
        </Box>
      </Flex>
      <SidebarClose isCollapsed={isCollapsed} onClick={onToggleCollapse} />
    </Box>
  );
};

interface NavItemProps extends FlexProps {
  icon: React.ElementType;
  children: React.ReactNode;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({
  icon,
  children,
  isCollapsed,
  isActive,
  onClick,
  ...rest
}: NavItemProps) => {
  const activeBg = useColorModeValue("purple.50", "purple.900");
  const activeColor = useColorModeValue("purple.700", "purple.200");
  const inactiveColor = useColorModeValue("gray.600", "gray.400");
  const hoverBg = useColorModeValue("gray.100", "gray.800");
  const activeHoverBg = useColorModeValue("purple.100", "purple.800");

  return (
    <Box
      as="a"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      onClick={onClick}
      cursor="pointer"
    >
      <Flex
        align="center"
        px={3}
        py={3}
        mx={isCollapsed ? 2 : 4}
        borderRadius="lg"
        cursor="pointer"
        bg={isActive ? activeBg : "transparent"}
        color={isActive ? activeColor : inactiveColor}
        fontWeight={isActive ? "semibold" : "normal"}
        _hover={{
          bg: isActive ? activeHoverBg : hoverBg,
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr={isCollapsed ? 0 : 4}
            fontSize="24"
            color="currentColor"
            as={icon}
          />
        )}
        {!isCollapsed && (
          <Box
            fontSize="md"
            fontWeight="inherit"
            lineHeight={"24px"}
            color="currentColor"
          >
            {children}
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default CollapsibleSidebar;
