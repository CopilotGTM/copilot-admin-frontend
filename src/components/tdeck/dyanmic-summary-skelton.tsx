import React from "react";
import { Box, Skeleton, SkeletonText, Table } from "@chakra-ui/react";

// Function to generate a random number between min and max (inclusive)
const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const DynamicSummarySkeleton = () => {
  // Random width for title skeleton (50% to 80%)
  const titleWidth = `${getRandomInt(50, 80)}%`;

  // Random padding for table cells (4 to 20)
  //const tablePadding = getRandomInt(4, 20);

  // Random number of list items (3)
  const listItems = Array.from({ length: 4 }, (_, index) => (
    <Skeleton
      key={index}
      height="15px"
      width={`${getRandomInt(60, 90)}%`}
      mb={2}
      bg="gray.100"
      borderRadius="md"
    />
  ));

  // Random number of lines for paragraph (3 to 5)
  const paragraphLines = getRandomInt(3, 5);

  return (
    <Box maxW="container.md" mx="auto">
      {/* Title */}
      <Skeleton
        height="30px"
        width={titleWidth}
        mb={6}
        bg="gray.100"
        borderRadius="md"
      />

      {/* 3x3 Table */}
      <Box mb={6} px={0.5}>
        <Table.Root
          size="sm"
          variant="outline"
          overflow={"hidden"}
          rounded={"xl"}
        >
          <Table.Header>
            <Table.Row>
              {Array.from({ length: 3 }).map((_, index) => (
                <Table.ColumnHeader
                  key={index}
                  p={`${10}px`}
                  //minW="100px"
                >
                  <Skeleton height="20px" bg="gray.100" />
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <Table.Row key={rowIndex}>
                {Array.from({ length: 3 }).map((_, colIndex) => (
                  <Table.Cell key={colIndex} p={`${12}px`}>
                    <Skeleton height="20px" bg="gray.100" />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* h3 */}
      <Skeleton
        height="25px"
        width={`${getRandomInt(40, 100)}%`}
        mb={4}
        bg="gray.100"
        borderRadius="md"
      />

      {/* List with 3 items */}
      <Box mb={6}>{listItems}</Box>

      {/* Paragraph */}
      <SkeletonText
        noOfLines={paragraphLines}
        gap="2"
        bg="gray.100"
        borderRadius="md"
        p={2}
        border="1px solid"
        borderColor="gray.200"
      />
    </Box>
  );
};

export default DynamicSummarySkeleton;
