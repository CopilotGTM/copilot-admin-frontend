"use client";

import { Box, HStack, Skeleton, Stack } from "@chakra-ui/react";

export default function LoadingOrganizations() {
  return (
    <Box w="full" px={10} py={6}>
      <Stack gap={4} w="full" maxW="6xl" mx="auto">
        <Skeleton height="40px" rounded="md" />
        <Box borderWidth="1px" rounded="lg" p={4}>
          <Stack gap={3}>
            {Array.from({ length: 8 }).map((_, idx) => (
              <HStack key={idx} gap={3}>
                <Skeleton height="24px" flex={2} rounded="md" />
                <Skeleton height="24px" flex={1} rounded="md" />
                <Skeleton height="24px" flex={1} rounded="md" />
                <Skeleton height="24px" flex={1} rounded="md" />
                <Skeleton height="24px" flex={1} rounded="md" />
              </HStack>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
