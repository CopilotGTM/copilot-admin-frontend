"use client";

import { Box, Flex, Skeleton, SkeletonCircle, VStack } from "@chakra-ui/react";

const DeckSkelton = () => {
  return (
    <Box
      w={{ base: "100%", sm: "640px" }}
      maxW="150px"
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
      position="relative"
      aspectRatio="16 / 9"
      p={2}
    >
      <VStack gap={4} h="100%" w={"full"}>
        {/* Main Content: Central Circle and Surrounding Text Blocks */}
        <Flex flexDirection={"column"} w="100%" h={"full"}>
          {/* Title Placeholder */}
          <Skeleton height="10px" width="60%" alignSelf="center" mb={2} />
          <Flex
            w={"full"}
            h={"full"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Flex w="30%" flexDirection={"column"} gap={3}>
              <Skeleton height="10px" />
              <Skeleton height="10px" />
            </Flex>

            {/* Central Circle Placeholder */}
            <SkeletonCircle size="40px" />

            <Flex w="30%" flexDirection={"column"} gap={3}>
              <Skeleton height="10px" />
              <Skeleton height="10px" />
            </Flex>
          </Flex>
        </Flex>
      </VStack>
    </Box>
  );
};

export default DeckSkelton;
