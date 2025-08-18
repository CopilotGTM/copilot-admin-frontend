import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  Avatar,
  Heading,
  Float,
  Circle,
} from "@chakra-ui/react";
import { MoveRight } from "lucide-react";
import { CustomScrollbar } from "../../custom-scrollbar";
import MarkdownEditor from "../markdown-editor";
import { useTdeckDetails } from "../../../app/hooks/use-tdeck";
import { useEffect, useMemo, useState } from "react";
import MarkdownRenderer from "../../markdown-renderer";
import { useSocketChats } from "../../../app/hooks/socket/use-socket-chats";
import { MessageChunk } from "../../../app/types/chat";
import DynamicSummarySkeleton from "../dyanmic-summary-skelton";
import {
  OutlineData,
  SummaryData,
  TDeckResponse,
  TDeckState,
} from "../../../app/types/tdeck";
import DynamicTranscriptSkeleton from "../dynamic-transript-skelton";
import useStepStore from "../../../app/stores/use-step-store";
import { usePanelStore } from "../../../app/stores/use-panel-store";
import { useQueryClient } from "@tanstack/react-query";
import { parseTranscript } from "../../../lib/tdeck";
import { useSocketTDeck } from "../../../app/hooks/socket/use-socket-tdeck";

interface SummaryFragmentProps {
  sessionId: string;
  messageId: string;
  state?: TDeckState;
}

