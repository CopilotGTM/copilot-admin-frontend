"use client";
import { Flex, Icon, IconButton, Steps, Text } from "@chakra-ui/react";
import {
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen,
  Presentation,
  X,
} from "lucide-react";
import useStepStore from "../../app/stores/use-step-store";
import { usePanelStore } from "../../app/stores/use-panel-store";
import { Tooltip } from "../ui/tooltip";
import { useSideChatStore } from "../../app/stores/use-sidechat-store";

const steps = ["Summary", "Outline", "Deck"];

export default function Navbar() {
  const { activeStep, currentStep, setStep } = useStepStore();
  const { closePanel } = usePanelStore();
  const { isSideChatOpen, openSideChat, closeSideChat } = useSideChatStore();

  return (
    <Flex
      gap={4}
      bg={"white"}
      borderBottom={"1px solid"}
      borderColor={"gray.200"}
      px="24px"
      //py="12px"
      h={"55px"}
      //pos={"fixed"}
      w={"full"}
      zIndex={10}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      <Flex alignItems={"center"} gap={2}>
        {activeStep === 2 && (
          <Tooltip
            content="Share with colleague"
            positioning={{ placement: "bottom" }}
          >
            <IconButton
              aria-label="Share"
              size="md"
              variant="ghost"
              rounded={"xl"}
              onClick={() => {
                if (isSideChatOpen) {
                  closeSideChat();
                } else {
                  openSideChat();
                }
              }}
            >
              {isSideChatOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </IconButton>
          </Tooltip>
        )}
        <Text
          fontSize={"md"}
          color={"gray.800"}
          fontWeight={"semibold"}
          lineHeight={"24px"}
          display={"flex"}
          flexDirection={"row"}
          gap={2}
          alignItems={"center"}
        >
          {activeStep !== 2 && <Presentation size={20} />}
          Technical Deck
        </Text>
      </Flex>
      <Flex alignItems={"center"}>
        <Steps.Root step={activeStep} count={steps.length}>
          <Steps.List as={Flex} gap={3}>
            {steps.map((step, index) => (
              <Steps.Item key={index} index={index}>
                <Steps.Trigger
                  asChild
                  disabled={activeStep === index || index > currentStep}
                  _hover={{
                    opacity: 0.8,
                    fontWeight: "medium",
                  }}
                  _disabled={{
                    cursor: "not-allowed",
                    pointerEvents: "none",
                  }}
                  title={step}
                  onClick={() => {
                    setStep(index);
                  }}
                  cursor={"pointer"}
                >
                  <Steps.Title
                    fontSize={"sm"}
                    fontWeight={activeStep === index ? "semibold" : "normal"}
                    lineHeight={"20px"}
                    color={activeStep === index ? "purple.500" : "gray.800"}
                  >
                    {step}
                  </Steps.Title>
                </Steps.Trigger>

                {/* Replace Steps.Separator with an arrow */}
                {index < steps.length - 1 && (
                  <Icon color={"gray.200"}>
                    <ChevronsRight />
                  </Icon>
                )}
              </Steps.Item>
            ))}
          </Steps.List>
        </Steps.Root>
      </Flex>
      <Flex>
        <IconButton
          size={"md"}
          variant={"ghost"}
          rounded={"xl"}
          onClick={closePanel}
        >
          <X />
        </IconButton>
      </Flex>
    </Flex>
  );
}
