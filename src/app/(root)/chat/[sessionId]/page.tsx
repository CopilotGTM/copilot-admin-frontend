/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Flex, Separator, Spinner, Text, VStack } from "@chakra-ui/react";
import { useSocketChats } from "../../../hooks/socket/use-socket-chats";
import { v4 as uuidv4 } from "uuid";
import { SendMessageInput } from "../../../schemas/chat";
import {
  MessageChunk,
  MessageData,
  MessageResponseData,
  MessageType,
} from "../../../types/chat";
import { useChat } from "../../../hooks/use-chats";
import { useParams } from "next/navigation";
import DynamicChatSkeleton from "../../../../components/chats/dynamic-chat-skelton";
import { AttachmentMetadata } from "../../../types/file";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { fileIconMap, getFileExtension } from "../../../../lib/utils";
import { usePanelStore } from "../../../stores/use-panel-store";
import useStepStore from "../../../stores/use-step-store";
import TDeckFragment from "../../../../components/tdeck/fragments";
import MarkdownRenderer from "../../../../components/markdown-renderer";
import { FloatingTextArea } from "../../../../components/floating-textarea";
import LoadingCursor from "../../../../components/ui/loading-cursor";
import { Presentation } from "lucide-react";
import RFPFragment from "../../../../components/rfp/rfp-fragment";
import { useSideChatStore } from "../../../stores/use-sidechat-store";
import FloatingChatButton from "../../../../components/tdeck/floating-chat-button";
import { RFPSheetDialog } from "../../../../components/dialogs/rfp-sheet-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { CHAT_LIMIT } from "../../../../lib/CONSTANTS";

interface InfiniteChatData {
  pages: MessageResponseData[];
  pageParams: any[];
}

