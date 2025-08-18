"use client";

import React from "react";
import { Box, Heading, HStack, Link, Text, Flex, Button, Icon } from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { usePathname, useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbEntry[];
  actions?: React.ReactNode;
  backOnSubPathOf?: string; // e.g. "organizations" -> show back if path is /organizations/...
  leading?: React.ReactNode; // optional element to render left of the title (e.g., logo)
}

export default function PageHeader({ title, breadcrumbs, actions, backOnSubPathOf, leading }: PageHeaderProps) {
  const bg = useColorModeValue("white", "gray.900");
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.500", "gray.400");
  const activeCrumbColor = useColorModeValue("gray.700", "gray.200");

  const pathname = usePathname();
  const router = useRouter();

  const base = backOnSubPathOf ? (backOnSubPathOf.startsWith("/") ? backOnSubPathOf : `/${backOnSubPathOf}`) : undefined;
  const showBack = base ? pathname.startsWith(`${base}/`) : false;

  return (
    <Box
      w="full"
      bg={bg}
      borderBottom="1px solid"
      borderColor={border}
      px={{ base: 4, md: 8 }}
      py={{ base: 4, md: 6 }}
    >
      <Flex align="center" justify="space-between" gap={4}>
        <HStack gap={3} align="center">
          {leading ? <Box>{leading}</Box> : null}
          <Box>
            <Heading fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold">
              {title}
            </Heading>
            {showBack ? (
              <Button mt={2} size="sm" variant="ghost" onClick={() => router.back()}>
                <Icon as={MoveLeft} boxSize={4} mr={2} /> Back
              </Button>
            ) : (
              <HStack gap={1} mt={2} color={muted} fontSize="sm">
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <HStack key={`${crumb.label}-${index}`} gap={1}>
                      {crumb.href && !isLast ? (
                        <Link href={crumb.href} _hover={{ textDecoration: "underline" }}>
                          {crumb.label}
                        </Link>
                      ) : (
                        <Text color={isLast ? activeCrumbColor : muted}>{crumb.label}</Text>
                      )}
                      {!isLast && <Text>/</Text>}
                    </HStack>
                  );
                })}
              </HStack>
            )}
          </Box>
        </HStack>
        {actions && <Box>{actions}</Box>}
      </Flex>
    </Box>
  );
}
