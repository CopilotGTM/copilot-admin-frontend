/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  createListCollection,
  Flex,
  Heading,
  IconButton,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useColorModeValue } from "./ui/color-mode";
import { ArrowDown, Mic, SendHorizonal, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { CustomFileUpload } from "./custom-file-upload";
import { AttachmentMetadata } from "../app/types/file";
import {
  ChatListItem,
  ChatListResponseData,
  MessageType,
} from "../app/types/chat";
import {
  CreateChatInput,
  createChatSchema,
  SendMessageInput,
  sendMessageSchema,
} from "../app/schemas/chat";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useSocketChats } from "../app/hooks/socket/use-socket-chats";
import { toaster } from "./ui/toaster";
import { createChat } from "../lib/chat";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePanelStore } from "../app/stores/use-panel-store";
import { useEffect, useState } from "react";
import { identifyRFPSheet } from "../lib/rfp";
import { useRFTSheetDialogStore } from "../app/stores/use-rft-sheet-dialog-store";
import { RFPSheetResponse } from "../app/types/rfp";
import { CHAT_LIST_LIMIT } from "../lib/CONSTANTS";

const ActionItems = [
  { value: "generate-battle-card", title: "Generate Battle Card" },
  { value: "view-objections", title: "View Objections" },
  { value: "list-stakeholders", title: "List Stakeholders" },
];

interface InfiniteChatList {
  pages: ChatListResponseData[];
  pageParams: any[];
}

interface FloatingTextAreaProps {
  sessionId?: string;
  align?: "center" | "bottom";
  showGreetings?: boolean;
  showActionItems?: boolean;
  from: "Root" | "Chat";
  callbackFn?: (data: SendMessageInput | ChatListItem) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  enabledScrollToBottom?: boolean; // Optional prop to control scroll behavior
  scrollToEndSentinel?: () => void; // Function to scroll to the end
}

const defaultItems = [
  {
    label: "Q&A",
    value: "GENERAL_MESSAGE",
  },
  {
    label: "RFP",
    value: "RFP_SHEET",
  },
  {
    label: "Deck",
    value: "TECHNICAL_DECK",
  },
];

interface CollectionItem {
  label: string;
  value: string;
}

