"use client";
import { Box, Flex } from "@chakra-ui/react";
import Navbar from "../navbar";
import useStepStore from "../../../app/stores/use-step-store";
import SummaryFragment from "./summary-fragment";
import DeckFragment from "./deck-fragment";
import OutlineFragmentV2 from "./outline-fragment-v2";

interface TDeckFragmentProps {
  sessionId: string;
  messageId: string;
}

export default function TDeckFragment({
  sessionId,
  messageId,
}: TDeckFragmentProps) {
  // Use the Zustand store instead of local state
  const { activeStep } = useStepStore();

  return (
    <Box w="full" h="full" overflow="hidden">
      {/* Navbar */}
      <Navbar />

      <Flex
        w={"full"}
        h={`calc(100% - 55px)`}
        //mt={"55px"}
        flexDirection={"row"}
        position={"relative"}
        overflow={"hidden"}
      >
        <Box w={"full"} h={"full"} overflow={"hidden"}>
          {activeStep === 0 ? (
            <SummaryFragment sessionId={sessionId} messageId={messageId} />
          ) : activeStep === 1 ? (
            <OutlineFragmentV2 sessionId={sessionId} messageId={messageId} />
          ) : (
            // : activeStep === 2 ? (
            //   <ThemeFragment sessionId={sessionId} messageId={messageId} />
            // )
            <DeckFragment sessionId={sessionId} messageId={messageId} />
          )}
        </Box>
      </Flex>
    </Box>
  );
}