const SummaryFragment = ({
  sessionId,
  messageId,
  state = "TRANSCRIPT_SUMMARY",
}: SummaryFragmentProps) => {
  const queryClient = useQueryClient();
  const { openedBy } = usePanelStore();

  //const [isEditing, setisEditing] = useState(false);
  const [isEditing] = useState(false);
  const [loading, setLoading] = useState<boolean>(
    openedBy === "Auto" ? true : false,
  );

  const [fullSummaryLoaded, setFullSummaryLoaded] = useState<boolean>(
    openedBy === "Auto" ? false : true,
  );
  const [isTranscriptLoading, setIsTranscriptLoading] =
    useState<boolean>(false);

  const { socket } = useSocketChats();
  const { generateOutline } = useSocketTDeck();

  const { activeStep, setStep } = useStepStore();

  const queryKey = useMemo(() => {
    return ["tdeck_details", sessionId, messageId, state];
  }, [sessionId, messageId, state]);

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    // error,
  } = useTdeckDetails(sessionId, messageId, state, openedBy);

  useEffect(() => {
    if (
      openedBy === "Auto" &&
      ((summaryData?.data as SummaryData)?.formatted_transcript.length || 0) ===
        0
    ) {
      setIsTranscriptLoading(true);
      parseTranscript(sessionId, messageId).then((data) => {
        queryClient.setQueryData<TDeckResponse>(queryKey, (old) => {
          //if (!old) return old;
          if (!old) {
            return {
              data: {
                complete_transcript_summary: "",
                formatted_transcript: data?.data?.formatted_transcript || [],
              } as SummaryData,
              message: "Summary updated",
              status: "success",
            };
          }

          const prev = old.data as SummaryData;
          return {
            ...old,
            data: {
              ...prev,
              formatted_transcript: data?.data?.formatted_transcript || [],
            },
          };
        });

        setIsTranscriptLoading(false);
      });
    }
  }, [openedBy, sessionId, messageId, queryKey]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveTranscriptMessage = async (chunk: MessageChunk) => {
      if (chunk.chat_id !== sessionId) return;
      if (chunk.message_id !== messageId) return;

      setLoading(false); // AI started responding

      if (chunk.isComplete) {
        setFullSummaryLoaded(true);
      }

      // Update summary if the chunk contains summary data
      if (chunk.response && typeof chunk.response === "string") {
        // Append incoming text to the cached summary
        queryClient.setQueryData<TDeckResponse>(queryKey, (old) => {
          //if (!old) return old;
          // if nothing was in cache yet, create the minimal shape
          if (!old) {
            return {
              data: {
                complete_transcript_summary: chunk.response,
                formatted_transcript: [],
              } as SummaryData,
              message: "Summary updated",
              status: "success",
            };
          }

          const prev = old.data as SummaryData;
          return {
            ...old,
            data: {
              ...prev,
              complete_transcript_summary:
                (prev.complete_transcript_summary || "") + chunk.response,
            },
          };
        });
      }
    };

    socket.on("recieve_transcript_messages", handleReceiveTranscriptMessage);

    return () => {
      socket.off("recieve_transcript_messages", handleReceiveTranscriptMessage);
    };
  }, [socket, sessionId, messageId, queryClient, queryKey]);

  console.log("@@@@@@helo", fullSummaryLoaded, loading, openedBy);

  const handleGenerateOutline = () => {
    // This function will be called when the user clicks the "Create outline" button
    if (!socket) return;

    try {
      generateOutline({
        session_id: sessionId,
        message_id: messageId,
      });

      queryClient.setQueryData<TDeckResponse>(
        ["tdeck_details", sessionId, messageId, "SLIDE_CONTENT"],
        (old) => {
          if (!old) return old;
          // if nothing was in cache yet, create the minimal shape
          return {
            data: {
              user_outline_input: {},
              slide_content_summary: [],
            } as OutlineData,
            message: "Outline updated",
            status: "SUCCESS",
          };
        },
      );

      setStep(activeStep + 1);
    } catch (error) {
      console.error("Error generating outline:", error);
    }
  };

  return (
    <Box w={"full"} h={"full"} px={8} overflow={"hidden"} pos={"relative"}>
      <Flex h={"full"} gap={8} overflow={"hidden"}>
        {/* Summary Panel */}
        <Flex
          w={"50%"}
          //   borderWidth="1px"
          //   borderRadius="lg"
          overflow={"hidden"}
          h={"full"}
          flexDirection={"column"}
        >
          <Box
            // style={{
            //   height: "calc(100% - 40px)",
            // }}
            h={"full"}
            overflow={isEditing ? "hidden" : "auto"}
            pt={12}
            pb={20}
            px={4}
          >
            <Flex mb={4} alignItems={"center"} justifyContent={"space-between"}>
              <Heading size="2xl" fontWeight={"bold"} lineHeight={"28px"}>
                Summary
              </Heading>

              {/* <Button
                size={"xs"}
                variant={"ghost"}
                gap={1}
                px={2}
                onClick={() => {
                  setisEditing((prev) => !prev);
                }}
              >
                {isEditing ? (
                  <>
                    <Eye />
                    View
                  </>
                ) : (
                  <>
                    <Pen />
                    Edit
                  </>
                )}
              </Button> */}
            </Flex>

            {/* <MDEditor
            //height={200}
            value={mkdStr}
            preview="edit"
            extraCommands={[commands.codeEdit, commands.codePreview]}
            previewOptions={{
              rehypePlugins: [[rehypeSanitize]],
              disallowedElements: ['style'],
            }}
            visibleDragbar={false}
            //onChange={setValue}
            style={
              {
                //padding: 4
              }
            }
          /> */}
            {isEditing ? (
              <MarkdownEditor
                initialValue={
                  (summaryData?.data as SummaryData).complete_transcript_summary
                }
              />
            ) : isSummaryLoading ||
              ((summaryData?.data as SummaryData)
                ?.complete_transcript_summary || "") === "" ? (
              <DynamicSummarySkeleton />
            ) : (
              <Box
                color={"gray.800"}
                fontSize={"sm"}
                fontWeight={"normal"}
                whiteSpace="pre-wrap"
                overflow={"hidden"}
                w={"full"}
                px={0.5}
              >
                <MarkdownRenderer
                  content={
                    (summaryData?.data as SummaryData)
                      ?.complete_transcript_summary
                  }
                />
              </Box>
            )}
          </Box>
        </Flex>

        {/* Transcript Panel */}
        <CustomScrollbar h={"full"} w={"50%"} px={4}>
          <Flex flexDirection={"column"} h={"full"} w={"full"} py={12}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="2xl" fontWeight={"bold"} lineHeight={"28px"}>
                Transcript
              </Heading>
              {/* <Text fontSize="xs" color="gray.400">
                POWERED BY{" "}
                <Text
                  as="span"
                  fontWeight="bold"
                  bg={"purple.50"}
                  rounded={"md"}
                  p={1}
                  color="purple.500"
                >
                  Copilot GTM
                </Text>
              </Text> */}
            </Flex>

            <VStack
              align="stretch"
              //py={4}
              //maxHeight="600px"
              h="full"
              //flex={"1"}
              //overflow="auto"
              w={"full"}
            >
              <Flex pb={12} flexDirection={"column"} gap={4} w={"full"}>
                {isTranscriptLoading ||
                isSummaryLoading ||
                ((summaryData?.data as SummaryData)?.formatted_transcript
                  ?.length || 0) === 0 ? (
                  <DynamicTranscriptSkeleton />
                ) : (
                  (
                    summaryData?.data as SummaryData
                  )?.formatted_transcript?.[0]?.sections?.[0]?.dialogues?.map(
                    (dialogue, index) => (
                      <Box key={index}>
                        <Flex alignItems={"center"} gap={4}>
                          <Flex alignItems={"center"} gap={2}>
                            <Avatar.Root
                              size={"xs"}
                              bg={index % 2 === 0 ? "gray.500" : "teal.500"}
                              color="white"
                            >
                              <Avatar.Fallback name={dialogue.speaker} />
                              {/* <Avatar.Image src="https://bit.ly/sage-adebayo" /> */}
                              <Float
                                placement="bottom-end"
                                offsetX="1"
                                offsetY="1"
                              >
                                <Circle
                                  bg="green.500"
                                  size="8px"
                                  outline="0.2em solid"
                                  outlineColor="bg"
                                />
                              </Float>
                            </Avatar.Root>
                            <Text
                              fontSize={"sm"}
                              lineHeight={"20px"}
                              color={"gray.800"}
                            >
                              {dialogue.speaker}
                            </Text>
                          </Flex>
                          <Text
                            fontSize="xs"
                            lineHeight={"16px"}
                            color="gray.500"
                          >
                            {dialogue.timestamp}
                          </Text>
                        </Flex>
                        <Text
                          mt={2}
                          fontSize={"sm"}
                          lineHeight={"20px"}
                          color={"gray.800"}
                        >
                          {dialogue.content}
                        </Text>
                      </Box>
                    ),
                  )
                )}
              </Flex>
            </VStack>
          </Flex>
        </CustomScrollbar>
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
            isSummaryLoading ||
            isTranscriptLoading ||
            ((summaryData?.data as SummaryData)?.complete_transcript_summary ||
              "") === "" ||
            ((summaryData?.data as SummaryData)?.formatted_transcript.length ||
              0) === 0 ||
            (!fullSummaryLoaded && !loading)
          }
          onClick={() => {
            handleGenerateOutline();
          }}
        >
          Create outline
          <MoveRight />
        </Button>
      </Box>
    </Box>
  );
};

export default SummaryFragment;
