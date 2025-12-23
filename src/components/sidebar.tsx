"use client";

import React from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  Drawer,
  Portal,
  useDisclosure,
  BoxProps,
  FlexProps,
  Separator,
  useBreakpointValue,
} from "@chakra-ui/react";
import { IconType } from "react-icons";

import { useColorModeValue } from "@chakra-ui/system";
import { SidebarClose } from "./sidebar-close";
import { Bell, Building2, Home, Settings } from "lucide-react";
import UserMenu from "./user-menu";
import { Tooltip } from "./ui/tooltip";
import logo from "../../public/logo.svg";
import Image from "next/image";
import Link from "next/link";

interface LinkItemProps {
  name: string;
  icon: IconType;
}

const ENABLE_NOTIFICATIONS =
  process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== "false";
const ENABLE_SETTINGS = process.env.NEXT_PUBLIC_ENABLE_SETTINGS !== "false";

const mainLinkItems: Array<LinkItemProps> = [
  { name: "Organizations", icon: Building2 }
];

const secondaryLinkItems: Array<LinkItemProps> = [
  ...(ENABLE_NOTIFICATIONS ? [{ name: "Notifications", icon: Bell }] : []),
  ...(ENABLE_SETTINGS ? [{ name: "Settings", icon: Settings }] : []),
];

interface CollapsibleSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CollapsibleSidebar({
  isCollapsed,
  setIsCollapsed,
}: CollapsibleSidebarProps) {
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
                  <Icon as={Home} fontSize="18" color="rgba(140, 86, 176, 1)" />
                  <Text
                    fontSize="md"
                    fontWeight="medium"
                    lineHeight={"24px"}
                    color="rgba(140, 86, 176, 1)"
                  >
                    CoPilotGTM
                  </Text>
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
  icon: IconType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  isCollapsed: boolean;
}

const NavItem = ({ icon, children, isCollapsed, ...rest }: NavItemProps) => {
  return (
    <Box
      as="a"
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
    >
      <Flex
        align="center"
        px={3}
        py={3}
        mx={isCollapsed ? 2 : 4}
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: "purple.100",
          color: "purple.700",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr={isCollapsed ? 0 : 4}
            fontSize="18"
            color={"gray.600"}
            _groupHover={{
              color: "gray.500",
            }}
            as={icon}
          />
        )}
        {!isCollapsed && (
          <Text
            fontSize="md"
            fontWeight="normal"
            lineHeight={"24px"}
            color={"gray.600"}
          >
            {children}
          </Text>
        )}
      </Flex>
    </Box>
  );
};