export const FloatingTextArea = ({
  sessionId,
  align = "bottom",
  showGreetings = false,
  showActionItems = false,
  from,
  callbackFn,
  loading,
  setLoading,
  enabledScrollToBottom = false,
  scrollToEndSentinel,
}: FloatingTextAreaProps) => {
  const { sendQAChat, sendDeckChat } = useSocketChats();
  const queryClient = useQueryClient();
  const { isPanelOpen, panelType } = usePanelStore();
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>(
    createListCollection({ items: defaultItems }).items,
  );
  const { open: openRFTSheetDialog } = useRFTSheetDialogStore();

  const chatTypeCollections = createListCollection({
    items: collectionItems,
  });

  useEffect(() => {
    if (isPanelOpen) {
      if (panelType === "RFP") {
        setCollectionItems([
          {
            label: "RFP",
            value: "RFP_SHEET",
          },
        ]);
        handleMessageTypeChange("GENERAL_MESSAGE" as MessageType);
      } else if (panelType === "Deck") {
        setCollectionItems([
          {
            label: "Deck",
            value: "TECHNICAL_DECK",
          },
        ]);
        handleMessageTypeChange("GENERAL_MESSAGE" as MessageType);
      }
    } else {
      setCollectionItems(defaultItems);
      handleMessageTypeChange("GENERAL_MESSAGE" as MessageType);
    }
  }, [isPanelOpen, panelType]);

  // Function to get the current greeting based on the time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  };

  const {
    setValue,
    getValues,
    register: sendMessageForm,
    handleSubmit: handleMessageSubmit,
    formState: { isSubmitting: isMessageSubmitting, isValid: isValidMessage },
    reset: resetMessageForm,
  } = useForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    mode: "onChange", // Validate on blur and submit
    defaultValues: {
      content: "",
      session_id: sessionId,
      role: "user",
      //is_edited: false,
      message_id: uuidv4(),
      timestamp: new Date().toISOString(),
      message_type: "default",
      message_version: 1,
      attachments: null,
    },
  });

  // Handle Q&A form submission
  const onQASubmit = async (data: SendMessageInput) => {
    console.log("@@@@@@chat", data);
    setLoading(true); // Set loading to true on submission
    sendQAChat(data);
    callbackFn!(data);
    resetMessageForm({
      content: "",
      session_id: sessionId,
      role: "user",
      //is_edited: false,
      message_id: uuidv4(),
      timestamp: new Date().toISOString(),
      message_type: "GENERAL_MESSAGE",
      message_version: 1,
      attachments: null,
    });
    setAcceptedFiles([]); // Clear accepted files after submission
    setUploadingFiles(new Set()); // Clear uploading files set
  };

  // Handle tab change to update message_type
  const handleMessageTypeChange = (value: string) => {
    setValue("message_type", value, { shouldValidate: true });
  };

  // Function to update attachments, matching setUploadedDeckFiles type
  const updateAttachments: React.Dispatch<
    React.SetStateAction<AttachmentMetadata[]>
  > = (newAttachments) => {
    // Handle both direct value and functional update
    const updatedValue =
      typeof newAttachments === "function"
        ? newAttachments(getValues("attachments") || [])
        : newAttachments;

    // Update form's attachments field (convert to AttachmentMetadata[] | null)
    setValue("attachments", updatedValue.length === 0 ? null : updatedValue, {
      shouldValidate: true,
    });
  };

  // Handle Deck form submission
  const onDeckSubmit = async (data: SendMessageInput) => {
    setLoading(true); // Set loading to true on submission
    console.log("@@@@@@data", data);
    sendDeckChat(data);
    callbackFn!(data);
    resetMessageForm({
      content: "",
      session_id: sessionId,
      role: "user",
      //is_edited: false,
      message_id: uuidv4(),
      timestamp: new Date().toISOString(),
      message_type: "TECHNICAL_DECK",
      message_version: 1,
      attachments: null,
    });
    setAcceptedFiles([]); // Clear accepted files after submission
    setUploadingFiles(new Set()); // Clear uploading files set
  };

  // Handle RFP form submission
  const onRFPSubmit = async (data: SendMessageInput) => {
    setLoading(true); // Set loading to true on submission
    console.log("@@@@@@data", data);
    //sendRFPChat(data);
    callbackFn!(data);
    resetMessageForm({
      content: "",
      session_id: sessionId,
      role: "user",
      //is_edited: false,
      message_id: uuidv4(),
      timestamp: new Date().toISOString(),
      message_type: "RFP_SHEET",
      message_version: 1,
      attachments: null,
    });
    const res = await identifyRFPSheet(data);

    setLoading(false);
    callbackFn!({
      content: "RFP Sheet Answers",
      message_type: "RFP_SHEET",
      message_id: res.data.message_id,
      role: "assistant",
      timestamp: new Date().toISOString(),
      attachments: null,
      session_id: sessionId!,
      message_version: 1,
    });
    setAcceptedFiles([]); // Clear accepted files after submission
    setUploadingFiles(new Set()); // Clear uploading files set
    openRFTSheetDialog(res as RFPSheetResponse);

    console.log("@@@@@@res", res);
  };

  /* Handle Root FloatingArea */
  // Initialize React Hook Form with Zod schema
  const {
    setValue: setCreateChatValue,
    register: createChatForm,
    handleSubmit: handleCreateChatSubmit,
    formState: {
      isSubmitting: isCreateChatSubmitting,
      isValid: isValidCreateChat,
    },
    reset: resetCreateChatForm,
  } = useForm<CreateChatInput>({
    resolver: zodResolver(createChatSchema),
    mode: "onChange", // Validate on blur and submit
    defaultValues: {
      title: "",
    },
  });

  const createChatMutation = useMutation({
    mutationFn: createChat,
    onSuccess: (data, variables) => {
      // Invalidate chat list query to refetch

      queryClient.setQueryData<InfiniteChatList>(
        ["chat_list", CHAT_LIST_LIMIT],
        (oldData) => {
          console.log("[setQueryData] Updating chat list", oldData);
          const newChat: ChatListItem = {
            ...data,
            updated_at: new Date().toISOString(), // ensure updated date
            title: variables.title,
          };

          // If no data exists, seed it
          if (!oldData) {
            return {
              pages: [
                {
                  chats: [newChat],
                  cursor: null, // No cursor for the first page
                },
              ],
              pageParams: [null],
            };
          }

          const pages = [...oldData.pages];
          const firstPage = pages[0];

          const updatedFirstPage: ChatListResponseData = {
            ...firstPage,
            chats: [newChat, ...firstPage.chats],
          };

          pages[0] = updatedFirstPage;

          return {
            ...oldData,
            pages,
          };
        },
      );

      // Save message to local storage
      localStorage.setItem(
        `chat-${data.session_id}`,
        JSON.stringify({
          content: variables.title,
          timestamp: new Date().toISOString(), // ISO8601 format
          attachments: getValues("attachments") as AttachmentMetadata[],
          message_type: getValues("message_type") as MessageType,
        }),
      );
      // Reset form
      resetCreateChatForm({ title: "" });
      callbackFn!(data as ChatListItem);
    },

    onError: (error: any) => {
      toaster.create({
        title: "Creating chat failed!",
        description: error.response?.data?.message || "Something went wrong",
        type: "error",
        duration: 2000,
      });
    },
  });

  // Handle form submission
  const onCreateChatSubmit = async (data: CreateChatInput) => {
    setLoading(true); // Set loading to true on submission
    createChatMutation.mutate(data);
  };

  ///////////////
  const handleRemoveFile = (fileName: string) => {
    setAcceptedFiles((prev) => prev.filter((file) => file.name !== fileName));
    updateAttachments((prev) =>
      prev.filter((file) => file.filename !== fileName),
    );
    setUploadingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
  };
  ///////////////

  return (
    <Flex
      left={"1/2"}
      translateX={"-50%"}
      position={"absolute"}
      // Center or bottom positioning based on `align` prop
      top={align === "center" ? "50%" : "unset"}
      bottom={align === "bottom" ? "5" : "unset"}
      transform={align === "center" ? "translateY(-50%)" : "unset"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      w={"full"}
      px={4}
    >
      {/* Show Greeting if enabled */}
      {showGreetings && (
        <Box textAlign={"center"} mb={6}>
          <motion.div
            initial={{ opacity: 0, translateY: -20 }} // Initial state (hidden and slightly above)
            animate={{ opacity: 1, translateY: 0 }} // Final state (fully visible and in place)
            transition={{ duration: 0.5 }} // Duration of the animation
          >
            <Heading fontSize="4xl" fontWeight="medium" color="gray.700" mb={2}>
              {getGreeting()}, {"Buddy!"}
            </Heading>
            <Text fontSize={"2xl"} color="gray.500">
              How can I help you today?
            </Text>
          </motion.div>
        </Box>
      )}

      {enabledScrollToBottom && (
        <Box textAlign={"center"} mb={2}>
          <motion.div
            initial={{ opacity: 0, translateY: -20 }} // Initial state (hidden and slightly above)
            animate={{ opacity: 1, translateY: 0 }} // Final state (fully visible and in place)
            transition={{ duration: 0.5 }} // Duration of the animation
          >
            <IconButton
              variant="outline"
              rounded={"full"}
              size="sm"
              color="gray.700"
              bg={"white"}
              aria-label="Scroll to bottom"
              //disabled={!enabledScrollToBottom}
              onClick={scrollToEndSentinel!}
            >
              <ArrowDown />
            </IconButton>
          </motion.div>
        </Box>
      )}

      <Box w={"full"}>
        <motion.div
          initial={{ opacity: 0, translateY: 50 }} // Initial state (hidden and slightly above)
          animate={{ opacity: 1, translateY: 0 }} // Final state (fully visible and in place)
          transition={{ duration: 0.2 }} // Duration of the animation
        >
          <Flex
            alignItems="center"
            gap="24px"
            bg={useColorModeValue("white", "unset")}
            borderRadius="32px"
            direction={"column"}
            p="24px"
            mx="auto"
            shadow={"lg"}
            blur={"lg"}
            border={"1px solid"}
            w={"full"}
            borderColor={"gray.200"}
          >
            {/* Custom File List */}
            {acceptedFiles.length > 0 && (
              <Flex
                alignItems={"center"}
                wrap="wrap"
                gap={2}
                justifyContent={"start"}
                w={"full"}
              >
                {acceptedFiles?.map((acceptedFile, index) => {
                  return (
                    <Flex
                      key={`file-${index}`}
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      borderRadius="full"
                      alignItems={"center"}
                    >
                      <Text fontSize="sm" color="gray.800" px={2}>
                        {acceptedFile.name} (
                        {(acceptedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </Text>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveFile(acceptedFile.name)}
                        rounded={"full"}
                        loading={uploadingFiles.has(acceptedFile.name)}
                        disabled={uploadingFiles.has(acceptedFile.name)}
                      >
                        <Trash2 />
                      </IconButton>
                    </Flex>
                  );
                })}
              </Flex>
            )}

            {/* Input field */}
            {((getValues("message_type") as MessageType) === "TECHNICAL_DECK" ||
              (getValues("message_type") as MessageType) === "RFP_SHEET") &&
              sessionId &&
              !isPanelOpen && (
                <CustomFileUpload
                  sessionId={sessionId}
                  setUploadedFiles={updateAttachments}
                  fileUploadType="DropZone"
                  acceptedFiles={acceptedFiles}
                  setAcceptedFiles={setAcceptedFiles}
                  setUploadingFiles={setUploadingFiles}
                  label={
                    (getValues("message_type") as MessageType) ===
                    "TECHNICAL_DECK"
                      ? "Transcript or Call Recording"
                      : (getValues("message_type") as MessageType) ===
                          "RFP_SHEET"
                        ? "RFP file"
                        : ""
                  }
                  messageType={getValues("message_type") as MessageType}
                />
              )}
            <Textarea
              {...(from === "Chat"
                ? sendMessageForm("content")
                : createChatForm("title"))}
              placeholder={
                (getValues("message_type") as MessageType) === "TECHNICAL_DECK"
                  ? "Additional input"
                  : "Ask a question"
              }
              size="sm"
              w="full"
              border="none"
              rows={1}
              maxH={"200px"}
              resize={"vertical"}
              autoresize
              _focus={{
                boxShadow: "none",
                border: "none",
                outline: "none",
              }}
              disabled={
                (from === "Chat"
                  ? isMessageSubmitting
                  : isCreateChatSubmitting) || loading
              }
              onKeyDown={(e) => {
                // If Enter without Shift, submit
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (from === "Chat") {
                    const type = getValues("message_type") as MessageType;
                    if (type === "GENERAL_MESSAGE" && isValidMessage) {
                      handleMessageSubmit(onQASubmit)();
                    } else if (
                      type === "RFP_SHEET" &&
                      ((getValues("attachments") as AttachmentMetadata[])
                        ?.length || 0) > 0
                    ) {
                      handleMessageSubmit(onRFPSubmit)();
                    } else if (
                      type === "TECHNICAL_DECK" &&
                      ((getValues("attachments") as AttachmentMetadata[])
                        ?.length || 0) > 0
                    ) {
                      handleMessageSubmit(onDeckSubmit)();
                    }
                  } else {
                    // from === "Root"
                    if (isValidCreateChat) {
                      handleCreateChatSubmit(onCreateChatSubmit)();
                    }
                  }
                }
                // Otherwise (Enter + Shift, or any other key), do nothing and let default behavior occur
              }}
            />
            {/* Left-side buttons */}
            <Flex
              w={"full"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Flex
                alignItems={"center"}
                gap={3}
                bg={"gray.100"}
                rounded={"full"}
                p={1}
              >
                {chatTypeCollections.items.map((chat_type) => (
                  <Button
                    key={chat_type.value}
                    onClick={() => {
                      handleMessageTypeChange(chat_type.value as MessageType);
                      //setMessageType(chat_type.value as MessageType);
                    }}
                    size="xs"
                    px={4}
                    //py={0}
                    h={7}
                    borderRadius={"full"}
                    bg={
                      (getValues("message_type") as MessageType) ===
                      chat_type.value
                        ? "white"
                        : "transparent"
                    }
                    shadow={
                      (getValues("message_type") as MessageType) ===
                      chat_type.value
                        ? "xs"
                        : "none"
                    }
                    color={"gray.700"}
                    fontSize={"sm"}
                    fontWeight={"medium"}
                    lineHeight={"20px"}
                    disabled={
                      (from === "Chat"
                        ? isMessageSubmitting
                        : isCreateChatSubmitting) ||
                      loading ||
                      isPanelOpen
                    }
                  >
                    {chat_type.label}
                  </Button>
                ))}
              </Flex>

              <Flex alignItems={"center"} gap={2}>
                {/* Right-side icons/buttons */}
                {sessionId && (
                  <CustomFileUpload
                    sessionId={sessionId}
                    setUploadedFiles={updateAttachments}
                    fileUploadType="IconButton"
                    acceptedFiles={acceptedFiles}
                    setAcceptedFiles={setAcceptedFiles}
                    setUploadingFiles={setUploadingFiles}
                    messageType={getValues("message_type") as MessageType}
                  />
                )}

                <IconButton
                  aria-label="Toggle sidebar"
                  variant="ghost"
                  rounded={"full"}
                  size={"md"}
                  color={"gray.500"}
                  disabled={
                    (from === "Chat"
                      ? isMessageSubmitting
                      : isCreateChatSubmitting) || loading
                  }
                >
                  <Mic />
                </IconButton>
                <IconButton
                  aria-label="Toggle sidebar"
                  variant="ghost"
                  rounded={"full"}
                  size={"md"}
                  color={"gray.500"}
                  loading={
                    (from === "Chat"
                      ? isMessageSubmitting
                      : isCreateChatSubmitting) || loading
                  }
                  disabled={
                    (from === "Chat"
                      ? isMessageSubmitting
                      : isCreateChatSubmitting) ||
                    loading ||
                    ((getValues("message_type") as MessageType) ===
                      "TECHNICAL_DECK" ||
                    (getValues("message_type") as MessageType) === "RFP_SHEET"
                      ? ((getValues("attachments") as AttachmentMetadata[])
                          ?.length || 0) <= 0
                      : from === "Chat"
                        ? !isValidMessage
                        : !isValidCreateChat)
                  }
                  onClick={() => {
                    if (from === "Chat") {
                      if (
                        (getValues("message_type") as MessageType) ===
                        "GENERAL_MESSAGE"
                      ) {
                        handleMessageSubmit(onQASubmit)();
                      } else if (
                        (getValues("message_type") as MessageType) ===
                        "RFP_SHEET"
                      ) {
                        handleMessageSubmit(onRFPSubmit)();
                      } else if (
                        (getValues("message_type") as MessageType) ===
                        "TECHNICAL_DECK"
                      ) {
                        handleMessageSubmit(onDeckSubmit)();
                      }
                    } else if (from === "Root") {
                      if (!isValidCreateChat) {
                        const value =
                          (getValues("message_type") as MessageType) ===
                          "TECHNICAL_DECK"
                            ? "Generate Deck"
                            : (getValues("message_type") as MessageType) ===
                                "RFP_SHEET"
                              ? "Generate RFP"
                              : "";
                        setCreateChatValue("title", value, {
                          shouldValidate: true,
                        });
                      }
                      handleCreateChatSubmit(onCreateChatSubmit)();
                    }
                  }}
                >
                  <SendHorizonal />
                </IconButton>
              </Flex>
            </Flex>
          </Flex>
        </motion.div>
      </Box>

      {showActionItems && (
        <Flex
          //maxW={{ base: "420px", lg: "720px", md: "520px" }}
          w="full"
          justifyContent={"start"}
          alignItems={"center"}
          gap={2}
          my={4}
          mx={4}
        >
          {ActionItems.map((action) => (
            <Button
              key={action.value}
              size="sm"
              px={4}
              py={2}
              borderRadius={"full"}
              bg={"white"}
              border={"1px solid"}
              borderColor="gray.200"
              color={"gray.600"}
              fontSize={"sm"}
              fontWeight={"normal"}
              lineHeight={"20px"}
            >
              {action.title}
            </Button>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
