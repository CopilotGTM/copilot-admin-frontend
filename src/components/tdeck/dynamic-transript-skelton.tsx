import React from "react";
import {
  Flex,
  Box,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Circle,
} from "@chakra-ui/react";

// Function to generate a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const DynamicTranscriptSkeleton = () => {
  // Generate 3 to 5 skeleton dialogue items
  const numItems = getRandomInt(3, 5);

  return (
    <Flex pb={12} flexDirection={"column"} gap={6} w={"full"}>
      {Array.from({ length: numItems }).map((_, index) => (
        <Box key={index}>
          <Flex alignItems={"center"} gap={4}>
            <Flex alignItems={"center"} gap={2}>
              {/* Avatar Skeleton */}
              <SkeletonCircle size="12" bg="gray.100">
                <Circle
                  bg="green.500"
                  size="8px"
                  outline="0.2em solid"
                  outlineColor="bg"
                  position="absolute"
                  bottom="0"
                  right="0"
                />
              </SkeletonCircle>
              {/* Speaker Name Skeleton */}
              <Skeleton
                height="20px"
                width={`${getRandomInt(80, 150)}px`}
                bg="gray.100"
                borderRadius="md"
              />
            </Flex>
            {/* Timestamp Skeleton */}
            <Skeleton
              height="16px"
              width={`${getRandomInt(40, 60)}px`}
              bg="gray.100"
              borderRadius="md"
            />
          </Flex>
          {/* Content Skeleton */}
          <SkeletonText
            mt={2}
            noOfLines={getRandomInt(2, 4)}
            gap="1"
            bg="gray.100"
            borderRadius="md"
          />
        </Box>
      ))}
    </Flex>
  );
};

export default DynamicTranscriptSkeleton;
