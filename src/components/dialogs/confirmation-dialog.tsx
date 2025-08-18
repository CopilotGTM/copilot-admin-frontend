import { Button, CloseButton, Dialog, Flex, Portal } from "@chakra-ui/react";
import { MoveRight } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmationDialogProps {
  title: string;
  description: string | ReactNode;
  confirmButton: string;
  onConfirm: () => void;
  onCancel?: () => void;
  trigger?: ReactNode;
  isOpen?: boolean;
}

export const ConfirmationDialog = ({
  title,
  description,
  confirmButton,
  onConfirm,
  onCancel,
  trigger,
  isOpen = false,
}: ConfirmationDialogProps) => {
  return (
    <Dialog.Root
      key={"confirmation-dialog"}
      placement={"center"}
      motionPreset="slide-in-bottom"
      open={trigger ? undefined : isOpen}
    >
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p={6} as={Flex} gap={4}>
            <Dialog.Header>
              <Dialog.Title
                fontSize={"lg"}
                fontWeight={"bold"}
                lineHeight={"28px"}
                color={"gray.700"}
              >
                {title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body fontSize={"sm"} color={"gray.700"}>
              {description}
            </Dialog.Body>
            <Dialog.Footer mt={4}>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={onCancel} p={4}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                bg={"purple.500"}
                gap={2}
                color={"white"}
                lineHeight={"24px"}
                onClick={onConfirm}
                p={4}
                _hover={{
                  opacity: 0.9,
                }}
              >
                {confirmButton}
                <MoveRight />
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" onClick={onCancel} />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
