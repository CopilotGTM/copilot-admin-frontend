"use client";

import {
  AbsoluteCenter,
  Box,
  Flex,
  ProgressCircle,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { DeckData, TDeckResponse, TDeckState } from "../../../app/types/tdeck";
import React, { useEffect, useMemo, useState } from "react";
import { DocumentEditorProps } from "@onlyoffice/document-editor-react";
import { fetchOnlyOfficeToken } from "../../../lib/onlyoffice";
import OnlyofficeEditor from "../../onlyoffice/onlyoffice-editor";
import { motion } from "framer-motion";
import { useSocketTDeck } from "../../../app/hooks/socket/use-socket-tdeck";
import { MessageChunk } from "../../../app/types/chat";
import { useTdeckDetails } from "../../../app/hooks/use-tdeck";
import { useQueryClient } from "@tanstack/react-query";

interface DeckFragmentProps {
  sessionId: string;
  messageId: string;
  state?: TDeckState;
}

function DeckFragment({
  sessionId,
  messageId,
  state = "SLIDE_OUTPUT",
}: DeckFragmentProps) {
  const {
    data: slideTDeckData,
    isLoading: isSlideLoading,
    // error,
  } = useTdeckDetails(sessionId, messageId, state, "Click");
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => {
    return ["tdeck_details", sessionId, messageId, state];
  }, [sessionId, messageId, state]);

  const { socket } = useSocketTDeck();

  console.log("DeckFragment slideTDeckData", slideTDeckData);

  const [token, setToken] = useState<{ value: string }>();
  const [loading, setIsLoading] = useState<boolean>(false);
  // ONLYOFFICE editor config
  const initialConfig: DocumentEditorProps["config"] = {
    document: {
      fileType: "pptx",
      key: "",
      title: "",
      url: "",
    },
    documentType: "slide",
    editorConfig: {
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/onlyoffice/callback`,
      user: {
        id: "currentUser.id",
        name: "Nikhil Singhal",
      },
    },
  };
  const [config, setConfig] =
    useState<DocumentEditorProps["config"]>(initialConfig);

  // Fetch a signed JWT from your backend (so you don't expose the secret in the client)
  useEffect(() => {
    const url = config?.document?.url || "";
    if (
      url !== "" &&
      !loading &&
      !isSlideLoading &&
      !token &&
      process.env.NEXT_PUBLIC_ONLYOFFICE_USE_JWT === "true"
    ) {
      fetchOnlyOfficeToken(config)
        .then((jwt) => setToken({ value: jwt }))
        .catch((err) => console.error("Failed to fetch OnlyOffice JWT", err));
    }
  }, [config?.document?.url, config, token, loading, isSlideLoading]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleReceivedDeck = async (chunk: MessageChunk) => {
      if (chunk.chat_id !== sessionId) return;
      if (chunk.message_id !== messageId) return;

      setIsLoading(true);

      setProgress(chunk.extras?.completion_percentage || 0);

      if (chunk.isComplete) {
        setIsLoading(false);
        //setupUrl(chunk.response as string);

        queryClient.setQueryData<TDeckResponse>(queryKey, (old) => {
          // if nothing was in cache yet, create the minimal shape
          if (!old) {
            return {
              data: {
                technical_deck_url: chunk.response as string,
              } as DeckData,
              message: "Deck updated",
              status: "success",
            };
          }

          const prev = old.data as DeckData;
          return {
            ...old,
            data: {
              ...prev,
              technical_deck_url: chunk.response as string,
            },
          };
        });
      }
    };

    socket.on("receive_generated_deck", handleReceivedDeck);

    return () => {
      socket.off("receive_generated_deck", handleReceivedDeck);
    };
  }, [socket, sessionId, messageId]);

  // const setupUrl = (url: string) => {};

  // Replace your useMemo block with:
  useEffect(() => {
    const url = (slideTDeckData?.data as DeckData)?.technical_deck_url;
    if (!url) {
      setToken(undefined);
      return;
    }

    const filename = url.split("/").pop() || `deck-${Date.now()}.pptx`;
    setConfig((prev) => ({
      ...prev,
      document: {
        fileType: "pptx",
        key: `${filename}`, // ensure a unique key so OnlyOffice reloads
        title: filename,
        url,
      },
    }));
  }, [slideTDeckData]);

  console.log("DeckFragment config", config);

  return (
    // fill the viewport vertically
    <Flex direction="column" h="full" w={"full"} overflow={"hidden"}>
      {loading ||
      isSlideLoading ||
      (slideTDeckData?.data as DeckData)?.technical_deck_url === "" ? (
        <Box
          textAlign={"center"}
          h={"full"}
          w={"full"}
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <motion.div
            initial={{ opacity: 0, translateY: -20 }} // Initial state (hidden and slightly above)
            animate={{ opacity: 1, translateY: 0 }} // Final state (fully visible and in place)
            transition={{ duration: 0.5 }} // Duration of the animation
          >
            {isSlideLoading ? (
              <Spinner size={"md"} />
            ) : (
              // <Lottie
              //   animationData={lottieWait}
              //   loop={true}
              //   style={{
              //     width: "80px",
              //     height: "80px",
              //     margin: "0 auto",
              //   }}
              // />

              <ProgressCircle.Root
                size={"xl"}
                key={"xl"}
                value={parseInt(progress.toFixed(0))}
              >
                <ProgressCircle.Circle>
                  <ProgressCircle.Track />
                  <ProgressCircle.Range strokeLinecap="round" />
                </ProgressCircle.Circle>
                <AbsoluteCenter>
                  <ProgressCircle.ValueText />
                </AbsoluteCenter>
              </ProgressCircle.Root>
            )}
            <Text fontSize={"md"} color="gray.500" fontWeight={"medium"}>
              {isSlideLoading
                ? "Loading Editor"
                : "Hold On! It'll take (7-10 mins) to generate slides."}
            </Text>
          </motion.div>
        </Box>
      ) : (
        <>{token && <OnlyofficeEditor config={config} token={token} />}</>
      )}
    </Flex>
  );
}

export default React.memo(DeckFragment);
