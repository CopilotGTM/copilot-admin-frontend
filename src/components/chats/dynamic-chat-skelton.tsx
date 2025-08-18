import React from "react";
import { Flex, HStack, Box, Skeleton, SkeletonText } from "@chakra-ui/react";

// Function to generate a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const DynamicChatSkeleton = () => {
  // Randomly decide the number of skeleton items (3 or 4)
  const numItems = getRandomInt(1, 1);

  // Generate the skeleton items
  const skeletonItems = Array.from({ length: numItems }, (_, index) => {
    // Random width for Box (30% to 70%)
    const boxWidth = `${getRandomInt(30, 70)}%`;

    // Random padding for Skeleton (4 to 30)
    const skeletonPadding = getRandomInt(4, 30);

    // Random noOfLines for SkeletonText (3 to 10), influenced by padding
    // Map padding (4-30) to noOfLines (3-10)
    const minLines = 3;
    const maxLines = 10;
    const paddingRange = 30 - 4; // 26
    const linesRange = maxLines - minLines; // 7
    const lines = Math.round(
      minLines + (skeletonPadding - 4) * (linesRange / paddingRange),
    );
    const noOfLines = Math.min(Math.max(lines, minLines), maxLines); // Ensure it's within 3-10

    return (
      <Flex key={index} flexDirection={"column"} w={"full"} gap={4}>
        <HStack gap="5">
          <Box w={boxWidth}></Box>
          <Skeleton
            bg={"gray.100"}
            p={`${skeletonPadding * 4}px`}
            style={{
              borderRadius: "20px 20px 10px 20px",
            }}
            border={"1px solid"}
            borderColor={"gray.200"}
            fontSize={"sm"}
            fontWeight={"normal"}
            whiteSpace="pre-wrap"
            flex="1"
            height="5"
          />
        </HStack>
        <SkeletonText bg={"gray.100"} noOfLines={noOfLines} gap={2} />
      </Flex>
    );
  });

  return <>{skeletonItems}</>;
};

export default DynamicChatSkeleton;
