"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Input,
  Portal,
  Select,
  VStack,
  createListCollection,
  Flex,
  Text,
} from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { MoveRight } from "lucide-react";
import { useSocketTDeck } from "../../../app/hooks/socket/use-socket-tdeck";
import { MessageChunk, OutlineContent } from "../../../app/types/chat";
import MarkdownRenderer from "../../markdown-renderer";
import { OutlineData, TDeckState } from "../../../app/types/tdeck";
import { useTdeckDetails } from "../../../app/hooks/use-tdeck";
import { CustomScrollbar } from "../../custom-scrollbar";
import LoadingCursor from "../../ui/loading-cursor";
import useStepStore from "../../../app/stores/use-step-store";

interface OutlineFragmentProps {
  sessionId: string;
  messageId: string;
  state?: TDeckState;
}

// const mockOutlineData = [
//   {
//     slide_number: 1,
//     slide_title: "Everyday Friction: Juggling Calendars & Email Threads",
//     slide_content:
//       "```markdown\nSlide 1: Everyday Friction: Juggling Calendars & Email Threads\n\n- Harika often only learns about critical calls when she’s tagged on a sprawling email thread—too late to shape the agenda or share essential insights  \n- Neeraj races against the clock each morning, spending 30–45 minutes cobbling together invites, agendas and last-minute updates for a single meeting  \n- Teams juggle 3–5 disparate channels (Outlook, Slack, Zoom links), spawning 20+ parallel threads per project and amplifying confusion  \n- Uncoordinated, ad-hoc reschedules and “oops, you weren’t on that call” moments drive a 45% rise in decision-making delays and squander hours of productive time  \n```",
//   },
//   {
//     slide_number: 2,
//     slide_title: "Core Challenge in Their Words",
//     slide_content:
//       "```markdown\n## Core Challenge in Their Words\n\n- “We keep getting last-minute requests and scrambling to catch up.”  \n- “Critical insights slip through the cracks when key voices aren’t looped in.”  \n- “Chaotic scheduling means decisions stall and frustration spikes.”  \n- “I need to be included on every call—otherwise I’m always one step behind.”  \n- “Chasing email threads instead of making progress is derailing our project timelines.”\n```",
//   },
//   {
//     slide_number: 3,
//     slide_title: "Xeno: The Glue That Keeps Everyone in Sync",
//     slide_content:
//       "### Slide 3: Xeno – The Glue That Keeps Everyone in Sync\n\n- Real-time unified channels + integrated calendars automatically loop in every stakeholder (e.g., Harika), eradicating “last-minute” invites and information gaps  \n- Centralized shared workspaces and auto-updated agendas cut coordination overhead by ~40%, so teams work from a single source of truth  \n- Role-based notifications ensure the right people see critical updates—Acme Corp reduced last-minute schedule changes by 60% within 30 days of rollout  \n- Native, low-code connectors to Outlook, Google Calendar, Slack and Teams deliver rapid deployment (<2 weeks) and eliminate tool-switching by 30%  \n- Enterprise-grade security & audit logs provide full visibility and compliance on who views agendas, edits tasks and joins calls  \n- vs. DIY or legacy point solutions: Xeno’s all-in-one platform lowers TCO, accelerates time-to-value and is proven across 90+ enterprise deployments",
//   },
//   {
//     slide_number: 4,
//     slide_title: "Automated, Role-Based Notifications",
//     slide_content:
//       "```markdown\nSlide 4: Automated, Role-Based Notifications\n\n• Configurable Role-Driven Alerts  \n  – Automatically route notifications to defined project roles (e.g., Harika) based on your custom ruleset  \n  – Ensures no stakeholder is sidelined—eliminates “out-of-loop” frustrations and last-minute outreach  \n\n• Real-Time Bi-Directional Calendar Sync  \n  – Auto-update invites across Outlook, Google Calendar & Microsoft Teams in one click  \n  – Maintains a single source of truth—any change triggers instant re-invites and avoids duplicate scheduling  \n\n• Enterprise-Grade Compliance & Auditability  \n  – Full visibility into who was notified, when and why—meets strict audit-log requirements  \n  – Reduces risk of missed approvals or compliance gaps in regulated environments  \n\n• Proven Business Impact  \n  – Acme Corp saw a 60% reduction in last-minute schedule changes within 30 days of rollout  \n  – BetaTech reported a 45% drop in project delays thanks to automated stakeholder alerts  \n\n• Xeno vs. Legacy Point Tools  \n  – Unified platform vs. stitching together multiple email, calendar & messaging apps  \n  – Low-code connectors for rapid integration with existing IT landscape  \n  – SLA-backed support & enterprise-grade security—no more juggling Zoom links, Outlook invites and Slack threads  \n```",
//   },
//   {
//     slide_number: 5,
//     slide_title: "Centralized Agenda & Action-Item Tracking",
//     slide_content:
//       "**Slide 5: Centralized Agenda & Action-Item Tracking**  \n\n- Pain in Their Words: “We scramble to draft agendas in Outlook, rebuild them in Slack, then race to loop in Harika at the 11th hour – last-minute asks and missed voices stall decisions.”  \n- Automated Agenda Assembly: Xeno auto-generates role-based agendas from your meeting template and pushes updates instantly to Outlook, Google Calendar, Teams and Slack—eliminating manual copy-and-paste.  \n- Real-Time, Ubiquitous Sharing: Edits to agenda items and assigned tasks sync across all channels in seconds, ensuring Harika (and every stakeholder) sees changes live—so follow-ups never slip through.  \n- Proven Impact: Acme Corp cut last-minute schedule changes by 60% within 30 days of rollout; BetaTech achieved a 45% drop in project delays by auto-alerting every participant.  \n- Why Xeno vs. DIY:  \n  • Unified platform replaces 4–5 point solutions (Outlook + Slack bots + manual invites)  \n  • Low-code connectors to existing calendars and collaboration channels—no dev lift  \n  • Enterprise-grade security & audit logs to track who saw what, when (critical for compliance)  \n- Next Step Proposal: Let’s pilot Xeno’s stakeholder-based agenda and task automation on your next planning session—guaranteed to eliminate last-minute catch-ups and unlock 3+ hours/week in team productivity.",
//   },
//   {
//     slide_number: 6,
//     slide_title: "Proof Points: Measurable Impact",
//     slide_content:
//       "```markdown\n## Slide 6: Proof Points: Measurable Impact\n\n• Acme Corp  \n  – Reduced last-minute schedule changes by 60% within 30 days of Xeno rollout  \n  – Accelerated decision cycles by 35%, freeing ~16 hours/week in coordination overhead  \n\n• BetaTech  \n  – Achieved a 45% drop in project delays using Xeno’s automated stakeholder alerts  \n  – Boosted on-time delivery from 78% to 93%, recouping ~$120K in annual rework costs  \n```",
//   },
//   {
//     slide_number: 7,
//     slide_title: "Why Xeno vs. DIY or Legacy Tools",
//     slide_content:
//       "```markdown\n**Why Xeno vs. DIY or Legacy Tools**\n\n• Fully Unified Platform  \n   – Single source for scheduling, agendas & collaboration—no more piecing together Outlook, Zoom, Slack or spreadsheets  \n   – Ensures Harika (and every key stakeholder) is automatically included in the right calls and updates  \n\n• Low-Code, Pre-Built Connectors  \n   – Plug-and-play integration with Outlook/Google Calendars, MS Teams, Slack in under 2 hours  \n   – Automates role-based invites and real-time updates—so Neeraj never races to send last-minute invites again  \n\n• Enterprise-Grade Security & Audit Logs  \n   – End-to-end encryption, SOC 2 compliance, customizable audit trails for every schedule change or message  \n   – Provides Procurement & IT leaders full visibility and governance over sensitive meeting data  \n\n• Proven Business Impact  \n   – Acme Corp cut last-minute schedule changes by 60% within 30 days of rollout  \n   – BetaTech saw a 45% drop in project delays through automated stakeholder alerts—no critical voice left out  \n```",
//   },
//   {
//     slide_number: 8,
//     slide_title: "Next Steps: Pilot & Workshop",
//     slide_content:
//       "```markdown\n## Next Steps: Pilot & Workshop\n\n- Launch a 4-week pilot of Xeno’s automated, role-based notifications on your next high-priority project  \n  • Guarantees real-time alerts to every stakeholder (so Harika never misses a call)  \n  • Leverages low-code connectors to Outlook, Slack and Teams for seamless adoption  \n\n- Schedule a 1-hour workflow-mapping workshop next week (e.g., Tue 10 AM)  \n  • Map critical workflows, stakeholder touchpoints and notification triggers  \n  • Define integration points and success metrics (calendar sync, audit-grade tracking)  \n\n- Align on clear success criteria upfront  \n  • Target a 60% reduction in last-minute schedule changes (Acme Corp saw this in 30 days)  \n  • Aim for a 45% drop in project delays through automated stakeholder alerts (BetaTech result)  \n\n- Deliverables & outcomes  \n  • Role-based notification matrix and workflow diagram  \n  • Integration blueprint (calendar + comms tools)  \n  • Dashboards to track engagement, response times and project velocity  \n\n- Call to action  \n  • Confirm pilot scope and workshop timing by EOW to lock in momentum  \n  • Xeno team will prepare agenda and pre-work materials immediately  \n```",
//   },
// ];

