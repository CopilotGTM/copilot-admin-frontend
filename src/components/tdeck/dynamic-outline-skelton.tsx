import React from "react";
import { Grid, Flex, Box, Skeleton, SkeletonText } from "@chakra-ui/react";

// same helper you already have
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const DynamicOutlineSkeleton: React.FC = () => {
  // show 4–6 skeleton cards
  const numItems = getRandomInt(3, 4);

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
      {Array.from({ length: numItems }).map((_, idx) => (
        <Flex
          key={idx}
          borderColor="gray.200"
          borderWidth="1px"
          borderRadius="3xl"
          overflow="hidden"
          w="full"
        >
          {/* Left “slide number” box */}
          <Box
            p={6}
            minW="70px"
            maxW="70px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="gray.100"
          >
            {/* just a square skeleton in place of the number */}
            <Skeleton height="24px" width="24px" borderRadius="md" />
          </Box>

          {/* Right content area */}
          <Box p={4} flex="1" w="full">
            {/* heading skeleton */}
            <Skeleton height="20px" width={`${getRandomInt(30, 60)}%`} mb={2} />

            {/* paragraph skeleton */}
            <SkeletonText mt={2} noOfLines={getRandomInt(2, 4)} gap="3" />
          </Box>
        </Flex>
      ))}
    </Grid>
  );
};

export default DynamicOutlineSkeleton;
