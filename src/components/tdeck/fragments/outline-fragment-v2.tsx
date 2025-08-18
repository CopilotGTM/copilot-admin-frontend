"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Heading, Flex, Text, Grid } from "@chakra-ui/react";
import { MoveRight } from "lucide-react";
import { useSocketTDeck } from "../../../app/hooks/socket/use-socket-tdeck";
import { MessageChunk, OutlineContent } from "../../../app/types/chat";
import MarkdownRenderer from "../../markdown-renderer";
import {
  DeckData,
  OutlineData,
  TDeckResponse,
  TDeckState,
} from "../../../app/types/tdeck";
import { useTdeckDetails } from "../../../app/hooks/use-tdeck";
import LoadingCursor from "../../ui/loading-cursor";
import useStepStore from "../../../app/stores/use-step-store";
import DynamicOutlineSkeleton from "../dynamic-outline-skelton";
import { useQueryClient } from "@tanstack/react-query";

interface OutlineFragmentV2Props {
  sessionId: string;
  messageId: string;
  state?: TDeckState;
}

const OutlineFragmentV2 = ({
  sessionId,
  messageId,
  state = "SLIDE_CONTENT",
}: OutlineFragmentV2Props) => {
  const { socket } = useSocketTDeck();
  const { generateDeck } = useSocketTDeck();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    return ["tdeck_details", sessionId, messageId, state];
  }, [sessionId, messageId, state]);

  const {
    data: outlineTDeckData,
    isLoading: isOutlineLoading,
    // error,
  } = useTdeckDetails(sessionId, messageId, state, "Click");

  //const [isGenerating, setIsGenerating] = useState(true);
  const [fullOutlineLoaded, setFullOutlineLoaded] = useState(false);

  const { activeStep, setStep } = useStepStore();

  const outlineContainerRef = useRef<HTMLDivElement>(null); // Create a ref for the outline container

  const handleGenerateDeck = async () => {
    if (!socket) return;
    if (
      (outlineTDeckData?.data as OutlineData)?.slide_content_summary.length > 0
    ) {
      try {
        generateDeck({
          session_id: sessionId,
          system_message_id: messageId,
        });

        queryClient.setQueryData<TDeckResponse>(
          ["tdeck_details", sessionId, messageId, "SLIDE_OUTPUT"],
          (old) => {
            if (!old) return old;
            // if nothing was in cache yet, create the minimal shape
            return {
              data: {
                technical_deck_url: "",
              } as DeckData,
              message: "Deck updated",
              status: "SUCCESS",
            };
          },
        );

        setStep(activeStep + 1);
      } catch (error) {
        console.error("Error generating outline:", error);
      }
    }
  };

  //console.log("@@@@@@outlineData", outlineData);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveOutline = async (chunk: MessageChunk) => {
      if (chunk.chat_id !== sessionId) return;
      if (chunk.message_id !== messageId) return;

      // if (chunk.isFirstMessage) {
      //   queryClient.setQueryData<TDeckResponse>(queryKey, (old) => {
      //     if (!old) return old;
      //     // if nothing was in cache yet, create the minimal shape
      //     return {
      //       data: {
      //         user_outline_input: {},
      //         slide_content_summary: [],
      //       } as OutlineData,
      //       message: "Outline updated",
      //       status: "success",
      //     };
      //   });
      // }

      if (chunk.isComplete) {
        setFullOutlineLoaded(true);
      }

      // Update outline if the chunk contains outline data
      // Append new OutlineContent to outlineData
      if (
        chunk.response &&
        typeof chunk.response === "object" &&
        "slide_number" in chunk.response
      ) {
        //setOutlineData((prev) => [...prev, chunk.response as OutlineContent]);
        // Append incoming text to the cached summary
        queryClient.setQueryData<TDeckResponse>(queryKey, (old) => {
          // if nothing was in cache yet, create the minimal shape
          if (!old) {
            return {
              data: {
                user_outline_input: {},
                slide_content_summary: [chunk.response as OutlineContent],
              } as OutlineData,
              message: "Outline updated",
              status: "success",
            };
          }

          const prev = old.data as OutlineData;
          return {
            ...old,
            data: {
              ...prev,
              slide_content_summary: [
                ...prev.slide_content_summary,
                chunk.response as OutlineContent,
              ],
            },
          };
        });
      }
    };

    socket.on("recieve_slide_content", handleReceiveOutline);

    return () => {
      socket.off("recieve_slide_content", handleReceiveOutline);
    };
  }, [socket, sessionId, messageId]);

  // Scroll to the bottom when isLoading is true or new outline data is added
  useEffect(() => {
    if (
      !fullOutlineLoaded &&
      outlineContainerRef.current &&
      !isOutlineLoading
    ) {
      const container = outlineContainerRef.current;
      container.scrollTop = container.scrollHeight; // Scroll to the bottom
    }
  }, [fullOutlineLoaded, outlineTDeckData, isOutlineLoading]);

  return (
    <Box w={"full"} h={"full"} px={8} overflow={"hidden"} pos={"relative"}>
      <Flex h={"full"} gap={8} overflow={"hidden"}>
        <Box
          overflow={"auto"}
          w="full"
          h={"full"}
          pt={12}
          pb={20}
          px={4}
          ref={outlineContainerRef}
        >
          <Flex mb={4} alignItems={"center"} justifyContent={"space-between"}>
            <Heading size="2xl" fontWeight={"bold"} lineHeight={"28px"}>
              Outlines
            </Heading>
          </Flex>

          {isOutlineLoading ||
          (outlineTDeckData?.data as OutlineData)?.slide_content_summary
            ?.length === 0 ? (
            <DynamicOutlineSkeleton />
          ) : (
            <Grid templateColumns="repeat(2, 1fr)" gap="6">
              {(
                outlineTDeckData?.data as OutlineData
              ).slide_content_summary?.map((outline, idx) => (
                <Flex
                  key={idx}
                  borderColor="gray.200"
                  borderWidth="1px"
                  borderRadius="3xl"
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
                    <Text fontSize="xl" fontWeight="bold" color="purple.500">
                      {outline.slide_number}
                    </Text>
                  </Box>
                  <Box p={4} flex="1" w={"full"}>
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
            </Grid>
          )}
        </Box>
      </Flex>

      <Box pos={"absolute"} bottom={4} zIndex={10}>
        <Button
          fontSize={"md"}
          w={"max"}
          h={"45px"}
          fontWeight={"semibold"}
          lineHeight={"24px"}
          bg={"purple.500"}
          color={"white"}
          px={6}
          gap={3}
          rounded={"full"}
          shadow={"2xl"}
          blur={"2xl"}
          disabled={
            isOutlineLoading ||
            (((outlineTDeckData?.data as OutlineData)?.slide_content_summary
              .length || 0) === 0 &&
              !fullOutlineLoaded)
            //|| (!fullSummaryLoaded && !loading)
          }
          onClick={() => {
            handleGenerateDeck();
          }}
        >
          {((outlineTDeckData?.data as OutlineData)?.slide_content_summary
            .length || 0) === 0 &&
          !fullOutlineLoaded &&
          !isOutlineLoading ? (
            <>
              <LoadingCursor />
              <Text>Generating...</Text>
            </>
          ) : (
            "Create deck"
          )}
          {(((outlineTDeckData?.data as OutlineData)?.slide_content_summary
            .length || 0) > 0 ||
            fullOutlineLoaded) &&
            !isOutlineLoading && <MoveRight />}
        </Button>
      </Box>
    </Box>
  );
};

export default OutlineFragmentV2;