const OutlineFragment = ({
  sessionId,
  messageId,
  state = "SLIDE_CONTENT",
}: OutlineFragmentProps) => {
  const { socket, generateOutline } = useSocketTDeck();

  const {
    data: outlineTDeckData,
    isLoading: isOutlineLoading,
    // error,
  } = useTdeckDetails(sessionId, messageId, state, "Click");

  //const [showOutline, setShowOutline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [outlineData, setOutlineData] = useState<OutlineContent[]>([]);
  const [description, setDescription] = useState("");
  const [imageSource, setImageSource] = useState("ai");
  const [audience, setAudience] = useState("executive");

  const { setStep } = useStepStore();

  const outlineContainerRef = useRef<HTMLDivElement>(null); // Create a ref for the outline container

  const imageSources = createListCollection({
    items: [
      { label: "AI", value: "ai" },
      { label: "Stock", value: "stock" },
      { label: "Custom", value: "custom" },
    ],
  });

  const audiences = createListCollection({
    items: [
      { label: "Executive", value: "executive" },
      { label: "Technical", value: "technical" },
      { label: "Sales", value: "sales" },
      { label: "General", value: "general" },
    ],
  });

  useEffect(() => {
    if (
      !isOutlineLoading &&
      outlineTDeckData &&
      (outlineTDeckData?.data as OutlineData)?.slide_content_summary?.length > 0
    ) {
      setOutlineData(
        (outlineTDeckData?.data as OutlineData)?.slide_content_summary,
      );
    }
  }, [isOutlineLoading, outlineTDeckData]);

  const { generateDeck } = useSocketTDeck();

  const handleGenerateOutline = async () => {
    if (outlineData.length > 0) {
      try {
        generateDeck({
          session_id: sessionId,
          system_message_id: messageId,
        });

        setStep(2);
      } catch (error) {
        console.error("Error generating outline:", error);
      }
    } else {
      setOutlineData([]);
      setIsLoading(true);

      try {
        generateOutline({
          session_id: sessionId,
          message_id: messageId,
        });
      } catch (error) {
        console.error("Error generating outline:", error);
      }
    }
  };

  console.log("@@@@@@outlineData", outlineData);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveOutline = async (chunk: MessageChunk) => {
      if (chunk.chat_id !== sessionId) return;
      if (chunk.message_id !== messageId) return;

      if (chunk.isComplete) {
        setIsLoading(false);
      }

      // Update outline if the chunk contains outline data
      // Append new OutlineContent to outlineData
      if (
        chunk.response &&
        typeof chunk.response === "object" &&
        "slide_number" in chunk.response
      ) {
        setOutlineData((prev) => [...prev, chunk.response as OutlineContent]);
      }
    };

    socket.on("recieve_slide_content", handleReceiveOutline);

    return () => {
      socket.off("recieve_slide_content", handleReceiveOutline);
    };
  }, [socket, sessionId, messageId]);

  // Scroll to the bottom when isLoading is true or new outline data is added
  useEffect(() => {
    if (isLoading && outlineContainerRef.current) {
      const container = outlineContainerRef.current;
      container.scrollTop = container.scrollHeight; // Scroll to the bottom
    }
  }, [isLoading, outlineData]);

  return (
    <Box w={"full"} h={"full"} px={12} overflow={"hidden"}>
      <Flex h={"full"} gap={8} overflow={"hidden"}>
        {/* Left Side - Form */}
        <Box
          py={12}
          overflow={"hidden"}
          w={outlineData.length > 0 ? "40%" : "60%"}
        >
          <VStack gap={6} align="stretch">
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
                {!isLoading && outlineData.length > 0
                  ? "Create Deck"
                  : "Generate outline"}
                {!isLoading && <MoveRight size={18} />}
              </Button>
            </Box>
          </VStack>
        </Box>

        {/* Right Side - Outline */}
        {outlineData.length > 0 && (
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
        )}
      </Flex>
    </Box>
  );
};

export default OutlineFragment;