const ChatPage = () => {
  const { sessionId } = useParams() as { sessionId: string };
  const { socket, sendQAChat, sendDeckChat } = useSocketChats();
  const queryClient = useQueryClient();

  // State with types
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // inside your ChatPage component, with the other refs:
  const [isAtBottom, setIsAtBottom] = useState(true);
  const { entityId, panelType, isPanelOpen, openPanel } = usePanelStore();
  const { isSideChatOpen, openSideChat } = useSideChatStore();
  const { activeStep, setStep, setCurrentStep } = useStepStore();

  // Fetch chat data with infinite query
  const {
    data: chatData,
    isLoading: isChatLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChat(sessionId, CHAT_LIMIT);

  const allMessages: MessageData[] = useMemo(() => {
    const msgs = chatData?.pages.flatMap((page) => page.chat.messages) || [];
    return msgs.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [chatData]);

  // Handle localStorage data on mount
  useEffect(() => {
    if (!sessionId) return;

    const localStorageKey = `chat-${sessionId}`;
    const storedData = localStorage.getItem(localStorageKey);

    if (storedData) {
      const parsedData = JSON.parse(storedData);

      const data = {
        content: parsedData.content as string,
        role: "user" as const,
        message_id: uuidv4(),
        timestamp: parsedData.timestamp,
        //is_edited: data.is_edited,
        //isComplete: false,
        message_type: parsedData.message_type as MessageType,
        attachments: parsedData.attachments,
        message_version: 1,
      };

      setLoading(true);

      // Send the message via WebSocket
      if ((parsedData.message_type as MessageType) === "GENERAL_MESSAGE") {
        sendQAChat({ ...data, session_id: sessionId });
      } else if (
        (parsedData.message_type as MessageType) === "TECHNICAL_DECK"
      ) {
        sendDeckChat({ ...data, session_id: sessionId });
      }
      // Add the message to the messages state
      queryClient.setQueryData(
        ["chat", sessionId, CHAT_LIMIT],
        (oldData: InfiniteChatData) => {
          const userMessage: MessageData = {
            message_id: data.message_id,
            content: data.content,
            role: data.role,
            timestamp: data.timestamp,
            isError: false,
            message_type: data.message_type,
            attachments: data.attachments,
            message_version: 1,
          };

          // If no old data exists yet, create the structure
          if (!oldData) {
            return {
              pages: [
                {
                  chat: {
                    messages: [userMessage],
                  },
                },
              ],
              pageParams: [null], // default first page param
            };
          }

          const pages = [...oldData.pages];
          const lastPage = pages[pages.length - 1];

          const updatedLastPage = {
            ...lastPage,
            chat: {
              ...lastPage.chat,
              messages: [...lastPage.chat.messages, userMessage],
            },
          };

          pages[pages.length - 1] = updatedLastPage;

          return {
            ...oldData,
            pages,
          };
        },
      );

      // Remove the localStorage entry
      localStorage.removeItem(localStorageKey);
    }
  }, [sessionId, sendQAChat, sendDeckChat]);

  ///////////////////////////////

  // ─── REFS & STATE ────────────────────────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const loadingOlderRef = useRef(false);
  const prevScrollHeight = useRef(0);

  // ─── 1) INITIAL LOAD → PIN TO BOTTOM ONCE ──────────────────────────────────────
  useEffect(() => {
    if (!isChatLoading && allMessages.length > 0 && isInitialLoad.current) {
      // wait for DOM → scroll to bottom
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const c = containerRef.current!;
          c.scrollTop = c.scrollHeight;
          isInitialLoad.current = false;
        });
      });
    }
  }, [isChatLoading, allMessages]);

  // ─── 2) SCROLL LISTENER → LOAD OLDER WHEN YOU SCROLL UP ─────────────────────────
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const onScroll = () => {
      // guards
      if (
        isInitialLoad.current || // still doing the first‐load jump
        loadingOlderRef.current || // already mid‐fetch
        !hasNextPage || // no more pages
        c.scrollHeight <= c.clientHeight // not scrollable yet
      ) {
        return;
      }

      // you’ve scrolled into the top 50px?
      if (c.scrollTop <= 50) {
        // ① record “before” height
        prevScrollHeight.current = c.scrollHeight;
        loadingOlderRef.current = true;

        // ② fetch the next (older) page
        fetchNextPage();
      }
    };

    c.addEventListener("scroll", onScroll, { passive: true });
    return () => c.removeEventListener("scroll", onScroll);
  }, [hasNextPage, fetchNextPage]);

  // ─── 3) ADJUST SCROLL AFTER PREPEND ─────────────────────────────────────────────
  useLayoutEffect(() => {
    // only if we just started a page-up
    if (!loadingOlderRef.current) return;

    const c = containerRef.current!;
    const heightDelta = c.scrollHeight - prevScrollHeight.current;
    c.scrollTop = heightDelta;

    // reset our flag
    loadingOlderRef.current = false;
  }, [allMessages.length]);

  const scrollToEndSentinel = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;

    // smooth or instant
    c.scrollTo({
      top: c.scrollHeight,
      behavior: "smooth",
    });

    // we’re now at bottom
    setIsAtBottom(true);
  }, []);

  // detect “am I at bottom?”
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const onScroll = () => {
      // consider “at bottom” if within 20px of the end
      const atBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 200;
      setIsAtBottom(atBottom);
    };

    // wire it up
    c.addEventListener("scroll", onScroll, { passive: true });
    // initialize
    onScroll();

    return () => c.removeEventListener("scroll", onScroll);
  }, []);

  ///////////////////////////////

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (chunk: MessageChunk) => {
      if (chunk.chat_id !== sessionId) return;

      setLoading(false); // AI started responding

      // Call openDeckPanel for TECHNICAL_DECK message type when it's the first message
      if (chunk.message_type === "TECHNICAL_DECK" && chunk.isFirstMessage) {
        setStep(0); // Reset step to 0 for the first message
        openPanel(chunk.message_id, "Deck", "Auto");
      }

      // Update the query cache
      queryClient.setQueryData(
        ["chat", sessionId, CHAT_LIMIT],
        (oldData: InfiniteChatData) => {
          if (!oldData) return oldData;

          const pages = [...oldData.pages];
          const lastPage = pages[pages.length - 1];

          const existingMessageIndex = lastPage.chat.messages.findIndex(
            (msg: MessageData) => msg.message_id === chunk.message_id,
          );

          let updatedMessages;

          if (chunk.isError) {
            if (existingMessageIndex >= 0) {
              // Mark existing message as error
              updatedMessages = lastPage.chat.messages.map(
                (msg: MessageData, index: number) =>
                  index === existingMessageIndex
                    ? { ...msg, isError: true }
                    : msg,
              );
            } else {
              // Add new error message with fallback content
              const errorMessage = {
                message_id: chunk.message_id,
                content: "Error occurred",
                isError: true,
                role: "assistant" as "assistant" | "user",
                timestamp: new Date().toISOString(),
                message_type: chunk.message_type || "GENERAL_MESSAGE",
                attachments: null,
                message_version: 1,
              };
              updatedMessages = [...lastPage.chat.messages, errorMessage];
            }
          } else {
            if (existingMessageIndex >= 0) {
              // Append to existing message content
              updatedMessages = lastPage.chat.messages.map(
                (msg: MessageData, index: number) =>
                  index === existingMessageIndex
                    ? {
                        ...msg,
                        content: (msg.content + chunk.response) as string,
                        isError: false,
                      }
                    : msg,
              );
            } else {
              // Add new assistant message
              const newMessage: MessageData = {
                message_id: chunk.message_id,
                content: chunk.response as string,
                isError: false,
                role: "assistant" as "assistant" | "user",
                timestamp: new Date().toISOString(),
                message_type: chunk.message_type as MessageType,
                attachments: null,
                state: "TRANSCRIPT_SUMMARY",
                message_version: 1,
              };
              console.log("@@@@@@chat-assistant", newMessage);
              updatedMessages = [...lastPage.chat.messages, newMessage];
            }
          }

          // Create updated last page immutably
          const updatedLastPage = {
            ...lastPage,
            chat: {
              ...lastPage.chat,
              messages: updatedMessages,
            },
          };

          pages[pages.length - 1] = updatedLastPage;

          return {
            ...oldData,
            pages,
          };
        },
      );

      scrollToEndSentinel();
    };

    socket.on("recieve_chat_message", handleReceiveMessage);

    return () => {
      socket.off("recieve_chat_message", handleReceiveMessage);
    };
  }, [socket, sessionId]);

  return (
    <Box w="full" h="full" overflow="hidden" pos={"relative"}>
      <PanelGroup direction="horizontal" style={{ overflow: "hidden" }}>
        {/* Chat Panel (Left) */}
        {isSideChatOpen &&
          (!isPanelOpen ||
            (isPanelOpen && panelType === "RFP") ||
            (isPanelOpen && panelType === "Deck" && activeStep === 2)) && (
            <>
              <Panel
                defaultSize={isPanelOpen ? 30 : 100}
                minSize={30}
                maxSize={100}
                order={1}
                style={{ overflow: "hidden" }}
              >
                <Flex
                  h="full"
                  w={"full"}
                  justifyContent={"center"}
                  overflow="hidden"
                >
                  <Box w={"full"} maxW={"3xl"} h="full" position={"relative"}>
                    {/* Chat Area */}
                    <Box
                      ref={containerRef}
                      w={"full"}
                      h={"full"}
                      overflowY="auto"
                      style={{
                        msOverflowStyle: "none",
                        scrollbarWidth: "none",
                      }}
                      css={{
                        "&::-webkit-scrollbar": {
                          display: "none",
                        },
                      }}
                    >
                      <VStack align="stretch" pt={10} pb={80} px={4} gap={4}>
                        {isFetchingNextPage && (
                          <Flex
                            justify="center"
                            alignItems={"center"}
                            my={4}
                            gap={4}
                          >
                            <Separator
                              h={0.5}
                              flex={1}
                              orientation="horizontal"
                            />
                            <Flex
                              alignItems="center"
                              justifyContent="center"
                              gap={2}
                              color="gray.500"
                              fontSize="sm"
                              fontWeight="medium"
                              style={{ opacity: 0.8 }}
                            >
                              <Spinner />
                              <Text>Loading Chats</Text>
                            </Flex>
                            <Separator
                              h={0.5}
                              flex={1}
                              orientation="horizontal"
                            />
                          </Flex>
                        )}
                        {isChatLoading && !loading ? (
                          <DynamicChatSkeleton />
                        ) : (
                          allMessages.map((msg, idx: number) => (
                            <ChatMessage
                              key={msg.message_id}
                              msg={msg}
                              onClick={() => {
                                if (msg.role !== "user") {
                                  if (msg.message_type === "TECHNICAL_DECK") {
                                    openPanel(msg.message_id, "Deck", "Click");
                                    const stepIndex =
                                      msg?.state &&
                                      msg.state === "TRANSCRIPT_SUMMARY"
                                        ? 0
                                        : msg.state === "SLIDE_CONTENT"
                                          ? 1
                                          : msg.state === "SLIDE_OUTPUT"
                                            ? 2
                                            : 0;
                                    setStep(stepIndex);
                                    setCurrentStep(stepIndex);
                                  } else if (msg.message_type === "RFP_SHEET") {
                                    openPanel(msg.message_id, "RFP", "Click");
                                  }
                                }
                              }}
                              index={idx}
                            />
                          ))
                        )}

                        {loading && <LoadingCursor />}

                        <Box ref={messagesEndRef} />
                      </VStack>
                    </Box>

                    {/* Input Area */}

                    <FloatingTextArea
                      from="Chat"
                      sessionId={sessionId}
                      enabledScrollToBottom={!isAtBottom}
                      scrollToEndSentinel={scrollToEndSentinel}
                      callbackFn={(data) => {
                        const finalData = data as SendMessageInput;

                        queryClient.setQueryData(
                          ["chat", sessionId, CHAT_LIMIT],
                          (oldData: InfiniteChatData) => {
                            if (!oldData) return oldData;

                            const pages = [...oldData.pages];
                            const lastPage = pages[pages.length - 1];

                            const userMessage = {
                              message_id: finalData.message_id,
                              content: finalData.content,
                              role: finalData.role as "assistant" | "user",
                              //timestamp: finalData.timestamp,
                              timestamp: new Date().toISOString(),
                              isError: false,
                              message_type:
                                finalData.message_type as MessageType,
                              attachments: finalData?.attachments,
                              message_version: 1,
                            };

                            const updatedLastPage = {
                              ...lastPage,
                              chat: {
                                ...lastPage.chat,
                                messages: [
                                  ...lastPage.chat.messages,
                                  userMessage,
                                ],
                              },
                            };

                            pages[pages.length - 1] = updatedLastPage;

                            return {
                              ...oldData,
                              pages,
                            };
                          },
                        );

                        scrollToEndSentinel();
                      }}
                      loading={loading}
                      setLoading={setLoading}
                    />
                  </Box>
                </Flex>
              </Panel>

              {isSideChatOpen &&
                ((isPanelOpen && panelType === "RFP") ||
                  (isPanelOpen &&
                    panelType === "Deck" &&
                    activeStep === 2)) && (
                  <PanelResizeHandle
                    className="custom-resize-handle"
                    style={{
                      width: "1px",
                      background: "var(--chakra-colors-gray-200)",
                      cursor: "col-resize",
                      padding: 0,
                      zIndex: 10,
                    }}
                  />
                )}
            </>
          )}

        {/* Show resize handle and code panel only if code panel is visible */}
        {isPanelOpen && (
          <>
            {/* Code Panel (Right) */}
            {entityId && (
              <Panel
                defaultSize={activeStep === 2 ? 70 : 100}
                minSize={70}
                maxSize={100}
                order={2}
                style={{ overflow: "hidden" }}
              >
                {panelType === "Deck" ? (
                  <TDeckFragment sessionId={sessionId} messageId={entityId} />
                ) : panelType === "RFP" ? (
                  <RFPFragment sessionId={sessionId} messageId={entityId} />
                ) : null}
              </Panel>
            )}
          </>
        )}
      </PanelGroup>

      {((panelType === "Deck" && activeStep === 2) || panelType === "RFP") &&
        !isSideChatOpen && <FloatingChatButton onClick={openSideChat} />}
      <RFPSheetDialog sessionId={sessionId} />
    </Box>
  );
};

