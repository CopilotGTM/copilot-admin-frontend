"use client";

import React from "react";
import {
  Portal,
  Dialog,
  Flex,
  Box,
  Stack,
  Button,
  CloseButton,
  Checkbox,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { MoveRight } from "lucide-react";
import { useRFTSheetDialogStore } from "../../app/stores/use-rft-sheet-dialog-store";
import { usePanelStore } from "../../app/stores/use-panel-store";
import { useSocketRFP } from "../../app/hooks/socket/use-socket-rfp";

interface RFPSheetDialogProps {
  sessionId: string;
}

export const RFPSheetDialog: React.FC<RFPSheetDialogProps> = ({
  sessionId,
}) => {
  // ❗️ Always call Hooks first
  const { response, isOpen, close } = useRFTSheetDialogStore();
  const { openPanel } = usePanelStore();
  const { generateAnswers } = useSocketRFP();

  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const [questionMap, setQuestionMap] = React.useState<Record<string, string>>(
    {},
  );
  const [answerMap, setAnswerMap] = React.useState<Record<string, string>>({});

  // Initialize state when `response` first becomes available
  React.useEffect(() => {
    if (!response) return;

    const initChecked: Record<string, boolean> = {};
    const initQuestion: Record<string, string> = {};
    const initAnswer: Record<string, string> = {};

    response.data.sheets_details.forEach((s) => {
      initChecked[s.sheet_name] = s.is_sheet_selected;
      initQuestion[s.sheet_name] =
        s.columns.find((c) => c.is_question_column)?.name ?? "";
      initAnswer[s.sheet_name] =
        s.columns.find((c) => c.is_answer_column)?.name ?? "";
    });

    setChecked(initChecked);
    setQuestionMap(initQuestion);
    setAnswerMap(initAnswer);
  }, [response]);

  // ⚠️ Now it’s safe to bail out if there’s no data
  if (!response) {
    return null;
  }

  const sheets = response.data.sheets_details;

  const toggleSheet = (name: string) =>
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));

  const handleGenerate = async () => {
    const selections = sheets
      .filter((s) => checked[s.sheet_name])
      .map((s) => ({
        sheet_name: s.sheet_name,
        question_column: questionMap[s.sheet_name],
        answer_column: answerMap[s.sheet_name],
      }));

    console.log("@@@@@@@selections", selections);
    generateAnswers({
      session_id: sessionId,
      system_message_id: response.data.message_id,
      sheets_details: selections,
    });
    close(selections);
    openPanel(response.data.message_id, "RFP", "Click");

    // await fetch("/api/generate-rfp-answers", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     message_id: response.data.message_id,
    //     selections,
    //   }),
    // });

    // close();
  };

  return (
    <Dialog.Root open={isOpen} key="rfp-dialog" placement={"center"}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2xl"
            minW="600px"
            p={6}
            as={Flex}
            direction="column"
            gap={4}
          >
            {/* Header */}
            <Dialog.Header>
              <Dialog.Title fontSize="lg" fontWeight="bold" color="gray.700">
                RFP Document - Acme CRM
              </Dialog.Title>
            </Dialog.Header>

            {/* Body */}
            <Dialog.Body
              border={"1px solid"}
              borderColor={"gray.200"}
              borderRadius={"xl"}
              p={4}
              maxH={80}
              overflow={"scroll"}
            >
              {/* column labels */}
              <Flex mb={4} px={2}>
                <Box flex={1} color="gray.600" fontWeight="semibold">
                  Sheets ({sheets.length})
                </Box>
                <Box flex={1} color="gray.600" fontWeight="semibold">
                  Questions
                </Box>
                <Box flex={1} color="gray.600" fontWeight="semibold">
                  Answers
                </Box>
              </Flex>

              <Stack gap={3}>
                {sheets.map((sheet, idx) => {
                  // build collections on the fly
                  const items = sheet.columns.map((c) => ({
                    label: c.name,
                    value: c.name,
                  }));
                  const columnCollection = createListCollection({ items });

                  console.log(
                    "@@@@@@questionCollection",
                    columnCollection.items,
                  );

                  return (
                    <Flex key={sheet.sheet_name} align="center">
                      {/* Checkbox */}
                      <Checkbox.Root
                        checked={checked[sheet.sheet_name]}
                        onCheckedChange={() => toggleSheet(sheet.sheet_name)}
                        mr={4}
                        maxW={40}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label lineClamp={1}>
                          {sheet.sheet_name}
                        </Checkbox.Label>
                      </Checkbox.Root>

                      {/* Question column */}
                      <Select.Root
                        key={`question-column-${idx}`}
                        collection={columnCollection}
                        value={[questionMap[sheet.sheet_name]]}
                        onValueChange={(details) =>
                          setQuestionMap((prev) => ({
                            ...prev,
                            [sheet.sheet_name]: details.value[0],
                          }))
                        }
                        size="sm"
                        flex={1}
                        mr={4}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger rounded="md">
                            <Select.ValueText
                              px="8px"
                              placeholder="Select column"
                            />
                          </Select.Trigger>
                          <Select.IndicatorGroup px={2}>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content zIndex="tooltip">
                              {columnCollection.items.map((item) => (
                                <Select.Item
                                  key={item.value}
                                  item={item}
                                  p={1.5}
                                >
                                  {item.label}
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Portal>
                      </Select.Root>

                      {/* Answer column */}
                      <Select.Root
                        collection={columnCollection}
                        value={[answerMap[sheet.sheet_name]]}
                        onValueChange={(details) =>
                          setAnswerMap((prev) => ({
                            ...prev,
                            [sheet.sheet_name]: details.value[0],
                          }))
                        }
                        size="sm"
                        flex={1}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger rounded="md">
                            <Select.ValueText
                              px="8px"
                              placeholder="Select column"
                            />
                          </Select.Trigger>
                          <Select.IndicatorGroup px={2}>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Portal>
                          <Select.Positioner>
                            <Select.Content zIndex="tooltip">
                              {columnCollection.items.map((item) => (
                                <Select.Item
                                  key={item.value}
                                  item={item}
                                  p={1.5}
                                >
                                  {item.label}
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Portal>
                      </Select.Root>
                    </Flex>
                  );
                })}
              </Stack>
            </Dialog.Body>

            {/* Footer */}
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    close();
                  }}
                  p={4}
                >
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                bg="purple.500"
                color="white"
                gap={2}
                lineHeight="24px"
                onClick={handleGenerate}
                p={4}
                _hover={{ opacity: 0.9 }}
              >
                Generate RFP answers
                <MoveRight />
              </Button>
            </Dialog.Footer>

            {/* Close button */}
            <Dialog.CloseTrigger asChild>
              <CloseButton
                position="absolute"
                top={2}
                right={2}
                size="sm"
                onClick={() => {
                  close();
                }}
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
