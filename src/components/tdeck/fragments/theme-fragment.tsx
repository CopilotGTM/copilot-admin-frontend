"use client";

import { Box, Button, Flex } from "@chakra-ui/react";
import { TDeckState } from "../../../app/types/tdeck";
import { useSocketTDeck } from "../../../app/hooks/socket/use-socket-tdeck";

interface ThemeFragmentProps {
  sessionId: string;
  messageId: string;
  state?: TDeckState;
}

export default function ThemeFragment({
  sessionId,
  messageId,
  //state = "SLIDE_TEMPLATE",
}: ThemeFragmentProps) {
  const { generateDeck } = useSocketTDeck();

  const handleGenerateDeck = async () => {
    try {
      generateDeck({
        session_id: sessionId,
        system_message_id: messageId,
      });
    } catch (error) {
      console.error("Error generating outline:", error);
    }
  };

  return (
    <Box w={"full"} h={"full"} px={12} overflow={"hidden"}>
      <Flex h={"full"} gap={8} overflow={"hidden"}>
        {/* Left Side - Form */}
        <Box
          py={12}
          overflow={"hidden"}
          //w={outlineData.length > 0 ? "40%" : "60%"}
        >
          {/* <VStack gap={6} align="stretch">
            <Heading size="xl" fontWeight="semibold" lineHeight="28px">
              Shape your deck
            </Heading>

            <FormControl display="flex" flexDirection="column" gap={4}>
              <FormLabel
                fontSize="sm"
                fontWeight="medium"
                lineHeight="20px"
                color="gray.600"
              >
                Description
              </FormLabel>
              <Input
                size="md"
                variant="outline"
                borderRadius="md"
                px="8px"
                fontSize="sm"
                placeholder="Please share information about attendees"
                _placeholder={{
                  color: "gray.400",
                }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>

            <Box
              display="flex"
              gap={4}
              flexDirection={{ base: "column", md: "row" }}
            >
              <FormControl
                flex={1}
                display="flex"
                flexDirection="column"
                gap={4}
              >
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="20px"
                  color="gray.600"
                >
                  Image Source
                </FormLabel>
                <Select.Root
                  collection={imageSources}
                  value={[imageSource]}
                  size="md"
                  onValueChange={(details) => {
                    setImageSource(details.value[0]);
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger rounded="md">
                      <Select.ValueText px="8px" />
                    </Select.Trigger>
                    <Select.IndicatorGroup px={2}>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content maxW={60} rounded="md" p={2}>
                        {imageSources.items.map((source) => (
                          <Select.Item
                            rounded="sm"
                            py={1}
                            px={2}
                            item={source}
                            key={source.value}
                          >
                            {source.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </FormControl>

              <FormControl
                flex={1}
                display="flex"
                flexDirection="column"
                gap={4}
              >
                <FormLabel
                  fontSize="sm"
                  fontWeight="medium"
                  lineHeight="20px"
                  color="gray.600"
                >
                  Audience
                </FormLabel>
                <Select.Root
                  collection={audiences}
                  value={[audience]}
                  size="md"
                  onValueChange={(details) => {
                    setAudience(details.value[0]);
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger rounded="md">
                      <Select.ValueText px="8px" />
                    </Select.Trigger>
                    <Select.IndicatorGroup px={2}>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content maxW={60} rounded="md" p={2}>
                        {audiences.items.map((source) => (
                          <Select.Item
                            rounded="sm"
                            py={1}
                            px={2}
                            item={source}
                            key={source.value}
                          >
                            {source.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </FormControl>
            </Box>

            <Box>
              <Button
                fontSize="md"
                fontWeight="medium"
                lineHeight="24px"
                bg="purple.500"
                color="white"
                px={4}
                gap={2}
                _hover={{ bg: "purple.600" }}
                onClick={handleGenerateOutline}
                loading={isLoading || isOutlineLoading}
                loadingText={isOutlineLoading ? "Loading..." : "Generating..."}
              >
                Generate outline
                {!isLoading && <MoveRight size={18} />}
              </Button>
            </Box>
          </VStack> */}

          <Button
            fontSize="md"
            fontWeight="medium"
            lineHeight="24px"
            bg="purple.500"
            color="white"
            px={4}
            gap={2}
            _hover={{ bg: "purple.600" }}
            onClick={handleGenerateDeck}
            //loading={isLoading || isOutlineLoading}
            //loadingText={isOutlineLoading ? "Loading..." : "Generating..."}
          >
            Generate Deck
            {/* {!isLoading && <MoveRight size={18} />} */}
          </Button>
        </Box>

        {/* Right Side - Outline */}
        {/* {outlineData.length > 0 && (
          <CustomScrollbar h={"full"} w={"60%"} ref={outlineContainerRef!}>
            <Flex
              flexDirection={"column"}
              h={"full"}
              w={"full"}
              gap={6}
              pt={12}
            >
              <Heading size="xl" fontWeight="semibold" lineHeight="28px">
                Outlines
              </Heading>

              <VStack
                align="stretch"
                //py={4}
                //maxHeight="600px"
                //h="full"
                flex={1}
                //overflow="auto"
                w={"full"}
              >
                <Flex
                  flexDirection={"column"}
                  gap={4}
                  //overflow="hidden"
                  w="full"
                  pb={12}
                >
                  {outlineData.map((outline, idx) => (
                    <Flex
                      key={idx}
                      borderColor="gray.200"
                      borderWidth="1px"
                      borderRadius="lg"
                      overflow={"hidden"}
                      w={"full"}
                    >
                      <Box
                        bg={"purple.100"}
                        p={6}
                        minW="70px"
                        maxW="70px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color="purple.500"
                        >
                          {outline.slide_number}
                        </Text>
                      </Box>
                      <Box p={6} flex="1" w={"full"}>
                        <Heading size="md" mb={2}>
                          {outline.slide_title}
                        </Heading>
                        <Box
                          color={"gray.800"}
                          fontSize={"sm"}
                          fontWeight={"normal"}
                          whiteSpace="pre-wrap"
                          overflow={"hidden"}
                          w={"full"}
                        >
                          <MarkdownRenderer content={outline.slide_content} />
                        </Box>
                      </Box>
                    </Flex>
                  ))}

                  {isLoading && <LoadingCursor />}
                </Flex>
              </VStack>
            </Flex>
          </CustomScrollbar>
        )} */}
      </Flex>
    </Box>
  );
}