export default memo(ChatPage);

interface ChatMessageProps {
  msg: MessageData;
  onClick: () => void;
  index: number;
}

const ChatMessage = memo(({ msg, onClick }: ChatMessageProps) => {
  return (
    <Box onClick={onClick} w={"full"} cursor={"pointer"}>
      <Flex w={"full"} flexDirection={"column"} alignItems={"end"} gap={2}>
        {msg.role === "user" &&
          msg.attachments &&
          msg.attachments.length > 0 && (
            <Flex
              alignItems={"center"}
              wrap="wrap"
              gap={2}
              justifyContent={"end"}
              maxW={"70%"}
              w="full"
            >
              {msg.attachments.map(
                (attachment: AttachmentMetadata, index: number) => {
                  const extension = getFileExtension(attachment.filename);
                  if (["xlsx", "docx", "pdf"].includes(extension)) {
                    return (
                      <Flex
                        key={`file-${index}`}
                        border="1px solid"
                        borderColor="gray.200"
                        bg="white"
                        borderRadius="full"
                        alignItems={"center"}
                        px={2}
                        gap={2}
                        py={1}
                      >
                        {fileIconMap[extension]}
                        <Text fontSize="sm" color="gray.800">
                          {attachment.filename} (
                          {(
                            (attachment?.size_bytes || 0) /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB)
                        </Text>
                      </Flex>
                    );
                  }
                  return null; // Skip unsupported file types
                },
              )}
            </Flex>
          )}

        {(msg.content ||
          (msg.message_type === "TECHNICAL_DECK" &&
            msg.role === "assistant")) && (
          <Box
            key={msg.message_id}
            bg={
              msg.role === "user"
                ? "gray.100"
                : msg.isError
                  ? "red.100"
                  : "white"
            }
            p={4}
            style={{
              borderRadius: msg.role === "user" ? "20px 20px 10px 20px" : 0,
            }}
            maxW={msg.role === "user" ? "70%" : "full"}
            color={
              msg.role === "user"
                ? "gray.800"
                : msg.isError
                  ? "red.800"
                  : "gray.800"
            }
            border={msg.role === "user" ? "1px solid" : "none"}
            borderColor={"gray.200"}
            alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
            fontSize={"sm"}
            fontWeight={"normal"}
            whiteSpace="pre-wrap"
          >
            {msg.message_type === "TECHNICAL_DECK" &&
            msg.role === "assistant" ? (
              <Flex
                gap={2}
                rounded={"xl"}
                alignItems={"center"}
                shadow={"md"}
                p={4}
              >
                <Presentation size={18} />
                <Text fontWeight={"medium"}>Technical Presentation</Text>
              </Flex>
            ) : (
              <MarkdownRenderer content={msg.content} />
            )}
          </Box>
        )}
      </Flex>
    </Box>
  );
});

ChatMessage.displayName = "ChatMessage";
